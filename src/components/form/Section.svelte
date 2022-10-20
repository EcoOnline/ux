<script>
    
	import InputCheckbox from "./InputCheckbox.svelte";
	import InputDate from "./InputDate.svelte";
	import InputLookup from "./InputLookup.svelte";
	import InputMatrix from "./InputMatrix.svelte";
	import InputMulti from "./InputMulti.svelte";
	import InputRadio from "./InputRadio.svelte";
	import InputSelect from "./InputSelect.svelte";
	import InputSignature from "./InputSignature.svelte";
	import InputSwitch from "./InputSwitch.svelte";
	import InputTally from "./InputTally.svelte";
	import InputText from "./InputText.svelte";
	import InputTextarea from "./InputTextarea.svelte";
	import RandomSelector from "./RandomSelector.svelte";

	let components = {
		"input_checkbox": InputCheckbox,
		"input_date": InputDate,
		"input_lookup": InputLookup,
		"input_matrix": InputMatrix,
		"input_multi": InputMulti,
		"input_radio": InputRadio,
		"input_select": InputSelect,
		"input_signature": InputSignature,
		"input_switch": InputSwitch,
		"input_tally": InputTally,
		"input_text": InputText,
		"input_textarea": InputTextarea,
		"random_selector": RandomSelector
    }
    

    export let f;
    export let channel;

</script>

<div class="card">
    {#if f.label}
        <div class="card-header">
            <h3>{f.label}</h3>
        </div>
    {/if}

    <div class="card-body">
        {#if f.children}

            {#each f.children as f} 
                {#if components[f.item_type]}
                    <svelte:component this={components[f.item_type]} {f} {channel}/>
                {:else}
                    <div>Tried loading an unknown component <b>{f.item_type}</b><br><br></div>
                {/if}
            {/each}
        {/if}

    </div>
</div>

<style>
    .card {
        margin-bottom:16px;
        padding:0px;
        padding-top:16px;
        padding-bottom:16px;
    }
    @media (min-width: 960px) {
        .card {
            padding: 16px;
        }
    }
    h3 {
        margin:0 0 16px 0;
        font-weight:100;
        font-size:20px
    }
</style>