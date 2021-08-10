
<script>
	import { onMount } from 'svelte';
	import {dndzone} from "svelte-dnd-action";
	import { fly } from 'svelte/transition';

	import Thumbnail_216 from "carbon-icons-svelte/lib/Thumbnail_216"; //Modules Icon
	import User32 from "carbon-icons-svelte/lib/User32";
	import Search32 from "carbon-icons-svelte/lib/Search32";

	import TrafficIncident32 from "carbon-icons-svelte/lib/TrafficIncident32"; //Events
	import TaskView32 from "carbon-icons-svelte/lib/TaskView32"; //Audits Icon
	import AirlineManageGates32 from "carbon-icons-svelte/lib/AirlineManageGates32"; //Actions Icon
	import CloudLightning32 from "carbon-icons-svelte/lib/CloudLightning32"; //Risk Icon
	import Clean32 from "carbon-icons-svelte/lib/Clean32"; //BBS Icon
	import SoilTemperatureField32 from "carbon-icons-svelte/lib/SoilTemperatureField32"; //EPR Icon
	import Alarm32 from "carbon-icons-svelte/lib/Alarm32"; // Schedule Icon
	import Rewind_3032 from "carbon-icons-svelte/lib/Rewind_3032"; //Lost time Icon
	import Schematics32 from "carbon-icons-svelte/lib/Schematics32"; //ARCA Icon

	/*
		https://github.com/IBM/carbon-icons-svelte

		Supported icon sizes include 16, 20, 24 and 32. See the Icon Index for a list of supported icons.
		
		import Add16 from "carbon-icons-svelte/lib/Add16";
		<Add16 />
		<Add16 title="Add" />
		<Add16>
			<title>Add</title>
		</Add16>

		<Add16
			on:click="{() => {}}"
			on:mouseenter="{() => {}}"
			on:mouseover="{() => {}}"
			on:mouseleave="{() => {}}"
			on:keyup="{() => {}}"
			on:keydown="{() => {}}"
		/>
	*/



	onMount(() => {
		//weird hack for carbon icon not turning up in css
		document.querySelectorAll('.header [data-carbon-icon]').forEach(function(e) {e.style.fill = '#fff';});

		let hash = window.location.hash.substr(1);
		if(hash !== '') {
			navigate(hash);
		}

		//psuedo message arrival
		setTimeout(function(){
			notifications.unshift(
				{"read":false, "title":"Your permissions have been upgraded"},
				{"read":false, "title":"You've just registered your 1000th event!"}
			);
			notifications = notifications;
		}, 8000)

		setTimeout(hideName, 5000); //empower brand by hiding company name
		setTimeout(function(){
			brand_color = '#0F1041';
		}, 1000)

		
	});

	let nav = "home";
	let nav2 = false;
	let nav3 = false;
	let nav4 = false;

	let tail_height = 121.78;
	let tail_height_min = 100;
	let tail_height_max = 140;
	let tail_width = 5;
	let tail_width_min = 5;
	let tail_width_max = 30;

	let is_searching = false;
	let search_text = '';

	let brand_color = getComputedStyle(document.documentElement).getPropertyValue('--brand_color'); 
	let contrast_color = '#FFFFFF';

	function luma(color) {
		if(color.length < 7){
			return 0;
		} else {
			let rgb = [];
			for (var i = 0; i <= 2; i++) {
				rgb[i] = parseInt(color.substr((i+1) * 2, 2), 16);
			}
			return (0.2126 * rgb[0]) + (0.7152 * rgb[1]) + (0.0722 * rgb[2]); // SMPTE C, Rec. 709 weightings
		}
	}
	$: {
		let c = brand_color;
		if(c.length == 7){
			document.documentElement.style.setProperty('--brand_color', c);
			contrast_color = (luma(brand_color) >= 165 ? '#000000' : '#FFFFFF');
			document.documentElement.style.setProperty('--contrast_color', contrast_color);
		}
	}

	


	function search() {
		//pseudo search here then 
		if(search_text !== '') {
			navigate('home/search');
		}
	}
	function search_key(e) {
		let k = e.which || e.keyCode;
		if(k == 13){
			search();
		}
		if(k == 13|| k == 27){
			e.target.blur();
			is_searching = false;
		}
	}

	function navigate(key) {
		let parts = key.split('/');
		window.location.hash = key;
		nav = key;
		nav2 = parts[1];
		nav3 = parts[2];
		nav4 = parts[3];

		if(nav2 == 'safety_manager' && !nav3) {
			navigate('home/safety_manager/modules');
		}
		if(nav2 == 'chemical_manager' && !nav3) {
			navigate('home/chemical_manager/modules');
		}
		if(nav2 == 'account' && !nav3) {
			navigate('home/account/notifications');
		}
	}

	function hideName() {
		document.querySelector('.breadcrumb > a').style.maxWidth=0;
		document.querySelector('.breadcrumb > a').style.padding=0;
	}


	let safety_modules = [
		{
			"id": 101,
			"name": "Actions",
			"key": "home/safety_manager/modules/actions",
			"index": 1,
			"carbon": AirlineManageGates32,
			"col1": "swatch1",
			"col2": "swatch2",
		},
		{
			"id": 102,
			"name": "Events",
			"key": "home/safety_manager/modules/events",
			"index": 0,
			"carbon": TrafficIncident32,
			"col1": "swatch3",
			"col2": "swatch4",
		},
		{
			"id": 103,
			"name": "Audits",
			"key": "home/safety_manager/modules/audits",
			"index": 2,
			"carbon": TaskView32,
			"col1": "swatch5",
			"col2": "swatch6",
		},
		{
			"id": 104,
			"name": "BBS",
			"key": "home/safety_manager/modules/bbs",
			"index": 3,
			"carbon": Clean32,
			"col1": "swatch7",
			"col2": "swatch8",
		},
		{
			"id": 105,
			"name": "Risk Assessment",
			"key": "home/safety_manager/modules/risk",
			"index": -1,
			"carbon": CloudLightning32,
			"col1": "swatch9",
			"col2": "swatch10",
		},
		{
			"id": 106,
			"name": "EPR",
			"key": "home/safety_manager/modules/epr",
			"index": -1,
			"carbon": SoilTemperatureField32,
			"col1": "swatch6",
			"col2": "swatch2",
		},
		{
			"id": 107,
			"name": "Schedule",
			"key": "home/safety_manager/modules/schedule",
			"index": -1,
			"carbon": Alarm32,
			"col1": "swatch8",
			"col2": "swatch3",
		},
		{
			"id": 108,
			"name": "Arca",
			"key": "home/safety_manager/modules/arca",
			"index": -1,
			"carbon": Schematics32,
			"col1": "swatch1",
			"col2": "swatch5",
		},
		{
			"id": 109,
			"name": "Lost Time",
			"key": "home/safety_manager/modules/lost_time",
			"index": -1,
			"carbon": Rewind_3032,
			"col1": "swatch10",
			"col2": "swatch4",
		}
	];

	$: fav_safety_modules = safety_modules.sort((a, b) => a.index - b.index).filter( (mod) => { return mod.index >= 0});
	$: other_safety_modules = safety_modules.filter( (mod) => { return mod.index < 0});

	let chemical_modules = [
		{
			"name": "My Products",
			"key": "home/chemical_manager/modules/my_products",
			"index": 0
		},
		{
			"name": "Search",
			"key": "home/chemical_manager/modules/search",
			"index": 1
		},
		{
			"name": "Locations",
			"key": "home/chemical_manager/modules/locations",
			"index": 2
		},
		{
			"name": "Reports",
			"key": "home/chemical_manager/modules/reports",
			"index": 3
		},
		{
			"name": "Read Link & QR",
			"key": "home/chemical_manager/modules/read_link",
			"index": 5
		},
		{
			"name": "SDS Requests",
			"key": "home/chemical_manager/modules/sds_requests",
			"index": 4
		},
		{
			"name": "Custom List",
			"key": "home/chemical_manager/modules/custom_list",
			"index": -1
		},
		{
			"name": "Substitution",
			"key": "home/chemical_manager/modules/custom_list",
			"index": -1
		},
		{
			"name": "Previous Version",
			"key": "home/chemical_manager/modules/custom_list",
			"index": -1
		},
		{
			"name": "Offline",
			"key": "home/chemical_manager/modules/custom_list",
			"index": -1
		},
		{
			"name": "Help",
			"key": "home/chemical_manager/modules/custom_list",
			"index": -1
		},
		{
			"name": "Ideas Portal",
			"key": "home/chemical_manager/modules/custom_list",
			"index": -1
		},
		{
			"name": "Actions",
			"key": "home/chemical_manager/modules/custom_list",
			"index": -1
		}
		
	];

	let notifications =[
		{
			"title": "You have an incident investigation due.",
			"read": true
		},
		{
			"title": "You have been assigned a task.",
			"read": true
		},
		{
			"title": "Your course starts tomorrow.",
			"read": true
		}
	];

	$: unread_notifications = notifications.filter( (n) => { return !n.read });

	function handleMousemove(e) {
		tail_height = Math.round(tail_height_min + (e.clientX / window.innerWidth * (tail_height_max - tail_height_min))).toFixed(2);
		tail_width = Math.round(tail_width_min + (e.clientX / window.innerWidth * (tail_width_max - tail_width_min))).toFixed(2);
	}




	function dstart(e) {
		let k = e.target.dataset.key;
		console.log('starting', e.target.dataset.k);
		e.dataTransfer.setData("text/plain", k);
		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.dropEffect = "move";
		drag_item = safety_modules.filter((m) => { return m.key == k})[0];
	}
	function ddrop_fave(e) {
		let k = e.target.dataset.key;
		let i = e.target.dataset.index;
		e.target.classList.remove('tile_drag_onto');
		console.log('dropped on fave', k, drag_item.index, '=>', i);
		if(drag_item.index < 0) {
			//came from other so 
			//add to all above i
			safety_modules.forEach( (m) => {
				if(m.index >= i) {
					m.index++
				}
			})
		} else {
			//came from fave eg reordering!
			if(drag_item.index < i) {
				//moving left to right
				safety_modules.forEach( (m) => {
					if(m.index > drag_item.index && m.index <= i ) {
						m.index--;
					}
				})
			} else {
				//moving right to left
				safety_modules.forEach( (m) => {
					if(m.index >= i && m.index < drag_item.index ) {
						m.index++;
					}
				})
			}

		}
		drag_item.index = i;
		safety_modules = safety_modules;
		drag_item = false;

	}
	function ddrop_other(e) {
		console.log('dropped on other', e);
		drag_item.index = -1;
		safety_modules = safety_modules;
		drag_item = false;
	}

	function allowDrop(e) {
  		e.preventDefault();
	}
	function allowDropFave(e) {
  		e.preventDefault();
		
	}
	function denter(e) {
		console.log('denter', e.target.classList);
		e.target.classList.add('tile_drag_onto');
		console.log('denterafter', e.target.classList);
	}
	function dleave(e) {
		console.log('dleave', e.target.classList);
		e.target.classList.remove('tile_drag_onto');
		console.log('dleaveafter', e.target.classList);
	}


	let drag_item = false;

	
