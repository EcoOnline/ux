<script>

	/*
		a responsive frame to hold smaller experiments so that they don't have to be continually framed,
	*/

	import NotFound from "./Frame_notfound.svelte";
	import Home from "./Frame_home.svelte";
	import Login from "./Frame_login.svelte";
	import Nav from "./Frame_header.svelte";
	import EHS from "./Frame_ehs.svelte";
	import CM from "./Frame_cm.svelte";
	import CMRisk from "./Frame_cm_risk.svelte";
	import Crisis from "./Frame_crisis.svelte";
	import ENV from "./Frame_environment.svelte";
	import AdminLinkedFields from "./Frame_administration_linkedfields.svelte";
	import Actions from "./Frame_actions.svelte";
	import Actions123 from "./Frame_actions_123.svelte";
	import Incidents from "./Frame_incidents.svelte";
	import IncidentsNew from "./Frame_incidents_new.svelte";
	import IncidentsAdmin from "./Frame_incidents_admin.svelte";
	import HazardAssessments from "./Frame_hazard_assessments.svelte";
	import QueriesNew from "./Frame_queries_new.svelte";
	import QueriesResult from "./Frame_queries_result.svelte";
	import RiskPrint from "./Frame_risk_print.svelte";
	
	let tabnav = '';
	let module = '';

	let mainCSS = '';

    const comps = {
		"notfound": NotFound,
        "home": Home,
        "login": Login,
        "ehs": EHS,
        "env": ENV,
        "cm": CM,
        "cm_risk_assessments": CMRisk,
		"cm_risk_assessment": CMRisk,
        "crisis": Crisis,
        "ehs_linkedfields": AdminLinkedFields,
        "ehs_actions": Actions,
        "ehs_incidents": Incidents,
        "ehs_incidents_incidents_new": IncidentsNew,
        "ehs_actions_123": Actions123,
        "ehs_actions_122": Actions123,
        "ehs_incidents_incidents_admin": IncidentsAdmin,
        "ehs_incidents_queries_new": QueriesNew,
        "ehs_incidents_queries_result": QueriesResult,
        "ehs_hazard_assessment": HazardAssessments,
		"ehs_audits": NotFound,
		"ehs_observations": NotFound,
		"ehs_risk_assessment": NotFound,
		"ehs_risk_print": RiskPrint,
		"ehs_observations": NotFound,
		"ehs_observations": NotFound,
		"ehs_observations": NotFound,
		"ehs_observations": NotFound,
		"ehs_observations": NotFound,
		"ehs_observations": NotFound,
		"ehs_observations": NotFound,
	}
    let comp = comps.login;
	let hash = window.location.hash.substring(1);
	if(hash!== '') {
		handleNavStr(hash);
	}


   let grid = false;

   function handleHash() {
		let hash = window.location.hash.substring(1);
		if(hash !== '') {
			handleNavStr(hash);
		}
   }

   function handleNavStr(hash) {
		console.log('frame handleNavStr', hash);
		let hash_arr = hash.split('/');

		mainCSS = hash_arr[0];
		let found = false;
		tabnav = '';

		for(let i = hash_arr.length;i>=0;i--){
			let test_join = hash_arr.slice(0,i).join('_');
			if(comps[test_join]) {
				comp = comps[test_join];
				found = true;
				if(hash_arr[i]) {
					tabnav = hash_arr[i];
					console.log('tabnav', tabnav);
				}
				i = -1;
			}
		}
		if(!found) {
			comp = comps.notfound; //default to first
		}

	   /*
		tabnav = '';
		let hash_arr = hash.split('/');
		let id = hash_arr[hash_arr.length-1];
		
		if (comps[id]) {
			module = id;
			comp = comps[id];
			return;
		} else {
			tabnav = id;
			id = hash_arr[hash_arr.length-2];
			if (comps[id]) {
				module = id;
				comp = comps[id];
				return;
			}
		}
		comp = comps.notfound; //default to first
		*/

   }

   function handleNav(event) {
		let hash = event.detail.text;
		handleNavStr(hash);
	}

    let bodyScroll = 0;
    let bodyHeight = 0;
    function handleScroll(event) {
        /* throttle this */
        bodyScroll = event.target.scrollTop;
        bodyHeight = event.target.offsetHeight;
    }
</script>
{#if grid}
<div class="grid"><div class="frame"></div></div>
{/if}

<svelte:window on:hashchange={handleHash}/>

{#if comp !== comps.login }
<Nav></Nav>
{/if}
	
<main on:scroll={handleScroll} class={mainCSS}>
	<div class="frame">
		<svelte:component this={comp} on:nav={handleNav} {tabnav} {bodyScroll}/>
		{#if window.location.href.indexOf('help=2') >= 0}
			<span on:click='{ () => alert('Help succeeded.')}' class="btn" style="position:fixed;right:0;bottom:16px;z-index:9999;padding-bottom:2px;"><i class="i-help i-24" style='filter:invert(1)'></i></span>
		{/if}
		{#if window.location.href.indexOf('help=3') >= 0}
			<span on:click='{ () => alert('Help succeeded.')}' class="btn" style="background:#1CD390;border:1px solid #1CD390;position:fixed;right:0;bottom:16px;z-index:9999;padding-bottom:2px;"><i class="i-help i-24" style='filter:invert(1)'></i></span>
		{/if}
		{#if window.location.href.indexOf('help=4') >= 0}
			<span on:click='{ () => alert('Help succeeded.')}' class="btn" style="position:fixed;right:0;bottom:16px;z-index:9999;padding-bottom:2px;">Help</span>
		{/if}
		{#if window.location.href.indexOf('help=5') >= 0}
			<span on:click='{ () => alert('Help succeeded.')}' class="btn" style="background:#1CD390;border:1px solid #1CD390;position:fixed;right:0;bottom:16px;z-index:9999;padding-bottom:2px;">Help</span>
		{/if}
		{#if window.location.href.indexOf('help=6') >= 0}
			<span on:click='{ () => alert('Help succeeded.')}' class="btn" style="position:fixed;right:0;bottom:16px;z-index:9999;padding-bottom:2px;"><i class="i-help i-20" style='filter:invert(1)'></i> Help</span>
		{/if}
		{#if window.location.href.indexOf('help=7') >= 0}
			<span on:click='{ () => alert('Help succeeded.')}' class="btn" style="background:#1CD390;border:1px solid #1CD390;position:fixed;right:0;bottom:16px;z-index:9999;padding-bottom:2px;"><i class="i-help i-20" style='filter:invert(1)'></i> Help</span>
		{/if}
	</div>
	
</main>


<style>
	
	 :global(body){
		overflow:hidden;
	 }
	 
	.grid {
		position:absolute;
		left:16px;
		width:calc(100% - 32px);
		height:100%;
		text-align: center;
		z-index:9999;
		pointer-events: none;
		overflow-y: scroll;
	}
	.grid .frame {
		background: repeating-linear-gradient( 90deg, rgba(255,0,0,0.1), rgba(255,0,0,0.1) var(--col), transparent var(--col), transparent var(--gutter) );
	}
	
	main {
		padding: var(--main-pad);
		width:100%;
		text-align: center;
		overflow-y: scroll;
	}

	main {
		height: calc( var(--mainH));
		padding-bottom: 16px;
		margin-top: var(--navH);
	}
	.frame {
		text-align: left;
		margin: 0 auto;
		max-width: var(--max-page);
		padding:0;
		height:100%;

	}
	

</style>