<script>
    export let f;
    export let channel = 'ANSWER';

</script>


<div class="form-item">
    {#if f.label}
        <label>{f.label}</label>
    {/if}
    {#if f.hint}
        <p>{f.hint}</p>
    {/if}
    {#each f.options as option}
        <div class="checkbox_label" class:simple="{f.options.length == 1}" on:click="{ () => { option.value = !option.value; } }">
            {#if option.value}
                <i class="i-checkbox-selected i-20" ></i>
            {:else}
                <i class="i-checkbox i-20"></i>
            {/if}

            {option.text}
        </div>
    {/each}
    
</div>
<style>
    .checkbox_label {
        font-weight:300;
        cursor:pointer;
    }
    i {
        margin-top:-3px;
    }
</style>