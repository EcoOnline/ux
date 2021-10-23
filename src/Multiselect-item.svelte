<script>
    import Items from "./Multiselect-item.svelte";
    import { createEventDispatcher } from 'svelte';
    import { slide } from 'svelte/transition';

	const dispatch = createEventDispatcher();

    export let items = []
    export let indent = 0;
    export let indentW = 0;
    export let search_word = '';

    $: indent_next = parseInt(indent, 10) + 1

    function handleCheck(item) {
        dispatch('handleCheck', item);
    }
    function bubbleCheck(event) {
        dispatch('handleCheck', event.detail);
    }
</script>


{#if items.length}
    {#each items as item }
        {#if search_word == '' || item.name.startsWith(search_word) || JSON.stringify(item.children).indexOf('"name":"' + search_word)>=0}
        
        <div class="dropdown-item" style="margin-left:{indentW*indent}px" transition:slide>
                {#if item.children.length}
                    {#if item.open || search_word !== ''}
                        <svg on:click="{ () => { item.open = false}}" width="24" height="24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 32 32" style="enable-background:new 0 0 32 32;" xml:space="preserve">
                            <polygon points="16,10 26,20 24.6,21.4 16,12.8 7.4,21.4 6,20 "/>
                        </svg>
                    {:else}
                        <svg on:click="{ () => { item.open = true}}" width="24" height="24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 32 32" style="enable-background:new 0 0 32 32;" xml:space="preserve">
                            <polygon points="16,22 6,12 7.4,10.6 16,19.2 24.6,10.6 26,12 "/>
                        </svg>  
                    {/if}
                {/if}
                {#if item.permission}
                    {#if item.disabled}
                        <div class="fake-checkbox" on:click={ () => { alert('Items must be on the same level')}}></div>
                    {:else}
                        <input type="checkbox" disabled={item.disabled} bind:checked={item.checked} on:change={ () => { handleCheck(item) }}/>
                    {/if}
                {/if}
                {#if search_word == '' || item.name.indexOf(search_word) !== 0}
                    {item.name}
                {:else}
                    <b>{search_word}</b>{item.name.substr(search_word.length)}
                {/if}
                <!--<small>(level {item.level})</small>-->
            </div>
            {#if item.open || search_word !== ''}
                <Items on:handleCheck={bubbleCheck} items={item.children.sort( function(a,b) {
                    return a.name.toLowerCase() < b.name.toLowerCase();
                })} indent={indent_next} {search_word} {indentW}></Items>  
            {/if} 
        {/if}
    {/each}
{/if}


<style>

    .dropdown-item {
        height:48px;
        border-bottom:1px solid #d3d3d3;
        border-top:1px solid #d3d3d3;
        margin-bottom:-1px;
        position:relative;
        box-sizing: border-box;
        border-left:3px solid #D4D5EA;
        padding:14px 8px;
        color:#1a1919;
    }

    .fake-checkbox {
        margin: 3px 3px 3px 4px;
        display: inline-block;
        vertical-align: middle;
        border:1px solid #e0e0e0;
        cursor: no-drop;
        border-radius:3px;
        width:13px;
        height:13px;
    }

    input {
        vertical-align: middle;
    }

    svg {
        fill: #1a1919;
        vertical-align: middle;
    }
</style>