</script>

<svelte:window on:mousemove={handleMousemove}/>

<div class="page">
	<div class="header">
		<div class="mark">
			<svg  on:click="{ () => { navigate("home");hideName(); }}" width="28.17px" height="26.96px" viewBox="0 0 162 155" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
				<path d="M{tail_width},{tail_height} L57.41,84.60 C69.29,71.79 81.69,59.51 94.63,47.77 C97.37,38.98 103.56,32.71 110.28,32.71 C117.00,32.71 121.33,36.36 124.41,40.68 C126.82,42.42 129.18,44.21 131.50,46.06 L124.41,47.77 C122.10,50.92 120.41,53.26 119.35,54.79 C122.24,63.79 127.96,77.73 113.88,97.58 C104.50,110.81 87.82,117.75 63.85,118.40 C63.85,118.40 89.89,149.10 89.89,149.10 C111.90,144.44 129.60,133.96 141.65,116.96 C150.76,104.11 156.13,90.84 156.13,77.26 C156.13,75.27 156.13,51.18 156.13,5 L39.13,5 L39.13,73.5"></path>
			</svg>

			<div class="breadcrumb">
				<a href="/" on:click|preventDefault="{ () => { navigate("home")}}">EcoOnline EHS</a>

				{#if nav2}
					<div class="dd_wrapper">
						{#if nav2 == 'safety_manager'}
							<a href="/" on:click|preventDefault="{ () => { navigate('home/safety_manager')}}">&nbsp;&nbsp;&nbsp;<b>></b>&nbsp;&nbsp;&nbsp;Safety Manager</a>
						{:else if nav2 == 'chemical_manager'}
							<a href="/" on:click|preventDefault="{ () => { navigate('home/chemical_manager')}}">&nbsp;&nbsp;&nbsp;<b>></b>&nbsp;&nbsp;&nbsp;Chemical Manager</a>
						{:else if nav2 == 'learning_manager'}
							<a href="/" on:click|preventDefault="{ () => { navigate('home/learning_manager')}}">&nbsp;&nbsp;&nbsp;<b>></b>&nbsp;&nbsp;&nbsp;Learning Manager</a>
						{:else if nav2 == 'account'}
							<a href="/" on:click|preventDefault="{ () => { navigate('home/acount')}}">&nbsp;&nbsp;&nbsp;<b>></b>&nbsp;&nbsp;&nbsp;My Account</a>
						{:else if nav2 == 'search'}
							<a href="/" on:click|preventDefault="{ () => { navigate('home/search')}}">&nbsp;&nbsp;&nbsp;<b>></b>&nbsp;&nbsp;&nbsp;Search</a>
						{/if}
						<div class="dd">
							<ul>
								<li class:active={nav2 == 'safety_manager'} on:click|preventDefault="{ () => { navigate('home/safety_manager')}}">Safety Manager</li>
								<li class:active={nav2 == 'chemical_manager'} on:click|preventDefault="{ () => { navigate('home/chemical_manager')}}">Chemical Manager</li>
								<li class:active={nav2 == 'learning_manager'} on:click|preventDefault="{ () => { navigate('home/learning_manager')}}">Learning Manager</li>
								<li class="divider"></li>
								<li class:active={nav2 == 'account'} on:click|preventDefault="{ () => { navigate('home/account')}}">My Account</li>
								{#if nav2 == 'search'}
									<li class="active" on:click|preventDefault="{ () => { navigate('home/search')}}">Search</li>
								{/if}
							</ul>
						</div>
					</div>
				{/if}

				{#if nav3}
					<div class="dd_wrapper">
						{#if nav2 == 'safety_manager'}
							{#if nav3 == 'modules'}
								<a href="/" on:click|preventDefault="{ () => { navigate('home/safety_manager/modules')}}">&nbsp;&nbsp;&nbsp;<b>></b>&nbsp;&nbsp;&nbsp;Modules</a>
							{:else if nav3 == 'dashboards'}
								<a href="/" on:click|preventDefault="{ () => { navigate('home/safety_manager/dashboards')}}">&nbsp;&nbsp;&nbsp;<b>></b>&nbsp;&nbsp;&nbsp;Dashboards</a>
							{:else if nav3 == 'reports'}
								<a href="/" on:click|preventDefault="{ () => { navigate('home/safety_manager/reports')}}">&nbsp;&nbsp;&nbsp;<b>></b>&nbsp;&nbsp;&nbsp;Reports</a>
							{:else if nav3 == 'my_tasks'}
								<a href="/" on:click|preventDefault="{ () => { navigate('home/safety_manager/my_tasks')}}">&nbsp;&nbsp;&nbsp;<b>></b>&nbsp;&nbsp;&nbsp;My Tasks</a>
							{:else if nav3 == 'groups'}
								<a href="/" on:click|preventDefault="{ () => { navigate('home/safety_manager/groups')}}">&nbsp;&nbsp;&nbsp;<b>></b>&nbsp;&nbsp;&nbsp;Groups</a>
							{/if}
							<div class="dd">
								<ul>
									<li class:active={nav3 == 'modules'} on:click|preventDefault="{ () => { navigate('home/safety_manager/modules')}}">Modules</li>
									<li class:active={nav3 == 'dashboards'} on:click|preventDefault="{ () => { navigate('home/safety_manager/dashboards')}}">Dashboards</li>
									<li class:active={nav3 == 'reports'} on:click|preventDefault="{ () => { navigate('home/safety_manager/reports')}}">Reports</li>
									<li class:active={nav3 == 'my_tasks'} on:click|preventDefault="{ () => { navigate('home/safety_manager/my_tasks')}}">My Tasks</li>
									<li class:active={nav3 == 'groups'} on:click|preventDefault="{ () => { navigate('home/safety_manager/groups')}}">Groups</li>
								</ul>
							</div>
						{:else if nav2 == 'account'}
							{#if nav3 == 'notifications'}
								<a href="/" on:click|preventDefault="{ () => { navigate('home/account/notifications')}}">&nbsp;&nbsp;&nbsp;<b>></b>&nbsp;&nbsp;&nbsp;Notifications</a>
							{:else if nav3 == 'preferences'}
								<a href="/" on:click|preventDefault="{ () => { navigate('home/account/preferences')}}">&nbsp;&nbsp;&nbsp;<b>></b>&nbsp;&nbsp;&nbsp;Preferences</a>
							{/if}
							<div class="dd">
								<ul>
									<li class:active={nav3 == 'notifications'} on:click|preventDefault="{ () => { navigate('home/account/notifications')}}">Notifications</li>
									<li class:active={nav3 == 'preferences'} on:click|preventDefault="{ () => { navigate('home/account/preferences')}}">Preferences</li>
								</ul>
							</div>
						{/if}
					</div>

				{/if}
				{#if nav4}
					<div class="dd_wrapper">
						{#if nav2 == 'safety_manager'}
							{#if nav3 == 'modules'}
								{#each safety_modules.filter( (m) => m.key == nav ) as module}
									<a href="/" on:click|preventDefault="{ () => { navigate(module.key)}}">&nbsp;&nbsp;&nbsp;<b>></b>&nbsp;&nbsp;&nbsp;{module.name}</a>
								{/each}
								<div class="dd">
									<ul>
										{#each safety_modules.sort((a, b) => a.index - b.index).filter( (mod) => { return mod.index >= 0}) as ehs_module}
											<li  class:active={nav == ehs_module.key} on:click|preventDefault="{ () => { navigate(ehs_module.key)}}">{ehs_module.name}</li>
										{/each}
										<li class="divider"></li>
										{#each safety_modules.filter( (mod) => { return mod.index < 0}) as ehs_module}
											<li  class:active={nav == ehs_module.key} on:click|preventDefault="{ () => { navigate(ehs_module.key)}}">{ehs_module.name}</li>
										{/each}
									</ul>
								</div>
							{/if}
						{/if}
						{#if nav2 == 'chemical_manager'}
							{#if nav3 == 'modules'}
								{#each chemical_modules.filter( (m) => m.key == nav ) as module}
									<a href="/" on:click|preventDefault="{ () => { navigate(module.key)}}">&nbsp;&nbsp;&nbsp;<b>></b>&nbsp;&nbsp;&nbsp;{module.name}</a>
								{/each}
								<div class="dd">
									<ul>
										{#each chemical_modules as module}
											<li  class:active={nav == module.key} on:click|preventDefault="{ () => { navigate(module.key)}}">{module.name}</li>
										{/each}
									</ul>
								</div>
							{/if}
						{/if}
					</div>
				{/if}
			</div> <!-- end breadcrumb -->

			<!--
				RHS menu expands as necessary when the search is clicked
				can overlap the breadcrumb on very small screens
			-->

			<div class="rhs_menu">
				<div class="search_wrapper" class:search_in="{is_searching}">
					<div class="search_icon_wrapper" on:click="{() => {is_searching = !is_searching}}">
						<Search32 />
					</div>
					{#if is_searching}
						<div in:fly="{{ x: 200, duration: 500 }}" out:fly="{{ x: 200, duration: 500 }}" style="display:inline-block">
							<input type="text" on:keydown="{search_key}" bind:value="{search_text}" placeholder="Search here" />
							<button on:click|preventDefault="{search}">Search</button>
						</div>
					{/if}
				</div>
				<div class="dd_wrapper">
					<div class:unread="{unread_notifications.length}" class="account_wrapper" data-count="{unread_notifications.length}">
						<User32/>
					</div>
					<div class="dd dd-right">
						<ul>
							<li class:active={nav == 'home/account/notifications'} on:click|preventDefault="{ () => { navigate('home/account/notifications')}}">{#if unread_notifications.length}New {/if}Notifications</li>
							<li class:active={nav == 'home/account/preferences'} on:click|preventDefault="{ () => { navigate('home/account/preferences')}}">Preferences</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="content">
		

		{#if !nav2}
			<h2>Home</h2>
			<!-- build menu -->
			<div class="home_row">
				<div class='home_panel'>
					<h4 on:click="{ () => { navigate('home/safety_manager')}}">Safety Manager</h4>
					<ul>
						<li on:click|preventDefault="{ () => { navigate('home/safety_manager/modules')}}">Modules</li>
						<li on:click|preventDefault="{ () => { navigate('home/safety_manager/dashboards')}}">Dashboards</li>
						<li on:click|preventDefault="{ () => { navigate('home/safety_manager/reports')}}">Reports</li>
						<li on:click|preventDefault="{ () => { navigate('home/safety_manager/my_tasks')}}">My Tasks</li>
						<li on:click|preventDefault="{ () => { navigate('home/safety_manager/groups')}}">Groups</li>
					</ul>
				</div>
				<div class='home_panel'>
					<h4 on:click="{ () => { navigate('home/chemical_manager')}}">Chemical Manager</h4>
					<ul>
						<li on:click|preventDefault="{ () => { navigate('home/chemical_manager/modules')}}">Modules</li>
						<li on:click|preventDefault="{ () => { navigate('home/chemical_manager/help')}}">Help</li>
					</ul>
				</div>
				<div class='home_panel'>
					<h4 on:click="{ () => { navigate('home/learning_manager')}}">Learning Manager</h4>
				</div>
				<div class='home_panel'>
					<h4 on:click="{ () => { navigate('home/account')}}">My Account</h4>
					<ul>
						<li on:click|preventDefault="{ () => { navigate('home/account/notifications')}}">Notifications</li>
						<li on:click|preventDefault="{ () => { navigate('home/account/preferences')}}">Preferences</li>
					</ul>
				</div>
			</div>

		{:else if nav2 == 'safety_manager'}
			{#if nav3 == 'modules'}
				{#if !nav4}
					<h2>Safety Manager</h2>

					

					<h4><Thumbnail_216/> Favourite Modules</h4>
					<div on:dragstart="{dstart}" style="text-align:center;min-height:100px;">
						{#each fav_safety_modules as item(item.id)}
							<div on:drop="{ddrop_fave}" on:dragover="{allowDrop}" on:dragenter="{denter}" on:dragleave="{dleave}" class="tile_shell" data-index="{item.index}" data-key="{item.key}" on:click="{ () => { navigate(item.key)}}" draggable="true">
								<div class="tile" data-col1="{item.col1}" data-col2="{item.col2}" >
									{#if item.carbon}
										<svelte:component this={item.carbon}/>
									{/if}
									<h5>{item.name}</h5>
								</div>
							</div>
						{/each}
					</div>
					<hr>
					<h4><Thumbnail_216/> Additional Modules</h4>
					<div on:dragstart="{dstart}" on:drop="{ddrop_other}" on:dragover="{allowDrop}" style="min-height:100px;">
						{#each other_safety_modules as item(item.id)}
							<div class="tile small" data-key="{item.key}" on:click="{ () => { navigate(item.key)}}" draggable="true">
								{#if item.carbon}
									<svelte:component this={item.carbon}/>
								{/if}
								<h5>{item.name}</h5>
							</div>
						{/each}
					</div>
					<!--
					<div use:dndzone="{{items: fav_safety_modules, dropTargetStyle: {outline: 'rgba(0, 0, 0, 1) solid 2px'}}}" on:consider="{consider}" on:finalize="{finalize_fave}">
						{#each fav_safety_modules as item(item.id)}
							<div class="tile" on:click="{ () => { navigate(item.key)}}">
								{#if item.icon}
									<img src="data:image{item.icon}" width="70" height="70">
								{/if}
								<h4>{item.name}</h4>
								
							</div>
						{/each}
					</div>
					<hr>
					<h4>Additional Modules</h4>
					<div use:dndzone="{{items: other_safety_modules}}" on:consider="{consider}" on:finalize="{finalize_other}">
						{#each other_safety_modules as item(item.id)}
							<div class="tile small" on:click="{ () => { navigate(item.key)}}">{item.name}</div>
						{/each}
					</div>
					-->
				{:else}
					
					{#each safety_modules.filter( (mod) => { return mod.key == nav}) as ehs_module}
						<h2>{ehs_module.name}</h2>
					{/each}
				{/if}

			{:else if nav3 == 'dashboards'}
				<h2>Safety Manager Dashboards</h2>
			{:else if nav3 == 'reports'}
				<h2>Safety Manager Reports</h2>
			{:else if nav3 == 'my_tasks'}
				<h2>Safety Manager Tasks</h2>
			{:else if nav3 == 'groups'}
				<h2>Safety Manager Groups</h2>
			{/if}
		{:else if nav2 == 'chemical_manager'}
			{#if nav3 == 'modules'}
				{#if !nav4}
					<h2>Chemical Manager</h2>
					<h4>Favourite Modules</h4>
					{#each chemical_modules.sort((a, b) => a.index - b.index).filter( (mod) => { return mod.index >= 0}) as ehs_module}
						<div class="tile" on:click="{ () => { navigate(ehs_module.key)}}">{ehs_module.name}</div>
					{/each}
					<hr>
					<h4>Additional Modules</h4>
					{#each chemical_modules.filter( (mod) => { return mod.index < 0}) as ehs_module}
						<div class="tile small" on:click="{ () => { navigate(ehs_module.key)}}">{ehs_module.name}</div>
					{/each}
				{:else}
					{#each chemical_modules.filter( (mod) => { return mod.key == nav}) as ehs_module}
						<h2>{ehs_module.name}</h2>
					{/each}
				{/if}
			{:else if nav == 'help'}
				<h2>Chemical Manager Help</h2>
			{/if}
		{:else if nav2 == 'learning_manager'}
			<h2>Learning Manager</h2>

		{:else if nav2 == 'account'}
			{#if !nav3}
				<h2>My Account</h2>
			{:else if nav3 == 'notifications'}
				<h2>My Account Notifications</h2>

				{#each notifications as n}
					<input type=checkbox bind:checked={n.read}> {n.title}
					<hr>
				{/each}
			{:else if nav3 == 'preferences'}
				<h2>My Account Preferences</h2>

				colour: <input bind:value="{brand_color}" type="text" /> {contrast_color}
			{/if}
		{:else if nav2 == 'search'}
			<h1>Searching for {search_text}...</h1>
		{/if}
	</div>
</div>

<div style="display:none">
	<!-- ugly hack to force certain classes to include -->
	<h1>hack</h1><h3>hack</h3>
	<div class="content"><div class="tile_shell tile_drag_onto"></div></div>
	<div class="header"><b data-carbon-icon="32"></b></div>
</div>

<style>
	h1, h2, h3, h4, h5 {
		font-weight:100;
	}
	.page {
		display:flex;
		flex-direction: column;
		flex-flow: column;
		height:100%;
	}
	.header {
		box-sizing:border-box;
		min-height:74px;
		position:relative;
		/*background: #0A81FF;
		background: linear-gradient(110deg, rgba(92,28,253,1) 0%, rgba(10,129,255,1) 50%);*/
		/*background: #0F1041;*/
		background: var(--brand_color);
		padding:15px 30px;
		transition: background-color 2s
	}
	.mark svg {
		vertical-align:middle;
		cursor:pointer;
	}
	.mark path {
		fill: none;
		stroke-width: 10px;
		stroke: var(--contrast_color);
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.breadcrumb {
		display:inline-block;
		padding-left:0px;
		line-height:44px;
	}
	.breadcrumb a {
		color: var(--contrast_color);
		text-decoration:none;
	}
	.breadcrumb > a {
		/* company name styled so it can be shrunk*/
		display:inline-block;
		transition:max-width 2s linear, padding 0.3s linear 2s;
		overflow: hidden;
		vertical-align: top;
		height: 44px;
		width:auto;
		padding-left:15px;
		max-width: 130px;
		white-space: nowrap;
	}

	.dd_wrapper {
		display:inline-block;
		position:relative;
	}
	.dd_wrapper b {
		display:inline-block;
		position:relative;
		transition: transform 0.3s ! important; 
		transition-timing-function: linear ! important;
	}
	.dd {
		display:block;
		position:absolute;
		top:44px;
		left:0px;
		width:200px;
		background: #FFF;
		border-top:0px solid var(--brand_color);
		border-bottom-left-radius: 5px;
		border-bottom-right-radius: 5px;
		box-shadow: 0 4px 5px rgb(0,0,0,0.2);
		max-height: 0;
		transition: all 0.15s ease-out;
		overflow: hidden;
		z-index: 1;
	}
	.dd ul {
		list-style: none;
		padding:0;
		margin:0;
	}
	.dd li {
		padding:0 15px;
	}
	.dd li:hover {
		background:rgba(0,0,0,0.1);
	}
	.dd li.active {
		background:rgba(0,0,0,0.15);
	}
	.dd li.divider {
		height:0;
		border-top:1px solid #e0e0e0;
	}
	.dd_wrapper:hover .dd, .dd_wrapper:active .dd {
		border-top-width:14px;
		max-height: 100vh;
		overflow: auto;
	}
	.dd_wrapper:hover b {
		 /*transform: rotate(90deg);*/
		 transform: rotate(45deg) translate(-1px, 19px);
	}

	.content {
		box-sizing:border-box;
		padding:30px;
		background:#F5F8FC;
		flex: 2;
		overflow:auto;
	}

	hr {
		border:none;
		border-top:1px solid #e0e0e0;
		margin:30px 0;
	}
	.content .tile_shell {
		padding:0px;
		width:110px;
		margin: 60px;
		display: inline-block;
		min-height: 100px;
		transition: all 0.3s; 
		transition-timing-function: linear;
		vertical-align: top;
		transform: scale(2); /* have to scale to hack the size of carbon icons which are limited to 32px... */
		
	}
	.content .tile {
		box-sizing:border-box;
		padding:10px;
		width:100px;
		margin: 5px;
		border-radius:2.5px;
		box-shadow: 0 4px 5px rgb(0,0,0,0.1);
		display: inline-block;
		min-height: 100px;
		text-align:center;
		transition: transform 0.3s; 
		transition-timing-function: linear;
		background:#fff;
		vertical-align: top;
		position:relative;
	}
	.content .tile h5{
		margin:0;
	}
	.content .tile_shell * {pointer-events: none;}

	.content .tile_shell:hover {
		transform: scale(2.1); 
	}
	.content .tile_shell:hover .tile {
		box-shadow: 0 4px 5px rgb(0,0,0,0.2);
		transform: rotate(0.3deg); 
	}
	.content .tile.small {
		margin: 10px;
		border-radius:5px;
		transform: scale(1);
	}
	.content .tile:before {
		content:'';
		display:block;
		background-color: #fff;
		position:absolute;
		left:50%;
		margin-left:-30px;
		top:10px;
		width:40px;
		height:40px;
		border-radius:20px;
		opacity:0.4;
		mix-blend-mode:multiply;
	}
	.content .tile:after {
		content:'';
		display:block;
		background-color: #fff;
		position:absolute;
		left:50%;
		margin-left:-10px;
		top:10px;
		width:40px;
		height:40px;
		border-radius:20px;
		opacity:0.4;
		z-index:0;
		mix-blend-mode:multiply;
	}

	.content .tile[data-col1=swatch1]:before { background-color:#7EFFEF !important}
	.content .tile[data-col2=swatch1]:after { background-color:#7EFFEF !important}
	.content .tile[data-col1=swatch2]:before { background-color:#FFB8B8 !important}
	.content .tile[data-col2=swatch2]:after { background-color:#FFB8B8 !important}
	.content .tile[data-col1=swatch3]:before { background-color:#0091FF !important}
	.content .tile[data-col2=swatch3]:after { background-color:#0091FF !important}
	.content .tile[data-col1=swatch4]:before { background-color:#E8FF58 !important}
	.content .tile[data-col2=swatch4]:after { background-color:#E8FF58 !important}
	.content .tile[data-col1=swatch5]:before { background-color:#F6C944 !important}
	.content .tile[data-col2=swatch5]:after { background-color:#F6C944 !important}
	.content .tile[data-col1=swatch6]:before { background-color:#FF58F8 !important}
	.content .tile[data-col2=swatch6]:after { background-color:#FF58F8 !important}
	.content .tile[data-col1=swatch7]:before { background-color:#6EDDFF !important}
	.content .tile[data-col2=swatch7]:after { background-color:#6EDDFF !important}
	.content .tile[data-col1=swatch8]:before { background-color:#58B381 !important}
	.content .tile[data-col2=swatch8]:after { background-color:#58B381 !important}
	.content .tile[data-col1=swatch9]:before { background-color:#FFF16E !important}
	.content .tile[data-col2=swatch9]:after { background-color:#FFF16E !important}
	.content .tile[data-col1=swatch10]:before { background-color:#724DDB !important}
	.content .tile[data-col2=swatch10]:after { background-color:#724DDB !important}

	.content .tile_shell.tile_drag_onto {
		padding-left:120px ! important;
	}
	.content .tile_shell.tile_drag_onto .tile {
		box-shadow: 0 4px 5px rgb(0,0,0,0.4);
	}

	.content .tile.small:hover {
		transform: scale(1.1) rotate(0.3deg); 
	}



	.home_row {
		display:flex;
		flex-direction: row;
		flex-flow: row;
	}
	.home_panel {
		flex:1 ;
		box-sizing:border-box;
		padding:10px;
		width:200px;
		margin: 10px;
		border-radius:5px;
		box-shadow: 0 4px 5px rgb(0,0,0,0.1);
		display: inline-block;
		min-height: 100px;
		background:#fff;
		vertical-align: top;
	}
	.home_panel li {
		list-style:none;
	}
	


	.rhs_menu {
		line-height: 44px;
		position: absolute;
		display: inline-block;
		text-align: right;
		top: 14px;
		paddng-left:50px;
		right: 30px;
		background: linear-gradient(90deg, transparent 0%, var(--brand_color) 10%);
	}

	.dd-right {
		right: 0;
		left: auto;
		text-align:left;
	}
	.search_wrapper {
		height:44px;
		margin-right:15px;
		display:inline-block;
		vertical-align:top;
	}
	.search_wrapper input{
		transition: all 1s; 
		vertical-align: top;
		padding: 5px 15px;
		border-radius: 4px;
		line-height: 32px;
		font-size: 15px;
		background:rgba(255,255,255,0.1);
		color:#fff;
		border:1px solid rgba(255,255,255,0.4);
		display:inline-block;
		outline:none ! important;
		width:300px;
	}
	::placeholder { /* Chrome, Firefox, Opera, Safari 10.1+ */
		color: var(--contrast_color);
		pacity: 0.8; /* Firefox */
	}
	.search_wrapper button{
		vertical-align: top;
		padding: 5px 15px;
		border-radius: 21px;
		line-height: 32px;
		font-size: 15px;
		background:#383A7C;
		color:#fff;
		border:none;
		display:inline-block;
	}
	.search_icon_wrapper {
		transition: all 0.3s; 
		transition-timing-function: linear;
		height:44px;
		width:44px;
		background:rgba(255,255,255,0.1);
		border-radius:22px;
		text-align:center;
		line-height: 64px;
		fill:#fff;
		vertical-align: top;
		display:inline-block;
		cursor:pointer;
	}
	.search_in .search_icon_wrapper {
		background:rgba(255,255,255,0);
		transform: scale(0.6);
	}


	.account_wrapper {
		height:44px;
		width:44px;
		background:rgba(255,255,255,0.1);
		border-radius:22px;
		text-align:center;
		line-height: 64px;
		fill:#fff;
		cursor:pointer;
	}

	.header [data-carbon-icon] {
		fill:#fff;
		position: absolute;
		left: 5px;
		top: 5px;
	}
	.unread:after {
		content: attr(data-count);
		display:block;
		color:#000;
		background:#f90;
		width:12px;
		height:12px;
		border-radius:6px;
		font-size:8px;
		line-height:10px;
		text-align:center;
		position:absolute;
		top:0;
		right:0;
		animation: pulse-animation 2s infinite;
	}

	@keyframes pulse-animation {
		0% {
			box-shadow: 0 0 0 0px rgba(255, 153, 0, 0.2);
		}
		100% {
			box-shadow: 0 0 0 10px rgba(255, 153, 0, 0);
		}
	}


</style>