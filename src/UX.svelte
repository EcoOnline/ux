<script>
    import { onMount } from 'svelte';
    import { fade, fly } from 'svelte/transition';
	import UXNPS from "./UX_nps.svelte";

    let name=false;
    let co = false;
    
    let w = 200;
    let wx = w;
    let slide = 0;
    let holder= false;
    let total_slides = 11;

    let h = window.location.hash.substring(1)
    if(h !== '') {
        slide = parseInt(h, 10);
        if(slide > total_slides) {
            slide = total_slides;
        }
        if(slide < 1) {
            slide = 1;
        }
        slide = slide-1;
    }

    let sz= 'lg';
    $: {
        if(w < 600) {
            sz = 'xs';
        } else if(w < 900) {
            sz = 'sm';
        } else if(w < 1400) {
            sz = 'md';
        } else {
            sz = 'lg';
        }
    }
    let ideation = [
        { lg: {x:55, y: 50}, md: {x:55, y: 80}, sm: {x:90, y: 54}, xs: {x:55, y: 50} },  //0 print
        { lg: {x:20, y: 90}, md: {x:5, y: 83}, sm: {x:52, y: 56}, xs: {x:55, y: 50} },  //1 action completed
        { lg: {x:25, y: 80}, md: {x:7, y: 70}, sm: {x:65, y: 65}, xs: {x:55, y: 50} },  //2 status
        { lg: {x:75, y: 75}, md: {x:30, y: 68}, sm: {x:28, y: 57}, xs: {x:55, y: 50} },  //3 witness
        { lg: {x:30, y: 65}, md: {x:70, y: 60}, sm: {x:25, y: 70}, xs: {x:55, y: 50} },  //4 ML claim
        { lg: {x:35, y: 52}, md: {x:48, y: 35}, sm: {x:50, y: 59}, xs: {x:55, y: 50} },  //5 actions hover
        { lg: {x:40, y: 37}, md: {x:5, y: 55}, sm: {x:355, y: 50}, xs: {x:55, y: 50} },  //6 metsa button
        { lg: {x:54, y: 75}, md: {x:76, y: 75}, sm: {x:55, y: 1}, xs: {x:55, y: 50} },  //7 single page
        { lg: {x:35, y: 20}, md: {x:53, y: 20}, sm: {x:90, y: 8}, xs: {x:55, y: 50} },  //8 input shortcut
        { lg: {x:5, y: 25}, md: {x:5, y: 25}, sm: {x:5, y: 25}, xs: {x:55, y: 50} },  //9 figma
        { lg: {x:60, y: 43}, md: {x:75, y: 15}, sm: {x:58, y: 20}, xs: {x:55, y: 50} },  //10 color blind
        { lg: {x:60, y: 1}, md: {x:71, y: 32}, sm: {x:55, y: 28}, xs: {x:55, y: 50} },  //11 whatsapp
        { lg: {x:73, y: 27}, md: {x:87, y: 24}, sm: {x:75, y: 70}, xs: {x:55, y: 50} },  //12 gamification
        { lg: {x:40, y: 80}, md: {x:15, y: 90}, sm: {x:30, y: 85}, xs: {x:55, y: 50} },  //13 checklist
        { lg: {x:10, y: 67}, md: {x:51, y: 50}, sm: {x:5, y: 60}, xs: {x:55, y: 50} },  //14 whos involved
        { lg: {x:43, y: 7}, md: {x:55, y: 1}, sm: {x:48, y: 5}, xs: {x:55, y: 50} }   //15 tooltop
    ];
    function next() {
        if(slide < total_slides -1) {
            wx = w;
            slide++;
            holder.scrollTop = 0;
            window.location.hash = slide+1;
        }
    }
    function prev() {
        if(slide >= 1) {
            wx = w*-1;
            slide--;
            holder.scrollTop = 0;
            window.location.hash = slide+1;
        }
    }
    function handleKeydown(event) {

        if(event.key == 'ArrowRight') {
            next()
        }
        if(event.key == 'ArrowLeft') {
            prev()
        }
        if(event.key == 'r') {
            wx = w*-1;
            slide = 0;
            holder.scrollTop = 0;
            window.location.hash = slide+1;
        }
	}
    function handleResize() {
        w = window.innerWidth;
    }

    onMount(() => {
		w = window.innerWidth;
        wx = w;

        //try to get dynamic params
        //btoa('{"name":"Tom","co":"Keel"}');

        let address = window.location.search;
        let parameterList = new URLSearchParams(address)
        let ref = parameterList.get('ref');

        if(ref) {
            try {
                let obj = JSON.parse(atob(ref));
                co = obj.co;
                name = obj.name;
            } catch (error) {
                co = false;
                name = false;
            }
        } else {
            co = false;
            name = false;
        }
        
	});
