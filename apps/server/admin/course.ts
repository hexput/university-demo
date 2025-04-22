import { api, APIError } from "encore.dev/api";
import { prisma } from "../database";
import { getAuthData } from "~encore/auth";
import { AuthData } from "../auth/auth";

interface CreateCourseRequest {
    universityId: number;
    name: string;
    lecturerId: number;
}

interface CreateCourseResponse {
    id: number;
    name: string;
    universityId: number;
    lecturerId: number;
    createdAt: Date;
    updatedAt: Date;
}

export const createCourse = api(
    { 
        expose: true, 
        method: "PUT", 
        path: "/api/university/:universityId/course",
        auth: true 
    },
    async ({ universityId, name, lecturerId }: CreateCourseRequest): Promise<CreateCourseResponse> => {
        // Validate lecturer exists and has lecturer role in the university
        const lecturerRole = await prisma.userRole.findUnique({
            where: {
                userId_universityId: {
                    userId: lecturerId,
                    universityId
                }
            }
        });

        if (!lecturerRole || lecturerRole.role !== "LECTURER") {
            throw APIError.notFound("Lecturer not found in this university");
        }

        // Create the course
        const course = await prisma.course.create({
            data: {
                name,
                universityId,
                lecturerId: lecturerId,
            }
        });

        return {
            id: course.id,
            name: course.name,
            universityId: course.universityId,
            lecturerId: course.lecturerId,
            createdAt: course.createdAt,
            updatedAt: course.updatedAt
        };
    }
);
