export interface User {
  id: number;
  name: string;
  email: string;
  role: "USER" | "EXPERT" | "ADMIN";
  specialty?:
    | "NUTRISI_ANAK"
    | "PSIKOLOGI_ANAK"
    | "PARENTING"
    | "PERKEMBANGAN_ANAK"
    | "EDUKASI_ANAK";
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
