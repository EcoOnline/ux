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
    <textarea id="{f.id}" bind:value="{f.answer}" class="form-control"></textarea>
    
</div>
