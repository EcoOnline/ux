<script>
	import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let title = 'Pullout drawer';
    export let mask_visible = true;
    export let mask_block = true;
	export let show_drawer = false;

    let drawer_in = false;
    let drawer_bool = false;


    $: {
        let s = show_drawer;
        if(s) {
            show_the_drawer();
        } else {
            hide_the_drawer();
        }

        
    }
    function show_the_drawer() {
        drawer_bool = true;
        setTimeout(() => {
            drawer_in = true;
        }, 300);
    }

    function hide_the_drawer() {
        drawer_in = false;
        setTimeout(() => {
            drawer_bool = false;
        }, 300);
        dispatch('close', {});
    }
    
</script>


{#if drawer_bool}
    <div class="drawer">
        <div class="mask" class:visible="{mask_visible}" class:block="{mask_block}"></div>
        <div class="pullout" class:in="{drawer_in}">
            <div class="pullout-head">
                <h2>{title} <span class="close" on:click="{hide_the_drawer}"><i class="i-close i-24"></i></span></h2>
            </div>
            <div class="pullout-body">
                <slot></slot>
            </div>
        </div>
    </div>
{/if}

<style>
	
</style>