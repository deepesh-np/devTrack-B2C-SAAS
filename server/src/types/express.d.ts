import { User as PrismaUser } from "@prisma/client";

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      name?: string | null;
      username?: string | null;
      avatar?: string | null;
      provider?: string;
    }
  }
}
