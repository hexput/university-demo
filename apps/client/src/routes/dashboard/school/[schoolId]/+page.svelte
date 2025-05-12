<script lang="ts">

    import { page } from "$app/state";
    import { states } from "$lib/data.svelte";
    let schoolId = $derived(page.params.schoolId);
    let school = $derived(states.schools.find(school => school.id === parseInt(schoolId)));
</script>