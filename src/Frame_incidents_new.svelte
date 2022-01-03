<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    let show_drawer = false;
    let mask_block = false;
    let mask_visible = false;
    let pullout = false;
    let add_event = false;

    let events = [];
    let event = {
        event_type: false,
        event_subtype: false,
        reportable: -1,
        type_of_person: false,
        person: '',
        parts_of_body: [],
        illness_type: false,
        medical_bool: false,
        losttime_bool: false
    }

    function show_event_drawer() {
        show_drawer = true;
        mask_block = false;
        mask_visible = true;
        setTimeout(() => {
            pullout = true;
        }, 300);
    }
    function hide_event_drawer() {
        mask_block = false;
        mask_visible = false;
        pullout = false;
        setTimeout(() => {
            show_drawer = false;
        }, 1000);
    }


    let tab = "report";
    export let tabnav = '';

    $: {
        let t = tabnav;
        if(tabnav !== '') {
            tab = t;

        }
    }

    function nav(str) {
        
		dispatch('nav', {
			text: str
		});
	}
</script>

<div class="row sticky">
    <div class="col12 col-md-6">
        <ul class="breadcrumb">
            <li><a href="#platform" on:click="{ () => {nav('platform')}}">EcoOnline</a></li>
            <li><a href="#ehs" on:click="{ () => {nav('ehs')}}">EHS</a></li>
            <li><a href="#ehs/incidents" on:click="{ () => {nav('incidents')}}">Incidents</a></li>
            <li>New</li>
        </ul>
    </div>
    <div class="col12 col-md-6 text-right">
        <a href="/" class='i-trash i-24'> </a>
        <a href="/" class='i-actions i-24'> </a>
        <a href="/" class='i-attachment i-24'> </a>
        <a href="/" class='i-printer i-24'> </a>
        <a href="/" class='btn btn-secondary'>Save Progress</a>
        <a href="/" class='btn'>Submit</a>
    </div>
