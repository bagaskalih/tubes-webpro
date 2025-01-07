export interface User {
  id: number;
  name: string;
  email: string;
  role: "USER" | "EXPERT" | "ADMIN";
  specialty?:
    | "NUTRISI_ANAK"
    | "PSIKOLOGI_ANAK"
    | "PARENTING"
    | "PERTUMBUHAN_ANAK"
    | "EDUKASI_ANAK";
  about?: string;
  image?: string;
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
