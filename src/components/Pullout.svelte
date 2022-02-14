<script>
	import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let title = 'Pullout drawer';
    export let mask_visible = true;
    export let mask_block = true;
	export let show_drawer = false;
    export let canfs = false;
    export let fs = false;

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
    <div class="drawer" class:fs>
        <div class="mask" class:visible="{mask_visible}" class:block="{mask_block}"></div>
        <div class="pullout" class:in="{drawer_in}">
            <div class="pullout-head">
                <h2>
                    {#if canfs}
                        {#if fs}
                            <i class="i-minimize i-24" on:click="{ () => { fs = false; }}"></i>
                        {:else}
                            <i class="i-maximize i-24" on:click="{ () => { fs = true; }}"></i>
                        {/if}
                    {/if}
                    {title} 
                    <span class="close" on:click="{hide_the_drawer}"><i class="i-close i-24"></i></span>
                </h2>
            </div>
            <div class="pullout-body">

                {#if $$slots.fs}
                    <!-- there is special content for fs and nofs-->
                    {#if fs}
                        <slot name="fs"></slot>
                    {:else}
                        <slot name="nofs"></slot>
                    {/if}
			        
                {:else}
                    <!-- there is special only one content for both fs and nofs-->
                    <slot></slot>
	            {/if}
            </div>
        </div>
    </div>
{/if}

<style>
	.fs .pullout.in {
        width:100%;
    }
</style>