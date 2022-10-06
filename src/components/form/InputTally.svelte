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
                shadow_value = shadow_value < 0 ? 0 : shadow_value;
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
        <label for="{f.id}">{f.label} {#if !f.optional}<span class="required">*</span>{/if}</label>
    {/if}
    {#if f.hint}
        <p>{f.hint}</p>
    {/if}

    <div class='tally' class:good={f.sentiment == 'good'} class:bad={f.sentiment == 'bad'}>
        <div class='indicator' title="{(f.sentiment=='good'?'A positive tally':(f.sentiment=='bad'?'A negative tally':''))}"></div>
        <div class='btn' on:click={decrement} class:disabled={f.answer < 1}><i class='i-32 i-minus'></i></div>
        <div class='tally-count' class:increment_anim class:decrement_anim class:focussed on:click='{ () => {focussed=true;setTimeout(() => { input_el.focus();},50)}}'>
            <div class="shadow">{shadow_value}</div>
            <div class="count">{f.answer}</div>
            <input id="{f.id}" on:focus={focus_input} on:keyup={keyup_input} on:blur={blur_input} bind:this="{input_el}" bind:value="{f.answer}" type="text" placeholder="{f.placeholder ? f.placeholder : '0'}" class="form-control">
        </div>
        <div class='btn btn-secondary' on:click={increment}><i class='i-32 i-plus'></i></div>
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
.indicator {
    height:40px;
    width:4px;
    border-radius: 2px;
    background:#ccc;
    margin:4px 8px 4px 0;   
}
.good .indicator {
    display:inline-block;
    background-color: var(--eo-success-500);
}
.bad .indicator {
    display:inline-block;
    background-color: var(--eo-critical-500);
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
    transition: all linear 0.3s;
}
.count:hover {
    background-color: #F5F6FF;
}
.shadow {
    top:-48px;
}
.tally-count.focussed {
    background-color: #F5F6FF;
    border: 1px solid var(--eo-primary-500);
    box-shadow: 0 0 4px var(--eo-primary-500);
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
/*
.tally.good .shadow, .tally.good .count {
    color: var(--eo-secondary-500);
}
.tally.bad .shadow, .tally.bad .count {
    color: var(--eo-critical-500);
}
*/

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

@keyframes shadow {
  from {opacity: 0}
  to {opacity: 1}
}
@keyframes count {
  from {opacity: 1}
  to {opacity: 0}
}


.btn {
    border-radius:12px;
    line-height:46px;
    user-select: none; 
    border-color: var(--eo-border-input);
    background: #fff;
    color: var(--black);
    padding-left:8px;
    padding-right:8px;
}
.btn:hover {
    background-color: #F5F6FF;
}
.btn:active {
    /*background-color: var(--eo-primary-500);
    background-color: rgba(40,47,150,30%);*/
    background-color: #DBDEFF;
}
.btn:active .i-32 {
    /*filter: invert(1);*/
}
.btn.disabled {
    border-color: transparent;
    background: #E4E5E7;
}
.btn.disabled .i-32 {
    opacity:0.5;
}

.btn-secondary {
    padding-left:32px;
    padding-right:32px;
}


</style>