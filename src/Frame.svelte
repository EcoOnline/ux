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
	import AdminLinkedFields from "./Frame_administration_linkedfields.svelte";
	import Actions from "./Frame_actions.svelte";
	import Actions123 from "./Frame_actions_123.svelte";
	import Incidents from "./Frame_incidents.svelte";
	import IncidentsNew from "./Frame_incidents_new.svelte";
	import IncidentsAdmin from "./Frame_incidents_admin.svelte";
	import HazardAssessments from "./Frame_hazard_assessments.svelte";
	import QueriesNew from "./Frame_queries_new.svelte";
	import QueriesResult from "./Frame_queries_result.svelte";
	
	let tabnav = '';
	let module = '';

	let mainCSS = '';

    const comps = {
		"notfound": NotFound,
        "home": Home,
        "login": Login,
        "ehs": EHS,
        "cm": CM,
        "cm_risk_assessments": CMRisk,
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
	
	main, nav {
		padding: var(--main-pad);
		width:100%;
		text-align: center;
		overflow-y: scroll;
	}

	nav {
		height: var(--navH);
		background:#fff;
		position: absolute;
		top:0;
		z-index: 999;
		box-shadow: 0 0 16px var(--eo-surface-background);
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
	nav .frame {
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	

</style>