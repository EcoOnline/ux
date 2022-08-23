<script>
    import { onMount } from 'svelte';
    import Section from './Section.svelte';
	import InputCheckbox from "./InputCheckbox.svelte";
	import InputFilters from "./InputFilters.svelte";
	import InputLookup from "./InputLookup.svelte";
	import InputMatrix from "./InputMatrix.svelte";
	import InputMulti from "./InputMulti.svelte";
	import InputPassword from "./InputPassword.svelte";
	import InputPasswordConfirm from "./InputPasswordConfirm.svelte";
    import InputSelect from "./InputSelect.svelte";
	import InputSignature from "./InputSignature.svelte";
	import InputSwitch from "./InputSwitch.svelte";
	import InputText from "./InputText.svelte";
	import InputTextarea from "./InputTextarea.svelte";

    export let f;
    export let channel = 'ANSWER';

    let components = {
        "section": Section,
		"input_checkbox": InputCheckbox,
		"input_filters": InputFilters,
		"input_lookup": InputLookup,
		"input_matrix": InputMatrix,
		"input_multi": InputMulti,
		"input_password": InputPassword,
		"input_password_confirm": InputPasswordConfirm,
		"input_select": InputSelect,
		"input_signature": InputSignature,
		"input_switch": InputSwitch,
		"input_text": InputText,
		"input_textarea": InputTextarea
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