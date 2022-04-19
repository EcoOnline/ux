<script>
    import Shortcuts from "./Shortcuts.svelte";
    export let f;
    let input_type = 'password';


    function focusPassword() {
        /*has_focus = true;
        validation_showing = false*/
    }
    function blurPassword() {
        /*has_focus = false;
        validation_showing = true;
        if(v_all) {
            //only show valid for a short time and then fade out
            setTimeout(() => {
                validation_showing = false;
            }, 3000);
        }
        */

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
    .form-item {
        margin-bottom:0;
    }
    .validation-message {
        display:block;
        height:24px;
        margin:4px 12px;
        font-size: 14px;
    }
</style>
