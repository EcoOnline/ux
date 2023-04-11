<script>
    import Shortcuts from "./Shortcuts.svelte";
    import { onMount } from 'svelte';

	import dayjs from 'dayjs/esm';
	import 'dayjs/locale/en' // load on demand
	import DatePicker from "@beyonk/svelte-datepicker/src/components/DatePicker.svelte";

    let hack_calendar = false;
    export let f;

    f.answer = new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })


    onMount(() => {
        hack_calendar = true;
	});
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

        <div style='max-width:255px'>
            {#if hack_calendar}
            
                <DatePicker
                time={true} 
                format='ddd, DD MMM YYYY HH:mm'
                locale = 'en'
                bind:selected={f.answer}
            >
            <button class="form-control">
                {dayjs(f.answer).format('ddd, DD MMM YYYY HH:mm')}
                <div class='separator'></div>
                <i class='i-calendar i-20'></i>
            </button>
            </DatePicker>
            {/if}
        </div>

        <Shortcuts {f} on:shortcut={(ev) => { f.answer = ev.detail.value.toLocaleString(); }}/>

    {/if}


</div>





<style>
.form-control {
    background:white;
    padding-top:0;
    padding-bottom:0;
}
.form-control .i-20 {
    /*vertical-align: sub;*/
    margin-left: 8px;
}
.separator {
    border-left-width:1px;
    border-left-style: solid;
    border-left-color: var(--eo-border);
    display: inline-block;
    vertical-align: middle;
    height: 48px;
    width: 1px;
    margin-left:8px;
}

</style>