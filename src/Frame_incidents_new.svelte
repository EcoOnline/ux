<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();


    let tab = "report";

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
            <li class:active="{tab == 'report'}">Report</li>
            <li>Events</li>
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
    </div>
</div>


<style>
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
    .side_menu li:before {
        display:block;
        content:'';
        position:absolute;
        left:0;
        top:0;
        border-radius:2px;
        width: 4px;
        height:100%;
        background: var(--eo-surface-selected);
    }
    .side_menu li.active:before {
        background: var(--eo-secondary-500);
    }
</style>
	
        