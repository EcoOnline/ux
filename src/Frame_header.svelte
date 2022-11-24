<script>
	import { writable } from 'svelte/store';
	import { createEventDispatcher } from 'svelte';

	import MenuSettings from "./Frame_menusettings.svelte";
	import AppMenu from "./Frame_appmenu.svelte";
	import { config, app_data, slices, favourites } from './Frame_menusettings.js';
    import { children } from 'svelte/internal';

    const dispatch = createEventDispatcher();

    function nav(module) {
		selected_menu_item = false;
		if(module.discover) {
			window.open(module.url, "_blank")
		} else {
			window.location.hash = '#' + module.url;
	

			dispatch('nav', {
				text: module.url
			});
		}
	}

	//work out current app and module
	let app = 'platform';
	let module = false;
	
	let selected_app = false;
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
	let menu_hover = false;
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
	
	

	function set_app_module() {
		let h = window.location.hash.substring(1);
		let h_arr = h.split('/');
		app = h_arr[0];
		if(h_arr[1]) {
			module = h_arr[1];
		} else {
			module = false;
		}
		selected_app = app;
	}
	set_app_module();


	function filter_mods(temp) {
		if(filter_key !== '') {
			temp = temp.filter( (m) => {
				return m.name.toLowerCase().includes(filter_key.toLowerCase())
			});
		}
		return temp;
	}
	function sort_mods(amod,bmod) {
		if(sort_key == 'default') {
			return 1;
		} else {
			if (amod.name < bmod.name) {
				return -1;
			}
			if (amod.name > bmod.name) {
				return 1;
			}
			return 0;
		}
	}
	function user_slicer(temp, a) {
		let ul = $config.user_level;
		let slice_arr = ($slices[a] ? ($slices[a][ul] ? $slices[a][ul] : null) : null);


		if(slice_arr) {
			temp = temp.slice(slice_arr[0], (typeof slice_arr[1] !== 'undefined' ? slice_arr[1] : temp.length) );
		}
		return temp;
	}
	function fake_tennant_change(a) {
		$slices[a].changing_tennant = true;
		const min = 2000;
		const max = 5000;
		let delay =  Math.floor(Math.random() * (max - min) + min);
		setTimeout( () => { 
			$slices[a].changing_tennant = false; 
		}, delay)
	}

	function menu_change_handler(event){

		console.log('header menu_change');
		if($config.menu_hover) {
			//if hover mode set go straight to app
			nav(event.detail.menu_item)
		} else {
			selected_app = event.detail.menu_item.key;
		}
	}

	function menu_hover_handler(event){
		console.log('header menu_hover');
		sidebar_enter(event.detail.m, event.detail.menu_item, event.detail.index);

		
	}
	function sidebar_enter(m, menu_item, index) {
		if($config.menu_hover) {
			selected_app = menu_item.key;
			menu_hover_item = menu_item;

			console.warn('sidebar_enter')
			setTimeout(() => {

				let apps_height = ($config.apps.length+1)*48;
				svg_height = Math.max(nav_item_holder.clientHeight, apps_height);
				let apps_width = apps_item_holder.clientWidth;
				svg_width = apps_width - m.layerX + 16;

				let factor =  apps_height / svg_height ;
				let pct = (index+1.25)/($config.apps.length+1);
				svg_peak = pct*100*factor;
				//svg_peak = pct * 48 * factor
			}, 30)
			

		}
	}

	function logout() {
		let c = $config;
		let btoa_str = btoa(JSON.stringify(c));

		let params = new URLSearchParams(document.location.search);
		let menu = params.get("menu");
		let origin = params.get("origin");

		window.location.href = window.location.protocol + '//' +
		window.location.host +
		window.location.pathname + '?' +
		(origin ? 'origin=' + origin : '') + 
		(menu ? '&menu=' + menu : '') +
		'&ran=' + Math.random()
	}


	


	
	
	


	

	$: {
		let s = svg_peak;
		let w = svg_width;
		svg_path = 'M100 100L100 0L0 '+(s-2)+'L0 '+(s+2)+'Z';
	}
	$: {
		let mt = config.multi_tennant;
		$config.apps.forEach( (a) => {
			$app_data[a].show_tennants = $config.multi_tennant;
		})
	}
	$: {
		let ul = $config.user_level;
		$config.apps.forEach( (a) => {
			$app_data[a].show_tennants = $config.multi_tennant;
		})

		
		$config.apps.forEach( (a) => {
			let temp = [...$app_data[a].modules];
			//remove apps from user type
			temp = user_slicer(temp, a);
			//sort apps
			temp = temp.sort(sort_mods);
			//filter
			temp = filter_mods(temp);

			$app_data[a].modules_to_paint = [...temp];//trigger repaint
		})
	}
	$: {
		let trigger = selected_menu_item;
		if(menu_view_rendered) {
			if(trigger) {
				menu_view_bool = true;
				menu_view_section = trigger;

				setTimeout(() => {
					menu_mask_in = true;
				}, menu_time/2);
				setTimeout(() => {
					menu_view_in = true;
				}, menu_time);
			} else {
				menu_view_in = false;
				setTimeout(() => {
					menu_mask_in = false;
				}, menu_time/2);
				setTimeout(() => {
					menu_view_bool = false;
					menu_view_section = false;
				}, menu_time);

			}
		}
		menu_view_rendered = true;
		
	}
	$:{
		let trigger = sort_key;

		$config.apps.forEach( (a) => {
			let temp = [...$app_data[a].modules];
			//remove apps from user type
			temp = user_slicer(temp, a);
			//sort apps
			temp = temp.sort(sort_mods);
			//filter
			temp = filter_mods(temp);

			$app_data[a].modules_to_paint = [...temp];//trigger repaint
		})
	}
	$:{
		let trigger = filter_key;
		
		$config.apps.forEach( (a) => {
			
			let temp = [...$app_data[a].modules];
			//remove apps from user type
			temp = user_slicer(temp, a);
			//sort apps
			temp = temp.sort(sort_mods);
			//filter
			temp = filter_mods(temp);

			$app_data[a].modules_to_paint = [...temp];//trigger repaint
		})
	}
	

	
	function focusSearchAndOpenKeyboard() {
		setTimeout(function() {
			var __tempEl__ = document.createElement('input');
			__tempEl__.style.position = 'absolute';
			__tempEl__.style.top = (filter_input.offsetTop + 7) + 'px';
			__tempEl__.style.left = filter_input.offsetLeft + 'px';
			__tempEl__.style.height = 0;
			__tempEl__.style.opacity = 0;
			document.body.appendChild(__tempEl__);
			__tempEl__.focus();

			// The keyboard is open. Now do a delayed focus on the target element
			setTimeout(function() {
				filter_input.focus();
				filter_input.click();
			// Remove the temp element
			document.body.removeChild(__tempEl__);
			}, 100);
		}, 100);
	}

	
	

