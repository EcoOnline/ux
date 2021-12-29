<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();


    let tab = "dashboard";

    function nav(str) {
		dispatch('nav', {
			text: str
		});
	}
</script>

<div class="row sticky">
    <div class="col12 col-sm-5">
        <ul class="breadcrumb">
            <li><a href="#platform" on:click="{ () => {nav('platform')}}">EcoOnline</a></li>
            <li><a href="#ehs" on:click="{ () => {nav('ehs')}}">EHS</a></li>
            <li><a href="#ehs/incidents" on:click="{ () => {nav('incidents')}}">Incidents</a></li>
            <li>New</li>
        </ul>
    </div>
    <div class="col12 col-sm-7 text-right">
        
        <a href="/" class='btn btn-secondary'>Save</a>
        <a href="/" class='btn'>Submit</a>
    </div>
</div>
<div class="row">
    <div class="col12 col-md-3">
        <h1><i class="i-incidents i-32"></i> Incident</h1>
        <div class="card">
            <div class="card-body">
                
            </div>
        </div>
    </div>
    <div class="col12 col-md-9">
        <h1>Event details</h1>
        <div class="card">
            <div class="card-body">

            </div>
        </div>
    </div>
</div>

	
        