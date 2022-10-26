<script>
    import Shortcuts from "./Shortcuts.svelte";
    export let channel = 'ANSWER';
    export let f;
    f.answer = getComputedStyle(document.documentElement).getPropertyValue('--h');
    f.answer2 = getComputedStyle(document.documentElement).getPropertyValue('--s');


    $: {
        let h = f.answer;
        let s = f.answer2;

        document.documentElement.style.setProperty('--h', h);
        document.documentElement.style.setProperty('--s', s);
    }

    
</script>


<div class="form-item">
    {#if f.label}
        <label for="{f.id}">{f.label} {#if f.optional}<span class="optional">(Optional)</span>{/if}</label>
    {/if}
    {#if f.hint}
        <p>{f.hint}</p>
    {/if}
    {#if f.readonly}
        <div class='readonly'>{f.answer}</div>
    {:else}

        <div class='swatches'>
            <div class='swatch1'>50</div>
            <div class='swatch2'>100</div>
            <div class='swatch3'>200</div>
            <div class='swatch4'>300</div>
            <div class='swatch5'>400</div>
            <div class='swatch6'>500</div>
            <div class='swatch7'>600</div>
            <div class='swatch8'>700</div>
            <div class='swatch9'>800</div>
            <div class='swatch10'>900</div>
        </div>

        <input bind:value="{f.answer}" type="text" class="form-control">
        <input bind:value="{f.answer2}" type="text" class="form-control">
    
        <Shortcuts {f} on:shortcut={(ev) => { let arr = ev.detail.value.split('/'); f.answer = arr[0]; f.answer2 = arr[1]; }}/>
    {/if}
</div>

<style>
    .swatches {
        display: flex;
        flex-direction: row;
    }
    .swatches div {
        width: 48px;
        height:48px;
        border-radius:4px;
        margin-right:4px;
        margin-bottom:8px;
        padding:4px;

        color: rgba(26,25,25,40%);
        font-size:8px;
        font-family: monospace;
    }
    .swatches div:nth-child(n+6) {
        color: rgba(255,255,255,40%);

    }
    .swatch1 { background-color: var(--color-swatch-50)}
    .swatch2 { background-color: var(--color-swatch-100)}
    .swatch3 { background-color: var(--color-swatch-200)}
    .swatch4 { background-color: var(--color-swatch-300)}
    .swatch5 { background-color: var(--color-swatch-400)}
    .swatch6 { background-color: var(--color-swatch-500)}
    .swatch7 { background-color: var(--color-swatch-600)}
    .swatch8 { background-color: var(--color-swatch-700)}
    .swatch9 { background-color: var(--color-swatch-800)}
    .swatch10 { background-color: var(--color-swatch-900)}
    .form-control {
        max-width:80px;
    }
</style>