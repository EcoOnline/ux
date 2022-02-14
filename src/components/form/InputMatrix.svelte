<script>
    import Shortcuts from "./Shortcuts.svelte";
    import PubSub from 'pubsub-js'
    export let f;


    function open_matrix() {
        let answer = JSON.parse(JSON.stringify(f));
        PubSub.publish('MATRIX', f);
    }
</script>


<div class="form-item">
    {#if f.label}
        <label for="{f.id}">{f.label} {#if f.optional}<span class="optional">(Optional)</span>{/if}</label>
    {/if}
    {#if f.hint}
        <p>{f.hint}</p>
    {/if}
    <div class="form-control" on:click="{open_matrix}">
        <div class="matrix" class:ok="{f.answer.color == 'ok'}" class:warning="{f.answer.color == 'warning'}" class:critical="{f.answer.color == 'critical'}">{f.answer.text ? f.answer.text : ''}</div>
        <i class="i-hinton-plot  i-20" ></i>
    </div>
    <Shortcuts {f} on:shortcut={(ev) => { f.answer = ev.detail.value.toLocaleString(); }}/>
</div>

<style>
    .form-control {
        width:82px;
        padding:4px;
    }
    .matrix {
        border:1px solid var(--eo-border-reduced);
        border-radius:8px;
        width: 38px;
        height: 38px;
        margin-right:8px;
        text-align: center;
        line-height: 38px;
        font-weight: 900;
    }
    .matrix.ok {
        background: var(--eo-secondary-500);
        border:1px solid var(--eo-secondary-500);
    }
    .matrix.warning {
        background: var(--eo-warning-500);
        border:1px solid var(--eo-warning-500);
    }
    .matrix.critical {
        background: var(--eo-critical-500);
        border:1px solid var(--eo-critical-500);
    }
</style>

