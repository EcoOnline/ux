<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    function nav(str) {
		dispatch('nav', {
			text: str
		});
	}



    let tab = "apps";
    let home_layout = true;

    let popup_active = false;

    export let tabnav = '';
    $: {
        let t = tabnav;
        tab = (t == '' ? 'apps' : t);
    }

    let sidebar = 'ehs';

</script>



<!--
<div class="page-actions" class:active="{popup_active}" on:click|preventDefault="{ () => { popup_active = !popup_active} }">
    <a href='#platform' class='btn popup' >
        <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path class="pop1" d="M6 20L16 10L17.4121 11.4164L7.41409 21.4146L6 20Z" fill="white"/>
            <path class="pop2"  d="M24.5856 21.4146L14.5874 11.4165L16.0016 10.0023L26 20L24.5856 21.4146Z" fill="white"/>
        </svg>
    </a>
    <a href='#platform' class='btn'>New Audit</a>
    <a href='#platform' class='btn btn-secondary'>Query</a>
    <a href='#platform' class='btn btn-secondary'>Summary</a>
    <a href='#platform' class='btn btn-secondary'>Admin</a>
    
</div>
-->
<h1>EcoOnline Home</h1>


<!--
<ul class="tabs">
    <li><a href="#platform" class:active="{tab == 'apps'}"><i class='i-apps i-24'></i><span>Applications</span></a></li>
    <li><a href="#platform/news" class:active="{tab == 'news'}"><i class='i-news i-24'></i><span>News</span></a></li>
    <li><a href="#platform/dashboards" class:active="{tab == 'dashboards'}"><i class='i-dashboard i-24'></i><span>Dashboards</span></a></li>
</ul>


