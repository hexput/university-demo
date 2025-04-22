import { api, APIError, middleware } from "encore.dev/api";
import { prisma } from "../database";
import { getAuthData } from "~encore/auth";
import { AuthData } from "../auth/auth";
import { hexput } from "../hexput";

interface NoteCalculationRequest {
    code: string;
    universityId: number;
}

export const changeNoteCalculation = api(
    { expose: true, method: "PATCH", path: "/api/university/:universityId/note-calculation", auth: true },
    async ({ code, universityId }: NoteCalculationRequest) => {

        const authData: AuthData = getAuthData();

        if (!authData) {
            throw APIError.permissionDenied("User not found");
        }

        const userRole = await prisma.userRole.findUnique({
            where: {
                userId_universityId: {
                    userId: Number(authData.userID),
                    universityId
                }
            }
        });

        if (!userRole || userRole.role !== "ADMIN") {
            throw APIError.notFound("University or university member not found");
        }


        // testing code if it returns boolean value, this code will be used to determine if the student passes current course
        const result = await hexput.execute(code, {
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
            final: 100,
            total: 100,
            notes: [
                {
                    name: "Final",
                    weight: 100,
                    type: "final",
                    note: 100,
                },
                {
                    name: "Total",
                    weight: 100,
                    type: "exam",
                    note: 100,
                },
                {
                    name: "Homework",
                    weight: 100,
                    type: "project",
                    note: 100,
                }
            ]
        }).catch((err) => ({
            error: err,
            result: false,
        }));

        if ("error" in result) {
            throw APIError.aborted("Invalid code:" + (result.error?.error || result.error));
        }

        if (!result) {
            throw APIError.aborted("Invalid code");
        }

        const noteCalculation = await prisma.university.update({
            where: {
                id: universityId,
            },
            data: {
                note_calculation: code,
            }
        });

        return {
            ok: true,
            noteCalculation: noteCalculation.note_calculation,
        }
    }
);