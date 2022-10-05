<script>
	import { writable } from 'svelte/store';
	import { createEventDispatcher } from 'svelte';

	import MenuSettings from "./Frame_menusettings.svelte";
	import { config, app_data } from './Frame_menusettings.js';

    const dispatch = createEventDispatcher();

    function nav(module) {
		selected_menu_item = false;
		if(module.discover) {
			window.open(module.url, "_blank")
		} else {

			window.location.hash = '#' + module.url
			dispatch('nav', {
				text: module.url
			});
		}
	}

	//work out current app and module
	let app = 'platform';
	let module = false;
	
	export let selected_app;
	let selected_hover_item = false;
	let selected_menu_item = false; //settings|menu|notifications|my account

	let nav_item_holder;
	let apps_item_holder;
	let menu_view_bool = false;
	let menu_view_in = false;
	let menu_mask_in = false;
	let menu_view_rendered = false;
	let menu_view_section = 'nav';
	let menu_time = 200;
	let menu_hover_item = false;
	let selected_tennant = '';
	let changing_tennant = false;
	let extras_as_modules = false;
	let sort_key = 'default';

	//vars for filtering modules
	let filter_key = ''; 
	let filter_input;

	//vars for svg mask
	let svg_height = 100;
	let svg_width = 0;
	let svg_peak = 0;
	let svg_path = 'M100 100L100 0L0 50L0 40Z';
	
	//hacks for app settings
	let slices= {
		ehs: {
			basic: [0,5],
			multi: [0,10],
			admin: [0],
			changing_tennant: false
		},
		cm: {
			basic: [0,10],
			multi: [0,-3],
			admin: [0],
			changing_tennant: false
		},
		munio: {
			basic: [0,-1],
			multi: [0,-1],
			admin: [0],
			changing_tennant: false
		}
	}
	
	function sidebar_click(menu_item) {
		if($config.menu_hover) {
			//if hover mode set go straight to app
			nav(menu_item)
		} else {
			//selected_app = menu_item.key;
			//dispatch this
			dispatch('menu_change', {
				menu_item: menu_item
			});
		}
	}

	function sidebar_enter(m, menu_item, index) {
		menu_hover_item = menu_item;
		dispatch('menu_hover', {
			m: m,
			menu_item: menu_item,
			index: index
		});
		
	}


	


	

	$: {
		let s = svg_peak;
		let w = svg_width;
		svg_path = 'M100 100L100 0L0 '+(s-2)+'L0 '+(s+2)+'Z';
	}
	
	
	

	
	
	
	

</script>
	<div style='position:sticky;top:16px;margin-top:24px;'>
		<h4>Applications</h4>
		<div class='nav-item-holder' title="{($config.menu_hover ? 'Click to navigate to the Application' : '')}">
		
			{#each $config.apps as a, index}
				<a 
					href="#"
					title="{($config.menu_hover ? 'Click to navigate to the Application' : '')}"
					on:mouseenter={(m) => { sidebar_enter(m, $app_data[a], index); } } 
					style='position:relative;' 
					class='nav-item' 
					class:selected="{ selected_app == $app_data[a].key }" 
					class:menu_hover="{$config.menu_hover}"
					class:menu_hover_icon_show="{menu_hover_item.key == $app_data[a].key}"
					on:click|preventDefault="{ () => { sidebar_click($app_data[a]) }}">
					<div class="icon" style={"background-image:url('./images/svgs_clean/" + $app_data[a].icon + (selected_app == $app_data[a].key ? '':'bw')+ ".svg')"}></div>
					<b>{$app_data[a].name}</b>

					{#if $config.menu_hover_icon == 'bento' }
						<i class='menu_hover_icon i-switcher i-16'></i>
					{/if}
					{#if $config.menu_hover_icon == 'arrow' }
						<i class='menu_hover_icon i-arrow-right i-16'></i>
					{/if}
				</a>
			{/each}

			<svg 
				style="position:absolute;right:0;top:0;pointer-events:none"
				width="{svg_width}" 
				height="{svg_height}" 
				preserveAspectRatio="none"
				viewBox="0 0 100 100" 
				xmlns="http://www.w3.org/2000/svg">
				
				<path 
					title="{($config.menu_hover ? 'Click to navigate to the Application' : '')}" 
					d="{svg_path}" fill="{$config.svg_show ? 'rgba(123,97,255, 40%)' : 'transparent'}" 
					style="pointer-events:auto;cursor:pointer" 
					on:mouseleave="{ () => { svg_width = 0; }}" 
					on:click="{ () => { sidebar_click(menu_hover_item); }}"/>
			</svg>

		</div>
	</div>
				


<style>
	.nav-item-holder {
		display: flex;
		flex-direction: column;
    	flex-wrap: wrap;
	}
	.nav-item {
		/*max-width: 236px;*/
		width: 236px;
		min-height: 40px;
		border-radius:8px;
		margin-right:8px;
		margin-bottom:8px;
		padding:8px;
		transition: background-color 0.5s ease-out;
		background: rgba(26,25,25,0%);
		text-decoration: none;

		display:flex;
		flex-direction: row;
		align-items: center;
	}

	.nav-tabs h4 {
		margin: 0;
		line-height: 40px;
		margin-top: 16px;
		font-weight: normal;
	}


	@keyframes navi_wave {
		0% { transform:translateX(10px) }
		100% { transform:translateX(0px) }
	}
	
	@keyframes navi_grow {
		0% { transform: scale(0.7); }
		100% { transform: scale(1); }
	}
	@keyframes navi_growwave {
		0% { transform: scale(0.1) translateX(100px); }
		100% { transform: scale(1) translateX(0px); }
	}


	.nav-item:hover {
		background: rgba(26,25,25,5%);
		cursor:pointer;
	}
	.nav-item:hover .icon {
		filter: grayscale(0);
	}
	.nav-item.selected {
		background: rgba(26,25,25,5%)
	}
	.nav-item .icon {
		width: 24px;
		height:24px;
		aspect-ratio: 1;
		margin-right:8px;
		background-color: transparent;
		background-position: center center;
		background-repeat:no-repeat;
		background-size:cover;
		transition: all 0.2s linear;
		display: inline-block;
		vertical-align: bottom;
	}
	.nav-item b {
		display:inline-block;
		line-height:24px;
		font-size:16px;
		font-weight: normal;
		white-space:nowrap;
		text-overflow: ellipsis;
  		overflow: hidden;
		/*max-width:148px;*/
		flex:1;
	}
	.nav-item.selected b {
		font-weight: bold;
	}
	.nav-item .menu_hover_icon {
		display:none;
		opacity:0.5;
	}

	.nav-item.menu_hover_icon_show .menu_hover_icon  {
		display: block;
	}


	
	@media (max-width: 599px) {
		.nav-tabs {
			display: none;
		}

		.nav-item {
			width: 100%; 
		}
	}
</style>