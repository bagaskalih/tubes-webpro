export interface User {
  id: number;
  name: string;
  role: "USER" | "ADMIN";
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
  category: "GENERAL" | "TECHNOLOGY" | "HEALTH" | "EDUCATION" | "OTHER";
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
  GENERAL = "GENERAL",
  TECHNOLOGY = "TECHNOLOGY",
  HEALTH = "HEALTH",
  EDUCATION = "EDUCATION",
  OTHER = "OTHER",
}
