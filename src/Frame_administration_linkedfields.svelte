<script>
    
    import { distance as dl } from 'damerau-levenshtein-js';
	
    let tab = "select";

    let lls = [
        {
            "icon": "incidents",
            "title": "Incidents",
            "children": [
                {
                    "parent_list": {
                        "title": "Countries",
                        "options": [
                            {
                                "title": "Ireland",
                                "children": [
                                    "Cork",
                                    "Dublin",
                                    "Galway"
                                ]
                            },
                            {
                                "title": "England",
                                "children": [
                                    "Liverpool",
                                    "London",
                                    "Brighton"
                                ]
                            },
                            {
                                "title": "Wales",
                                "children": [
                                    "Cardiff"
                                ]
                            },
                            {
                                "title": "Zimbabwe",
                                "children": []
                            },
                        ]
                    },
                    "child_list": {
                        "title": "Cities",
                        "options": [
                            "Auckland",
                            "Brighton",
                            "Cardiff",
                            "Cork",
                            "Dublin",
                            "Leeds",
                            "Liverpool",
                            "London",
                            "Madrid",
                            "Paris",
                            "Sheffield",
                            "Southampton",
                            "St Albans",
                            "Stoke-on-Trent",
                            "Sunderland",
                            "Truro",
                            "Wakefield",
                            "Wells",
                            "Westminster",
                            "Winchester",
                            "Wolverhampton"
                        ]
                    }
                }
            ]
        }
    ]
    
    let test_mode = false;

    let lls_copy = JSON.parse(JSON.stringify(lls));
    $: dirty_flag = JSON.stringify(lls) != JSON.stringify(lls_copy);
    
    let selected_ll = false;
    let selected_parent = false;
    let paste_list = [];
    
    let pastearea = false;
    let pastetext = '';
    $: {
        let p = pastetext;
        if(p !== '') {
            paste_list = [];
            let temp_list = p.split(/\r?\n/);
            temp_list.forEach( (paste) => {
                let dls = dl_score(paste);
                let mod = (dls < 0 ? dls : dls/paste.length);
                let temp_obj = {
                    dl: mod,
                    dot: dot_color(mod),
                    title: paste,
                }
                paste_list.push(temp_obj);
            })


            paste_list = paste_list.sort((a,b) => { console.log(a.title, b.title);return a.title.localeCompare(b.title);});

            pastetext = '';
            pastearea.blur();
        }
    }

    $: red_pastes = paste_list.filter( (el) => { return el.dot == 'red'}).length;
    $: green_pastes = paste_list.filter( (el) => { return el.dot == 'green'}).length;
    $: grey_pastes = paste_list.filter( (el) => { return el.dot == 'grey'}).length;
    $: orange_pastes = paste_list.filter( (el) => { return el.dot == 'orange'}).length;


    let parent_test = false;

    function dot_color(ds) {
        if(ds == 0) {
            return "green"; //in list and not already added
        } else if(ds == -10) {
            return "grey"; //in list and already added
        } else if (ds < 0.2){
            return "orange"; //too close to an option already in list
        } else {
            return "red"; //not in list
        }
    }
    

    function dl_score(str) {
        //compare with all in selected_ll.child_list.options and take highest
        let current_score = 99;
        selected_ll.child_list.options.forEach( (l) => {
            let dl_temp = dl(l, str);
            //console.log("dl_temp", dl_temp, l, str);
            if( dl_temp < current_score) {
                current_score = dl_temp;
            }
        })
        
        if(current_score == 0 && selected_parent.children.indexOf(str) >= 0) {
            current_score = -10;
        }
        return current_score;

    }
    function select_ll(ll) {
        selected_ll = ll;
        selected_parent = false;
    }
    function select_parent(pl) {
        selected_parent = pl;
    }
    function add_child_option(city) {
        selected_parent.children.push(city);
        selected_ll = selected_ll;
        lls = lls;
    }

    function faux_save () {
        if(dirty_flag){
            lls_copy = JSON.parse(JSON.stringify(lls));

        }
    }
    function add_pastes () {
        paste_list.forEach( (paste) => {
            if(paste.dot == 'green') {
                add_child_option(paste.title);
            }
        })
        pastetext = '';
    }
    function remove_child_option(pl, index) {
        pl.children.sort().splice(index, 1);
        selected_parent.children = selected_parent.children;
        selected_parent = selected_parent;
        selected_ll = selected_ll;
        lls = lls;
    }


