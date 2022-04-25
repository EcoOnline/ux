<script>
    import Shortcuts from "./Shortcuts.svelte";
    import PubSub from 'pubsub-js';
    export let f;
    export let channel;

    let input_type = 'password';
    let has_focus = false;
    let validation_showing = false;

    let sub = PubSub.subscribe(channel, read_answer);
    function read_answer(msg, data) {
        if(msg == channel && data.confirm == f.id) {
            f.password = data.answer
        }
    }
    $: v_all = (f.answer == f.password);


    function focusPassword() {
        has_focus = true;
        validation_showing = false;
    }
    function blurPassword() {
        has_focus = false;
        validation_showing = true;
        if(v_all) {
            //only show valid for a short time and then fade out
            setTimeout(() => {
                validation_showing = false;
            }, 1000);
        }

    }
    
</script>


<div class="form-item">
    {#if f.label}
        <label for="{f.id}">{f.label} {#if f.optional}<span class="optional">(Optional)</span>{/if}</label>
    {/if}
    {#if f.hint}
        <p>{f.hint}</p>
    {/if}
    <div class="password-shell">
        {#if input_type == 'password'}
            <input id="{f.id}" bind:value="{f.answer}" type="password" on:focus="{focusPassword}" on:blur="{blurPassword}" placeholder="{f.placeholder ? f.placeholder : ''}" class="form-control">
            <i on:click="{ () => { input_type = 'text'}}"class="i-view i-24"></i>
        {:else}
        <input id="{f.id}" bind:value="{f.answer}" type="text" placeholder="{f.placeholder ? f.placeholder : ''}" class="form-control">
            <i on:click="{ () => { input_type = 'password'}}"class="i-view i-24"></i>
        {/if}
    </div>
    <div class='validation-message'>
        {#if has_focus}
            {#if v_all}
                <i class='i-checkmark-green i-20'></i> Passwords match
            {/if}
        {/if}
        {#if validation_showing}
            {#if v_all}
                <i class='i-checkmark-green i-20'></i> Passwords match
            {:else}
                <span class="error"><i class='i-error i-20'></i> Passwords don't match</span>
            {/if}
        {/if}
    </div>
</div>

<style>
    .password-shell {
        position:relative;
    }
    .password-shell .i-24 {
        position:absolute;
        right:8px;
        top:12px;
    }
    .password-shell:hover .i-view {
        opacity:1;
    }
    .i-view {
        opacity:0;
        transition: all 0.3s ease-out;
    }
    .form-item {
        margin-bottom:0;
    }
    .validation-message {
        display:block;
        height:24px;
        margin:4px 12px 8px 12px;
        font-size: 14px;
    }
    .error {
        color: var(--eo-critical-500);
    }
</style>
