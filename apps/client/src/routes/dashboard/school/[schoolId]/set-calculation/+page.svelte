<script lang="ts">
    import { browser } from "$app/environment";
    import { page } from "$app/state";
    import Code from "$lib/components/code.svelte";
    import { Button } from "$lib/components/ui/button";


    import { Switch } from "$lib/components/ui/switch";
    import { states } from "$lib/data.svelte";
    import { req } from "$lib/utils";
    import { BlocklyComponent } from "@hexput/blockly-svelte"
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";

    let currentUniversity = $derived(states.schools.find((school) => school.id === Number(page.params.schoolId)));
    // svelte-ignore state_referenced_locally
    let code = $state(currentUniversity?.note_calculation ?? "");
    // svelte-ignore state_referenced_locally
    let checked = $state(false);
    let workspace: any = $state(null);
    let blockly: any = browser ? (window as any).Blockly : null;

    onMount(() => {
        setTimeout(() => {
            checked = code ? true : false;
        }, 100);

        let interval = setInterval(() => {
            if (browser) {
                if ((window as any).Blockly) {
                    blockly = (window as any).Blockly;
                    clearInterval(interval);
                }
            }
        }, 100);

        let blocklyChange = setInterval(() => {
            if (workspace && !checked) {
                code = generateCode();
            }
        }, 1000);

        return () => {
            if (interval) clearInterval(interval);
            if (blocklyChange) clearInterval(blocklyChange);
        };
    });

    function generateCode() {
        const code = (blockly as any).Hexput.workspaceToCode(workspace);
        return code;
    }
</script>

<div class="flex w-full min-h-full flex-col">
    <div class="flex flex-row p-2 gap-2">
        <h1>
            Code Raw
        </h1>
        <Switch bind:checked />
    </div>
    <div class="h-96 w-full {checked ? 'hidden' : 'flex'}">
        <BlocklyComponent bind:workspace>
            {#snippet toolBox()}
                <category name="Variables" colour="230">
                    <block type="variable_declaration"></block>
                    <block type="variable_reference"></block>
                </category>
                <category name="Values" colour="160">
                    <block type="number_literal"></block>
                    <block type="string_literal"></block>
                    <block type="boolean_literal"></block>
                    <block type="any_concat"></block>
                    <block type="math_subtract"></block>
                    <block type="math_multiply"></block>
                    <block type="math_divide"></block>
                </category>
                <category name="Collections" colour="290">
                    <block type="array_literal"></block>
                    <block type="array_item"></block>
                    <block type="object_literal"></block>
                    <block type="object_property"></block>
                    <block type="object_property_access"></block>
                    <block type="object_bracket_access"></block>
                    <block type="array_index_access"></block>
                </category>
                <category name="Control" colour="210">
                    <block type="if_statement"></block>
                    <block type="loop_statement"></block>
                    <block type="function_call"></block>
                    <block type="function_params"></block>
                    <block type="function_parameter"></block>
                    <block type="return_statement"></block>
                </category>
                <category name="Logic" colour="210">
                    <block type="logic_and"></block>
                    <block type="logic_or"></block>
                    <block type="logic_not"></block>
                    <block type="comparison_eq"></block>
                    <block type="comparison_neq"></block>
                    <block type="comparison_gt"></block>
                    <block type="comparison_lt"></block>
                    <block type="comparison_gte"></block>
                    <block type="comparison_lte"></block>
                </category>
                <category name="Calculation Variables" colour="032">
                    <block type="final"></block>
                    <block type="total"></block>
                    <block type="student"></block>
                    <block type="notes"></block>
                </category>
            {/snippet}
        </BlocklyComponent>
    </div>
    <div class="flex w-full {!checked ? 'cursor-not-allowed opacity-60' : ''}">
        <Code bind:code class="w-full {!checked ? 'pointer-events-none' : ''}" />
    </div>
    <div class="flex flex-row justify-center w-full pt-4">
        <Button class="w-min" onclick={() => {
            if (currentUniversity) {
                currentUniversity.note_calculation = code;
            }

            req(`/university/${page.params.schoolId}/note-calculation`, 'PATCH', {
                code: code
            })
                .then(() => {
                    toast.success("Calculation submitted successfully");
                })
                .catch(() => {
                    toast.error("Failed to submit calculation");
                });
        }}>
            Submit Calculation
        </Button>
    </div>
</div>
