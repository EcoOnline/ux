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
    }
    .shortcut {
        border: 1px solid var(--eo-border-reduced);
        border-radius:100px;
        font-size:12px;
        line-height:12px;
        padding:4px 8px;
        cursor:pointer;
    }
    .shortcut:hover {
        background: var(--eo-border-reduced)
    }
</style>