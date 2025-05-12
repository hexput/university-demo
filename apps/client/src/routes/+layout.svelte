<script lang="ts">
    import { browser } from '$app/environment';
    import { BASE_URL } from '$lib';
    import { states } from '$lib/data.svelte';
    import { onMount } from 'svelte';
	import '../app.css';
    import LoginForm from '$lib/components/login-form.svelte';
    import { Toaster } from '$lib/components/ui/sonner';
    import { req } from '$lib/utils';
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
	import { BlocklyInit, addCustomLiteral } from "@hexput/blockly-svelte"
	
	let { children } = $props();

	onMount(async () => {
		if (browser) {
			if (!states.auth_token) {
				try {
					states.auth_token = localStorage.getItem('auth_token');
					if (!states.auth_token) throw new Error('No auth token found');
					const { user }: any = await req('/check-auth', 'POST', {
						token: states.auth_token
					});

					const { schools }: any = await req('/my-schools', 'GET');
					if (!schools) throw new Error('No schools found');

					states.user = user;
					states.schools = schools;
				} catch {
					localStorage.removeItem('auth_token');
					states.auth_token = null;
					states.user = null;
					states.schools = [];
				}
			}
			states.loading = false;

			addCustomLiteral("final", "Final Exam", "final");
			addCustomLiteral("total", "Total Score", "total");
			addCustomLiteral("student", "Student", "student");
			addCustomLiteral("notes", "Notes", "notes");
		}
	});

	$effect(() => {
		if (!browser) return;
		if (page.url.pathname === '/' && states.user && states.auth_token && !states.loading) {
			goto('/dashboard');
		}
	})
</script>

<BlocklyInit />
<Toaster />
{#if states.loading}
	<div class="w-screen h-screen flex items-center justify-center">
		<h1 class="text-3xl font-bold text-center">
			Loading...
		</h1>
	</div>
{:else}
	<div class="w-screen h-screen flex items-start justify-start flex-col">
		{#if states.user}
			{@render children()}
		{:else}
			<div class="flex h-screen w-full items-center justify-center px-4">
				<LoginForm />
			</div>
		{/if}
	</div>
{/if}

