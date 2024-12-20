import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common';
import { PlaylistService } from 'src/playlist/playlist.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class SavedPlaylistService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly playlistService: PlaylistService
	) {}

	async getMany(userId: number, take?: number) {
		return await this.prismaService.userSavedPlaylist.findMany({
			where: { userId },
			select: {
				playlist: true
			},
			orderBy: { addedAt: 'desc' },
			take
		});
	}

	async save(userId: number, playlistId: number) {
		await this.playlistService.checkPlaylistExists(playlistId);
		const savedPlaylist = await this.prismaService.userSavedPlaylist.findUnique(
			{
				where: { userId_playlistId: { userId, playlistId } }
			}
		);
		if (savedPlaylist) {
			throw new BadRequestException('Playlist is already saved');
		}
		await this.prismaService.userSavedPlaylist.create({
			data: { userId, playlistId }
		});
	}

	async remove(userId: number, playlistId: number) {
		await this.playlistService.checkPlaylistExists(playlistId);
		const savedPlaylist = await this.prismaService.userSavedPlaylist.findUnique(
			{
				where: { userId_playlistId: { userId, playlistId } }
			}
		);
		if (!savedPlaylist) {
			throw new NotFoundException(
				"Playlist is not in this user's saved playlists"
			);
		}
		await this.prismaService.userSavedPlaylist.delete({
			where: { userId_playlistId: { userId, playlistId } }
		});
	}
}
