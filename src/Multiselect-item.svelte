<script>
    import Items from "./Multiselect-item.svelte";

    export let items = []
    export let indent = 0;

</script>


{#if items.length}
    {#each items as item }
        <div class="dropdown-item">
            <input type="checkbox" checked={item.checked} />
            {indent} 
            {item.name}
        </div>
        <Items items={item.children.sort( function(a,b) {
            return a.name.toLowerCase() < b.name.toLowerCase();
        })} indent=(indent+1)></Items>)
    {/each}
{/if}
