<script>
    import { createEventDispatcher } from 'svelte';
    import Search from './components/Search.svelte';
    const dispatch = createEventDispatcher();


    let tab = "dashboard";


    let search_config = {
        domain: "incidents",
        btn: "Run Query",
        conditions: [], //selected conditions, this could be pre-populated from 
        condition_options:[
            {
                label: "Person involved"
            }

        ],
        condition_matches: {}
    }

    function nav(str) {
		dispatch('nav', {
			text: str
		});
	}
</script>

<div class="row sticky">
    <div class="col12 col-sm-7">
        <ul class="breadcrumb">
            <li><a href="#platform">EcoOnline</a></li>
            <li><a href="#ehs">EHS</a></li>
            <li><a href="#ehs/incidents">Incidents</a></li>
            <li>New Query</li>
        </ul>
    </div>
    <div class="col12 col-sm-5 text-right">
        <a href="#ehs/incidents/queries_result" class='btn'>Run</a>
    </div>
</div>
<h1 class="page-title"><i class="i-filter i-32"></i> New query</h1>
<ul class="tabs">
    <li><a href="#ehs/incidents">Overview</a></li>
    <li><a href="#ehs/incidents/queries_new" class="active">Query</a></li>
    <li><a href="#ehs/incidents/summary">Summary</a></li>
    <li><a href="#ehs/incidents/incidents_admin">Admin</a></li>
</ul>
<div class="row">
    <div class="col12">
        <div class="card">
            <div class="card-body">

                <Search {search_config}></Search>

            </div>
        </div>
    </div>
</div>

	
        