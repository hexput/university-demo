import { api } from "encore.dev/api";
import { prisma } from "../database";

interface CheckAuthRequest {
  token: string;
}

interface Response {
    ok: boolean;
    user?: {
        token: string | null;
        id: number;
        username: string;
        password: string;
        firstName: string | null;
        lastName: string | null;
        system_admin: boolean;
        createdAt: Date;
        updatedAt: Date;
    } | null
}

export const checkAuth = api(
    { expose: true, method: "POST", path: "/api/check-auth", auth: false },
    async ({ token }: CheckAuthRequest): Promise<Response> => {
        // Check if the token is valid
        if (!token) {
            return { ok: false };
        }

        const user = await prisma.user.findUnique({
            where: {
                token
            }
        });

        const isValid = !!user;

        return { ok: isValid, user };
    }
)