{#if tab == 'apps'}


    {#if home_layout}

        <div class="row">
            <div class="col3 col-sm-2">
                <ul class="sidebar">
                    <li class:active={sidebar == 'home'} on:mouseenter={ () => { sidebar = 'home'}}><i class='i-platform i-24'></i> <span>Home</span></li>
                    <li class:active={sidebar == 'ehs'} on:mouseenter={ () => { sidebar = 'ehs'}}><i class='i-ehs i-24'></i> <span>Health & Safety</span></li>
                    <li class:active={sidebar == 'cm'} on:mouseenter={ () => { sidebar = 'cm'}}><i class='i-chemical-manager i-24'></i> <span>Chemical Manager</span></li>
                    <li class:active={sidebar == 'admin'} on:mouseenter={ () => { sidebar = 'admin'}}><i class='i-administration i-24'></i> <span>Administration</span></li>
                    <li class:active={sidebar == 'more'} on:mouseenter={ () => { sidebar = 'more'}}><i class='i-add i-24'></i> <span>More</span></li>
                </ul>
            </div>
            <div class="col9 col-sm-10">
                <div class="row home">

                    {#if sidebar == 'home'}
                        <div class="col12">
                            <div class="hometile ar_12_1">
                                <h1>Your home for workplace safety</h1>
                            </div>
                        </div>
                        
                        <div class="col4">
                            <div class="hometile ar_1_1">tile</div>
                        </div>
                        <div class="col4">
                            <div class="hometile ar_10_1 mb">tile</div>
                            <div class="hometile ar_10_1">tile</div>
                        </div>
                        <div class="col4">
                            <div class="hometile ar_1_1">tile</div>
                        </div>
                    {/if}

                    {#if sidebar == 'ehs'}
                        <div class="col12">
                            <div class="hometile x ar_12_1">
                                <h1>Health & Safety</h1>
                            </div>
                        </div>
                        

                        <div class="col6 col-sm-4 col-md-3 col-lg-2">
                            <div class="tile" on:click|preventDefault="{ () => {nav('incidents');window.location.hash='#ehs/incidents'}}">
                                <div class="icon" style="background-image:url(./images/ehs_svgs_clean/incidents.svg)"></div>
                                <b>Incidents</b>
                                <div class="tools">
                                    <a href="#ehs/incidents/incidents_new" class="add" on:click|stopPropagation="{ () => {nav('incidents_new')}}"> </a>
                                    <a href="#ehs/incidents/queries_new" class="filter" on:click|stopPropagation="{ () => {nav('queries_new')}}"> </a>
                                    <a href="#ehs/incidents/summary" class="summary" on:click|stopPropagation="{ () => {nav('incidents/summary')}}"> </a>
                                    <a href="#ehs/incidents/incidents_admin" class="tool" on:click="{ () => {nav('incidents/incidents_admin')}}" > </a>
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
                            <div class="tile" on:click|preventDefault="{ () => {nav('hazard_assessments');window.location.hash='#ehs/hazard_assessments'}}">
                                <div class="icon" style="background-image:url(./images/ehs_svgs_clean/hazard_assessment.svg)"></div>
                                <b>Hazard Assessment</b>
                                <div class="tools">
                                    <a href="./" class="add"> </a>
                                    <a href="./" class="filter"> </a>
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
                            <div class="tile" on:click|preventDefault="{ () => {nav('linkedfields');window.location.hash='#ehs/administration/linkedfields'}}">
                                <div class="icon" style="background-image:url(./images/ehs_svgs_clean/administration.svg)"></div>
                                <b>Administration</b>
                            </div>
                        </div>







                        <div class="col2">
                            <div class="hometile ar_1_1">tile</div>
                        </div>
                        <div class="col2">
                            <div class="hometile ar_1_1">tile</div>
                        </div>
                        <div class="col2">
                            <div class="hometile ar_1_1">tile</div>
                        </div>
                        <div class="col2">
                            <div class="hometile ar_1_1">tile</div>
                        </div>
                        <div class="col2">
                            <div class="hometile ar_1_1">tile</div>
                        </div>
                        <div class="col2">
                            <div class="hometile ar_1_1">tile</div>
                        </div>
                        <div class="col2">
                            <div class="hometile ar_1_1">tile</div>
                        </div>
                    {/if}

                    {#if sidebar == 'cm'}
                        <div class="col12">
                            <div class="ar_12_1">
                                <h1>Chemicals</h1>
                            </div>
                        </div>
                        
                        <div class="col2">
                            <div class="hometile ar_1_1">tile</div>
                        </div>
                        <div class="col2">
                            <div class="hometile ar_1_1">tile</div>
                        </div>
                        <div class="col2">
                            <div class="hometile ar_1_1">tile</div>
                        </div>
                        <div class="col2">
                            <div class="hometile ar_1_1">tile</div>
                        </div>
                        <div class="col2">
                            <div class="hometile ar_1_1">tile</div>
                        </div>
                        <div class="col2">
                            <div class="hometile ar_1_1">tile</div>
                        </div>
                        <div class="col2">
                            <div class="hometile ar_1_1">tile</div>
                        </div>
                        <div class="col2">
                            <div class="hometile ar_1_1">tile</div>
                        </div>
                        <div class="col2">
                            <div class="hometile ar_1_1">tile</div>
                        </div>
                        <div class="col2">
                            <div class="hometile ar_1_1">tile</div>
                        </div>
                        <div class="col2">
                            <div class="hometile ar_1_1">tile</div>
                        </div>
                        <div class="col2">
                            <div class="hometile ar_1_1">tile</div>
                        </div>
                        <div class="col2">
                            <div class="hometile ar_1_1">tile</div>
                        </div>
                        <div class="col2">
                            <div class="hometile ar_1_1">tile</div>
                        </div>
                    {/if}




                </div>
            </div>
        </div>
    {:else}
        <h1>Applications</h1>
    {/if}
{/if}

{#if tab == 'news'}
<h1>News</h1>
{/if}

{#if tab == 'dashboards'}
<h1>Dashboards</h1>
{/if}

-->



<style>

/*dirty hack for proper tile sizes inside a 10col*/
:root {
    --col10: calc(10 * var(--c) + 9 * var(--g) );
    --hack: calc((var(--col10) - (9 * var(--g))) / 8.055);
}
.col9 .col6 {
    width: calc(2 * var(--hack) + var(--g) );

}

.hometile.x {
    box-shadow: none;
    background: transparent;
}



.page-actions {
    float:right;
    display: flex;
    flex-direction: row-reverse;
}


.page-actions .btn{
    margin-right:0;
    margin-left:8px;
}
.popup {
    display: none;
    padding:0 12px;      
}
.popup .pop1, .popup .pop2 {
    transition: all 0.3s linear;
}
.page-actions.active .pop1 {
    d: path("M8 22.5837L22.5836 8L24 9.41421L9.41421 24L8 22.5837Z");
}
.page-actions.active .pop2 {
    d: path("M22.5837 24L8 9.41429L9.41421 8L24 22.5837L22.5837 24Z");
}

@media (max-width: 900px) {

    .btn {
        line-height: 48px;
    }
    .page-actions {
        width:0%;
        overflow: visible;
        float: none;
        position:absolute;
        right:16px;
        bottom:80px;
        flex-direction: column-reverse;
        align-items: flex-end;
    }
    .page-actions .btn:nth-child(2) {
        transition-delay: 0s;
        /*New Audit*/
    }
    .page-actions .btn:nth-child(3) {
        transition-delay: 0.05s;
        /*Query*/
    }
    .page-actions .btn:nth-child(4) {
        transition-delay: 0.1s;
        /*Summary*/
    }
    .page-actions .btn:nth-child(5) {
        transition-delay: 0.15s;
        /*Admin*/
    }
    .page-actions .btn{
        float:right;
        margin-top:16px;
        clear:both;
        transition: all 0.3s ease-out;
        position: relative;
        margin-right:0;
    }
    .page-actions .btn:not(.popup){
        transform: translateY(32px);
        opacity:0;
    }
    
    .popup {
        display: inline-block;  
    }
    .page-actions.active {
        width:100%;
    }
    .page-actions.active:before {
        content: '';
        display: block;
        background:rgba(0,0,0,0.3);
        width:100%;
        height:100vh;
        position: absolute;
        bottom:-16px;
        right:-16px;
    }
    /*
    .popup ~ .btn {
        display: none;
    }
    */
    .page-actions.active .btn {
        display: inline-block;
        transform: translateY(0px);
        opacity:1;
    }

    .tabs {
        background:#fff;
        left:0;
        bottom:-16px;
        position:absolute;
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        align-items: center;
        height: auto;
        padding:8px;
        box-shadow: 0 -4px 8px rgba(0,0,0,0.05);
    }
    .tabs li {
        height:auto;
        margin:0;
        padding:0;
    }
    .tabs li a {
        text-align: center;
        width:100%;
        padding:8px 24px 8px 16px;
        border-radius: 12px;

        display: flex;
        flex-direction: row;
        align-items: center;
        height: 48px;
    }
    .tabs li a.active {
        background: var(--eo-surface-selected)

    }
    .tabs li a.active span {
        display:inline-block;
        max-width:300px;
    }
    .tabs li a.active:after {
        display:none;/* hide green border*/
    }
    .tabs .i-24 { display:inline-block; margin: 8px }
    .tabs span { 
        display:inline-block;
        max-width:300px;
        transition: all 0.1s linear;
    }
}

@media (max-width: 600px) {
    .tabs span { 
        line-height:20px;
        max-width:0px;
        overflow: hidden;
    }
}

</style>