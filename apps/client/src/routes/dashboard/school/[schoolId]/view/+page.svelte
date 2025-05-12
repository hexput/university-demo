<script lang="ts">
    import { page } from "$app/state";
    import { states, type BaseCourse } from "$lib/data.svelte";
    import { req } from "$lib/utils";
    import { onMount } from "svelte";

    let courses = $state([] as BaseCourse[]);
    let universityId = $derived(page.params.schoolId);

    onMount(() => {
        setCourses();
    });

    async function waitUntilLoaded() {
        while (states.loading) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
    }

    async function setCourses() {
        await waitUntilLoaded();
        try {
            const { courses: currentCourses }: any = await req(`/university/${universityId}/student/courses`, "GET");
            if (!currentCourses) throw new Error("No courses found");

            for (const course of currentCourses) {
                const { id } = course;
                const data: any = await req(`/university/${universityId}/student/course/${id}/notes`, "GET");
                if (!data) throw new Error("No notes found");
                course.data = data;
            }

            courses = currentCourses;
        } catch (error) {
            console.error(error);
        }
    }
</script>

<div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-6 text-center text-gray-800">My Courses</h1>

    {#if courses.length === 0 && !states.loading}
        <p class="text-center text-gray-600">No courses found or still loading...</p>
    {/if}

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each courses as course (course.id)}
            <div class="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300">
                <h2 class="text-2xl font-semibold mb-3 text-indigo-700">{course.name}</h2>
                
                {#if course.lecturer}
                    <p class="text-sm text-gray-600 mb-1">
                        Lecturer: {course.lecturer.firstName || ''} {course.lecturer.lastName || ''} ({course.lecturer.username})
                    </p>
                {/if}

                {#if course.data}
                    <div class="mt-4 pt-4 border-t border-gray-200">
                        <h3 class="text-lg font-medium mb-2 text-gray-700">Course Details:</h3>
                        
                        {#if course.data.finalGrade !== null && course.data.finalGrade !== undefined}
                            <p class="mb-2">
                                <span class="font-semibold">Average Grade:</span> 
                                <span class:text-green-600={course.data.passed} class:text-red-600={course.data.passed === false}>
                                    {course.data.finalGrade.toFixed(2)}
                                </span>
                            </p>
                        {/if}

                        {#if course.data.passed !== null && course.data.passed !== undefined}
                            <p class="mb-3">
                                <span class="font-semibold">Status:</span> 
                                {#if course.data.passed}
                                    <span class="text-green-600 font-medium">Passed</span>
                                {:else}
                                    <span class="text-red-600 font-medium">Failed</span>
                                {/if}
                            </p>
                        {/if}

                        {#if course.data.notes && course.data.notes.length > 0}
                            <h4 class="text-md font-medium mt-3 mb-2 text-gray-600">Notes:</h4>
                            <ul class="space-y-2">
                                {#each course.data.notes as note (note.id)}
                                    <li class="bg-gray-50 p-3 rounded-md shadow-sm">
                                        <div class="flex justify-between items-center">
                                            <span class="font-medium text-gray-700" class:text-blue-600={note.type.toLowerCase() == "final"} >{note.name}</span>
                                            {#if note.note !== null && note.note !== undefined}
                                                <span class="text-indigo-600 font-semibold">{note.note}</span>
                                            {:else}
                                                <span class="text-gray-400 italic">Not Graded</span>
                                            {/if}
                                        </div>
                                        <p class="text-xs text-gray-500">Weight: {note.weight * 100}%</p>
                                    </li>
                                {/each}
                            </ul>
                        {:else}
                            <p class="text-sm text-gray-500 italic">No notes available for this course.</p>
                        {/if}
                    </div>
                {:else}
                    <p class="text-sm text-gray-500 italic mt-4">No data available for this course.</p>
                {/if}
            </div>
        {/each}
    </div>
</div>