</div>
<div class="row">
    <div class="col12 col-md-3">
        <h1><i class="i-incidents i-32"></i> Incident</h1>
        <div class="card">
            <div class="card-body">
                Draft
            </div>
        </div>
        <h4>Tabs</h4>
        <ul class="side_menu">
            <li class:active="{tab == 'report'}"><a href="#ehs/incidents/incidents_new/report" on:click="{ () => nav('ehs/incidents/incidents_new/report')}">Report</a></li>
            <li class:active="{tab == 'events'}"><a href="#ehs/incidents/incidents_new/events" on:click="{ () => nav('ehs/incidents/incidents_new/events')}">Events</a></li>
        </ul>
        <h4>Tools</h4>
        <ul class="side_menu">
            <li>Witnesses</li>
            <li>Vehicles</li>
            <li>Attachments</li>
            <li>Links</li>
            <li>Claim</li>
        </ul>
    </div>
    <div class="col12 col-md-9">


        {#if tab == 'report'}
            <h1>Report</h1>
            <div class="card">
                <div class="card-body form">
                    <h4>Initial details</h4>

                    <div class="form-item">
                        <label>Site</label>
                        <input type="text" class="form-control">
                    </div>
                    <div class="form-item">
                        <label>Date and time of event</label>
                        <input type="text" class="form-control">
                    </div>
                </div>
            </div>
            <div class="text-right">
                <a class="btn" href="#ehs/incidents/incidents_new/events" on:click="{ () => nav('ehs/incidents/incidents_new/events')}">Next</a>
            </div>
        {:else if tab =='events'}
            <div>
                <h1>Events</h1>
            </div>
            <div class="card">
                <div class="card-body blank_state">
                    <img src="../images/illustrations/events.png">
                    <h5>Primary event</h5>
                    <p>You <b>must</b> add at least one event and this should be 
                        the most serious part of the incident.<br>
                        You can add others at any time.</p>
                </div>
            </div>
            <div class="text-right">
                <a class="btn btn-secondary btn-left" href="#ehs/incidents/incidents_new/report" on:click="{ () => nav('ehs/incidents/incidents_new/report')}">Back</a>
            
                <a href="/" on:click|preventDefault="{show_event_drawer}" class="btn btn-secondary">Add primary event</a>
                <span class="btn disabled">Next</span>
            </div>

        {/if}
    </div>
</div>

{#if show_drawer}
    <div class="drawer">
        <div class="mask" class:visible="{mask_visible}" class:block="{mask_block}"></div>
        <div class="pullout" class:in="{pullout}">
            <div class="pullout-head">
                <h2>Add event <span class="close" on:click="{hide_event_drawer}"><i class="i-close i-24"></i></span></h2>
            </div>
            <div class="pullout-body form">

                <div class="form-item">
                    <label>Event type</label>
                    <select bind:value="{event.event_type}" class="form-control">
                        <option>Accident</option>
                        <option>Occupational Illness</option>
                        <option>Environmental</option>
                        <option>Incident</option>
                        <option>Security</option>
                        <option>Process Safety</option>
                        <option>Near Miss</option>
                    </select>
                </div>
                <div class="form-item">
                    <label>Event sub-type</label>
                    <select class="form-control">
                        <option>Riddor</option>
                    </select>
                </div>
                <div class="form-item">
                    <label>Legally reportable?</label>
                    
                    <div class="form-control radio inline">
                        <input type="radio"> Yes
                    </div>
                    <div class="form-control radio inline">
                        <input type="radio"> No
                    </div>
                </div>
                <div class="form-item">
                    <label>Type of person affected</label>
                    <select class="form-control">
                        <option>Employee</option>
                    </select>
                </div>
                <div class="form-item">
                    <label>Person</label>
                    <input bind:value="{event.person}" type="text" class="form-control" />
                </div>
                <div class="form-item">
                    <label>Parts of the body affected</label>
                    <input type="text" class="form-control" />
                </div>
                <div class="form-item">
                    <label>Illness type</label>
                    <input type="text" class="form-control" />
                </div>
                <div class="form-item">
                    Was the person given medical care?
                </div>
                <div class="form-item">
                    Is there Lost Time involved?
                </div>
                <div class="form-item">
                    <span class="btn">Add event</span>
                    <span class="btn btn-secondary" on:click="{hide_event_drawer}">Cancel</span>
                </div>
            </div>
        </div>
    </div>
{/if}


<style>
    .drawer {
        position:absolute;
        top:0;
        left:0;
        width:100%;
        height:100%;
        z-index: 1000;
    }
    .drawer .mask {
        position:absolute;
        top:0;
        left:0;
        width:100%;
        height:100%;
        pointer-events: none;
        background-color: rgba(0,0,0,0);
        transition: background-color 1s linear;
    }
    .drawer .mask.block {
        pointer-events:all;
    }

    .drawer .mask.visible {
        background-color: rgba(0,0,0,0.2);
    }
    .drawer .pullout {
        position:absolute;
        left:100%;
        width:544px;
        height:100%;
        background:#fff;
        transition:left 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .drawer .pullout.in {
        left: calc(100% - 544px);
        box-shadow: 0 0 12px rgba(0,0,0,0.1);
    }
    .radio {
        display:block;
    }
    .radio.inline {
        width: 222px;
        float:left;
        padding: 8px 16px;
    }
    .radio.inline:last-child {
        margin-left:16px;
    }

    .pullout {
        display:flex;
        flex-direction: column;
    }

    .pullout-head {
        padding: 0 32px;
    }
    .pullout-head h2 {
        font-weight:300;
    }
    .pullout-body {
        flex:1;
        padding:32px;
        overflow-y: auto;
    }

    .pullout .close {
        float:right;
    }
    .card {
        margin-bottom:16px;
    }
    h4 {
        margin-bottom: 8px;
    }
    .side_menu {
        margin:0;
        padding:0;
    }
    .side_menu li {
        margin:0 0 8px 0;
        padding:4px 0 4px 20px;
        height:auto;
        position:relative;
    }
    .side_menu li a {
        display:block;
        text-decoration:none;
        cursor: pointer;
    }
    .side_menu li:before {
        display:block;
        content:'';
        position:absolute;
        left:0;
        top:0;
        border-radius:2px;
        width: 4px;
        height:100%;
        background: var(--eo-border-reduced);
        transition: height 0.3s linear, top 0.3s linear;
    }
    .side_menu li:hover:before {
        top:10%;
        height:80%;
        background: var(--eo-border);
    }
    .side_menu li.active:before {
        background: var(--eo-secondary-500);
    }


    .blank_state {
        padding:48px;
        text-align:center;
    }
    .blank_state img {
        width:120px;
    }
    .blank_state h5 {
        font-size:21px;
        margin:8px 0;
        font-weight:300;
    }
</style>
	
        