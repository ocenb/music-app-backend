export interface CreateDocumentDto {
	id: number;
	type: 'user' | 'album' | 'track';
	name: string;
}

export interface UpdateDocumentDto {
	name: string;
}
