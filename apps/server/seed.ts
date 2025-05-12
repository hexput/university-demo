import crypto from "crypto";
import { prisma } from "./database";

// Helper function to hash passwords
const hashPassword = (password: string) => {
  return crypto.createHash("sha256").update(password).digest("hex");
};

// Create admin user
prisma.user.upsert({
    where: {
        username: "admin",
    },
    update: {
        system_admin: true,
    },
    create: {
        username: "admin",
        password: hashPassword("password7452"),
        system_admin: true,
    },
}).then(() => {}).catch(() => {});

// Create Maltepe University
prisma.university.upsert({
    where: {
        name: "Maltepe University"
    },
    update: {},
    create: {
        name: "Maltepe University",
    }
}).then(async (university) => {
    // Create university admin user
    const uniAdmin = await prisma.user.upsert({
        where: { username: "uniadmin" },
        update: {},
        create: {
            username: "uniadmin",
            password: hashPassword("admin123"),
            firstName: "John",
            lastName: "Doe",
        }
    });
    
    // Create lecturer user
    const lecturer = await prisma.user.upsert({
        where: { username: "professor" },
        update: {},
        create: {
            username: "professor",
            password: hashPassword("teach123"),
            firstName: "Jane",
            lastName: "Smith",
        }
    });
    
    // Create student user
    const student = await prisma.user.upsert({
        where: { username: "student" },
        update: {},
        create: {
            username: "student",
            password: hashPassword("study123"),
            firstName: "Alex",
            lastName: "Johnson",
        }
    });
    
    // Assign roles to users
    await prisma.userRole.upsert({
        where: { 
            userId_universityId: { userId: uniAdmin.id, universityId: university.id } 
        },
        update: { role: "ADMIN" },
        create: {
            userId: uniAdmin.id,
            universityId: university.id,
            role: "ADMIN"
        }
    });
    
    await prisma.userRole.upsert({
        where: { 
            userId_universityId: { userId: lecturer.id, universityId: university.id } 
        },
        update: { role: "LECTURER" },
        create: {
            userId: lecturer.id,
            universityId: university.id,
            role: "LECTURER"
        }
    });
    
    const studentRole = await prisma.userRole.upsert({
        where: { 
            userId_universityId: { userId: student.id, universityId: university.id } 
        },
        update: { role: "STUDENT" },
        create: {
            userId: student.id,
            universityId: university.id,
            role: "STUDENT"
        }
    });
    
    // Create a course
    const course = await prisma.course.upsert({
        where: {
            id: 1
        },
        update: {},
        create: {
            name: "Introduction to Computer Science",
            universityId: university.id,
            lecturerId: lecturer.id
        }
    });
    
    // Enroll the student in the course
    await prisma.student.upsert({
        where: {
            courseId_userId_universityId: {
                courseId: course.id,
                userId: student.id,
                universityId: university.id
            }
        },
        update: {},
        create: {
            courseId: course.id,
            userId: student.id,
            universityId: university.id
        }
    });
    
    // Create note schemas (grading components) for the course
    const midtermSchema = await prisma.noteSchema.upsert({
        where: { id: 1 },
        update: {},
        create: {
            userId: lecturer.id,
            universityId: university.id,
            courseId: course.id,
            name: "Midterm Exam",
            type: "EXAM",
            weight: 0.3 // 30% of total grade
        }
    });
    
    const finalSchema = await prisma.noteSchema.upsert({
        where: { id: 2 },
        update: {},
        create: {
            userId: lecturer.id,
            universityId: university.id,
            courseId: course.id,
            name: "Final Exam",
            type: "EXAM",
            weight: 0.5 // 50% of total grade
        }
    });
    
    const assignmentSchema = await prisma.noteSchema.upsert({
        where: { id: 3 },
        update: {},
        create: {
            userId: lecturer.id,
            universityId: university.id,
            courseId: course.id,
            name: "Assignments",
            type: "HOMEWORK",
            weight: 0.2 // 20% of total grade
        }
    });
    
    // Add some sample grades
    const studentObj = await prisma.student.findFirst({
        where: {
            userId: student.id,
            courseId: course.id
        }
    });
    
    if (studentObj) {
        // Add midterm grade
        await prisma.noteData.upsert({
            where: {
                schema_id_student_id: {
                    schema_id: midtermSchema.id,
                    student_id: studentObj.id
                }
            },
            update: { note: 85 },
            create: {
                schema_id: midtermSchema.id,
                student_id: studentObj.id,
                note: 85
            }
        });
        
        // Add assignment grade
        await prisma.noteData.upsert({
            where: {
                schema_id_student_id: {
                    schema_id: assignmentSchema.id,
                    student_id: studentObj.id
                }
            },
            update: { note: 92 },
            create: {
                schema_id: assignmentSchema.id,
                student_id: studentObj.id,
                note: 92
            }
        });
        
        // Final exam grade
        await prisma.noteData.upsert({
            where: {
                schema_id_student_id: {
                    schema_id: assignmentSchema.id,
                    student_id: studentObj.id
                }
            },
            update: { note: 40 },
            create: {
                schema_id: finalSchema.id,
                student_id: studentObj.id,
                note: 40
            }
        });
    }
    
    console.log("Seed data created successfully!");
}).catch((error) => {
    console.error("Error seeding data:", error);
});

