<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    function nav(str) {
		dispatch('nav', {
			text: str
		});
	}
    let tab = "home";
</script>

    <div class="row sticky">
        <div class="col12">
            <ul class="breadcrumb">
                <li><a href="/">EcoOnline</a></li>
                <li>EHS</li>
            </ul>
        </div>
       
    </div>
    

    <ul class="tabs">
        <li><a href="/" class:active="{tab == 'home'}" on:click|preventDefault ="{ () => { tab = 'home';}}">Home</a></li>
        <li><a href="/" class:active="{tab == 'dashboards'}" on:click|preventDefault ="{ () => { tab = 'dashboards'; }}">Dashboards</a></li>
        <li><a href="/" class:active="{tab == 'reports'}" on:click|preventDefault ="{ () => { tab = 'reports';}}">Reports</a></li>
        <li><a href="/" class:active="{tab == 'tasks'}" on:click|preventDefault ="{ () => { tab = 'tasks';}}">My Tasks</a></li>
    </ul>

    {#if tab == 'home'}
        <div class="row">
            <div class="col6 col-sm-4 col-md-3 col-lg-2">
                <div class="tile" on:click|preventDefault="{ () => {nav('incidents');window.location.hash='#ehs/incidents'}}">
                    <div class="icon" style="background-image:url(./images/ehs_svgs_clean/incidents.svg)"></div>
                    <b>Incidents</b>
                    <div class="tools">
                        <a href="#ehs/incidents/incidents_new" class="add" on:click|stopPropagation="{ () => {nav('incidents_new')}}"> </a>
                        <a href="#ehs/incidents/queries_new" class="filter" on:click|stopPropagation="{ () => {nav('queries_new')}}"> </a>
                        <a href="#ehs/incidents/summary" class="summary" on:click|stopPropagation="{ () => {nav('incidents/summary')}}"> </a>
                        <a href="#ehs/incidents/admin" class="tool" on:click|stopPropagation="{ () => {nav('incidents/admin')}}"> </a>
                    </div>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/ehs_svgs_clean/actions.svg)"></div>
                    <b>Actions</b>
                    <div class="tools">
                        <a href="#incidents/incidents_new" class="add"> </a>
                        <a href="queries_new" class="filter"> </a>
                        <a href="./" class="summary"> </a>
                        <a href="./" class="tool"> </a>
                    </div>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/ehs_svgs_clean/audits.svg)"></div>
                    <b>Audit & Inspection</b>
                    <div class="tools">
                        <a href="./" class="add"> </a>
                        <a href="./" class="filter"> </a>
                        <a href="./" class="summary"> </a>
                        <a href="./" class="tool"> </a>
                    </div>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/ehs_svgs_clean/observations.svg)"></div>
                    <b>Observation</b>
                    <div class="tools">
                        <a href="./" class="add"> </a>
                        <a href="./" class="filter"> </a>
                        <a href="./" class="summary"> </a>
                        <a href="./" class="tool"> </a>
                    </div>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/ehs_svgs_clean/risk_assessment.svg)"></div>
                    <b>Risk Assessment</b>
                    <div class="tools">
                        <a href="./" class="add"> </a>
                        <a href="./" class="filter"> </a>
                        <a href="./" class="summary"> </a>
                        <a href="./" class="tool"> </a>
                    </div>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/ehs_svgs_clean/scheduling.svg)"></div>
                    <b>Scheduling</b>
                    <div class="tools">
                        <a href="./" class="add"> </a>
                        <a href="./" class="filter"> </a>
                        <a href="./" class="summary"> </a>
                        <a href="./" class="tool"> </a>
                    </div>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/ehs_svgs_clean/epr.svg)"></div>
                    <b>Environmental</b>
                    <div class="tools">
                        <a href="./" class="add"> </a>
                        <a href="./" class="filter"> </a>
                        <a href="./" class="summary"> </a>
                        <a href="./" class="tool"> </a>
                    </div>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/ehs_svgs_clean/period_statistics.svg)"></div>
                    <b>Period Statistics</b>
                    <div class="tools">
                        <a href="./" class="add"> </a>
                        <a href="./" class="filter"> </a>
                        <a href="./" class="summary"> </a>
                        <a href="./" class="tool"> </a>
                    </div>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/ehs_svgs_clean/register.svg)"></div>
                    <b>Register</b>
                    <div class="tools">
                        <a href="./" class="add"> </a>
                        <a href="./" class="filter"> </a>
                        <a href="./" class="summary"> </a>
                        <a href="./" class="tool"> </a>
                    </div>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/ehs_svgs_clean/advanced_rca.svg)"></div>
                    <b>Adavanced RCA</b>
                    <div class="tools">
                        <a href="./" class="add"> </a>
                        <a href="./" class="filter"> </a>
                        <a href="./" class="summary"> </a>
                        <a href="./" class="tool"> </a>
                    </div>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/ehs_svgs_clean/documents.svg)"></div>
                    <b>Document</b>
                    <div class="tools">
                        <a href="./" class="add"> </a>
                        <a href="./" class="filter"> </a>
                        <a href="./" class="summary"> </a>
                        <a href="./" class="tool"> </a>
                    </div>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/ehs_svgs_clean/tracker.svg)"></div>
                    <b>COVID-19 Tracker</b>
                    <div class="tools">
                        <a href="./" class="add"> </a>
                        <a href="./" class="filter"> </a>
                        <a href="./" class="summary"> </a>
                        <a href="./" class="tool"> </a>
                    </div>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/ehs_svgs_clean/pow_ra.svg)"></div>
                    <b>Point of Work</b>
                    <div class="tools">
                        <a href="./" class="add"> </a>
                        <a href="./" class="filter"> </a>
                        <a href="./" class="summary"> </a>
                        <a href="./" class="tool"> </a>
                    </div>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/ehs_svgs_clean/lost_time.svg)"></div>
                    <b>Lost Time</b>
                    <div class="tools">
                        <a href="./" class="add"> </a>
                        <a href="./" class="filter"> </a>
                        <a href="./" class="summary"> </a>
                        <a href="./" class="tool"> </a>
                    </div>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/ehs_svgs_clean/administration.svg)"></div>
                    <b>Administration</b>
                    <div class="tools">
                        <a href="./" class="add"> </a>
                        <a href="./" class="filter"> </a>
                        <a href="./" class="summary"> </a>
                        <a href="./" class="tool"> </a>
                    </div>
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
        