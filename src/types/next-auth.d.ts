import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    role: string;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };

    token: {
      id: string;
      name: string;
      role: string;
    };
  }
}
