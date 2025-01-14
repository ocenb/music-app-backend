import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
	BadRequestException,
	Inject,
	Injectable,
	NotFoundException
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { AlbumService } from 'src/album/album.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class LikedAlbumService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly albumService: AlbumService,
		@Inject(CACHE_MANAGER) private readonly cacheManager: Cache
	) {}

	async getMany(userId: number, take?: number) {
		return await this.prismaService.userLikedAlbum.findMany({
			where: { userId },
			select: {
				album: true
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

		const _count = await this.cacheManager.get<string>(`album:${albumId}`);

		if (!_count) {
			const album = await this.prismaService.album.findUnique({
				where: { id: albumId },
				select: { _count: { select: { likes: true, tracks: true } } }
			});

			await this.cacheManager.set(
				`album:${albumId}`,
				JSON.stringify({
					likes: album._count.likes,
					tracks: album._count.tracks
				})
			);
		} else {
			const parsedCount = JSON.parse(_count);

			await this.cacheManager.set(
				`album:${albumId}`,
				JSON.stringify({
					likes: parsedCount.likes + 1,
					tracks: parsedCount.tracks
				})
			);
		}
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

		const _count = await this.cacheManager.get<string>(`album:${albumId}`);

		if (!_count) {
			const album = await this.prismaService.album.findUnique({
				where: { id: albumId },
				select: { _count: { select: { likes: true, tracks: true } } }
			});

			await this.cacheManager.set(
				`album:${albumId}`,
				JSON.stringify({
					likes: album._count.likes,
					tracks: album._count.tracks
				})
			);
		} else {
			const parsedCount = JSON.parse(_count);

			await this.cacheManager.set(
				`album:${albumId}`,
				JSON.stringify({
					likes: parsedCount.likes - 1,
					tracks: parsedCount.tracks
				})
			);
		}
	}
}
