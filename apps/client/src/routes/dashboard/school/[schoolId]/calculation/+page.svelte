<script>
    import { browser } from "$app/environment";
    import { page } from "$app/state";
    import Code from "$lib/components/code.svelte";
    import { states } from "$lib/data.svelte";
    import { onMount } from "svelte";

    let currentUniversity = $derived(states.schools.find((school) => school.id === Number(page.params.schoolId)));
    let code = $derived(currentUniversity?.note_calculation ?? "");

</script>
<div class="flex w-full min-h-full flex-col">
    <div class="flex w-full cursor-not-allowed">
        <Code bind:code class="w-full pointer-events-none" />
    </div>
</div>
