import { api, APIError, Query } from "encore.dev/api";
import { prisma } from "../database";
import { getAuthData } from "~encore/auth";

// ==== Get Note Schemas for a Course ====

interface GetNoteSchemasRequest {
    universityId: number;
    courseId: number;
}

interface NoteSchemaResponse {
    id: number;
    userId: number;
    universityId: number;
    courseId: number;
    name: string;
    type: string;
    weight: number;
    createdAt: Date;
    updatedAt: Date;
}

export const getNoteSchemas = api(
    {
        expose: true,
        method: "GET",
        path: "/api/university/:universityId/course/:courseId/note-schemas",
        auth: true
    },
    async ({ universityId, courseId }: GetNoteSchemasRequest): Promise<{ noteSchemas: NoteSchemaResponse[] }> => {
        // Validate course exists
        const course = await prisma.course.findUnique({
            where: {
                id: courseId,
                universityId
            },
            include: {
                lecturer: true
            }
        });

        if (!course) {
            throw APIError.notFound("Course not found in this university");
        }

        // Get auth data to check if the user is the lecturer for this course
        const auth = getAuthData();
        
        // Check if the user is the lecturer for this course
        if (course.lecturerId !== auth.userId) {
            throw APIError.permissionDenied("You are not the lecturer for this course");
        }

        // Get all note schemas for this course
        const noteSchemas = await prisma.noteSchema.findMany({
            where: {
                courseId,
                universityId
            }
        });

        return {
            noteSchemas: noteSchemas.map(schema => ({
                id: schema.id,
                userId: schema.userId,
                universityId: schema.universityId,
                courseId: schema.courseId,
                name: schema.name,
                type: schema.type,
                weight: schema.weight,
                createdAt: schema.createdAt,
                updatedAt: schema.updatedAt
            }))
        };
    }
);

// ==== Get Single Note Schema ====

interface GetNoteSchemaRequest {
    universityId: number;
    courseId: number;
    schemaId: number;
}

export const getNoteSchema = api(
    {
        expose: true,
        method: "GET",
        path: "/api/university/:universityId/course/:courseId/note-schema/:schemaId",
        auth: true
    },
    async ({ universityId, courseId, schemaId }: GetNoteSchemaRequest): Promise<NoteSchemaResponse> => {
        // Validate course exists
        const course = await prisma.course.findUnique({
            where: {
                id: courseId,
                universityId
            }
        });

        if (!course) {
            throw APIError.notFound("Course not found in this university");
        }

        // Get auth data to check if the user is the lecturer for this course
        const auth = getAuthData();
        
        // Check if the user is the lecturer for this course
        if (course.lecturerId !== auth.userId) {
            throw APIError.permissionDenied("You are not the lecturer for this course");
        }

        // Get the note schema
        const noteSchema = await prisma.noteSchema.findFirst({
            where: {
                id: schemaId,
                courseId,
                universityId
            }
        });

        if (!noteSchema) {
            throw APIError.notFound("Note schema not found");
        }

        return {
            id: noteSchema.id,
            userId: noteSchema.userId,
            universityId: noteSchema.universityId,
            courseId: noteSchema.courseId,
            name: noteSchema.name,
            type: noteSchema.type,
            weight: noteSchema.weight,
            createdAt: noteSchema.createdAt,
            updatedAt: noteSchema.updatedAt
        };
    }
);

// ==== Create Note Schema ====

interface CreateNoteSchemaRequest {
    universityId: number;
    courseId: number;
    name: string;
    type: "final" | "midterm" | "project" | "homework" | "quiz" | "other";
    weight: number;
}

export const createNoteSchema = api(
    {
        expose: true,
        method: "PUT", // Changed from POST to PUT for creating data
        path: "/api/university/:universityId/course/:courseId/note-schema",
        auth: true
    },
    async ({ universityId, courseId, name, type, weight }: CreateNoteSchemaRequest): Promise<NoteSchemaResponse> => {
        // Validate course exists
        const course = await prisma.course.findUnique({
            where: {
                id: courseId,
                universityId
            }
        });

        if (!course) {
            throw APIError.notFound("Course not found in this university");
        }

        // Get auth data to check if the user is the lecturer for this course
        const auth = getAuthData();
        
        // Check if the user is the lecturer for this course
        if (course.lecturerId !== auth.userId) {
            throw APIError.permissionDenied("You are not the lecturer for this course");
        }

        // Create the note schema
        const noteSchema = await prisma.noteSchema.create({
            data: {
                userId: auth.userId,
                universityId,
                courseId,
                name,
                type,
                weight: weight ?? null
            }
        });

        return {
            id: noteSchema.id,
            userId: noteSchema.userId,
            universityId: noteSchema.universityId,
            courseId: noteSchema.courseId,
            name: noteSchema.name,
            type: noteSchema.type,
            weight: noteSchema.weight,
            createdAt: noteSchema.createdAt,
            updatedAt: noteSchema.updatedAt
        };
    }
);

