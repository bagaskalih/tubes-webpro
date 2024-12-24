export interface User {
  id: number;
  name: string;
  email: string;
  role: "USER" | "EXPERT" | "ADMIN";
  specialty?:
    | "CHILD_NUTRITION"
    | "CHILD_PSYCHOLOGY"
    | "PARENTING"
    | "CHILD_DEVELOPMENT"
    | "CHILD_EDUCATION";
  about?: string;
  profileImage?: string;
  rating?: number;
  totalReviews?: number;
  createdAt: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: "USER" | "EXPERT";
}
