import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common';
import { AlbumService } from 'src/album/album.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class LikedAlbumService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly albumService: AlbumService
	) {}

	async getMany(userId: number, take?: number) {
		return await this.prismaService.userLikedAlbum.findMany({
			where: { userId },
			select: {
				album: { include: { user: { select: { username: true } } } }
			},
			orderBy: { addedAt: 'desc' },
			take
		});
	}

	async add(userId: number, albumId: number) {
		await this.albumService.validateAlbum(albumId);
		const likedAlbum = await this.prismaService.userLikedAlbum.findUnique({
			where: { userId_albumId: { userId, albumId } }
		});
		if (likedAlbum) {
			throw new BadRequestException('Album is already liked');
		}
		await this.prismaService.userLikedAlbum.create({
			data: { userId, albumId }
		});
	}

	async remove(userId: number, albumId: number) {
		await this.albumService.validateAlbum(albumId);
		const likedAlbum = await this.prismaService.userLikedAlbum.findUnique({
			where: { userId_albumId: { userId, albumId } }
		});
		if (!likedAlbum) {
			throw new NotFoundException("Album is not in this user's liked albums");
		}
		await this.prismaService.userLikedAlbum.delete({
			where: { userId_albumId: { userId, albumId } }
		});
	}
}
