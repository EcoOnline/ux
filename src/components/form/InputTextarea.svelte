<script>
    export let f;
</script>


<div class="form-item">
    {#if f.label}
        <label for="{f.id}">{f.label}</label>
    {/if}
    {#if f.hint}
        <p>{f.hint}</p>
    {/if}
    {#if f.readonly}
        <div class='readonly'>{f.answer}</div>
    {:else}
        <textarea id="{f.id}" bind:value="{f.answer}" class="form-control"></textarea>
    {/if}
    
</div>
