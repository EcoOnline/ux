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
        {#if f.options.length > 5}
            <select class="form-control"bind:value="{f.answer}">
                {#each f.options as option}
                    <option value="{(typeof option.value !== 'undefined' ? option.value : option.text)}">{option.text}</option>
                {/each}
            </select>
        {:else}
            <div class='options' class:inline={f.options.length < 3}>
                {#each f.options as option}
                <label class:selected={f.answer == (typeof option.value !== 'undefined' ? option.value : option.text)}><input type="radio" bind:group={f.answer} name={f.id} value="{(typeof option.value !== 'undefined' ? option.value : option.text)}"> {option.text}</label>
                {/each}
            </div>
        {/if}
    {/if}


</div>

<style>
    .options {
        display: flex;
        flex-direction: column;
    }
    .options label {
        font-weight:normal;
        border:1px solid var(--eo-border-input);
        margin-bottom:8px;
        padding: 12px;
        border-radius: 12px;

    }

    .options.inline {
        flex-direction: row;
    }
    .options.inline label {
        margin-right:8px;
        flex:1;
        max-width:236px;
    }
    label.selected {
        border:1px solid var(--eo-primary-500);
        background-color: var(--eo-primary-50);
        color: var(--eo-primary-500);
    }

</style>