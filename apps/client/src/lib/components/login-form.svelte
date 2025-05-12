<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
    import { states } from "$lib/data.svelte";
    import { req } from "$lib/utils";
    import { toast } from "svelte-sonner";

	let form = {
		username: "",
		password: ""
	}

	let authLoading = $state(false);
</script>

<Card.Root class="mx-auto max-w-sm">
	<Card.Header>
		<Card.Title class="text-2xl">Login</Card.Title>
		<Card.Description>Enter your username below to login to your account</Card.Description>
	</Card.Header>
	<Card.Content>
		<form class="grid gap-4" onsubmit={async (e) => {
			e.preventDefault();
			authLoading = true;
			toast("Logging in...");
			try {
				let { token, message }: any = await req('/login', "POST", {
					username: form.username,
					password: form.password
				});
				
				if (!token) throw new Error(message ?? "No token received");

				let { user, message: checkMessage }: any = await req('/check-auth', "POST", {
					token
				});

				if (!user) throw new Error(checkMessage ?? "No user received");

				states.auth_token = token;
				const { schools, message: schoolsMessage }: any = await req('/my-schools', 'GET');
				if (!schools) {
					states.auth_token = null;
					throw new Error(schoolsMessage ?? 'No schools found');
				}

				localStorage.setItem("auth_token", token);
				states.user = user;
				states.schools = schools;
				states.loading = false;
				toast.success("Login successful");
			} catch (e: any) {
				toast.error("Login failed: " + (e?.message || "Unknown error"));
				console.error(e);
			}
			authLoading = false;
		}}>
			<div class="grid gap-2">
				<Label for="username">Username</Label>
				<Input id="username" placeholder="admin" type="text" required bind:value={form.username} />
			</div>
			<div class="grid gap-2">
				<div class="flex items-center">
					<Label for="password">Password</Label>
				</div>
				<Input id="password" type="password" required bind:value={form.password} />
			</div>
			<Button type="submit" class="w-full" disabled={authLoading}>Login</Button>
		</form>
	</Card.Content>
</Card.Root>
