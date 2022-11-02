<script>
    import { createEventDispatcher } from 'svelte';
	import { config, app_data } from './Frame_menusettings.js';

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
                <li>Crisis Manager</li>
            </ul>
        </div>
       
    </div>

    <h1 class="page-title"><i class="i-crisis-manager  i-32"></i>Crisis Manager  
    
    {#if $config.multi_tennant && $app_data['crisis'].tennants.length}
    []
    <!--{#each $app_data[a].tennants as tennant}
        <option>{tennant}</option>
    {/each}-->
    {/if}
    </h1>
    
    <!--
    <ul class="tabs">
        <li><a href="#ehs" class:active="{tab == 'home'}">Hub</a></li>
        <li><a href="#ehs/dashboards" class:active="{tab == 'dashboards'}">Dashboards</a></li>
        <li><a href="#ehs/reports" class:active="{tab == 'reports'}">Reports</a></li>
        <li><a href="#ehs/tasks" class:active="{tab == 'tasks'}">My Tasks</a></li>
    </ul>
    -->

    {#if tab == 'home'}
       
        new table type
    {/if}
        