</script>

<div class="row sticky">
    <div class="col12">
        <ul class="breadcrumb">
            <li><a href="#home" on:click="{ () => {nav('home')}}">EcoOnline</a></li>
            <li><a href="#ehs" on:click="{ () => {nav('ehs')}}">EHS</a></li>
            <li><a href="#ehs/administration" on:click="{ () => {nav('administration')}}">Administration</a></li>
            <li>Linked Fields</li>
        </ul>
    </div>


</div>
<div class="row">
    <div class="col12 col-md-4 ll1">
        <div class="card">
           <div class="card-body">
                <h1>Linked Fields</h1>

                <div class="overflow">
                    {#each lls as section}
                        <h3 class="ll-title"><i class="i-{section.icon} i-32"></i> {section.title} ({section.children.length})</h3>
                        {#each section.children as ll}
                            <p class="ll"  class:active={selected_ll == ll} on:click="{ () => { select_ll(ll) }}">{ll.parent_list.title} / {ll.child_list.title}</p>
                        {/each}
                    {/each}
                </div>

            </div>
        </div>
    </div>
    {#if !test_mode}
        {#if selected_ll}
            <div class="col12 col-md-4 ll2">
                <div class="card">
                    <div class="card-body">
                        <h1>Parent Field & Child Options</h1>
                        <div class="overflow">
                            {#each selected_ll.parent_list.options as pl}
                                <h3 class="ll-title" class:active={selected_parent == pl} on:click="{ () => { select_parent(pl) }}" >{pl.title} ({pl.children.length}) <i class="i-add i-20 right"></i></h3>
                                {#each pl.children.sort() as opt, i}
                                    <p class="ll" on:click="{ () => remove_child_option(pl,i) }">{opt} <i class="i-trash i-20 right"></i></p>
                                {:else}
                                    <p  class="ll" style="opacity:0.5">{selected_ll.child_list.title} input will not be visible</p>
                                {/each}
                            {/each}
                        </div>
                        <div>
                            <span on:click="{faux_save}" class="btn right" class:disabled={!dirty_flag}>Save</span>
                            <span on:click="{ () => { test_mode = true} }" class="btn btn-secondary right">Test Linked Fields</span>
                            
                        </div>
                    </div>
                </div>
            </div>


        {/if}
        {#if selected_parent}
            <div class="col12 col-md-4 ll3">
                <div class="card">
                    <div class="card-body">
                        <h1>New Child Options</h1>

                        <ul class="tabs">
                            <li><a href="#ehs/administration/linkedlists/select" class:active="{tab == 'select'}" on:click ="{ () => { tab = 'select';}}">Select List</a></li>
                            <li><a href="#ehs/administration/linkedlists/paste" class:active="{tab == 'paste'}" on:click ="{ () => { tab = 'paste'; }}">Paste List</a></li>
                        </ul>
                        
                        {#if tab == 'select'}
                            <div class="overflow">
                                {#each selected_ll.child_list.options as city}
                                    {#if selected_parent.children.indexOf(city) >= 0}
                                        <p class="ll" style="opacity:0.5;cursor:default">{city}</p>
                                    {:else}
                                        <p class="ll" on:click="{ () => add_child_option(city) }">{city}</p>
                                    {/if}
                                {/each}
                            </div>
                        {/if}
                        {#if tab == 'paste'}
                            <h5>Copy and Pasta</h5>

                            <div class="fakearea">
                                {#each paste_list as paste}
                                    <p class="paste-ll"><i class="dot {paste.dot}"></i> {paste.title}</p>
                                {/each}
                                <textarea bind:this={pastearea} bind:value="{pastetext}"></textarea>
                            </div>
                            
                            {#if paste_list.length}
                                {#if red_pastes}
                                    <div class="feedback">
                                        <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M2 16C2 18.7689 2.82109 21.4757 4.35943 23.778C5.89777 26.0803 8.08427 27.8747 10.6424 28.9343C13.2006 29.9939 16.0155 30.2712 18.7313 29.731C21.447 29.1908 23.9416 27.8574 25.8995 25.8995C27.8574 23.9416 29.1908 21.447 29.731 18.7313C30.2712 16.0155 29.9939 13.2006 28.9343 10.6424C27.8747 8.08427 26.0803 5.89777 23.778 4.35943C21.4757 2.82109 18.7689 2 16 2C12.287 2 8.72601 3.475 6.1005 6.1005C3.475 8.72601 2 12.287 2 16V16ZM25.15 23.75L8.25 6.85C10.5506 4.935 13.4839 3.94898 16.4742 4.08546C19.4644 4.22195 22.2957 5.47108 24.4123 7.5877C26.5289 9.70432 27.7781 12.5356 27.9145 15.5258C28.051 18.5161 27.065 21.4494 25.15 23.75V23.75ZM8.24 25.16C5.81832 23.1035 4.311 20.1706 4.04856 17.0044C3.78612 13.8382 4.78997 10.6972 6.84 8.27L23.73 25.16C21.5642 26.99 18.8204 27.994 15.985 27.994C13.1496 27.994 10.4058 26.99 8.24 25.16V25.16Z" fill="#E40C0C"/>
                                        </svg>
                                        {red_pastes} item{red_pastes == 1 ? '':'s'} cannot be added because they don’t exist in the child list. <br>
                                    </div>
                                {/if}
                                {#if orange_pastes}
                                    <div class="feedback">
                                        <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M16 2C13.2311 2 10.5243 2.82109 8.22202 4.35943C5.91973 5.89777 4.12532 8.08427 3.06569 10.6424C2.00607 13.2006 1.72882 16.0155 2.26901 18.7313C2.80921 21.447 4.14258 23.9416 6.10051 25.8995C8.05845 27.8574 10.553 29.1908 13.2687 29.731C15.9845 30.2712 18.7994 29.9939 21.3576 28.9343C23.9157 27.8747 26.1022 26.0803 27.6406 23.778C29.1789 21.4757 30 18.7689 30 16C30 12.287 28.525 8.72601 25.8995 6.1005C23.274 3.475 19.713 2 16 2V2ZM16 28C13.6266 28 11.3066 27.2962 9.33316 25.9776C7.35977 24.6591 5.8217 22.7849 4.91345 20.5922C4.0052 18.3995 3.76756 15.9867 4.23058 13.6589C4.69361 11.3311 5.83649 9.19295 7.51472 7.51472C9.19295 5.83649 11.3312 4.6936 13.6589 4.23058C15.9867 3.76755 18.3995 4.00519 20.5922 4.91345C22.7849 5.8217 24.6591 7.35977 25.9776 9.33316C27.2962 11.3065 28 13.6266 28 16C28 19.1826 26.7357 22.2348 24.4853 24.4853C22.2349 26.7357 19.1826 28 16 28Z" fill="#EB961A"/>
                                            <path d="M17 8H15V19H17V8Z" fill="#EB961A"/>
                                            <path d="M16 22C15.7033 22 15.4133 22.088 15.1666 22.2528C14.92 22.4176 14.7277 22.6519 14.6142 22.926C14.5006 23.2001 14.4709 23.5017 14.5288 23.7926C14.5867 24.0836 14.7296 24.3509 14.9393 24.5607C15.1491 24.7704 15.4164 24.9133 15.7074 24.9712C15.9983 25.0291 16.2999 24.9993 16.574 24.8858C16.8481 24.7723 17.0824 24.58 17.2472 24.3334C17.412 24.0867 17.5 23.7967 17.5 23.5C17.5 23.1022 17.342 22.7206 17.0607 22.4393C16.7794 22.158 16.3978 22 16 22Z" fill="#EB961A"/>
                                        </svg>
                                            
                                        {orange_pastes} item{orange_pastes == 1 ? '':'s'} need{orange_pastes == 1 ? 's':''} attention<br>
                                    </div>
                                {/if}
                                {#if grey_pastes}
                                    <div class="feedback">
                                        <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M16 2C13.2311 2 10.5243 2.82109 8.22202 4.35943C5.91973 5.89777 4.12532 8.08427 3.06569 10.6424C2.00607 13.2006 1.72882 16.0155 2.26901 18.7313C2.80921 21.447 4.14258 23.9416 6.10051 25.8995C8.05845 27.8574 10.553 29.1908 13.2687 29.731C15.9845 30.2712 18.7994 29.9939 21.3576 28.9343C23.9157 27.8747 26.1022 26.0803 27.6406 23.778C29.1789 21.4757 30 18.7689 30 16C30 12.287 28.525 8.72601 25.8995 6.1005C23.274 3.475 19.713 2 16 2V2ZM16 28C13.6266 28 11.3066 27.2962 9.33316 25.9776C7.35977 24.6591 5.8217 22.7849 4.91345 20.5922C4.0052 18.3995 3.76756 15.9867 4.23058 13.6589C4.69361 11.3311 5.83649 9.19295 7.51472 7.51472C9.19295 5.83649 11.3312 4.6936 13.6589 4.23058C15.9867 3.76755 18.3995 4.00519 20.5922 4.91345C22.7849 5.8217 24.6591 7.35977 25.9776 9.33316C27.2962 11.3065 28 13.6266 28 16C28 19.1826 26.7357 22.2348 24.4853 24.4853C22.2349 26.7357 19.1826 28 16 28Z" fill="#BABFC3"/>
                                            <path d="M10.5 15V17H21.5V15H10.5Z" fill="#BABFC3"/>
                                            </svg>
                                            
                                        {grey_pastes} item{grey_pastes == 1 ? '':'s'} already exist{grey_pastes == 1 ? 's':''}<br>
                                    </div>
                                {/if}
                                
                                <div>
                                <span on:click="{add_pastes}" class="btn right">Add {green_pastes} option{grey_pastes == 1 ? '':'s'}</span>
                                </div>
                            {/if}
                        {/if}
                        
                    </div>
                </div>
            </div>


        {/if}
    {:else}
        <div class="col12 col-md-8">
            <div class="card">
                <div class="card-body">
                    <h1>Test</h1>

                    <div class="overflow">
                        <!-- svelte-ignore a11y-label-has-associated-control -->
                        <div class="form-item">
                            <label>{selected_ll.parent_list.title}</label>
                            <select class="form-control" bind:value="{parent_test}">
                                <option value="{false}">Select one...</option>
                                {#each selected_ll.parent_list.options as opt}
                                    <option value="{opt}">{opt.title}</option>
                                {/each}
                            </select>
                        </div>

                        {#if parent_test && parent_test.children.length}
                            <!-- svelte-ignore a11y-label-has-associated-control -->
                            <div class="form-item">
                                <label>{selected_ll.child_list.title}</label>
                                <select class="form-control" >
                                    <option>Select one...</option>
                                    {#each parent_test.children as opt}
                                        <option>{opt}</option>
                                    {/each}
                                </select>
                            </div>
                        {/if}
                    </div>
                    <div style="max-width:480px;">
                        <span on:click="{ () => { test_mode = false} }" class="btn right">OK</span>
                        
                    </div>

                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    .ll-title {
        font-weight: normal;
    }
    .ll-title.active {
        background:#D4D5EA;
    }
    .ll, .paste-ll { padding:8px 8px 8px 40px;cursor:pointer;}
    .paste-ll {
        padding-left:8px;
    }
    .ll.active {
        background:#D4D5EA;
    }

    .card {
        height: calc( 100vh - 150px);
    }
    .card-body {
        display:flex;
        flex-direction: column;
        max-height:100%;
    }
    .overflow {
        flex:1;
        overflow-y:auto
    }

    
    .ll2 h3 {
        cursor:pointer;
        padding: 6px 8px;
    }
    .right {
        float:right;
        display:none;
    }


    .btn.right {
        display: inline-block;
        margin: 16px 0 12px 8px
    }
    .ll2 .ll:hover .right {
        display: inline-block;
    }
    .ll2 h3:hover .right {
        display: inline-block;
    }

    .fakearea {
        width:100%;
        height:200px;
        border:1px solid #72737A;
        border-radius:12px;
        position:relative;
        overflow-y:auto;
    }
    .fakearea textarea {
        position:absolute;
        width:100%;
        height:100%;
        background:transparent;
        top:0;
        left:0;
        border:none;
        opacity:0;
    }

    .dot {
        display:inline-block;
        margin-right:8px;
        background:#999;
        width:12px;
        height:12px;
        border-radius:50%;
    }

    .dot.green {
        background:green ! important;
    }
    .dot.orange {
        background:orange;
    }
    .dot.red {
        background:red;
    }
    .feedback {
        margin:8px 0;
    }
    .feedback svg {
        vertical-align: middle;
    }

    
</style>
	
        