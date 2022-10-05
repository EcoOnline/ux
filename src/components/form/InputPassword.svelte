<script>
    import Shortcuts from "./Shortcuts.svelte";
    import PubSub from 'pubsub-js';

    export let f;
    export let channel;

    let input_type = 'password';
    let has_focus = false;

    let input_password = false;
    let input_text = false;

    $: v_length = (f.answer.length >= 10);
    $: v_number =  (f.answer.match(/[0-9]/));
    $: v_uppercase = (f.answer !== f.answer.toLowerCase());
    $: v_lowercase = (f.answer !== f.answer.toUpperCase());
    $: v_symbols =  (f.answer.match(/[\.,\*\£\+&\(\)~$%@\^\#\-_!]/));
    $: v_all = 
        (v_length && 
        v_number && 
        v_uppercase && 
        v_lowercase && 
        v_symbols);

    let validation_showing = false;

    function keyHandler(e) {
        //test if paste was used
        //if valid password was paste jump to confirmation
        if(e.key == 'v' && e.metaKey && f.confirm) {
            setTimeout(() => {
                //allow time for validation update
                let confirmation_input = document.getElementById(f.confirm);
                if(v_all && confirmation_input) {
                    /*
                    wont work untrusted event
                    var evt = document.createEvent("KeyboardEvent");
                    console.log(evt);
                    (evt.initKeyEvent || evt.initKeyboardEvent)("keypress", true, true, window, 0, 0, 0, 0, 0, 9) 
                    */

                    /*
                    wont work normal event bug doesnt function for tab key
                    var eventObj = document.createEventObject ? document.createEventObject() : document.createEvent("Events");

                    if(eventObj.initEvent){
                        eventObj.initEvent("keydown", true, true);
                    }
                    eventObj.keyCode = 9;
                    eventObj.which = 9;
                    eventObj.key = 'Tab';
                    eventObj.code = 'Tab'

                    input_password.dispatchEvent ? input_password.dispatchEvent(eventObj) : input_password.fireEvent("onkeydown", eventObj); 
                    */

                    /*
                        hack using focus for 'next' input (doesnt respect tabindex)
                        ok for demo only 
                    */
                    confirmation_input.focus();
  
                }
               
            }, 100)
        }

        /*

        

                    */
    }
    
    function eye(input) {
        if(input == 'password') {
            input_type = 'text';
            setTimeout(() => {
                input_text.focus();
            }, 50);
        } else {
            input_type = 'password';
            setTimeout(() => {
                input_password.focus();
            }, 50);
        }
    }
   
    function focusPassword() {
        has_focus = true;
        validation_showing = false
    }
    function blurPassword() {
        PubSub.publish(channel, f); // publish so that confirmation can pick it up
        setTimeout(() => {
            if(input_password !== document.activeElement && input_text !== document.activeElement) {
                has_focus = false;
                validation_showing = true;
                if(v_all) {
                    //only show valid for a short time and then fade out
                    setTimeout(() => {
                        validation_showing = false;
                    }, 1000);
                }
            }
        }, 300);
        

    }
    
</script>


<div class="form-item">
    {#if f.label && channel}
        <label for="{f.id}">{f.label} {#if f.optional}<span class="optional">(Optional)</span>{/if}</label>
    {/if}
    {#if f.hint}
        <p>{f.hint}</p>
    {/if}
    <div class="password-shell">
        <div style="display:{(input_type == 'password' ? 'block':'none')}">
            <input id="{f.id}" bind:value="{f.answer}" bind:this={input_password} type="password" on:keydown="{keyHandler}" on:focus="{focusPassword}" on:blur="{blurPassword}" placeholder="{f.placeholder ? f.placeholder : ''}" class="form-control" autocomplete="off">
            <i on:click="{ () => { eye('password')}}"class="i-view i-24"></i>
        </div>
        <div style="display:{(input_type == 'text' ? 'block':'none')}">
            <input id="{f.id}_alt" bind:value="{f.answer}" bind:this="{input_text}" type="text" on:focus="{focusPassword}" on:blur="{blurPassword}" placeholder="{f.placeholder ? f.placeholder : ''}" class="form-control" autocomplete="off">
            <i on:click="{ () => { eye('text')}}"class="i-view i-24"></i>
        </div>
    </div>

    <ul class='rules' class:in={!f.hide_rules && has_focus && !v_all}>
        <li><b>Your password must contain at least:</b></li>
        <li><i class="i-checkmark-green i-16" class:in={v_length}></i> 10 characters</li>
        <li><i class="i-checkmark-green i-16" class:in={v_uppercase}></i> 1 uppercase letter (A-Z)</li>
        <li><i class="i-checkmark-green i-16" class:in={v_lowercase}></i> 1 lowercase letter (a-z)</li>
        <li><i class="i-checkmark-green i-16" class:in={v_number}></i> 1 number (0-9)</li>
        <li><i class="i-checkmark-green i-16" class:in={v_symbols}></i> 1 special character (!@#$^&)</li>
    </ul>

    <div class='validation-message'>
        {#if !f.hide_rules}
            {#if has_focus}
                {#if v_all}
                    <i class='i-checkmark-green i-20'></i> Password meets the requirements
                {/if}
            {/if}
            {#if validation_showing}
                {#if v_all}
                    <i class='i-checkmark-green i-20'></i> Password meets the requirements
                {:else}
                    <span class="error"><i class='i-error i-20'></i> Password does not meet the requirements</span>
                {/if}
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
        margin:4px 12px;
        font-size: 14px;
    }
    .rules {
        margin:4px 0 4px 16px;
        padding:0;
        font-size: 14px;
        overflow:hidden;
        /*animation: show 0.5s forwards;*/
	    max-height: 0;
        opacity:0;
        transition: all 0.3s ease-out;
    }
    .rules.in {
        max-height: 140px;
        opacity:1;
    }
    .rules b {
        font-weight: 600;
    }
    .rules .i-16 {
        vertical-align: middle;
        opacity: 0;
        transition: opacity 1s linear;
    }
    .rules .i-16.in {
        opacity: 1;
    }
    .error {
        color: var(--eo-critical-500);
    }

    @keyframes show {
		0% {
			max-height: 0;
		}
		100% {
			max-height: 140px;
		}
	}
</style>