</script>

<svelte:window on:hashchange={set_app_module}/>
<nav>
	<div class="frame">

		<svg id="svglockup" width="128" height="33" viewBox="0 0 128 33" fill="none" xmlns="http://www.w3.org/2000/svg">

			<path id="svglogo" d="M15.91 11.1327L16.5 9.81266C16.94 8.84266 17.91 8.22266 18.97 8.22266C19.69 8.22266 20.37 8.50266 20.88 9.01266L21.58 9.71266C20.34 10.3927 19.5 11.7127 19.5 13.2227V15.1027C19.5 18.4627 17.11 21.3527 13.81 21.9827L6.91 23.3027C6.56 23.3727 6.28 23.6127 6.16 23.9427C6.04 24.2727 6.1 24.6427 6.32 24.9127C10.19 29.7027 16.01 31.1427 16.26 31.2027C16.34 31.2127 16.42 31.2227 16.5 31.2227C16.58 31.2227 16.66 31.2127 16.73 31.1927C16.87 31.1627 30 27.8627 30 15.2227V3.22266C30 2.12266 29.1 1.22266 28 1.22266H5C3.9 1.22266 3 2.12266 3 3.22266V18.4827L5 16.4827V3.22266H28V15.2227C28 25.5227 18.22 28.7127 16.5 29.1827C15.56 28.9127 11.96 27.7327 9.05 24.9227L14.19 23.9427C18.43 23.1327 21.5 19.4127 21.5 15.1027V13.2227C21.5 12.1227 22.4 11.2227 23.5 11.2227H24.35C24.93 11.2227 25.22 10.5227 24.81 10.1127L22.3 7.60266C21.41 6.71266 20.23 6.22266 18.97 6.22266C17.12 6.22266 15.44 7.31266 14.68 8.99266L14.16 10.1427L0 24.3127V27.1427L15.71 11.4327C15.8 11.3427 15.86 11.2427 15.91 11.1327Z" fill="#1A1919"/>
			<path d="M39 22.2227V8.22266H47.96V10.2327H41.26V14.1227H47.34V16.1327H41.26V20.2227H47.96V22.2227H39Z" fill="#1A1919"/>
			<path d="M54.3902 22.4627C53.6402 22.4627 52.9702 22.3327 52.3802 22.0827C51.7902 21.8327 51.3002 21.4627 50.9002 20.9927C50.5002 20.5227 50.1902 19.9427 49.9802 19.2727C49.7702 18.6027 49.6602 17.8427 49.6602 17.0127C49.6602 16.1827 49.7702 15.4327 49.9802 14.7527C50.1902 14.0827 50.5002 13.5027 50.9002 13.0327C51.3002 12.5627 51.8002 12.1927 52.3802 11.9427C52.9702 11.6927 53.6402 11.5627 54.3902 11.5627C55.4302 11.5627 56.2902 11.7927 56.9602 12.2627C57.6302 12.7327 58.1202 13.3527 58.4202 14.1327L56.6202 14.9727C56.4702 14.4927 56.2202 14.1027 55.8502 13.8227C55.4802 13.5327 55.0002 13.3927 54.4002 13.3927C53.6002 13.3927 52.9902 13.6427 52.5802 14.1427C52.1702 14.6427 51.9702 15.2927 51.9702 16.0927V17.9527C51.9702 18.7527 52.1702 19.4027 52.5802 19.9027C52.9902 20.4027 53.5902 20.6527 54.4002 20.6527C55.0402 20.6527 55.5502 20.4927 55.9302 20.1827C56.3102 19.8727 56.6102 19.4527 56.8402 18.9327L58.5002 19.8127C58.1502 20.6727 57.6302 21.3327 56.9402 21.7927C56.2402 22.2327 55.3902 22.4627 54.3902 22.4627Z" fill="#1A1919"/>
			<path d="M64.5603 22.4627C63.8403 22.4627 63.1803 22.3327 62.5903 22.0827C61.9903 21.8327 61.4903 21.4627 61.0803 20.9927C60.6603 20.5227 60.3403 19.9427 60.1203 19.2727C59.8903 18.6027 59.7803 17.8427 59.7803 17.0127C59.7803 16.1827 59.8903 15.4327 60.1203 14.7527C60.3503 14.0827 60.6703 13.5027 61.0803 13.0327C61.4903 12.5627 62.0003 12.1927 62.5903 11.9427C63.1803 11.6927 63.8403 11.5627 64.5603 11.5627C65.2803 11.5627 65.9403 11.6927 66.5403 11.9427C67.1303 12.1927 67.6403 12.5627 68.0503 13.0327C68.4603 13.5027 68.7903 14.0827 69.0103 14.7527C69.2403 15.4327 69.3503 16.1827 69.3503 17.0127C69.3503 17.8427 69.2403 18.5927 69.0103 19.2727C68.7803 19.9527 68.4603 20.5227 68.0503 20.9927C67.6403 21.4627 67.1303 21.8327 66.5403 22.0827C65.9403 22.3327 65.2803 22.4627 64.5603 22.4627ZM64.5603 20.6327C65.3103 20.6327 65.9103 20.4027 66.3703 19.9427C66.8203 19.4827 67.0503 18.7927 67.0503 17.8827V16.1227C67.0503 15.2027 66.8203 14.5227 66.3703 14.0627C65.9103 13.6027 65.3103 13.3727 64.5603 13.3727C63.8103 13.3727 63.2103 13.6027 62.7603 14.0627C62.3103 14.5227 62.0803 15.2127 62.0803 16.1227V17.8827C62.0803 18.8027 62.3103 19.4827 62.7603 19.9427C63.2103 20.4027 63.8103 20.6327 64.5603 20.6327Z" fill="#1A1919"/>
			<path d="M77.54 22.4627C76.63 22.4627 75.8 22.3027 75.06 21.9927C74.32 21.6827 73.68 21.2227 73.15 20.6127C72.62 20.0027 72.21 19.2527 71.93 18.3427C71.64 17.4427 71.5 16.4027 71.5 15.2227C71.5 14.0427 71.64 13.0027 71.93 12.1027C72.22 11.2027 72.62 10.4427 73.15 9.83267C73.68 9.22267 74.31 8.76267 75.06 8.45267C75.8 8.14267 76.63 7.98267 77.54 7.98267C78.45 7.98267 79.27 8.14267 80.02 8.45267C80.76 8.76267 81.4 9.23267 81.93 9.83267C82.46 10.4427 82.87 11.1927 83.15 12.1027C83.44 13.0027 83.58 14.0427 83.58 15.2227C83.58 16.4027 83.44 17.4427 83.15 18.3427C82.86 19.2427 82.45 20.0027 81.93 20.6127C81.4 21.2227 80.77 21.6827 80.02 21.9927C79.27 22.3027 78.45 22.4627 77.54 22.4627ZM77.54 20.4527C78.07 20.4527 78.57 20.3627 79.01 20.1727C79.46 19.9827 79.84 19.7127 80.15 19.3527C80.46 18.9927 80.71 18.5627 80.88 18.0527C81.05 17.5427 81.14 16.9627 81.14 16.3227V14.1127C81.14 13.4727 81.05 12.8927 80.88 12.3827C80.71 11.8727 80.46 11.4427 80.15 11.0827C79.84 10.7227 79.45 10.4527 79.01 10.2627C78.56 10.0727 78.07 9.98267 77.54 9.98267C76.99 9.98267 76.5 10.0727 76.06 10.2627C75.62 10.4527 75.24 10.7227 74.93 11.0827C74.62 11.4427 74.37 11.8727 74.2 12.3827C74.03 12.8927 73.94 13.4727 73.94 14.1127V16.3227C73.94 16.9627 74.03 17.5427 74.2 18.0527C74.37 18.5627 74.62 18.9927 74.93 19.3527C75.24 19.7127 75.62 19.9827 76.06 20.1727C76.49 20.3627 76.99 20.4527 77.54 20.4527Z" fill="#1A1919"/>
			<path d="M85.8496 22.2227V11.7927H88.0396V13.5227H88.1396C88.3696 12.9627 88.7096 12.4927 89.1696 12.1227C89.6296 11.7527 90.2596 11.5627 91.0596 11.5627C92.1296 11.5627 92.9596 11.9127 93.5596 12.6127C94.1496 13.3127 94.4496 14.3127 94.4496 15.6127V22.2227H92.2596V15.8827C92.2596 14.2527 91.5996 13.4327 90.2896 13.4327C90.0096 13.4327 89.7296 13.4727 89.4596 13.5427C89.1896 13.6127 88.9396 13.7227 88.7296 13.8727C88.5196 14.0227 88.3496 14.2027 88.2196 14.4327C88.0896 14.6627 88.0296 14.9227 88.0296 15.2327V22.2227H85.8496Z" fill="#1A1919"/>
			<path d="M99.4602 22.2228C98.7102 22.2228 98.1502 22.0328 97.7902 21.6528C97.4202 21.2728 97.2402 20.7428 97.2402 20.0628V7.38281H99.4302V20.4328H100.87V22.2228H99.4602Z" fill="#1A1919"/>
			<path d="M103.81 9.93273C103.36 9.93273 103.02 9.82273 102.82 9.61273C102.61 9.40273 102.51 9.12273 102.51 8.79273V8.44273C102.51 8.11273 102.61 7.83273 102.82 7.62273C103.03 7.41273 103.36 7.30273 103.81 7.30273C104.26 7.30273 104.59 7.41273 104.79 7.62273C104.99 7.83273 105.09 8.11273 105.09 8.44273V8.78273C105.09 9.11273 104.99 9.39273 104.79 9.60273C104.59 9.82273 104.27 9.93273 103.81 9.93273ZM102.71 11.7927H104.9V22.2227H102.71V11.7927Z" fill="#1A1919"/>
			<path d="M107.76 22.2227V11.7927H109.95V13.5227H110.05C110.28 12.9627 110.62 12.4927 111.08 12.1227C111.54 11.7527 112.17 11.5627 112.97 11.5627C114.04 11.5627 114.87 11.9127 115.47 12.6127C116.06 13.3127 116.36 14.3127 116.36 15.6127V22.2227H114.17V15.8827C114.17 14.2527 113.51 13.4327 112.2 13.4327C111.92 13.4327 111.64 13.4727 111.37 13.5427C111.1 13.6127 110.85 13.7227 110.64 13.8727C110.43 14.0227 110.26 14.2027 110.13 14.4327C110 14.6627 109.94 14.9227 109.94 15.2327V22.2227H107.76Z" fill="#1A1919"/>
			<path d="M123.37 22.4627C122.62 22.4627 121.95 22.3327 121.36 22.0827C120.77 21.8327 120.27 21.4627 119.86 20.9927C119.45 20.5227 119.13 19.9427 118.91 19.2727C118.69 18.6027 118.58 17.8427 118.58 17.0127C118.58 16.1827 118.69 15.4327 118.91 14.7527C119.13 14.0827 119.45 13.5027 119.86 13.0327C120.27 12.5627 120.78 12.1927 121.36 11.9427C121.95 11.6927 122.62 11.5627 123.37 11.5627C124.13 11.5627 124.8 11.6927 125.39 11.9627C125.97 12.2327 126.46 12.6027 126.84 13.0727C127.22 13.5427 127.52 14.1027 127.71 14.7227C127.9 15.3527 128 16.0227 128 16.7527V17.5727H120.84V17.9127C120.84 18.7127 121.08 19.3627 121.55 19.8727C122.02 20.3827 122.7 20.6427 123.59 20.6427C124.23 20.6427 124.77 20.5027 125.21 20.2227C125.65 19.9427 126.02 19.5627 126.33 19.0827L127.61 20.3527C127.22 20.9927 126.66 21.5127 125.93 21.8927C125.2 22.2727 124.34 22.4627 123.37 22.4627ZM123.37 13.2527C123 13.2527 122.65 13.3227 122.34 13.4527C122.03 13.5827 121.76 13.7727 121.54 14.0127C121.32 14.2527 121.15 14.5427 121.03 14.8727C120.91 15.2027 120.85 15.5727 120.85 15.9727V16.1127H125.7V15.9127C125.7 15.1127 125.49 14.4627 125.08 13.9827C124.66 13.5027 124.09 13.2527 123.37 13.2527Z" fill="#1A1919"/>
		</svg>
		
		<div class="search-bar">
			<i class="i-search i-20"></i>
			<input type="text" placeholder="Type a keyword to begin your search"/>
		</div>

		<div class="menu-icons text-right">
			<span on:click='{ () => {selected_menu_item =  selected_menu_item == 'menu_settings' ? false : 'menu_settings'}}' class:selected="{selected_menu_item == 'menu_settings'}" class="menu-icon" style="opacity:0.05"><i class="i-administration i-24"></i></span>
			{#if window.location.href.indexOf('help=1') >= 0}
				<span on:click='{ () => alert('Help succeeded.')}' class="menu-icon"><i class="i-help i-24"></i></span>
			{/if}
			<span on:click='{ () => {selected_menu_item =  selected_menu_item == 'notification' ? false : 'notification'}}' class:selected="{selected_menu_item == 'notification'}" class="menu-icon"><i class="i-notification i-24"></i></span>
			<span on:click='{ () => {selected_menu_item =  selected_menu_item == 'user' ? false : 'user'}}' class:selected="{selected_menu_item == 'user'}" class="menu-icon"><i class="i-user-avatar i-24"></i></span>
			<span on:click='{ () => {
				if(selected_menu_item == 'nav') {
					selected_menu_item = false;
				} else {
					selected_menu_item = 'menu_settings';
					setTimeout(()=>{
						selected_menu_item = 'nav';
					}, 30)
				}
			}}' class:selected="{selected_menu_item == 'nav'}" class="menu-icon"><i class="i-menu i-24"></i></span>
		</div>
	</div>
