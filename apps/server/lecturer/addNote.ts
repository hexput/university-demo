import { api, APIError } from "encore.dev/api";
import { AuthData } from "../auth/auth";
import { prisma } from "../database";
import { getAuthData } from "~encore/auth";

interface NotePutRequest {
    universityId: number;
    courseId: number;
    studentId: number;
    noteId: number;
    note: number;
}

export const addNote = api(
    { expose: true, method: "PATCH", path: "/api/university/:universityId/course/:courseId/student/:studentId/note/:noteId", auth: true },
    async ({ noteId, studentId, universityId, note }: NotePutRequest) => {

        const studentRole = await prisma.userRole.findUnique({
            where: {
                userId_universityId: {
                    userId: studentId,
                    universityId
                }
            }
        });

        if (!studentRole || studentRole.role !== "STUDENT") {
            throw APIError.notFound("Student not found");
        }

        const student = await prisma.student.findUnique({
            where: {
                courseId_userId_universityId: {
                    courseId: universityId,
                    userId: studentId,
                    universityId
                }
            }
        });

        const noteSchema = await prisma.noteSchema.findUnique({
            where: {
                id: noteId
            }
        });

        if (!noteSchema || noteSchema.universityId !== universityId) {
            throw APIError.notFound("Note schema not found");
        }

        if (!student || student.universityId !== universityId) {
            throw APIError.notFound("Student not found");
        }

        await prisma.noteData.upsert({
            where: {
                schema_id_student_id: {
                    schema_id: noteId,
                    student_id: studentId
                }
            },
            create: {
                note,
                schema_id: noteId,
                student_id: studentId,
            },
            update: {
                note,
            }
        }).catch(() => {});

        return {
            ok: true,
            message: "Note updated successfully",
        }
    }
)