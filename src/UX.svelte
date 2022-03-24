<script>
    import { onMount } from 'svelte';
    import { fade, fly } from 'svelte/transition';
	import UXQR from "./UX_qr.svelte";

    let name=false;
    let co = false;
    
    let w = 200;
    let wx = w;
    let slide = 0;
    let holder= false;
    let total_slides = 19;

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
            <h3>EcoOnline Incidents Project</h3>
            <h4 class="tip">(AKA here's how I could help {co ? co : 'you'})</h4>
        </div>
    {/if}

    {#if slide == 1}
        <div class="screen" in:fly="{{ x: wx, duration: 1000 }}" out:fade>
            <h2>Incidents Project:</h2>
            <h4><b>Client:</b> EcoOnline Health & Safety Application</h4>
            <h4><b>My role:</b> Lead Designer</h4>
            <h4><b>Worked with:</b></h4>
            <h4>&mdash; Aneta Kmiecik (Lead Researcher)</h4>
            <h4>&mdash; Ran workshops with 3 other designers</h4>
        </div>
    {/if}
    {#if slide == 2}
        <div class="screen" in:fly="{{ x: wx, duration: 1000 }}" out:fade>
            <h2>Business Context:</h2>
            <h4>EcoOnline is the amalgamation of nearly a dozen companies.</h4>
            <h4>It had recently gone through a rebrand so all products are in the long slow process of UI refresh with an evolving design system.</h4>
            <h4>The Incidents Project was the first true full UX project from discovery & research to ideation and testing for a company accustomed to feature-driven development.</h4>
            <h4 class="tip">(Imagine how amazing a product could be doing great UX from the beginning)</h4>

        </div>
    {/if}
    {#if slide == 3}
        <div class="screen" in:fly="{{ x: wx, duration: 1000 }}" out:fade>
            <h2>Product Context:</h2>
            <h4>The EcoOnline Incident Reporting module is how to report workplace incidents and accidents.</h4>
            <h4>It is by <i>far</i> the most used of the EcoOnline Suite of modules (65%).</h4>
            <h4>It's dynamic, no two clients are set up the same.</h4>
            <h4><b>Reporting levels were actually dropping</b> as existing clients migrated.</h4>
            <h4 class="tip">(Hard problems are fun)</h4>

        </div>
    {/if}
    {#if slide == 4}
        <div class="screen marker" in:fly="{{ x: wx, duration: 1000 }}" out:fade>
            <p>General internal opinion:</p>
            <h1>“The module is great, it only needs a few changes”</h1>
            <h4>Narrator: “It wasn’t and it didn’t”</h4>
        </div>
    {/if}
    {#if slide == 5}
        <div class="screen" in:fly="{{ x: wx, duration: 1000 }}" out:fade>
            <h2>Discovery & Research:</h2>
            <h4><b>Interviews:</b> 10+ hours</h4>
            <h4><b>Survey:</b> 180 Responses</h4>
            <h4><b>Key findings:</b> (There were dozens more)</h4>
            <h4>&mdash; End users were not using the report fully (config)</h4>
            <h4>&mdash; Reporting was too complex (drop-off in submissions)</h4>
            <h4>&mdash; Photos were underused as a source of evidence</h4>
            <h4>&mdash; Big difference between safety manager and end users</h4>
            <h4 class="tip">(<i>Really</i> grokking a problem is <b>important</b>)</h4>

        </div>
    {/if}
    {#if slide == 6}
        <div class="screen" in:fly="{{ x: wx, duration: 1000 }}" out:fade>
            <h2>Discovery & Research:</h2>
            <div class="center">
                <img src="./images/ux/existing.png" style="margin:0 auto" alt="existing">
            </div>

        </div>
    {/if}
    {#if slide == 7}
        <div class="screen" in:fly="{{ x: wx, duration: 1000 }}" out:fade>
            <h2>Ideation:</h2>
            <div class="row">
                <div class="col">
                    <h4 class="special">30+ ideas</h4>
                    <p>I developed <b>high-fidelity</b> visual ideas<br> for a <b>multitude</b> of improvements</p>
                </div>
                <div class="col">
                    <ul>
                        <li>ML prediction of a claim being made</li>
                        <li class="hilight">new menu</li>
                        <li>single page view</li>
                        <li class="hilight">overview page</li>
                        <li>submit checklist</li>
                        <li>attachment quick links</li>
                        <li>ML input shortcuts</li>
                        <li>better pre-filling</li>
                        <li>autosaving</li>
                        <li>step through submission errors</li>
                        <li>improved print options</li>
                        <li class="hilight">mobile first quick form</li>
                        <li>personal info censorship</li>
                        <li>email-to-attach</li>
                        <li>inline tutorials</li>
                        <li>CCTV playback</li>
                        <li>“I don’t know”</li>
                    </ul>
                </div>
                <div class="col">
                    <ul>
                        <li>elapsed time and improved date suggestions</li>
                        <li>form comments and subscription</li>
                        <li>full-screen gallery view</li>
                        <li>classified attachments</li>
                        <li>time sensitive help</li>
                        <li>reporting gamification</li>
                        <li>safety year in review</li>
                        <li>notification feedback loop</li>
                        <li class="hilight">dashboard</li>
                        <li>risk matrix simplification</li>
                        <li>action shortcuts</li>
                        <li>progress tiles</li>
                        <li>reporting plugin for other sites</li>
                        <li>lock & sign witness statement</li>
                        <li>inline signature</li>
                        <li>User feedback for managers</li>
                        <li>Voice input</li>
                    </ul>

                </div>
            </div>

        </div>
    {/if}

    {#if slide == 8}
        <div class="screen scatter" in:fly="{{ x: wx, duration: 1000 }}" out:fade>
            <h2>Ideation:</h2>
            {#if sz !== 'xs'}
                {#each ideation as idea, i}
                    <img alt="id-{i}" src="./images/ux/id{i}.png" style="left:{idea[sz].x}%;top:{idea[sz].y}%;">
                {/each}
            {:else}
                <div class="center">
                    {#each ideation as idea, i}
                        <img class="mob" alt="id-{i}" src="./images/ux/id{i}.png">
                    {/each}
                </div>
            {/if}

        </div>
    {/if}
    {#if slide == 9}
        <div class="screen marker" in:fly="{{ x: wx, duration: 1000 }}" out:fade>
            <p>Streamlined:</p>
            <h2>3 core proposals:</h2>
            <h4>Given the pre-defined development window the ideas were reduced to the most impact for the space available to be tested with end users.</h4>
            <div class="row" style="margin-top:100px">
                <div class="col center">
                    <svg style="margin-bottom:24px;" width="80px" height="104px" viewBox="0 0 80 104" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill-rule="nonzero" fill="var(--grey)">
                        <polygon id="Path" points="48 92.72 37.64 82.36 32 88 48 104 80 72 74.36 66.36"></polygon>
                        <path d="M8,96 L8,24 L56,24 L56,60 L64,60 L64,8 C63.9976,5.879 63.154,3.8456 61.654,2.34584 C60.1544,0.84608 58.1208,0.00244 56,7.10542736e-15 L8,7.10542736e-15 C5.87892,0.00212 3.84532,0.84564 2.34548,2.34548 C0.84564,3.84532 0.00212,5.87892 0,8 L0,96 C0.00244,98.1208 0.84608,100.1544 2.34584,101.654 C3.8456,103.154 5.879,103.9976 8,104 L24,104 L24,96 L8,96 Z M8,8 L56,8 L56,16 L8,16 L8,8 Z" id="Shape"></path>
                    </svg>
                    <p>Mobile first quick report</p>
                </div>
                <div class="col center">
                    <svg style="margin-bottom:16px;" width="113px" height="112px" viewBox="0 0 113 112" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="var(--grey)" fill-rule="nonzero">
                        <polygon id="Path" points="96 76 88 76 88 96 96 96"></polygon>
                        <polygon id="Path" points="80 56 72 56 72 96 80 96"></polygon>
                        <path d="M36,96 C30.6976,95.9936 25.61412,93.8848 21.86476,90.1352 C18.1154,86.386 16.00624,81.3024 16,76 L24,76 C24,78.3732 24.7038,80.6936 26.02236,82.6668 C27.34096,84.6404 29.21508,86.1784 31.4078,87.0864 C33.6004,87.9948 36.0132,88.2324 38.3412,87.7696 C40.6688,87.3064 42.8072,86.1636 44.4852,84.4852 C46.1636,82.8072 47.3064,80.6688 47.7696,78.3412 C48.2324,76.0132 47.9948,73.6004 47.0864,71.4076 C46.1784,69.2152 44.6404,67.3408 42.6668,66.0224 C40.6936,64.7036 38.3732,64 36,64 L36,56 C41.3044,56 46.3916,58.1072 50.142,61.858 C53.8928,65.6084 56,70.6956 56,76 C56,81.3044 53.8928,86.3916 50.142,90.142 C46.3916,93.8928 41.3044,96 36,96 Z" id="Path"></path>
                        <path d="M104,0 L8,0 C5.87892,0.00212 3.84532,0.84564 2.34548,2.34548 C0.84564,3.84532 0.00212,5.87892 0,8 L0,104 C0.00244,106.1208 0.84608,108.1544 2.34584,109.654 C3.8456,111.154 5.879,111.9976 8,112 L104,112 C106.1208,111.9972 108.154,111.1532 109.6536,109.6536 C111.1532,108.154 111.9972,106.1208 112,104 L112,8 C111.9976,5.879 111.154,3.8456 109.654,2.34584 C108.1544,0.84608 106.1208,0.00244 104,0 L104,0 Z M104,36 L48,36 L48,8 L104,8 L104,36 Z M40,8 L40,36 L8,36 L8,8 L40,8 Z M8,104 L8,44 L104.0028,44 L104.008,104 L8,104 Z" id="Shape"></path>
                    </svg>
                    <p>Dashboard access</p>
                </div>
                <div class="col center">
                    <svg style="margin-bottom:0px;" width="128px" height="128px" viewBox="0 0 128 128" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="var(--grey)" fill-rule="nonzero">
                        <path d="M112,16 L16,16 C11.581722,16 8,19.581722 8,24 L8,104 C8,108.418278 11.581722,112 16,112 L112,112 C116.418278,112 120,108.418278 120,104 L120,24 C120,19.581722 116.418278,16 112,16 Z M16,24 L40,24 L40,104 L16,104 L16,24 Z M112,104 L48,104 L48,24 L112,24 L112,104 Z" id="Shape" ></path>       
                    </svg>
                    <p>Improved nav & overview</p>
                </div>
            </div>
        </div>
    {/if}
    {#if slide == 10}
        <div class="screen" in:fly="{{ x: wx, duration: 1000 }}" out:fade>
            <h2>Testing - Mobile Quick Report:</h2>
            <div class="row">
                <div class="col center">
                    <img src="./images/ux/mob1.png" style="margin:0 auto" alt="existing">
                </div>
                <div class="col center">
                    <img src="./images/ux/mob2.png" style="margin:0 auto" alt="existing">
                </div>
                <div class="col center">
                    <img src="./images/ux/mob3.png" style="margin:0 auto" alt="existing">
                </div>
            </div>
        </div>
    {/if}
    {#if slide == 11}
        <div class="screen" in:fly="{{ x: wx, duration: 1000 }}" out:fade>
            <h2>Testing - Mobile Quick Report:</h2>

            <h4 class="tip">Your turn to try {name}</h4>
            <p>
                I built a mobile prototype and a multi-lingual QR code configurator using sveltejs for on-site testing with clients in Finland and England.
            </p>

            <UXQR />
        </div>
    {/if}
    {#if slide == 12}
        <div class="screen" in:fly="{{ x: wx, duration: 1000 }}" out:fade>
            <h2>Testing - Dashboard:</h2>
            <div class="center">
                <img src="./images/ux/dashboard.png" style="margin:0 auto" alt="dashboard">
            </div>

        </div>
    {/if}
    {#if slide == 13}
        <div class="screen" in:fly="{{ x: wx, duration: 1000 }}" out:fade>
            <h2>Testing - Overview:</h2>
            <div class="center">
                <img src="./images/ux/overview.png" style="margin:0 auto" alt="overview">
            </div>

        </div>
    {/if}
    {#if slide == 14}
        <div class="screen" in:fly="{{ x: wx, duration: 1000 }}" out:fade>
            <h2>Testing - Future roadmap:</h2>
            <div class="center">
                <img src="./images/ux/full_page.png" style="margin:0 auto" alt="full page">
            </div>
        </div>
    {/if}
    {#if slide == 15}
        <div class="screen" in:fly="{{ x: wx, duration: 1000 }}" out:fade>
            <h2>Testing - on site:</h2>
            <div class="center">
                <img src="./images/ux/testing1.png" style="margin:0 auto;max-width:37%" alt="testing1">
                <img src="./images/ux/testing2.png" style="margin:0 auto;max-width:37%" alt="testing2">
                <img src="./images/ux/testing3.png" style="margin:0 auto;max-width:24%" alt="testing3">
                <h4 class="tip">(I will literally go to the ends of the earth)</h4>
            </div>
        </div>
    {/if}
    
    {#if slide == 16}
        <div class="screen marker" in:fly="{{ x: wx, duration: 1000 }}" out:fade>
            <p>Results:</p>
            <h1>“Is that it? Is it that easy? It’s not!... I can’t believe it”</h1>
            <h4>Narrator: “It was and it is”</h4>
            <!--
            <p>Went through a refinement based on feedback and now implementation is in progress. We’ve set <i>conservative</i> goals for a 50% increase in reporting.</p>
            <p>*This <b>is</b> an actual quote, I just can't show the video of it.</p>
            -->
            <div class="row steps">
                <div class="col">
                    <div class="step">Problem definition</div>
                </div>
                <div class="col">
                    <div class="step">Interviews & surveys</div>
                </div>
                <div class="col">
                    <div class="step">Synthesis</div>
                </div>
                <div class="col">
                    <div class="step">Ideation</div>
                </div>
                <div class="col">
                    <div class="step">Prototyping</div>
                </div>
                <div class="col">
                    <div class="step">On site testing</div>
                </div>
                <div class="col">
                    <div class="step">Refinement</div>
                </div>
                <div class="col">
                    <div class="step">Validation</div>
                </div>
                <div class="col">
                    <div class="step nextstep here">Development</div>
                </div>
                <div class="col">
                    <div class="step nextstep">Review</div>
                </div>
            </div>
            <div class="row steps">
                <div class="col" style="flex:3">
                    <div class="step">Research<br>2 months</div>
                </div>
                <div class="col" style="flex:5">
                    <div class="step">Design<br>3 weeks</div>
                </div>
                <div class="col" style="flex:2">
                    <div class="step nextstep here2">Development<br>2 months</div>
                </div>
            </div>
        </div>
    {/if}
    {#if slide == 17}
        <div class="screen title" in:fly="{{ x: wx, duration: 1000 }}" out:fade>
            <h1>Key takeaways:</h1>
            <h3>&mdash; Created something <i>loved</i> by end users</h3>
            <h3>&mdash; Developed a product design language</h3>
            <h3>&mdash; Leveraged one process for future product opportunities</h3>
            <h3>&mdash; Exposed weaknesses in our own biases</h3>
            <h4 class="tip">&mdash; Can repeat this for {co ? co : 'you'}</h4>
        </div>
    {/if}
    {#if slide == 18}
        <div class="screen end" in:fly="{{ x: wx, duration: 1000 }}" out:fade>
            <p>So {name}...</p>
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