<script lang="ts">
    import { browser } from "$app/environment";
    import { goto } from "$app/navigation";
    import { states } from "$lib/data.svelte";
    import { onMount } from "svelte";

    onMount(() => {
        let timeout: any;
        if (browser) {
            if (states.schools.length > 0) {
                goto(`/dashboard/school/${states.schools[0].id}`);
            } else {
                timeout = setTimeout(() => {
                    if (states.schools.length > 0) {
                        goto(`/dashboard/school/${states.schools[0].id}`);
                    }
                }, 3000);
            }
        }

        return () => {
            if (timeout) {
                clearTimeout(timeout);
            }
        };
    });

    $effect(() => {
        states.loading;
        if (states.schools.length > 0) {
            goto(`/dashboard/school/${states.schools[0].id}`);
        }
    })

</script>