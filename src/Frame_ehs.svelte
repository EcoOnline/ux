<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    function nav(str) {
		dispatch('nav', {
			text: str
		});
	}
    let tab = "home";
    export let tabnav = '';
    $: {
        let t = tabnav;
        tab = (t == '' ? 'home' : t);
    }
</script>

    <div class="row sticky">
        <div class="col12">
            <ul class="breadcrumb">
                <li><a href="#home"><i class="i-16 i-platform"></i></a></li>
                <li>EHS</li>
            </ul>
        </div>
       
    </div>


    <h1 class="page-title"><i class="i-ehs  i-32"></i>EcoOnline EHS</h1>
    

    <ul class="tabs">
        <li><a href="#ehs" class:active="{tab == 'home'}">Hub</a></li>
        <li><a href="#ehs/dashboards" class:active="{tab == 'dashboards'}">Dashboards</a></li>
        <li><a href="#ehs/reports" class:active="{tab == 'reports'}">Reports</a></li>
        <li><a href="#ehs/tasks" class:active="{tab == 'tasks'}">My Tasks</a></li>
    </ul>

    {#if tab == 'home'}
        <div class="row">
            <div class="col6 col-sm-4 col-md-3 col-lg-2 col-xl-1">
                <div class="tile" on:click|preventDefault="{ () => {nav('incidents');window.location.hash='#ehs/incidents'}}">
                    <div class="icon" style="background-image:url(./images/svgs_clean/incidents.svg)"></div>
                    <b>Incidents</b>
                    <div class="tools">
                        <a href="#ehs/incidents/incidents_new" class="add" on:click|stopPropagation="{ () => {nav('incidents_new')}}"> </a>
                        <a href="#ehs/incidents/queries_new" class="filter" on:click|stopPropagation="{ () => {nav('queries_new')}}"> </a>
                        <a href="#ehs/incidents/summary" class="summary" on:click|stopPropagation="{ () => {nav('incidents/summary')}}"> </a>
                        <a href="#ehs/incidents/incidents_admin" class="tool" on:click="{ () => {nav('incidents/incidents_admin')}}" > </a>
                    </div>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2 col-xl-1">
                <div class="tile" on:click|preventDefault="{ () => {nav('actions');window.location.hash='#ehs/actions'}}">
                    <div class="icon" style="background-image:url(./images/svgs_clean/actions.svg)"></div>
                    <b>Actions</b>
                    <div class="tools">
                        <a href="#incidents/incidents_new" class="add"> </a>
                        <a href="queries_new" class="filter"> </a>
                    </div>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2 col-xl-1">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/svgs_clean/audits.svg)"></div>
                    <b>Audit & Inspection</b>
                    <div class="tools">
                        <a href="./" class="add"> </a>
                        <a href="./" class="filter"> </a>
                        <a href="./" class="summary"> </a>
                        <a href="./" class="tool"> </a>
                    </div>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2 col-xl-1">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/svgs_clean/observations.svg)"></div>
                    <b>Observation</b>
                    <div class="tools">
                        <a href="./" class="add"> </a>
                        <a href="./" class="filter"> </a>
                        <a href="./" class="summary"> </a>
                        <a href="./" class="tool"> </a>
                    </div>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2 col-xl-1">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/svgs_clean/risk_assessment.svg)"></div>
                    <b>Risk Assessment</b>
                    <div class="tools">
                        <a href="./" class="add"> </a>
                        <a href="./" class="filter"> </a>
                        <a href="./" class="summary"> </a>
                        <a href="./" class="tool"> </a>
                    </div>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2 col-xl-1">
                <div class="tile" on:click|preventDefault="{ () => {nav('hazard_assessments');window.location.hash='#ehs/hazard_assessments'}}">
                    <div class="icon" style="background-image:url(./images/svgs_clean/hazard_assessment.svg)"></div>
                    <b>Hazard Assessment</b>
                    <div class="tools">
                        <a href="./" class="add"> </a>
                        <a href="./" class="filter"> </a>
                        <a href="./" class="tool"> </a>
                    </div>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2 col-xl-1">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/svgs_clean/scheduling.svg)"></div>
                    <b>Scheduling</b>
                    <div class="tools">
                        <a href="./" class="add"> </a>
                        <a href="./" class="filter"> </a>
                        <a href="./" class="summary"> </a>
                        <a href="./" class="tool"> </a>
                    </div>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2 col-xl-1">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/svgs_clean/epr.svg)"></div>
                    <b>Environmental</b>
                    <div class="tools">
                        <a href="./" class="add"> </a>
                        <a href="./" class="filter"> </a>
                        <a href="./" class="summary"> </a>
                        <a href="./" class="tool"> </a>
                    </div>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2 col-xl-1">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/svgs_clean/period_statistics.svg)"></div>
                    <b>Period Statistics</b>
                    <div class="tools">
                        <a href="./" class="add"> </a>
                        <a href="./" class="filter"> </a>
                        <a href="./" class="summary"> </a>
                        <a href="./" class="tool"> </a>
                    </div>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2 col-xl-1">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/svgs_clean/register.svg)"></div>
                    <b>Register</b>
                    <div class="tools">
                        <a href="./" class="add"> </a>
                        <a href="./" class="filter"> </a>
                        <a href="./" class="summary"> </a>
                        <a href="./" class="tool"> </a>
                    </div>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2 col-xl-1">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/svgs_clean/advanced_rca.svg)"></div>
                    <b>Adavanced RCA</b>
                    <div class="tools">
                        <a href="./" class="add"> </a>
                        <a href="./" class="filter"> </a>
                        <a href="./" class="summary"> </a>
                        <a href="./" class="tool"> </a>
                    </div>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2 col-xl-1">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/svgs_clean/documents.svg)"></div>
                    <b>Document</b>
                    <div class="tools">
                        <a href="./" class="add"> </a>
                        <a href="./" class="filter"> </a>
                        <a href="./" class="summary"> </a>
                        <a href="./" class="tool"> </a>
                    </div>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2 col-xl-1">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/svgs_clean/tracker.svg)"></div>
                    <b>COVID-19 Tracker</b>
                    <div class="tools">
                        <a href="./" class="add"> </a>
                        <a href="./" class="filter"> </a>
                        <a href="./" class="summary"> </a>
                        <a href="./" class="tool"> </a>
                    </div>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2 col-xl-1">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/svgs_clean/pow_ra.svg)"></div>
                    <b>Point of Work</b>
                    <div class="tools">
                        <a href="./" class="add"> </a>
                        <a href="./" class="filter"> </a>
                        <a href="./" class="summary"> </a>
                        <a href="./" class="tool"> </a>
                    </div>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2 col-xl-1">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/svgs_clean/lost_time.svg)"></div>
                    <b>Lost Time</b>
                    <div class="tools">
                        <a href="./" class="add"> </a>
                        <a href="./" class="filter"> </a>
                        <a href="./" class="summary"> </a>
                        <a href="./" class="tool"> </a>
                    </div>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2 col-xl-1">
                <div class="tile" on:click|preventDefault="{ () => {nav('linkedfields');window.location.hash='#ehs/administration/linkedfields'}}">
                    <div class="icon" style="background-image:url(./images/svgs_clean/administration.svg)"></div>
                    <b>Administration</b>
                </div>
            </div>
            
        </div>
    {:else if tab == 'dashboards'}
        <h2>Dashboards</h2>
    {:else if tab == 'reports'}
        <h2>Reports</h2>
    {:else if tab == 'tasks'}
        <h2>My Tasks</h2>
    {/if}
        