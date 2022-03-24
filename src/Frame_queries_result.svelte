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
    <div class="col12 col-md-5">
        <ul class="breadcrumb">
            <li><a href="#platform">EcoOnline</a></li>
            <li><a href="#ehs">EHS</a></li>
            <li><a href="#ehs/incidents">Incidents</a></li>
            <li>Query Result</li>
        </ul>
    </div>
    <div class="col12 col-md-7 text-right">
        <a title="Edit this query" class="i-edit i-24" href="#ehs/incidents/queries_new" on:click="{ () => {nav('queries_new')}}"> </a>
        <i title="Download these results" class="i-download i-24"></i>
        <a href="#ehs/incidents/queries_new" class='btn btn-secondary' on:click="{ () => {nav('queries_new')}}">New query</a>
        <a href="/" class='btn btn-secondary'>Add to dashboard</a>
        <a href="/" class='btn'>Save</a>
    </div>
</div>
<h1 class="page-title"><i class="i-filter i-32"></i> Query results</h1>

<div class="row">
    <div class="col12">
        <div class="sticky-wrapper">
            <table class="table">
                <thead>
                    <tr>
                        <th>Record ID</th>
                        <th>Report Type</th>
                        <th>Source</th>
                        <th>Event Type</th>
                        <th>When</th>
                        <th>Location</th>
                        <th>Shift</th>
                        <th>Open Actions</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><b>485</b></td>
                        <td>Full Report</td>
                        <td>[]</td>
                        <td>Near Miss</td>
                        <td>9hr 4min</td>
                        <td>Main Office</td>
                        <td>Yellow</td>
                        <td>0</td>
                        <td>In Progress</td>
                    </tr>
                    
                </tbody>
            </table>
            <div class="pagination-wrapper"><div class="pagination"> </div></div>
        </div>
    </div>
</div>

	
        