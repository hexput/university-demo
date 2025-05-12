export interface School {
    id: number;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    note_calculation: string;
}

interface CourseData {
    courseId: number;
    notes: {
        id: number;
        name: string;
        type: string;
        weight: number;
        note: number | null;
    }[];
    finalGrade: number | null;
    passed: boolean | null;
}

export interface BaseCourse {
    id: number;
    name: string;
    lecturer: {
        firstName: string | null;
        lastName: string | null;
        username: string;
    };
    data: Pick<CourseData, "notes" | "finalGrade" | "passed">;
}

export interface User {
    token: string | null;
    id: number;
    username: string;
    password: string;
    firstName: string | null;
    lastName: string | null;
    system_admin: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export const states = $state({
    auth_token: null as string | null,
    user: null as User | null,
    loading: true,
    schools: [] as School[],
})