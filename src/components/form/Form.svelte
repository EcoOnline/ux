<script>
    import { onMount } from 'svelte';
    import Section from './Section.svelte';
    import InputSelect from "./InputSelect.svelte";
	import InputText from "./InputText.svelte";
	import InputMulti from "./InputMulti.svelte";
	import InputTextarea from "./InputTextarea.svelte";
	import InputCheckbox from "./InputCheckbox.svelte";

    export let f;
    export let channel = 'ANSWER';

    let components = {
        "section": Section,
		"input_text": InputText,
		"input_multi": InputMulti,
		"input_select": InputSelect,
		"input_textarea": InputTextarea,
		"input_checkbox": InputCheckbox
    }

    onMount(() => {
		console.log('Form and all children are mounted');
	});

</script>

{#each f as f}
    {#if components[f.item_type]}
        <svelte:component this={components[f.item_type]} {f} {channel}/>
    {:else}
        Unknown component <b>{f.item_type}</b> on Form.svelte.
    {/if}
{/each}