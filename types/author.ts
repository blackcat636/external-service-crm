export interface Author {
  id: number;
  username: string;
  full_name: string;
  profile_picture: string;
  instagram_url: string;
  followers: number;
  viral_percentage: number;
  client_id: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddAuthorRequest {
  url: string;
}

export interface RefreshAuthorRequest {
  authorId: string;
}
