import { api, APIError } from "encore.dev/api";
import { prisma } from "../database";
import { getAuthData } from "~encore/auth";

interface AddStudentToCourseRequest {
    universityId: number;
    courseId: number;
    studentId: number;
}

interface AddStudentToCourseResponse {
    id: number;
    courseId: number;
    userId: number;
    universityId: number;
    createdAt: Date;
}

export const addStudentToCourse = api(
    {
        expose: true,
        method: "PUT",
        path: "/api/university/:universityId/course/:courseId/student/:studentId",
        auth: true
    },
    async ({ universityId, courseId, studentId }: AddStudentToCourseRequest): Promise<AddStudentToCourseResponse> => {
        // Validate course exists in the university
        const course = await prisma.course.findUnique({
            where: {
                id: courseId,
                universityId
            }
        });

        if (!course) {
            throw APIError.notFound("Course not found in this university");
        }

        // Validate student exists and has student role in the university
        const studentRole = await prisma.userRole.findUnique({
            where: {
                userId_universityId: {
                    userId: studentId,
                    universityId
                }
            }
        });

        if (!studentRole || studentRole.role !== "STUDENT") {
            throw APIError.notFound("Student not found in this university");
        }

        // Check if student is already enrolled in the course
        const existingEnrollment = await prisma.student.findUnique({
            where: {
                courseId_userId_universityId: {
                    courseId,
                    userId: studentId,
                    universityId
                }
            }
        });

        if (existingEnrollment) {
            throw APIError.alreadyExists("Student is already enrolled in this course");
        }

        // Create the enrollment
        const enrollment = await prisma.student.create({
            data: {
                courseId,
                userId: studentId,
                universityId
            }
        });

        return {
            id: enrollment.id,
            courseId: enrollment.courseId,
            userId: enrollment.userId,
            universityId: enrollment.universityId,
            createdAt: enrollment.createdAt
        };
    }
);
