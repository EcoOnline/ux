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
                <li><a href="#platform"><i class="i-16 i-platform"></i></a></li>
                <li>Chemical Manager</li>
            </ul>
        </div>
       
    </div>
    
    <!--
    <ul class="tabs">
        <li><a href="#ehs" class:active="{tab == 'home'}">Hub</a></li>
        <li><a href="#ehs/dashboards" class:active="{tab == 'dashboards'}">Dashboards</a></li>
        <li><a href="#ehs/reports" class:active="{tab == 'reports'}">Reports</a></li>
        <li><a href="#ehs/tasks" class:active="{tab == 'tasks'}">My Tasks</a></li>
    </ul>
    -->

    {#if tab == 'home'}
        <div class="row">
            <div class="col6 col-sm-4 col-md-3 col-lg-2 col-xl-1">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/svgs_clean/cm.svg)"></div>
                    <b>My Products</b>
                    <ol></ol>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2 col-xl-1">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/svgs_clean/search.svg)"></div>
                    <b>Search</b>
                    <ol></ol>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2 col-xl-1">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/svgs_clean/locations.svg)"></div>
                    <b>Locations</b>
                    <ol></ol>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2 col-xl-1">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/svgs_clean/legislation.svg)"></div>
                    <b>Legislation Lists</b>
                    <ol></ol>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2 col-xl-1">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/svgs_clean/amount.svg)"></div>
                    <b>Amounts</b>
                    <ol></ol>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2 col-xl-1">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/svgs_clean/actions.svg)"></div>
                    <b>Actions</b>
                    <ol></ol>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2 col-xl-1">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/svgs_clean/exposure_register.svg)"></div>
                    <b>Exposures</b>
                    <ol></ol>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2 col-xl-1">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/svgs_clean/risk_assessment.svg)"></div>
                    <b>Risk Assessments</b>
                    <ol></ol>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2 col-xl-1">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/svgs_clean/sds_request.svg)"></div>
                    <b>SDS Requests</b>
                    <ol></ol>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2 col-xl-1">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/svgs_clean/workplace_description.svg)"></div>
                    <b>Workplace Descriptions</b>
                    <ol></ol>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2 col-xl-1">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/svgs_clean/pow_ra.svg)"></div>
                    <b>Substitutions</b>
                    <ol></ol>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2 col-xl-1">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/svgs_clean/substitution.svg)"></div>
                    <b>Read Links/QR Codes</b>
                    <ol></ol>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2 col-xl-1">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/svgs_clean/custom_lists.svg)"></div>
                    <b>Custom Lists</b>
                    <ol></ol>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2 col-xl-1">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/svgs_clean/reports.svg)"></div>
                    <b>Reports</b>
                    <ol></ol>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2 col-xl-1">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/svgs_clean/smartforms.svg)"></div>
                    <b>Smartforms</b>
                    <ol></ol>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2 col-xl-1">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/svgs_clean/help.svg)"></div>
                    <b>Help</b>
                    <ol></ol>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2 col-xl-1">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/svgs_clean/previous_version.svg)"></div>
                    <b>Other</b>
                    <ol></ol>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2 col-xl-1">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/svgs_clean/chemical_approval.svg)"></div>
                    <b>Chemical Approval</b>
                    <ol></ol>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2 col-xl-1">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/svgs_clean/analytics.svg)"></div>
                    <b>Reports & Analytics</b>
                    <ol></ol>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2 col-xl-1">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/svgs_clean/user_management.svg)"></div>
                    <b>User Management</b>
                    <ol></ol>
                </div>
            </div>
            <div class="col6 col-sm-4 col-md-3 col-lg-2 col-xl-1">
                <div class="tile">
                    <div class="icon" style="background-image:url(./images/svgs_clean/administration.svg)"></div>
                    <b>Administration</b>
                    <ol></ol>
                </div>
            </div>
            
        </div>
    {/if}
        