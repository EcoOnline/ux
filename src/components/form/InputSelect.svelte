<script>
    export let f;
    //export let channel = 'ANSWER';
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
        <select class="form-control"bind:value="{f.answer}">
            {#each f.options as option}
                <option value="{(typeof option.value !== 'undefined' ? option.value : option.text)}">{option.text}</option>
            {/each}
        </select>
    {/if}
</div>
