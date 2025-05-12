<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
	import AppSidebar from "$lib/components/app-sidebar.svelte";
	import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import { states } from "$lib/data.svelte";
    import { onMount } from "svelte";

    onMount(() => {
        setTimeout(() => {
            if (page.url.pathname !== '/' && !states.user) {
                goto('/');
            }
        }, 3000);
    });

    let { children } = $props();

</script>

<Sidebar.Provider>
	<AppSidebar />
	<Sidebar.Inset>
		<header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
			<Sidebar.Trigger class="-ml-1" />
			<Separator orientation="vertical" class="mr-2 h-4" />
			<h1>University Note Calculation Demo</h1>
		</header>
		<div class="flex flex-1 flex-col gap-4 p-4">
			<!-- <div class="grid auto-rows-min gap-4 md:grid-cols-3">
				<div class="bg-muted/50 aspect-video rounded-xl"></div>
				<div class="bg-muted/50 aspect-video rounded-xl"></div>
				<div class="bg-muted/50 aspect-video rounded-xl"></div>
			</div>
			<div class="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min"></div> -->
            {@render children()}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