// ==== Update Note Schema ====

interface UpdateNoteSchemaRequest {
    universityId: number;
    courseId: number;
    schemaId: number;
    name?: string;
    type?: "final" | "midterm" | "project" | "homework" | "quiz" | "other";
    weight?: number;
}

export const updateNoteSchema = api(
    {
        expose: true,
        method: "PATCH", // Changed from PUT to PATCH for editing data
        path: "/api/university/:universityId/course/:courseId/note-schema/:schemaId",
        auth: true
    },
    async ({ universityId, courseId, schemaId, name, type, weight }: UpdateNoteSchemaRequest): Promise<NoteSchemaResponse> => {
        // Validate course exists
        const course = await prisma.course.findUnique({
            where: {
                id: courseId,
                universityId
            }
        });

        if (!course) {
            throw APIError.notFound("Course not found in this university");
        }

        // Get auth data to check if the user is the lecturer for this course
        const auth = getAuthData();
        
        // Check if the user is the lecturer for this course
        if (course.lecturerId !== auth.userId) {
            throw APIError.permissionDenied("You are not the lecturer for this course");
        }

        // Validate the note schema exists
        const existingSchema = await prisma.noteSchema.findFirst({
            where: {
                id: schemaId,
                courseId,
                universityId
            }
        });

        if (!existingSchema) {
            throw APIError.notFound("Note schema not found");
        }

        // Update the note schema
        const noteSchema = await prisma.noteSchema.update({
            where: {
                id: schemaId
            },
            data: {
                name: name !== undefined ? name : undefined,
                type: type !== undefined ? type : undefined,
                weight: weight !== undefined ? weight : undefined
            }
        });

        return {
            id: noteSchema.id,
            userId: noteSchema.userId,
            universityId: noteSchema.universityId,
            courseId: noteSchema.courseId,
            name: noteSchema.name,
            type: noteSchema.type,
            weight: noteSchema.weight,
            createdAt: noteSchema.createdAt,
            updatedAt: noteSchema.updatedAt
        };
    }
);

// ==== Delete Note Schema ====

interface DeleteNoteSchemaRequest {
    universityId: number;
    courseId: number;
    schemaId: number;
}

interface DeleteNoteSchemaResponse {
    success: boolean;
}

export const deleteNoteSchema = api(
    {
        expose: true,
        method: "DELETE",
        path: "/api/university/:universityId/course/:courseId/note-schema/:schemaId",
        auth: true
    },
    async ({ universityId, courseId, schemaId }: DeleteNoteSchemaRequest): Promise<DeleteNoteSchemaResponse> => {
        // Validate course exists
        const course = await prisma.course.findUnique({
            where: {
                id: courseId,
                universityId
            }
        });

        if (!course) {
            throw APIError.notFound("Course not found in this university");
        }

        // Get auth data to check if the user is the lecturer for this course
        const auth = getAuthData();
        
        // Check if the user is the lecturer for this course
        if (course.lecturerId !== auth.userId) {
            throw APIError.permissionDenied("You are not the lecturer for this course");
        }

        // Validate the note schema exists
        const existingSchema = await prisma.noteSchema.findFirst({
            where: {
                id: schemaId,
                courseId,
                universityId
            }
        });

        if (!existingSchema) {
            throw APIError.notFound("Note schema not found");
        }

        // Check if there are any associated note data records
        const noteDataCount = await prisma.noteData.count({
            where: {
                schema_id: schemaId
            }
        });

        if (noteDataCount > 0) {
            throw APIError.failedPrecondition(
                "Cannot delete note schema with existing note data. Delete the note data first."
            );
        }

        // Delete the note schema
        await prisma.noteSchema.delete({
            where: {
                id: schemaId
            }
        });

        return { success: true };
    }
);
