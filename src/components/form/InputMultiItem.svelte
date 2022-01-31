<script>
    import { createEventDispatcher } from 'svelte';
    import Item from './InputMultiItem.svelte';
    export let f;
    export let indent = 0;
    const dispatch = createEventDispatcher();

    $: indent_class = (indent > 5 ? 5 : indent);

    function toggle_item() {
        f.selected = !f.selected;
        dispatch('item_update', {
			item: f
		});
    }

    function handleItemUpdate(ev) {
        dispatch('item_update', {
			item: ev.detail.item
		});
    }
</script>

{#if f.visible}
    <div class="multi-item indent{indent_class}" >
        {#if f.selectable}
            {#if f.selected}
                <i class="i-checkbox-selected i-20" on:click="{toggle_item}"></i>
            {:else}
                <i class="i-checkbox i-20" on:click="{toggle_item}"></i>
            {/if}
        {/if}
        {f.value}
        {#if f.pii}
                <i title="Personally Identifiable Information" class="i-fingerprint i-16"></i>
        {/if}
        {#if f.children}
            {#if f.expanded}
                <i class="i-chevron-up i-20" on:click="{ () => { f.expanded = false; } }"></i>
            {:else if f.expanded === false}
                <i class="i-chevron-down i-20" on:click="{ () => { f.expanded = true; } }"></i>
            {/if}
      
        {/if}
    
    </div>
    {#if f.children && f.expanded}
        {#each f.children as f}
            <svelte:self {f} indent={indent+1} on:item_update="{handleItemUpdate}"/>
        {/each}
    {/if}
{/if}

<style>
    .multi-item {
        border-top:1px solid var(--eo-border-reduced);
        border-bottom:1px solid var(--eo-border-reduced);
        padding:8px 16px;
        border-left:3px solid #D4D5EA;
        margin-top:-1px;
    }
    .indent0 { border-left:none; }
    .indent1 { margin-left: 20px; }
    .indent2 { margin-left: 40px; }
    .indent3 { margin-left: 60px; }
    .indent4 { margin-left: 80px; }
    .indent5 { margin-left: 100px; }
</style>
