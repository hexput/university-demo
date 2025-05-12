<script lang="ts">
	import SearchForm from "$lib/components/search-form.svelte";
	import SchoolSwitcher from "$lib/components/version-switcher.svelte";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { onMount, type ComponentProps } from "svelte";
    import { states } from "$lib/data.svelte";
    import { page } from "$app/state";

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();

	let currentUniversity = $derived(states.schools.find((school) => school.id === Number(page.params.schoolId)));

	const paths = $derived({
		setCalculation: `/dashboard/school/${currentUniversity?.id}/set-calculation`,
		calculation: `/dashboard/school/${currentUniversity?.id}/calculation`,
		view: `/dashboard/school/${currentUniversity?.id}/view`,
	});

</script>

<Sidebar.Root {...restProps} bind:ref>
	<Sidebar.Header>
		<SchoolSwitcher />
		<SearchForm />
	</Sidebar.Header>
	<Sidebar.Content>
		 {#if states.user?.system_admin || states.user?.username.includes("admin")}
			<Sidebar.Group>
				<Sidebar.GroupLabel>Admin</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						<Sidebar.MenuItem>
							<Sidebar.MenuButton isActive={page.url.pathname === paths.setCalculation}>
								<a href={paths.setCalculation}>Set Calculation</a>
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
						<Sidebar.MenuItem>
							<Sidebar.MenuButton isActive={page.url.pathname === paths.calculation}>
								<a href={paths.calculation}>Calculation</a>
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		 {/if}

		 {#if states.user?.username.includes("student")}
			<Sidebar.Group>
				<Sidebar.GroupLabel>Student</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						<Sidebar.MenuItem>
							<Sidebar.MenuButton isActive={page.url.pathname === paths.view}>
								<a href={paths.view}>View</a>
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		 {/if}
		<!-- {/each} -->
	</Sidebar.Content>
	<Sidebar.Rail />
</Sidebar.Root>
