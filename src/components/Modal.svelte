<script>
	import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let title = 'Pullout drawer';
    export let mask_visible = true;
    export let mask_block = true;
	export let show_modal = false;
    export let w = '840px';

    let modal_in = false;
    let modal_bool = false;


    $: {
        let s = show_modal;
        if(s) {
            show_the_modal();
        } else {
            hide_the_modal();
        }

        
    }
    function show_the_modal() {
        modal_bool = true;
        setTimeout(() => {
            modal_in = true;
        }, 300);
    }

    function hide_the_modal() {
        modal_in = false;
        setTimeout(() => {
            modal_bool = false;
        }, 300);
        dispatch('close', {});
    }
    
</script>


{#if modal_bool}
    <div class="modal">
        <div class="mask" class:visible="{mask_visible}" class:block="{mask_block}"></div>
        <div class="modal-window" class:in="{modal_in}" style="width:{w}">
            <div class="modal-head">
                <h2>
                    {title} 
                    <span class="close" on:click="{hide_the_modal}"><i class="i-close i-24"></i></span>
                </h2>
            </div>
            <div class="modal-body">
                <slot></slot>
            </div>
        </div>
    </div>
{/if}

<style>
    
</style>