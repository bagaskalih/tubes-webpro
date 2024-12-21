// types/index.ts
export interface User {
  id: number;
  name: string;
  email: string;
  role: "USER" | "EXPERT" | "ADMIN";
  createdAt: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: "USER" | "EXPERT";
}