</nav>

{#if menu_view_bool}
<div class="main-menu"  >
	<div class="mask" on:click='{ () => {selected_menu_item =  false}}'
		class:in="{menu_mask_in}" ></div>
	
	<div class="frame">

		<div class="dd" 
			class:in="{menu_view_in}" 
			class:anim_dd_grow={$config.anim_dd_grow}
			class:anim_dd_opacity={$config.anim_dd_opacity}
			class:anim_navi_grow={$config.anim_navi_grow}
			class:anim_navi_wave={$config.anim_navi_wave}>


			<div class='action-holder'>


				{#if menu_view_section == 'nav'}
					{#if $config.filter_view}
						<div class='action-item filter-view' on:click="{ () => { if($config.action_dd == 'filter_view') { $config.action_dd = false; } else { $config.action_dd = 'filter_view';focusSearchAndOpenKeyboard()} }}">
							<i class="i-search i-24"></i><span>Search</span>
							{#if $config.action_dd == 'filter_view'}
								<input type="text" bind:value="{filter_key}" bind:this="{filter_input}" on:blur="{ () => { $config.action_dd = false}}">
							{/if}
						</div>
					{/if}
					
					{#if $config.sort_view}
						<div class='action-item sort-view' on:click="{ () => { $config.action_dd = $config.action_dd == 'sort_view' ? false : 'sort_view'}}">
							<i class="i-orderby i-24"></i><span>Order by</span><i class="i-chevron-down i-16"></i>
							{#if $config.action_dd == 'sort_view'}
								<ul class='action-dd'>
									<li class:selected="{sort_key == 'default'}" on:click|preventDefault="{ () => { sort_key = 'default';  }}">Default</li>
									<li class:selected="{sort_key == 'alphabetical'}"  on:click|preventDefault="{ () => { sort_key = 'alphabetical';  }}">Alphabetical</li>
								</ul>
							{/if}
						</div>
					{/if}
					{#if $config.toggle_view && $config.apps.length > 1}
						<div class='action-item view-mode' on:click={ () => { $config.view_mode = $config.view_mode == 'tabbed' ? 'single':'tabbed' }}><i class="i-24" class:i-page-tabs="{$config.view_mode == 'single'}" class:i-page-single="{$config.view_mode == 'tabbed'}"></i><span>{$config.view_mode == 'single' ? 'View tabs' : 'View single page'}</span></div>
					{/if}
				{/if}

				<i class="action-item i-close i-32" on:click='{ () => {selected_menu_item =  false}}'></i>
			</div>


			{#if menu_view_section == 'menu_settings'}
				<h3>Menu Settings (for testingonly)</h3>

				
				<MenuSettings ></MenuSettings>	

			{/if}
			{#if menu_view_section == 'notification'}
				<h3>Notifications</h3>
				<p>Won't be changed until they're ready for incorporation into home page</p>
			{/if}
			{#if menu_view_section == 'user'}
				<h3>User Settings</h3>
				<p>Won't be changed until they're ready for incorporation into main menu</p>
				<div on:click="{logout}" class="btn btn-secondary">Log Out</div>
			{/if}
			{#if menu_view_section == 'nav'}
				
				<div class='nav-row' class:tabbed={$config.view_mode == 'tabbed'} class:single={$config.view_mode == 'single'}>
					{#if $config.view_mode == 'tabbed' && $config.apps.length > 1}
						<div class='nav-tabs-wrapper'>
						
							<div class='nav-tabs' bind:this={apps_item_holder}>
								<AppMenu {selected_app} {svg_peak} {svg_width} {svg_height} {svg_path} on:menu_change={menu_change_handler} on:menu_hover={menu_hover_handler}></AppMenu>
							</div>
						</div>
					{/if}
					<div class='nav-content'>


						
						{#each $config.apps as a}
							
							<h2 class:hide_headers={$config.hide_headers} class:selected="{ selected_app == $app_data[a].key }" >
								<div class="icon" style={"background-image:url('./images/svgs_clean/" + $app_data[a].icon + ($app_data[a].key == selected_app ? '' : 'bw') + ".svg')"}></div>
								
								<span>{$app_data[a].name}</span>
								{#if $config.apps.length > 1}
									<div class="collapser" on:click="{ () => { selected_app = selected_app == $app_data[a].key ? false : $app_data[a].key }}">
										<i class="i-chevron-down i-24" class:i-chevron-up="{ selected_app == $app_data[a].key }" ></i>
									</div>
								{/if}
							</h2>
							
							{#if ($app_data[a].key == selected_app) || $config.view_mode == 'single'}
								<div class='nav-page' bind:this={nav_item_holder}>
								

									{#if $app_data[a].has_ecoid}

										{#if ($app_data[a].has_modules && $app_data[a].modules_to_paint.length) || !$app_data[a].has_modules}
											{#if !$config.menu_hover}
												{#if a == 'home'}
													<span class='hub-link btn btn-secondary' class:hub-link-left="{$config.hide_headers}" on:click|preventDefault="{ () => {nav($app_data[a]); }}">Go to EcoOnline Home</span>
												{:else}
													<span class='hub-link btn btn-secondary' class:hub-link-left="{$config.hide_headers}" on:click|preventDefault="{ () => {nav($app_data[a]); }}">Go to {($config.hide_headers ? $app_data[a].name : 'Product')} Hub</span>
												{/if}
											{/if}
										{/if}
										{#if $app_data[a].show_tennants && $app_data[a].tennants && $app_data[a].tennants.length}
											<!-- svelte-ignore a11y-no-onchange -->
											<select bind:value="{$app_data[a].selected_tennant}" class='tennant-select btn btn-secondary' on:change="{()=> { fake_tennant_change(a); }}">
												{#each $app_data[a].tennants as tennant}
													<option>{tennant.name}</option>
													{#if tennant.children}
														<!-- only going one layer deep for demo - needs to recur -->
														{#each tennant.children as tc} 
															<option value='{tc.name}'> - {tc.name}</option>
														{/each}
													{/if}
												{/each}
											</select>
										{/if}
										{#if $slices[a] && $slices[a].changing_tennant}
											<div style='text-align:center'>
												<div class='changing-tennant'>
													<div class="icon" style={"background-image:url('./images/svgs_clean/loading.svg')"}></div>
													Loading modules for {$app_data[a].selected_tennant}...
												</div>
											</div>
										{:else}
											{#if $app_data[a].has_modules}
												{#if a == 'home' && $favourites.length}
													<h4>Favourites</h4>
													<div class='nav-item-holder' class:limited={$favourites.length < 3}>
														{#each $favourites as m, i}
															<div class='nav-item' style="animation-delay:{i*0.02+0.3}s" class:selected="{ window.location.hash == '#' + m.url }" on:click|preventDefault="{ () => {nav(m); }}">
																<div class="icon" style={"background-image:url('./images/svgs_clean/" + m.icon + ".svg')"}></div>
																<b>
																	{m.name}
																	{#if m.tip}
																		<span class='tip'>{m.tip}</span>
																	{/if}
																</b>
															</div>
														{/each}
													</div>
												{/if}
												<h4>Shortcuts</h4>
												<div class='nav-item-holder' class:limited={$app_data[a].modules_to_paint.length < 3}>
													{#each $app_data[a].modules_to_paint as m, i}
														<div class='nav-item' style="animation-delay:{i*0.02+0.3}s" class:selected="{ window.location.hash == '#' + m.url }" on:click|preventDefault="{ () => {nav(m); }}">
															<div class="icon" style={"background-image:url('./images/svgs_clean/" + m.icon + ".svg')"}></div>
															<b>
																{m.name}
																{#if m.tip}
																	<span class='tip'>{m.tip}</span>
																{/if}
															</b>
															{#if $config.menu_upsell}
																<!--{#if m.recent}
																	<span class='badge badge-new'>New</span>
																{/if}
																
																{#if m.updated}
																	<span class='badge badge-updated'>Updated</span>
																{/if}
																-->
																{#if m.discover}
																	<span class='badge badge-discover'>Discover</span>
																{/if}

															{/if}
														</div>
													{:else}
														{#if filter_key !== ''}
															<p class='exception exception-filter'>There are no shortcuts with this search</p>
														{:else}
															<!-- App has modules but you dont have access to them -->
															<div class='exception exception-permissions'>
																<h3>Access</h3>
																<p>
																	This Application has been enabled for your organisation but your roles have not been set yet.<br>
																	Please talk to your company administrator.
																</p>
															</div>
														{/if}
													{/each}
												</div>
											{:else}
												<!-- App doesnt have modules -->
												<div class='nav-item-holder limited'>

													<!--
													<div class='nav-item'>
														<div class="icon" style={"background-image:url('./images/svgs_clean/" + $app_data[a].icon + ".svg')"}></div>
														<b>
															{$app_data[a].name}
															<span class='tip'>{$app_data[a].tip}</span>
														</b>
													</div>
													-->
													<div class='exception exception-nomodules'>
														{#if $app_data[a].tip}
															<p>{$app_data[a].tip}</p>
														{/if}
													</div>
												</div>
											{/if}
										
										{/if}
									{:else}
										<div class='nav-item-holder limited'>
											<div class='exception'>
												<h3>Access</h3>
												<p>We’ve added <i>{$app_data[a].name}</i> to the exciting suite of EcoOnline products. If you’re an existing client of this product you can access it here or learn more about what it can do for your company.</p>
												{#if $app_data[a].external_login}
													<a href='{$app_data[a].external_login}' target='_blank' class='btn'>Login</a>
												{/if}
												{#if $app_data[a].external_marketing}
													<a href='{$app_data[a].external_marketing}' target='_blank' class='btn btn-secondary'>Learn More</a>
												{/if}
											</div>
										</div>
									{/if}

								</div>
							{/if}

						{/each}
					</div>
				</div>


			{/if}
		</div>
	</div>
</div>
{/if}


<style>
	nav {
		padding: 0 16px;
		width:100%;
		text-align: center;
		overflow-y: scroll;
		height: var(--navH);
		background:#fff;
		position: absolute;
		top:0;
		z-index: 2999;
		box-shadow: 0 0 16px var(--eo-surface-background);
	}
	#svglogo {
		/*transition: d 0.2s linear;*/
	}

	#svglockup:hover #svglogo {
		animation: bob 3s linear infinite;
		/*d: path("M15.91 12.1327L16.5 10.8127C16.94 9.84266 17.91 9.22266 18.97 9.22266C19.69 9.22266 20.37 9.50266 20.88 10.0127L21.58 10.7127C20.34 11.3927 19.5 12.7127 19.5 14.2227V16.1027C19.5 19.4627 17.11 22.3527 13.81 22.9827L6.91 23.3027C6.56 23.3727 6.28 23.6127 6.16 23.9427C6.04 24.2727 6.1 24.6427 6.32 24.9127C10.19 29.7027 16.01 31.1427 16.26 31.2027C16.34 31.2127 16.42 31.2227 16.5 31.2227C16.58 31.2227 16.66 31.2127 16.73 31.1927C16.87 31.1627 30 27.8627 30 15.2227V3.22266C30 2.12266 29.1 1.22266 28 1.22266H5C3.9 1.22266 3 2.12266 3 3.22266V18.4827L5 16.4827V3.22266H28V15.2227C28 25.5227 18.22 28.7127 16.5 29.1827C15.56 28.9127 11.96 27.7327 9.05 24.9227L14.19 24.9427C18.43 24.1327 21.5 20.4127 21.5 16.1027V14.2227C21.5 13.1227 22.4 12.2227 23.5 12.2227H24.35C24.93 12.2227 25.22 11.5227 24.81 11.1127L22.3 8.60266C21.41 7.71266 20.23 7.22266 18.97 7.22266C17.12 7.22266 15.44 8.31266 14.68 9.99266L14.16 11.1427L0 24.3127V27.1427L15.71 12.4327C15.8 12.3427 15.86 12.2427 15.91 12.1327Z");*/
	}
	@keyframes bob {
		0% { d: path("M15.91 11.1327L16.5 9.81266C16.94 8.84266 17.91 8.22266 18.97 8.22266C19.69 8.22266 20.37 8.50266 20.88 9.01266L21.58 9.71266C20.34 10.3927 19.5 11.7127 19.5 13.2227V15.1027C19.5 18.4627 17.11 21.3527 13.81 21.9827L6.91 23.3027C6.56 23.3727 6.28 23.6127 6.16 23.9427C6.04 24.2727 6.1 24.6427 6.32 24.9127C10.19 29.7027 16.01 31.1427 16.26 31.2027C16.34 31.2127 16.42 31.2227 16.5 31.2227C16.58 31.2227 16.66 31.2127 16.73 31.1927C16.87 31.1627 30 27.8627 30 15.2227V3.22266C30 2.12266 29.1 1.22266 28 1.22266H5C3.9 1.22266 3 2.12266 3 3.22266V18.4827L5 16.4827V3.22266H28V15.2227C28 25.5227 18.22 28.7127 16.5 29.1827C15.56 28.9127 11.96 27.7327 9.05 24.9227L14.19 23.9427C18.43 23.1327 21.5 19.4127 21.5 15.1027V13.2227C21.5 12.1227 22.4 11.2227 23.5 11.2227H24.35C24.93 11.2227 25.22 10.5227 24.81 10.1127L22.3 7.60266C21.41 6.71266 20.23 6.22266 18.97 6.22266C17.12 6.22266 15.44 7.31266 14.68 8.99266L14.16 10.1427L0 24.3127V27.1427L15.71 11.4327C15.8 11.3427 15.86 11.2427 15.91 11.1327Z"); }
		45% { d: path("M15.91 11.1327L16.5 9.81266C16.94 8.84266 17.91 8.22266 18.97 8.22266C19.69 8.22266 20.37 8.50266 20.88 9.01266L21.58 9.71266C20.34 10.3927 19.5 11.7127 19.5 13.2227V15.1027C19.5 18.4627 17.11 21.3527 13.81 21.9827L6.91 23.3027C6.56 23.3727 6.28 23.6127 6.16 23.9427C6.04 24.2727 6.1 24.6427 6.32 24.9127C10.19 29.7027 16.01 31.1427 16.26 31.2027C16.34 31.2127 16.42 31.2227 16.5 31.2227C16.58 31.2227 16.66 31.2127 16.73 31.1927C16.87 31.1627 30 27.8627 30 15.2227V3.22266C30 2.12266 29.1 1.22266 28 1.22266H5C3.9 1.22266 3 2.12266 3 3.22266V18.4827L5 16.4827V3.22266H28V15.2227C28 25.5227 18.22 28.7127 16.5 29.1827C15.56 28.9127 11.96 27.7327 9.05 24.9227L14.19 23.9427C18.43 23.1327 21.5 19.4127 21.5 15.1027V13.2227C21.5 12.1227 22.4 11.2227 23.5 11.2227H24.35C24.93 11.2227 25.22 10.5227 24.81 10.1127L22.3 7.60266C21.41 6.71266 20.23 6.22266 18.97 6.22266C17.12 6.22266 15.44 7.31266 14.68 8.99266L14.16 10.1427L0 24.3127V27.1427L15.71 11.4327C15.8 11.3427 15.86 11.2427 15.91 11.1327Z"); }
		50% { d: path("M15.91 12.1327L16.5 10.8127C16.94 9.84266 17.91 9.22266 18.97 9.22266C19.69 9.22266 20.37 9.50266 20.88 10.0127L21.58 10.7127C20.34 11.3927 19.5 12.7127 19.5 14.2227V16.1027C19.5 19.4627 17.11 22.3527 13.81 22.9827L6.91 23.3027C6.56 23.3727 6.28 23.6127 6.16 23.9427C6.04 24.2727 6.1 24.6427 6.32 24.9127C10.19 29.7027 16.01 31.1427 16.26 31.2027C16.34 31.2127 16.42 31.2227 16.5 31.2227C16.58 31.2227 16.66 31.2127 16.73 31.1927C16.87 31.1627 30 27.8627 30 15.2227V3.22266C30 2.12266 29.1 1.22266 28 1.22266H5C3.9 1.22266 3 2.12266 3 3.22266V18.4827L5 16.4827V3.22266H28V15.2227C28 25.5227 18.22 28.7127 16.5 29.1827C15.56 28.9127 11.96 27.7327 9.05 24.9227L14.19 24.9427C18.43 24.1327 21.5 20.4127 21.5 16.1027V14.2227C21.5 13.1227 22.4 12.2227 23.5 12.2227H24.35C24.93 12.2227 25.22 11.5227 24.81 11.1127L22.3 8.60266C21.41 7.71266 20.23 7.22266 18.97 7.22266C17.12 7.22266 15.44 8.31266 14.68 9.99266L14.16 11.1427L0 24.3127V27.1427L15.71 12.4327C15.8 12.3427 15.86 12.2427 15.91 12.1327Z") }
		70% { d: path("M15.91 11.1327L16.5 9.81266C16.94 8.84266 17.91 8.22266 18.97 8.22266C19.69 8.22266 20.37 8.50266 20.88 9.01266L21.58 9.71266C20.34 10.3927 19.5 11.7127 19.5 13.2227V15.1027C19.5 18.4627 17.11 21.3527 13.81 21.9827L6.91 23.3027C6.56 23.3727 6.28 23.6127 6.16 23.9427C6.04 24.2727 6.1 24.6427 6.32 24.9127C10.19 29.7027 16.01 31.1427 16.26 31.2027C16.34 31.2127 16.42 31.2227 16.5 31.2227C16.58 31.2227 16.66 31.2127 16.73 31.1927C16.87 31.1627 30 27.8627 30 15.2227V3.22266C30 2.12266 29.1 1.22266 28 1.22266H5C3.9 1.22266 3 2.12266 3 3.22266V18.4827L5 16.4827V3.22266H28V15.2227C28 25.5227 18.22 28.7127 16.5 29.1827C15.56 28.9127 11.96 27.7327 9.05 24.9227L14.19 23.9427C18.43 23.1327 21.5 19.4127 21.5 15.1027V13.2227C21.5 12.1227 22.4 11.2227 23.5 11.2227H24.35C24.93 11.2227 25.22 10.5227 24.81 10.1127L22.3 7.60266C21.41 6.71266 20.23 6.22266 18.97 6.22266C17.12 6.22266 15.44 7.31266 14.68 8.99266L14.16 10.1427L0 24.3127V27.1427L15.71 11.4327C15.8 11.3427 15.86 11.2427 15.91 11.1327Z"); }
	}
	.menu-icon.selected {
		background:rgb(39 47 150 / 15%);
	}

	.nav-tabs h4 {
		margin: 0;
		line-height: 40px;
		margin-top: 16px;
		font-weight: normal;
	}


	.main-menu {
		position:absolute;
		top: var(--navH);
		left: 0;
		width:100%;
		height: calc( 100vh - var(--navH) );
		z-index: 9998;
	}
	.main-menu .mask {
		background: #1a1919;
		opacity:0;
		position:absolute;
		top: 0;
		left: 0;
		width:100%;
		height:100%;
		z-index: 9998;
		transition: opacity 0.3s ease-out;
	}
	.main-menu .mask.in {
		opacity:0.4;
	}


	.dd {
		border-radius:12px;
		background:#fff;
		overflow: scroll;
		min-width: 256px;
		min-height:64px;
		max-width: 1088px;
		width: calc( 100vw - 32px );
		z-index: 9999;
		position:absolute;
		top:16px;
		right:16px;
		opacity:0;
		padding:16px 16px 40px 32px;
		max-height: calc( 100vh - var(--navH) - 32px );
    	box-shadow:0 6px 10px rgba(25, 25, 26, 0.2);
		transition: transform 0.3s ease-out, opacity 0.3s ease-out;
	}

	.anim_dd_grow {
		transform-origin: 100% 0%;
		transform: scale(0);
	}

	.dd.in {
		opacity:1;
	}
	.dd.in.anim_dd_grow {
		transform: scale(1);
	}

	.dd h3 {
		font-weight:normal;
		font-size:20px;
	}
	.frame {
		text-align: left;
		margin: 0 auto;
		max-width: var(--max-page);
		padding:0;
		height:100%;
		position:relative;

	}
	nav .frame {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.action-holder { 
		background-color: #fff;
		position: sticky;
		width: calc(100% + 20px);
		box-sizing: border-box;
		left: 0;
		top: 16px;
		padding-top:16px;
		margin-bottom: 16px;
		transform: translate(-16px,-16px);
		height:1px;
		padding-right:16px;	
		display:flex;
		flex-direction: row;
		justify-content: flex-end;
		align-items: center;
	}
	.action-holder:before {
		content:'';
		display:block;
		background:#fff;
		position: absolute;
		width: 100%;
		height: 48px;
		top: -16px;
	}
	.action-item {
		margin-left:32px;
		cursor:pointer;
		position: relative;
	}
	.action-holder .i-close {
		display: none;
	}
	.action-item span {
		display: inline-block;
		margin-left:4px;
	}

	.action-dd {
		background:#fff;
		border-radius:8px;
		position:absolute;
		top:24px;
		right:0px;
		list-style: none;
		margin:0;
		padding:4px 0;
		box-shadow:0 6px 10px rgba(25, 25, 26, 0.2);
		overflow: hidden;
		border-top: 1px solid transparent;
		transition: all 0.3s linear;
	}
	.action-dd li {
		position: relative;
		margin:0 4px 4px 4px;
		padding:0px 16px;
		line-height:24px;
		height:auto;
		border-radius:4px;
	}
	.action-dd li:hover {
		background-color: rgba(25, 25, 26, 0.1)
	}
	
	.action-dd li.selected {
		background-color: rgba(25, 25, 26, 0.2)
	}
	

	.nav-row {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}

	.nav-row.single .nav-page {
		margin-bottom: 40px;
	}
	.collapser {
		cursor: pointer;
		flex: 1;
    	text-align: right;
	}
	.nav-row.single .collapser {
		display: none !important;
	}

	.nav-tabs-wrapper, .nav-content {
		/* hidden on small */
		box-sizing: border-box;
	}
	.nav-tabs-wrapper {
		width:238px;
		margin-right:16px;

	}
	.nav-content {
		flex: 3; /*on wide screens */
		min-width:238px;
	}
	.nav-content .nav-item-holder {
		margin-top:16px;
	}
	h2 {
		line-height:40px;
		font-weight: normal;
		margin:16px 0 0 0;
		display: flex;
		align-items: center;
		flex-direction: row;
		cursor:pointer;
	}
	h2.hide_headers {
		display:none;
	}
	h2 span {
		line-height: 32px;
		font-size: 24px
	}
	h2 .icon {
		width: 28px;
		height:28px;
		aspect-ratio: 1;
		margin-left:6px;
		margin-top:2px;
		margin-right:12px;
		background-color: transparent;
		background-position: center center;
		background-repeat:no-repeat;
		background-size:cover;
		transition: all 0.2s linear;
		display: inline-block;
		vertical-align: middle;
	}
	h2.selected .icon {
		width: 32px;
		margin-left:4px;
		margin-top:0;
		margin-right:8px;
	}

	.nav-row.tabbed h2:not(.selected) {
		display: none;
	}
	.nav-row.tabbed h2 i {
		display: none;
	}

	.hub-link {
		/*color: var(--black);*/
		line-height: 16px;
		display: inline-block;
		padding:4px 8px;
		/*border-radius:4px;*/
		margin-left:0px;
		margin-bottom: 13px;
		margin-top: 8px;
		/*background: rgba(26,25,25,5%);*/
		font-size:12px;
		/*text-transform: uppercase;*/
		position:initial;
	}
	.hub-link-left {
		margin-left:0px;
	}
	.hub-link:hover {
		/*background: rgba(26,25,25,10%);
		text-decoration: underline;*/
		cursor:pointer;
	}

	.tennant-select {
		/*border:none;
		border-radius:4px;
		background: rgba(26,25,25,5%);
		text-transform: uppercase;*/
		
		padding: 3px 24px 3px 8px;
		margin-top: 8px;
		font-size: 12px;
		font-family: "IBM Plex Sans", sans-serif;
		outline: none;
		cursor: pointer;
		vertical-align: top;
		background: url(data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0Ljk1IDEwIj48ZGVmcz48c3R5bGU+LmNscy0xe2ZpbGw6I2ZmZjt9LmNscy0ye2ZpbGw6IzQ0NDt9PC9zdHlsZT48L2RlZnM+PHRpdGxlPmFycm93czwvdGl0bGU+PHJlY3QgY2xhc3M9ImNscy0xIiB3aWR0aD0iNC45NSIgaGVpZ2h0PSIxMCIvPjxwb2x5Z29uIGNsYXNzPSJjbHMtMiIgcG9pbnRzPSIxLjQxIDQuNjcgMi40OCAzLjE4IDMuNTQgNC42NyAxLjQxIDQuNjciLz48cG9seWdvbiBjbGFzcz0iY2xzLTIiIHBvaW50cz0iMy41NCA1LjMzIDIuNDggNi44MiAxLjQxIDUuMzMgMy41NCA1LjMzIi8+PC9zdmc+) no-repeat;
		background-position: right 5px top;
		-moz-appearance: none;
		-webkit-appearance: none;
		appearance: none;
		line-height: 18px;
	}
	.changing-tennant {
		margin:0 auto;
		padding:32px;
		display: inline-block;
	}
	.changing-tennant .icon {
		width: 32px;
		height:32px;
		aspect-ratio: 1;
		margin-right:8px;
		background-color: transparent;
		background-position: center center;
		background-repeat:no-repeat;
		background-size:cover;
		animation: loading 3s ease-in-out infinite;
		vertical-align:middle;
		display: inline-block;
	}
	@keyframes loading {
		0% { transform: rotate(0deg) }
		100% { transform: rotate(719deg) }
	}


	.nav-item-holder {
		display: flex;
		flex-direction: row;
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
	.nav-item-holder.limited {
		/*justify-content: space-evenly;*/
	}
	.nav-item-holder.limited .nav-item {
		/*box-shadow: 0 0 4px rgba(26,25,25,5%);*/
		width: 320px;
		min-height: 64px;
	}
	.nav-item-holder.limited .nav-item .icon {
		width: 48px;
		height:48px;
	}

	.nav-item-holder .nav-item .tip {
		display:none;
	}
	.nav-item-holder.limited .nav-item .tip {
		display:block;
		font-size:12px;
		color:#666;
	}

	.anim_navi_wave .nav-item {
		transform:translateX(10px);
		animation: navi_wave 0.2s ease-out forwards;
	}
	@keyframes navi_wave {
		0% { transform:translateX(10px) }
		100% { transform:translateX(0px) }
	}
	.anim_navi_grow .nav-item {
		transform-origin: 0% 0%;
		transform: scale(0.7);
		animation: navi_grow 0.5s ease-out forwards;
	}
	@keyframes navi_grow {
		0% { transform: scale(0.7); }
		100% { transform: scale(1); }
	}

	.anim_navi_grow.anim_navi_wave .nav-item {
		transform: scale(0.1) translateX(100px);
		animation: navi_growwave 0.5s ease-out forwards;
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

	.badge {
		font-size:10px;
		text-transform: uppercase;
		padding:2px 6px;
		line-height:12px;
		border-radius:8px;
		background: var(--eo-secondary-500);
		color:#fff;
		margin-bottom: 8px;
		font-weight: bold;
		margin-left: 4px;
	}
	.badge-new {
		background: var(--eo-secondary-500);
	}
	.badge-updated {
		background: var(--eo-addon-blue);
	}
	.badge-discover {
		background: #72737A;
	}


	.exception {
		border: 1px solid #BABFC3;
		background: #FBFBFB;
		border-radius:8px;
		padding:16px;
		width:100%; max-width:480px;
	}
	.exception h3 {margin-top:0;}

	@media (max-width: 379px) {
		.dd {
			width: 100vw !important;
		}
	}

	@media (max-width: 599px) {
		.main-menu {
			top: 0;
			height: 100vh;
		}
		.dd {
			border-radius:0;
			overflow: scroll;
			min-width: 256px;
			height:100vh;
			max-width: initial;
			width: calc( 100vw - 64px );
			top:0;
			right:0;
			max-height: 100vh;
			box-shadow:0 6px 10px rgba(25, 25, 26, 0.2);

			transition: transform 0.3s cubic-bezier(.4,.14,.85,1.18);
			transform-origin: 100% 0%;
			transform: translateX( 100vh );
		}
		.dd.in {
			transform: translateX( 0 );
		}
		.action-holder { 
			padding-right:0px;	
		}
		.action-holder .i-close { 
			display: block;
		}
		.action-item span {
			display: none;
		}
		.view-mode {
			display:none; /* cant change view mode when there isnt enough room for tabs anyway*/
		}
		.filter-view input {
			width:90px;
		}
		.nav-row.tabbed h2 {
			display: flex ! important;
		}
		h2 span { font-size: 20px}
		.nav-row.tabbed h2 i {
			display: inline-block;
		}
		.nav-tabs-wrapper {
			display: none;
		}

		.nav-item {
			width: 100%; 
		}
	}
	@media (max-width: 821px) {

		.hub-link {
			margin-left:0px;
			margin-top:16px;
		}
		.tennant-select {
			margin-top:16px;
		}
	}
	@media (max-width: 959px) {
		.search-bar {
			display:none ! important
		}
		.menu-icon {
			display: inline-block ! important
		}
	}
</style>