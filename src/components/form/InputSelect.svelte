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
    <select class="form-control"bind:value="{f.answer}">
        {#each f.options as option}
            <option value="{option.value}">{option.text}</option>
        {/each}
    </select>
</div>
