<script>
	import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let f;
    function click_shortcut(s) {
        dispatch('shortcut', {
			value: s.value
		});
    }
</script>

{#if f.shortcuts}
    <div class="shortcuts">
        {#each f.shortcuts as shortcut}
            <div class="shortcut" on:click="{ () => { click_shortcut(shortcut) } }">
                {#if shortcut.icon}
                    <i class="i-{shortcut.icon} i-16"></i>
                {/if}
                {shortcut.text}
            </div>
        {/each}
    </div>
{/if}
<style>
    .shortcuts {
        display:flex;
        flex-direction: row;
        margin-top:4px;
        margin-right:4px;
    }
    .shortcut {
        border: 1px solid var(--eo-border-reduced);
        border-radius:100px;
        font-size:12px;
        line-height:18px;
        padding:1px 8px 1px 8px;
        cursor:pointer;
        margin-right:2px;
        vertical-align: baseline;
    }
    .shortcut i {
        margin-top:-2px;
    }
    .shortcut:hover {
        background: var(--eo-border-reduced)
    }
</style>