import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreatePlaylistDto, UpdatePlaylistDto } from './playlist.dto';
import { FileService } from 'src/file/file.service';
import { SavedPlaylistService } from 'src/user/saved-playlist/saved-playlist.service';
import { Express } from 'express';

@Injectable()
export class PlaylistService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly fileService: FileService,
		private readonly savedPlaylistService: SavedPlaylistService
	) {}

	async getOne(currentUserId: number, username: string, changeableId: string) {
		const playlist = await this.prismaService.playlist.findUnique({
			where: { username_changeableId: { changeableId, username } },
			include: {
				savedByUsers: {
					where: { userId: currentUserId },
					select: { addedAt: true }
				},
				_count: { select: { tracks: true } }
			}
		});

		if (!playlist) {
			throw new NotFoundException('Playlist not found');
		}

		return playlist;
	}

	async getMany(userId: number, take?: number, lastId?: number) {
		return await this.prismaService.playlist.findMany({
			where: { userId, id: { lt: lastId } },
			orderBy: { createdAt: 'desc' },
			take
		});
	}

	async getManyWithSaved(userId: number, take?: number, lastId?: number) {
		const createdPlaylists = await this.prismaService.playlist.findMany({
			where: { userId, id: { lt: lastId } },
			orderBy: { createdAt: 'desc' },
			take
		});

		const savedPlaylists = await this.savedPlaylistService.getMany(
			userId,
			take,
			lastId
		);

		const formattedCreatedPlaylists = createdPlaylists.map((playlist) => ({
			...playlist,
			isSaved: false,
			addedAt: null
		}));

		const formattedSavedPlaylists = savedPlaylists.map((savedPlaylist) => ({
			...savedPlaylist.playlist,
			isSaved: true,
			addedAt: savedPlaylist.addedAt
		}));

		const allPlaylists = [
			...formattedCreatedPlaylists,
			...formattedSavedPlaylists
		];
		allPlaylists.sort((a, b) => {
			const aTime = a.isSaved ? a.addedAt.getTime() : a.createdAt.getTime();
			const bTime = b.isSaved ? b.addedAt.getTime() : b.createdAt.getTime();

			return bTime - aTime;
		});

		return allPlaylists.slice(0, take);
	}

	async create(
		userId: number,
		createPlaylistDto: CreatePlaylistDto,
		image: Express.Multer.File
	) {
		await this.validatePlaylistTitle(userId, createPlaylistDto.title);
		await this.validateChangeableId(userId, createPlaylistDto.changeableId);

		const imageName = await this.fileService.saveImage(image);

		return await this.prismaService.playlist.create({
			data: {
				user: { connect: { id: userId } },
				image: imageName,
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
			imageName = await this.fileService.saveImage(image);
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

	async deleteAllUserPlaylists(userId: number) {
		const playlists = await this.prismaService.playlist.findMany({
			where: { userId }
		});

		playlists.map(async (playlist) => {
			await this.fileService.deleteFileByName(playlist.image, 'images');
		});

		await this.prismaService.playlist.deleteMany({ where: { userId } });
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
