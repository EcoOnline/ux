<script>
	import InputSelect from "./InputSelect.svelte";
	import InputText from "./InputText.svelte";
	import InputMulti from "./InputMulti.svelte";
	import InputTextarea from "./InputTextarea.svelte";
	import InputSwitch from "./InputSwitch.svelte";
	import InputMatrix from "./InputMatrix.svelte";

	let components = {
		"input_text": InputText,
		"input_multi": InputMulti,
		"input_select": InputSelect,
		"input_textarea": InputTextarea,
		"input_switch": InputSwitch,
		"input_matrix": InputMatrix
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
                    <svelte:component this={components[f.item_type]} {f} />
                {:else}
                    <div>Tried loading an unknown component <b>{f.item_type}</b></div>
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