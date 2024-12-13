import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
    };

    token: {
      id: string;
      name: string;
    };
  }
}
