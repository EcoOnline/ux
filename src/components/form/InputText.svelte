<script>
    import Shortcuts from "./Shortcuts.svelte";
    export let f;
</script>


<div class="form-item">
    {#if f.label}
        <label for="{f.id}">{f.label} {#if f.optional}<span class="optional">(Optional)</span>{/if}</label>
    {/if}
    {#if f.hint}
        <p>{f.hint}</p>
    {/if}
    <input id="{f.id}" bind:value="{f.answer}" type="text" placeholder="{f.placeholder ? f.placeholder : ''}" class="form-control">
    
    <Shortcuts {f} on:shortcut={(ev) => { f.answer = ev.detail.value.toLocaleString(); }}/>
</div>