</script>

<svelte:window on:keydown={handleKeydown} on:resize="{handleResize}"/>

<div class="screens" bind:this="{holder}">
	{#if slide == 0}
        <div class="screen title" in:fly="{{ x: wx, duration: 1000 }}" out:fade>
            <h1>UX</h1>
            <h3>A story about Bob</h3>
            <h4 class="tip">(AKA how empathy paid off)</h4>
            <p style="font-size:0.83em;margin-top:64px;">Left & right arrow to navigate.</p>
        </div>
    {/if}

    {#if slide == 1}
        <div class="screen" in:fly="{{ x: wx, duration: 1000 }}" out:fade>
            <h2>A story about Bob:</h2>
            <h4><b>Client:</b> Effective Software</h4>
            <h4><b>My role:</b> Lead Designer</h4>
           
        </div>
    {/if}
    {#if slide == 2}
        <div class="screen" in:fly="{{ x: wx, duration: 1000 }}" out:fade>
            <h2>Business Context:</h2>
            <h4>Effective Software was a Health & Safety platform.</h4>
            <h4>The domain space is very dry, legal, sometimes with some very serious types of reporting.</h4>
            <h4>A basic pixel design had been established that was calm, robust, solid, but not overly human...</h4>
            <h4 class="tip">Except for Bob</h4>

        </div>
    {/if}
    {#if slide == 3}
        <div class="screen" in:fly="{{ x: wx, duration: 1000 }}" out:fade>
            <h2>Meet Bob:</h2>
            <img alt="Maybe Bob left the building?" src="https://www.unco.co.nz/ux3/images/bob.png" style="float:left;margin:0 32px 50vh 0">
            <h4>Bob (the builder, as they became known internally) was only present on one screen and wasn't communicating.</h4>
            <h4>It would be like Duolingo only using the owl as a splash screen.</h4>
            <h4>Bob needed fleshing out in order to give the product a human touch.</h4>
            <h4 class="tip">(In a product like this empathy would go a long way)</h4>

        </div>
    {/if}
    {#if slide == 4}
        <div class="screen" in:fly="{{ x: wx, duration: 1000 }}" out:fade>
            <h2>Meet Bob:</h2>
            <img alt="Bob of many faces" src="https://www.unco.co.nz/ux3/images/bob_emotions.png" style="float:left;margin:0 32px 50vh 0">
            <h4>I developed <b>14 different emotions</b> for use in distinct occasions.</h4>
            <h4>Particular sensitivity was required around system errors and report completion (you dont want to celebrate the reporting of potentially horrific accidents)</h4>
            <h4>Sometimes series of emotions were used during lengthy data imports. Happy -> Meh -> Concerned</h4>

        </div>
    {/if}
    {#if slide == 5}
        <div class="screen" in:fly="{{ x: wx, duration: 1000 }}" out:fade>
            <h2>Bob went to work:</h2>
            <div class="center">
                <img alt="Maybe Bob left the building?" src="https://www.unco.co.nz/ux3/images/bob_dialogue_party.png" style="max-width:80%;margin:0 auto;">
            </div>

        </div>
    {/if}
    {#if slide == 6}
        <div class="screen marker" in:fly="{{ x: wx, duration: 1000 }}" out:fade>
            <p>They came into their own:</p>
            <img alt="Maybe Bob left the building?" src="https://www.unco.co.nz/ux3/images/appstore_image_4.png" style="border-radius:8px;box-shadow:0 0 32px rgba(0,0,0,0.3);width:240px;float:right;margin:0 0 50vh 32px">
            <h1>Bob became the public touchpoint for communication</h1>
            <h4>And we started getting requests</h4>
        </div>
    {/if}
    {#if slide == 7}
        <div class="screen" in:fly="{{ x: wx, duration: 1000 }}" out:fade>
            <h2>Requests:</h2>
            <h4>Can Bob have friends?</h4>
            <h4>Can Bob match our colour scheme? </h4>
            <!--<h4 class="tip">(Yes)</h4>-->
            <p>In addition to typical application settings, customers were given a choice of helper.<br>
                From a technical level Bob was implemented with an icon font.<br> A simple class change on the body updated all helpers.
            </p><br>
            <div class="center">
                <img src="https://www.unco.co.nz/ux3/images/bob-wink2.png" style="margin:0 auto" alt="wink">
                <img src="https://www.unco.co.nz/ux3/images/bobby-wink.png" style="margin:0 auto" alt="wink">
                <img src="https://www.unco.co.nz/ux3/images/ash-wink.png" style="margin:0 auto" alt="wink">
                <img src="https://www.unco.co.nz/ux3/images/eddie-wink.png" style="margin:0 auto" alt="wink">
            </div>

        </div>
    {/if}
    {#if slide == 8}
        <div class="screen" in:fly="{{ x: wx, duration: 1000 }}" out:fade>
            <h2>Affinity:</h2>
            <h4>Bob and friends created an affinity with the product.</h4>
            <h4><b>&gt; 35%</b> of clients chose a character.</h4>
            <h4><b>&lt; 1%</b> of clients chose none.</h4>
            <h4>Partly responsible for a <b>13pt</b> increase in NPS.</h4>
            <div class="center">
                
            </div>

        </div>
    {/if}
    {#if slide == 9}
        <div class="screen" in:fly="{{ x: wx, duration: 1000 }}" out:fade>
            <h2>Interactive:</h2>
            <p>See how Bob responds to NPS interaction</p>
            
           <UXNPS></UXNPS>

        </div>
    {/if}
    {#if slide == 10}
        <div class="screen title" in:fly="{{ x: wx, duration: 1000 }}" out:fade>
            <h1>Key takeaways:</h1>
            <h3>&mdash; Judicious use of tone helped humanise the product</h3>
            <h3>&mdash; Bob unexpectedly became a key element to hinge the brand off</h3>
            <h3>&mdash; Low time investment produced disproportionate results</h3>
        </div>
    {/if}
    {#if slide == 11}
        <div class="screen end" in:fly="{{ x: wx, duration: 1000 }}" out:fade>
            <p>So {(name ? name : '')}...</p>
            <h1>How can I help solve<br><u style="color:var(--blue)">your</u> problems?</h1>
        </div>
    {/if}
    








    {#if slide >= 1}
    <svg class="prev" class:pop={[0,4,9,16,17].indexOf(slide) >= 0} on:click="{prev}" width="51px" height="41px" viewBox="0 0 102 82" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" stroke-width="4" fill="none" fill-rule="evenodd" stroke-linecap="round"><line x1="0" y1="40" x2="100" y2="40"></line><line x1="40" y1="0" x2="0" y2="40"></line><line x1="40" y1="80" x2="0" y2="40"></line></svg>
    {/if}
    {#if slide < total_slides - 1}
    <svg class="next" class:pop={[0,4,9,16,17].indexOf(slide) >= 0} on:click="{next}" width="51px" height="41px" viewBox="0 0 102 82" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" stroke-width="4" fill="none" fill-rule="evenodd" stroke-linecap="round"><line x1="0" y1="40" x2="100" y2="40"></line><line x1="60" y1="0" x2="100" y2="40"></line><line x1="60" y1="80" x2="100" y2="40"></line></svg>
    {/if}

    <div class="pg">{slide+1} / {total_slides}</div>
    <div class="prep">Prepared for Tom Frew - 18 March 2022</div>

	


</div>
<style>
    
	.screens {
        width:100%;
        height:100%;
        overflow-x:hidden;
        overflow-y:auto;
    }

    .screen {
        width:100%;
        min-height:100%;
        padding:72px;
        background:#f0f0f0;
    }

    h1 {
        font-weight: 900;
        font-size:5.5em;
    }
    h2 {
        font-weight:900;
        font-size:3em;
    }
    h3 {
        font-weight:100;
        font-size:2em;
    }
    h4 {
        font-weight:100;
        font-size:2em;
        margin: 0.5em 0;
    }
    h4 b {
        font-weight:400;
    }
    svg line {
        stroke:var(--blue);
        transition: all 0.5s linear;
    }
    svg.pop line {
        stroke:#fff;

    }

    .tip {
        color: var(--blue);
    }
    .pg {
        position:absolute;
        top:36px;
        right:36px;
        z-index: 200;
    }
    .prep {
        display: none;
        position:absolute;
        bottom:36px;
        right:72px;
        z-index: 200;
        font-size:10px;
        font-family: monospace;
    }
    .prev, .next {
        position:absolute;
        bottom:72px;
        cursor:pointer;
        z-index: 200;
    }
    .prev {
        left:12px;
    }
    .next {
        right:12px;
    }

    .title {
        color:#fff;
        background: var(--dark);
    }
    .title h3 {
        color: var(--lightgrey);
    }
    .title svg line {
        stroke:#fff;
    }

    .marker {
        color:#fff;
        background: var(--blue);
    }
    .marker h1 {
        margin-top:0;
    }
    .marker p {
        color: var(--grey)
    }

    .end {
        background: #1a1919;
        color:#fff;
        text-align:center;
    }
    .end p {
        margin-top:100px;
    }


    .center {
        text-align:center
    }



    :global(.row) {
        display:flex;
        flex-direction: row;
    }

    :global(.col) {
        flex:1;
    }

    ul {
        list-style:none;
        font-weight:100;
    }
    li {
        position:relative;
    }
    li:before {
        display:block;
        content: '-';
        position:absolute;
        left:-20px;
        top:0px;
    }
    li.hilight:before {
        content: '#';
        color: var(--blue);
        font-weight:900;
    }

    .special {
        font-size:3em;
        color: var(--blue)
    }
    .scatter h2 {
        position:relative;
        z-index:100;
    }
    .scatter img {
        position:absolute;
        z-index:1;
        transition: left 0.5s ease-out, top 0.5s ease-out;
    }
    .scatter img.mob {
        position:relative;
        max-width:90%;
        margin: 0 auto 32px auto;

    }
    .scatter img:hover {
        z-index:99;
    }

    .steps {
        align-items: flex-end;
        margin-top: 64px;
    }
    .step {
        color: var(--grey);
        border-bottom:5px solid var(--grey);
        margin-right:4px;
        padding-bottom:8px;
        position:relative;
    }
    .nextstep {
        color: var(--lightgrey);
        border-bottom:5px solid var(--lightgrey);

    }
    .here:after {
        content:'';
        display:block;
        position:absolute;
        width:20%;
        border-bottom:5px solid var(--grey);
        left:0;
        bottom:-5px;
    }
    .here2:after {
        content:'';
        display:block;
        position:absolute;
        width:10%;
        border-bottom:5px solid var(--grey);
        left:0;
        bottom:-5px;
    }
</style>