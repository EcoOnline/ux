<script>
import { now } from "svelte/internal";


    export let channel = 'ANSWER';
    export let f;

    f.answer = parseInt(f.answer? f.answer : 0);
    let input_el = false;
    let focussed = false;
    let increment_anim = false;
    let decrement_anim = false;
    let shadow_value = 0; //scrolls into place with new value
    let audio_plus;
    let audio_minus;

    function increment() {
        audio_plus.pause();
        audio_plus.currentTime = 0;
        audio_plus.play();
        focussed = false;
        let v = parseInt(f.answer? f.answer : 0);
        shadow_value = v+1;
        increment_anim = true;
        setTimeout(() => {
            f.answer = shadow_value;
            increment_anim = false;

        },300);
    }
    function decrement() {
        focussed = false;
        let v = parseInt(f.answer? f.answer : 0);
        shadow_value = v-1;
        if(shadow_value>=0) {
            audio_minus.pause();
            audio_minus.currentTime = 0;
            audio_minus.play();
            decrement_anim = true;
            setTimeout(() => {
                f.answer = shadow_value;
                decrement_anim = false;

            },300);
        }
        
    }

    function focus_input() {
        focussed = true;
        input_el.select();
    }
    function keyup_input(e) {
        if(e.code == 'Enter') {
            input_el.blur();
        }
    }
    function blur_input(e) {

        let v = parseInt(f.answer);
        f.answer = (Number.isNaN(v) ? 0 : v);
        focussed = false;
    }
    
</script>


<!-- svelte-ignore a11y-media-has-caption -->
<audio src="./sound/click.mp3" bind:this={audio_plus}></audio>
<!-- svelte-ignore a11y-media-has-caption -->
<audio src="./sound/click.mp3" bind:this={audio_minus}></audio>

<div class="form-item">
    {#if f.label}
        <label for="{f.id}">{f.label} {#if f.optional}<span class="optional">(Optional)</span>{/if}</label>
    {/if}
    {#if f.hint}
        <p>{f.hint}</p>
    {/if}

    <div class='tally' class:good={f.sentiment == 'good'} class:bad={f.sentiment == 'bad'}>
        <div class='btn' on:click={decrement}>—</div>
        <div class='tally-count' class:increment_anim class:decrement_anim class:focussed on:click='{ () => {focussed=true;setTimeout(() => { input_el.focus();},50)}}'>
            <div class="shadow">{shadow_value}</div>
            <div class="count">{f.answer}</div>
            <input id="{f.id}" on:focus={focus_input} on:keyup={keyup_input} on:blur={blur_input} bind:this="{input_el}" bind:value="{f.answer}" type="text" placeholder="{f.placeholder ? f.placeholder : '0'}" class="form-control">
        </div>
        <div class='btn btn-secondary' on:click={increment}>+1</div>
    </div>
    
</div>

<style>
.tally {
    display: flex;
    flex-direction: row;
    max-width: 480px;
}
.tally-count {
    height:48px;
    overflow: hidden;
    border:1px solid var(--eo-border-input);
    border-radius:12px;
    flex:1;
    position: relative;
    margin-right: 8px;
}

.form-control {
    display:none
}

.shadow, .count {
    height:48px;
    width:100%;
    text-align: center;
    position:absolute;
    top:0;
    line-height:48px;
    font-size: 16px;
    transition: top linear 0.3s;
}
.shadow {
    top:-48px;
}
.tally-count.focussed .form-control {
    display: inline-block;
    border:none;
    text-align: center;
    border-radius:0;
}
.tally-count.focussed .shadow, .tally-count.focussed .count {
    display: none;
}
.tally.good .shadow, .tally.good .count {
    color: var(--eo-secondary-500);
}
.tally.bad .shadow, .tally.bad .count {
    color: var(--eo-critical-500);
}

.increment_anim .shadow {
    animation: increment_shadow 0.3s ease-out forwards;
}
.increment_anim .count {
    animation: increment_count 0.3s ease-out forwards;
}
.decrement_anim .shadow {
    animation: decrement_shadow 0.3s ease-out forwards;
}
.decrement_anim .count {
    animation: decrement_count 0.3s ease-out forwards;
}


@keyframes increment_shadow {
  from {top: -48px}
  to {top: 0px;}
}
@keyframes increment_count {
  from {top: 0px}
  to {top: 48px;}
}
@keyframes decrement_shadow {
  from {top: 48px}
  to {top: 0px;}
}
@keyframes decrement_count {
  from {top: 0px}
  to {top: -48px;}
}


.btn {
    border-radius:12px;
    line-height:46px;
    user-select: none; 
}

.btn-secondary {
    padding-left:32px;
    padding-right:32px;
}

.btn:not(.btn-secondary) {
    background:rgba(26,25,25,5%);
    color: var(--black);
    border-color: transparent;
}

</style>