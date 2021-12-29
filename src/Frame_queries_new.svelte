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
            <li>New Query</li>
        </ul>
    </div>
    <div class="col12 col-sm-7 text-right">
        <a href="#ehs/incidents/queries_result" on:click="{ () => {nav('queries_result')}}" class='btn'>Run</a>
    </div>
</div>
<h1><i class="i-filter i-32"></i> New query</h1>

<div class="row">
    <div class="col12 col-sm-3">
        <div class="card">
            <div class="card-header">
                <h2>Add a filter</h2>
            </div>
        </div>
    </div>
    <div class="col12 col-sm-9">
        <div class="card">
            <div class="card-header">
                <h2>Query filters</h2>
            </div>
        </div>
    </div>
</div>

	
        