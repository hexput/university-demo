import { api } from "encore.dev/api";
import { prisma } from "../database";

interface MySchoolsResponse {
    schools: {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        note_calculation: string;
    }[]
}

export const mySchools = api(
    { expose: true, method: "GET", path: "/api/my-schools", auth: true },
    async ({ }): Promise<MySchoolsResponse> => {
        return {
            schools: await prisma.university.findMany({})
        };
    }
)