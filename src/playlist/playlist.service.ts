import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreatePlaylistDto, UpdatePlaylistDto } from './playlist.dto';
import { FileService } from 'src/file/file.service';

@Injectable()
export class PlaylistService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly fileService: FileService
	) {}

	async getOne(username: string, changeableId: string) {
		const playlist = await this.prismaService.playlist.findUnique({
			where: { username_changeableId: { changeableId, username } },
			include: {
				_count: { select: { savedByUsers: true, tracks: true } }
			}
		});

		if (!playlist) {
			throw new NotFoundException('Playlist not found');
		}

		return playlist;
	}

	async getMany(userId: number, take = 50, lastId?: number) {
		return await this.prismaService.playlist.findMany({
			where: { userId, id: { lt: lastId } },
			take
		});
	}

	async create(
		userId: number,
		createPlaylistDto: CreatePlaylistDto,
		image: Express.Multer.File
	) {
		await this.validatePlaylistTitle(userId, createPlaylistDto.title);
		await this.validateChangeableId(userId, createPlaylistDto.changeableId);

		const imageFile = await this.fileService.saveImage(image);

		return await this.prismaService.playlist.create({
			data: {
				user: { connect: { id: userId } },
				image: imageFile.filename,
				...createPlaylistDto
			}
		});
	}

	async update(
		userId: number,
		playlistId: number,
		updatePlaylistDto: UpdatePlaylistDto,
		image?: Express.Multer.File
	) {
		const playlist = await this.validatePlaylist(playlistId, userId);
		if (updatePlaylistDto.title) {
			await this.validatePlaylistTitle(userId, updatePlaylistDto.title);
		}
		if (updatePlaylistDto.changeableId) {
			await this.validateChangeableId(userId, updatePlaylistDto.changeableId);
		}

		let imageName: string;

		if (image) {
			const imageFile = await this.fileService.saveImage(image);
			imageName = imageFile.filename;
			await this.fileService.deleteFileByName(playlist.image, 'images');
		}

		return await this.prismaService.playlist.update({
			data: { image: imageName, ...updatePlaylistDto },
			where: { id: playlistId }
		});
	}

	async delete(userId: number, playlistId: number) {
		const playlist = await this.validatePlaylist(playlistId, userId);

		await this.fileService.deleteFileByName(playlist.image, 'images');

		await this.prismaService.playlist.delete({
			where: { id: playlistId }
		});
	}

	async validatePlaylist(playlistId: number, userId: number) {
		const playlist = await this.checkPlaylistExists(playlistId);
		if (userId !== playlist.userId) {
			throw new ForbiddenException(
				'You do not have permission to change this playlist'
			);
		}

		return playlist;
	}

	async checkPlaylistExists(playlistId: number) {
		const playlist = await this.prismaService.playlist.findUnique({
			where: { id: playlistId }
		});
		if (!playlist) {
			throw new NotFoundException('Playlist not found');
		}

		return playlist;
	}

	private async validatePlaylistTitle(userId: number, title: string) {
		const playlist = await this.prismaService.playlist.findUnique({
			where: { userId_title: { userId, title } }
		});
		if (playlist) {
			throw new BadRequestException(
				`Playlist with the name "${title}" already exists.`
			);
		}
	}

	private async validateChangeableId(userId: number, changeableId: string) {
		const playlist = await this.prismaService.playlist.findUnique({
			where: { userId_changeableId: { userId, changeableId } }
		});
		if (playlist) {
			throw new BadRequestException(
				`You already have a playlist with the id "${changeableId}".`
			);
		}
	}
}
