import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common';
import { User as UserModel } from '@prisma/client';
import { RegisterDto } from 'src/auth/auth.dto';
import { FileService } from 'src/file/file.service';
import { PrismaService } from 'src/prisma.service';
import { UpdateUserDto } from './user.dto';
import { AlbumService } from 'src/album/album.service';
import { TrackService } from 'src/track/track.service';

@Injectable()
export class UserService {
	selectPrivate = {
		id: true,
		username: true,
		email: true,
		image: true,
		createdAt: true,
		updatedAt: true
	};
	selectPublic = {
		id: true,
		username: true,
		image: true,
		_count: { select: { followers: true, following: true } }
	};

	constructor(
		private readonly prismaService: PrismaService,
		private readonly fileService: FileService,
		private readonly albumService: AlbumService,
		private readonly trackService: TrackService
	) {}

	async getById(id: number) {
		return await this.prismaService.user.findUnique({
			where: { id },
			select: this.selectPrivate
		});
	}

	async getFullById(id: number) {
		return await this.prismaService.user.findUnique({
			where: { id }
		});
	}

	async getByEmail(email: string) {
		return await this.prismaService.user.findUnique({
			where: { email },
			select: { ...this.selectPrivate, password: true }
		});
	}

	async getByName(username: string) {
		const user = await this.prismaService.user.findUnique({
			where: { username },
			select: this.selectPublic
		});
		if (!user) {
			throw new NotFoundException('User not found');
		}
		return user;
	}

	async getByNameWithoutError(username: string) {
		const user = await this.prismaService.user.findUnique({
			where: { username },
			select: this.selectPublic
		});
		return user;
	}

	async getMany(take = 50, lastId?: number) {
		return await this.prismaService.user.findMany({
			select: this.selectPublic,
			orderBy: { createdAt: 'desc' },
			where: { id: { lt: lastId } },
			take
		});
	}

	async create(registerDto: RegisterDto) {
		return await this.prismaService.user.create({
			data: registerDto,
			select: this.selectPrivate
		});
	}

	async update(
		user: UserModel,
		updateUserDto: UpdateUserDto,
		image?: Express.Multer.File
	) {
		if (updateUserDto.username) {
			const userByName = await this.prismaService.user.findUnique({
				where: { username: updateUserDto.username }
			});
			if (userByName) {
				throw new BadRequestException('User with the same name already exists');
			}
		}
		let imageName: string;
		if (image) {
			const imageFile = await this.fileService.saveImage(image);
			imageName = imageFile.filename;
			if (user.image !== 'default') {
				await this.fileService.deleteFileByName(user.image, 'images');
			}
		}
		await this.prismaService.user.update({
			data: { image: imageName, ...updateUserDto },
			where: { id: user.id }
		});
	}

	async changeEmail(userId: number, email: string) {
		const userByEmail = await this.getByEmail(email);
		if (userByEmail) {
			throw new BadRequestException('User with the same email already exists');
		}
		return await this.prismaService.user.update({
			where: { id: userId },
			data: { email },
			select: this.selectPrivate
		});
	}

	async changePassword(userId: number, password: string) {
		return await this.prismaService.user.update({
			where: { id: userId },
			data: { password },
			select: this.selectPrivate
		});
	}

	async delete(userId: number) {
		await this.albumService.deleteAllUserAlbums(userId);
		await this.trackService.deleteAllUserTracks(userId);
		await this.prismaService.user.delete({
			where: { id: userId }
		});
	}

	async validateUser(userId: number) {
		const user = await this.getById(userId);
		if (!user) {
			throw new NotFoundException('User not found');
		}
		return user;
	}
}
