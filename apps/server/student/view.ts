import { api, APIError } from "encore.dev/api";
import { prisma } from "../database";
import { getAuthData } from "~encore/auth";
import { AuthData } from "../auth/auth";
import { hexput } from "../hexput";

// Interface for the request to get all courses
interface GetCoursesRequest {
    universityId: number;
}

// Interface for the request to get notes for a specific course
interface GetCourseNotesRequest {
    universityId: number;
    courseId: number;
}

// Endpoint to get all courses for the authenticated student
export const getStudentCourses = api(
    { expose: true, method: "GET", path: "/api/university/:universityId/student/courses", auth: true },
    async ({ universityId }: GetCoursesRequest) => {
        const authData: AuthData = getAuthData();

        if (!authData) {
            throw APIError.permissionDenied("User not authenticated");
        }

        // Check if the user has a student role in this university
        const userRole = await prisma.userRole.findUnique({
            where: {
                userId_universityId: {
                    userId: Number(authData.userID),
                    universityId
                }
            }
        });

        if (!userRole || userRole.role !== "STUDENT") {
            throw APIError.permissionDenied("User is not a student at this university");
        }

        // Get all courses the student is enrolled in
        const studentEnrollments = await prisma.student.findMany({
            where: {
                userId: Number(authData.userID),
                universityId
            },
            include: {
                course: {
                    include: {
                        lecturer: {
                            include: {
                                user: {
                                    select: {
                                        firstName: true,
                                        lastName: true,
                                        username: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Format the response
        const courses = studentEnrollments.map(enrollment => ({
            id: enrollment.course.id,
            name: enrollment.course.name,
            lecturer: {
                firstName: enrollment.course.lecturer.user.firstName,
                lastName: enrollment.course.lecturer.user.lastName,
                username: enrollment.course.lecturer.user.username
            }
        }));

        return { courses };
    }
);

// Endpoint to get notes for a specific course
export const getStudentCourseNotes = api(
    { expose: true, method: "GET", path: "/api/university/:universityId/student/course/:courseId/notes", auth: true },
    async ({ universityId, courseId }: GetCourseNotesRequest) => {
        const authData: AuthData = getAuthData();

        if (!authData) {
            throw APIError.permissionDenied("User not authenticated");
        }

        // Check if the user has a student role in this university
        const userRole = await prisma.userRole.findUnique({
            where: {
                userId_universityId: {
                    userId: Number(authData.userID),
                    universityId
                }
            }
        });

        if (!userRole || userRole.role !== "STUDENT") {
            throw APIError.permissionDenied("User is not a student at this university");
        }

        // Find the student record for this course
        const student = await prisma.student.findUnique({
            where: {
                courseId_userId_universityId: {
                    courseId,
                    userId: Number(authData.userID),
                    universityId
                }
            }
        });

        if (!student) {
            throw APIError.notFound("Student is not enrolled in this course");
        }

        // Get all note schemas for this course
        const noteSchemas = await prisma.noteSchema.findMany({
            where: {
                courseId,
                universityId
            }
        });

        // Get all note data for this student
        const noteData = await prisma.noteData.findMany({
            where: {
                student_id: student.id,
                schema: {
                    courseId,
                    universityId
                }
            }
        });

        // Format notes with schema information
        const notes = noteSchemas.map(schema => {
            const data = noteData.find(data => data.schema_id === schema.id);
            return {
                id: schema.id,
                name: schema.name,
                type: schema.type,
                weight: schema.weight,
                note: data ? data.note : null
            };
        });

        // Get university note calculation formula
        const university = await prisma.university.findUnique({
            where: { id: universityId }
        });

        // Calculate the final grade if we have the calculation formula and notes
        let finalGrade = null;
        let passed = null;

        if (university?.note_calculation && notes.length > 0 && notes.some(n => n.note !== null)) {
            try {
                // Prepare the data for the calculation
                const notesForCalculation = notes.map(n => ({
                    name: n.name,
                    weight: n.weight,
                    type: n.type,
                    note: n.note || 0
                }));

                // Find the final exam note (if any)
                const finalNote = notesForCalculation.find(n => n.type === "final")?.note || 0;
                
                // Calculate total weighted score
                const totalWeight = notes.reduce((sum, n) => sum + n.weight, 0);
                const totalScore = notesForCalculation.reduce((sum, n) => sum + (n.note * n.weight), 0) / 
                                  (totalWeight || 1);

                // Execute the university's note calculation formula
                const result = await hexput.execute(university.note_calculation, {
                    secret_context: {
                        token: authData.token,
                        id: authData.id,
                    }
                }, {
                    student: {
                        firstName: authData.firstName,
                        lastName: authData.lastName,
                        username: authData.username,
                        id: authData.id,
                        secret_data: {
                            __type: "student",
                            token: authData.token,
                            id: authData.id,
                            universityId: universityId,
                        }
                    },
                    final: finalNote,
                    total: totalScore,
                    notes: notesForCalculation
                });

                finalGrade = totalScore;
                passed = !!result;
            } catch (error) {
                console.error("Error calculating final grade:", error);
            }
        }

        return {
            courseId,
            notes,
            finalGrade,
            passed
        };
    }
);
