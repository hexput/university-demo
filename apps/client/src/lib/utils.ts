import { BASE_URL } from "$lib";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { states } from "./data.svelte";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export async function req(path: string, method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" = "GET", body?: any) {
	console.log("Request", `${BASE_URL}${path}`, method, body);
	return await fetch(`${BASE_URL}${path}`, {
		method,
		body: body ? JSON.stringify(body) : undefined,
		//@ts-ignore
		headers: {
			...(body ? {
				"Content-Type": "application/json"
			}: {}),
			"Authorization": `${(states.auth_token ?? localStorage.getItem("auth_token")) || ""}`.trim() || "",
		}
	}).then((res) => res.json())
}