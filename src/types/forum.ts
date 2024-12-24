export interface User {
  id: number;
  name: string;
  role: "USER" | "ADMIN" | "EXPERT";
  specialty?: string;
}

export interface Comment {
  id: number;
  content: string;
  author: User;
  userLike?: {
    type: "LIKE" | "DISLIKE";
  };
  _count: {
    likes: number;
  };
}

export interface Thread {
  id: number;
  title: string;
  content: string;
  category: "UMUM" | "TEKNOLOGI" | "KESEHATAN" | "EDUKASI" | "";
  author: {
    name: string;
    role: string;
  };
  comments: Comment[];
  _count: {
    comments: number;
  };
}

export enum Category {
  UMUM = "UMUM",
  TEKNOLOGI = "TEKNOLOGI",
  KESEHATAN = "KESEHATAN",
  EDUKASI = "EDUKASI",
  LAINNYA = "LAINNYA",
}
