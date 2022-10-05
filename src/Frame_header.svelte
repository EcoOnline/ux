<script>
	import { writable } from 'svelte/store';
	import { createEventDispatcher } from 'svelte';

	import MenuSettings from "./Frame_menusettings.svelte";
	import AppMenu from "./Frame_appmenu.svelte";
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
		if($config.filter_key !== '') {
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
		let slice_arr = (slices[a] ? (slices[a][ul] ? slices[a][ul] : null) : null);


		if(slice_arr) {
			temp = temp.slice(slice_arr[0], (typeof slice_arr[1] !== 'undefined' ? slice_arr[1] : temp.length) );
		}
		return temp;
	}
	function fake_tennant_change(a) {
		slices[a].changing_tennant = true;
		const min = 2000;
		const max = 5000;
		let delay =  Math.floor(Math.random() * (max - min) + min);
		setTimeout( () => { 
			slices[a].changing_tennant = false; 
		}, delay)
	}

	function menu_change_handler(event){
		if($config.menu_hover) {
			//if hover mode set go straight to app
			nav(event.detail.menu_item)
		} else {
			selected_app = event.detail.menu_item.key;
		}
	}

	function menu_hover_handler(event){
		sidebar_enter(event.detail.m, event.detail.menu_item, event.detail.index);
	}
	function sidebar_enter(m, menu_item, index) {
		if($config.menu_hover) {
			selected_app = menu_item.key;
			menu_hover_item = menu_item;
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
	

	
	
	
	

</script>

<svelte:window on:hashchange={set_app_module}/>
<nav>
	<div class="frame">

		<svg width="129" height="33" viewBox="0 0 129 33" fill="none" xmlns="http://www.w3.org/2000/svg" >
			<path d="M16.202 11.0018L16.792 9.6818C17.232 8.7118 18.202 8.0918 19.262 8.0918C19.982 8.0918 20.662 8.3718 21.172 8.8818L21.872 9.5818C20.632 10.2618 19.792 11.5818 19.792 13.0918V14.9718C19.792 18.3318 17.402 21.2218 14.102 21.8518L7.20199 23.1718C6.85199 23.2418 6.57199 23.4818 6.45199 23.8118C6.33199 24.1418 6.39199 24.5118 6.61199 24.7818C10.482 29.5718 16.302 31.0118 16.552 31.0718C16.632 31.0818 16.712 31.0918 16.792 31.0918C16.872 31.0918 16.952 31.0818 17.022 31.0618C17.162 31.0318 30.292 27.7318 30.292 15.0918V3.0918C30.292 1.9918 29.392 1.0918 28.292 1.0918H5.29199C4.19199 1.0918 3.29199 1.9918 3.29199 3.0918V18.3518L5.29199 16.3518V3.0918H28.292V15.0918C28.292 25.3918 18.512 28.5818 16.792 29.0518C15.852 28.7818 12.252 27.6018 9.34199 24.7918L14.482 23.8118C18.722 23.0018 21.792 19.2818 21.792 14.9718V13.0918C21.792 11.9918 22.692 11.0918 23.792 11.0918H24.642C25.222 11.0918 25.512 10.3918 25.102 9.9818L22.592 7.4718C21.702 6.5818 20.522 6.0918 19.262 6.0918C17.412 6.0918 15.732 7.1818 14.972 8.8618L14.452 10.0118L0.291992 24.1818V27.0118L16.002 11.3018C16.092 11.2118 16.152 11.1118 16.202 11.0018Z" fill="black"/>
			<path d="M39.292 22.0918V8.0918H48.252V10.1018H41.552V13.9918H47.632V16.0018H41.552V20.0918H48.252V22.0918H39.292Z" fill="black"/>
			<path d="M54.6821 22.3318C53.9321 22.3318 53.2621 22.2018 52.6721 21.9518C52.0821 21.7018 51.5922 21.3318 51.1922 20.8618C50.7922 20.3918 50.4821 19.8118 50.2721 19.1418C50.0621 18.4718 49.9521 17.7118 49.9521 16.8818C49.9521 16.0518 50.0621 15.3018 50.2721 14.6218C50.4821 13.9518 50.7922 13.3718 51.1922 12.9018C51.5922 12.4318 52.0921 12.0618 52.6721 11.8118C53.2621 11.5618 53.9321 11.4318 54.6821 11.4318C55.7221 11.4318 56.5821 11.6618 57.2521 12.1318C57.9221 12.6018 58.4121 13.2218 58.7121 14.0018L56.9121 14.8418C56.7621 14.3618 56.5121 13.9718 56.1421 13.6918C55.7721 13.4018 55.2922 13.2618 54.6922 13.2618C53.8922 13.2618 53.2822 13.5118 52.8722 14.0118C52.4622 14.5118 52.2621 15.1618 52.2621 15.9618V17.8218C52.2621 18.6218 52.4622 19.2718 52.8722 19.7718C53.2822 20.2718 53.8822 20.5218 54.6922 20.5218C55.3321 20.5218 55.8421 20.3618 56.2221 20.0518C56.6021 19.7418 56.9021 19.3218 57.1321 18.8018L58.7921 19.6818C58.4421 20.5418 57.9221 21.2018 57.2321 21.6618C56.5321 22.1018 55.6821 22.3318 54.6821 22.3318Z" fill="black"/>
			<path d="M64.8518 22.3318C64.1318 22.3318 63.4718 22.2018 62.8818 21.9518C62.2818 21.7018 61.7818 21.3318 61.3718 20.8618C60.9518 20.3918 60.6318 19.8118 60.4118 19.1418C60.1818 18.4718 60.0718 17.7118 60.0718 16.8818C60.0718 16.0518 60.1818 15.3018 60.4118 14.6218C60.6418 13.9518 60.9618 13.3718 61.3718 12.9018C61.7818 12.4318 62.2918 12.0618 62.8818 11.8118C63.4718 11.5618 64.1318 11.4318 64.8518 11.4318C65.5718 11.4318 66.2318 11.5618 66.8318 11.8118C67.4218 12.0618 67.9318 12.4318 68.3418 12.9018C68.7518 13.3718 69.0818 13.9518 69.3018 14.6218C69.5318 15.3018 69.6418 16.0518 69.6418 16.8818C69.6418 17.7118 69.5318 18.4618 69.3018 19.1418C69.0718 19.8218 68.7518 20.3918 68.3418 20.8618C67.9318 21.3318 67.4218 21.7018 66.8318 21.9518C66.2318 22.2018 65.5718 22.3318 64.8518 22.3318ZM64.8518 20.5018C65.6018 20.5018 66.2018 20.2718 66.6618 19.8118C67.1118 19.3518 67.3418 18.6618 67.3418 17.7518V15.9918C67.3418 15.0718 67.1118 14.3918 66.6618 13.9318C66.2018 13.4718 65.6018 13.2418 64.8518 13.2418C64.1018 13.2418 63.5018 13.4718 63.0518 13.9318C62.6018 14.3918 62.3718 15.0818 62.3718 15.9918V17.7518C62.3718 18.6718 62.6018 19.3518 63.0518 19.8118C63.5018 20.2718 64.1018 20.5018 64.8518 20.5018Z" fill="black"/>
			<path d="M77.832 22.3318C76.922 22.3318 76.092 22.1718 75.352 21.8618C74.612 21.5518 73.972 21.0918 73.442 20.4818C72.912 19.8718 72.502 19.1218 72.222 18.2118C71.932 17.3118 71.792 16.2718 71.792 15.0918C71.792 13.9118 71.932 12.8718 72.222 11.9718C72.512 11.0718 72.912 10.3118 73.442 9.70181C73.972 9.09181 74.602 8.63181 75.352 8.32181C76.092 8.01181 76.922 7.85181 77.832 7.85181C78.742 7.85181 79.562 8.01181 80.312 8.32181C81.052 8.63181 81.692 9.10181 82.222 9.70181C82.752 10.3118 83.162 11.0618 83.442 11.9718C83.732 12.8718 83.872 13.9118 83.872 15.0918C83.872 16.2718 83.732 17.3118 83.442 18.2118C83.152 19.1118 82.742 19.8718 82.222 20.4818C81.692 21.0918 81.062 21.5518 80.312 21.8618C79.562 22.1718 78.742 22.3318 77.832 22.3318ZM77.832 20.3218C78.362 20.3218 78.862 20.2318 79.302 20.0418C79.752 19.8518 80.132 19.5818 80.442 19.2218C80.752 18.8618 81.002 18.4318 81.172 17.9218C81.342 17.4118 81.432 16.8318 81.432 16.1918V13.9818C81.432 13.3418 81.342 12.7618 81.172 12.2518C81.002 11.7418 80.752 11.3118 80.442 10.9518C80.132 10.5918 79.742 10.3218 79.302 10.1318C78.852 9.94181 78.362 9.85181 77.832 9.85181C77.282 9.85181 76.792 9.94181 76.352 10.1318C75.912 10.3218 75.532 10.5918 75.222 10.9518C74.912 11.3118 74.662 11.7418 74.492 12.2518C74.322 12.7618 74.232 13.3418 74.232 13.9818V16.1918C74.232 16.8318 74.322 17.4118 74.492 17.9218C74.662 18.4318 74.912 18.8618 75.222 19.2218C75.532 19.5818 75.912 19.8518 76.352 20.0418C76.782 20.2318 77.282 20.3218 77.832 20.3218Z" fill="black"/>
			<path d="M86.1421 22.0918V11.6618H88.3321V13.3918H88.4321C88.6621 12.8318 89.0021 12.3618 89.4621 11.9918C89.9221 11.6218 90.5521 11.4318 91.3521 11.4318C92.4221 11.4318 93.2521 11.7818 93.8521 12.4818C94.4421 13.1818 94.7421 14.1818 94.7421 15.4818V22.0918H92.5521V15.7518C92.5521 14.1218 91.8921 13.3018 90.5821 13.3018C90.3021 13.3018 90.0221 13.3418 89.7521 13.4118C89.4821 13.4818 89.2321 13.5918 89.0221 13.7418C88.8121 13.8918 88.6421 14.0718 88.5121 14.3018C88.3821 14.5318 88.3221 14.7918 88.3221 15.1018V22.0918H86.1421Z" fill="black"/>
			<path d="M99.7522 22.0918C99.0022 22.0918 98.4422 21.9018 98.0822 21.5218C97.7122 21.1418 97.5322 20.6118 97.5322 19.9318V7.25183H99.7222V20.3018H101.162V22.0918H99.7522Z" fill="black"/>
			<path d="M104.102 9.80181C103.652 9.80181 103.312 9.69181 103.112 9.48181C102.902 9.27181 102.802 8.99181 102.802 8.66181V8.31181C102.802 7.98181 102.902 7.70181 103.112 7.49181C103.322 7.28181 103.652 7.17181 104.102 7.17181C104.552 7.17181 104.882 7.28181 105.082 7.49181C105.282 7.70181 105.382 7.98181 105.382 8.31181V8.65181C105.382 8.98181 105.282 9.26181 105.082 9.47181C104.882 9.69181 104.562 9.80181 104.102 9.80181ZM103.002 11.6618H105.192V22.0918H103.002V11.6618Z" fill="black"/>
			<path d="M108.052 22.0918V11.6618H110.242V13.3918H110.342C110.572 12.8318 110.912 12.3618 111.372 11.9918C111.832 11.6218 112.462 11.4318 113.262 11.4318C114.332 11.4318 115.162 11.7818 115.762 12.4818C116.352 13.1818 116.652 14.1818 116.652 15.4818V22.0918H114.462V15.7518C114.462 14.1218 113.802 13.3018 112.492 13.3018C112.212 13.3018 111.932 13.3418 111.662 13.4118C111.392 13.4818 111.142 13.5918 110.932 13.7418C110.722 13.8918 110.552 14.0718 110.422 14.3018C110.292 14.5318 110.232 14.7918 110.232 15.1018V22.0918H108.052Z" fill="black"/>
			<path d="M123.662 22.3318C122.912 22.3318 122.242 22.2018 121.652 21.9518C121.062 21.7018 120.562 21.3318 120.152 20.8618C119.742 20.3918 119.422 19.8118 119.202 19.1418C118.982 18.4718 118.872 17.7118 118.872 16.8818C118.872 16.0518 118.982 15.3018 119.202 14.6218C119.422 13.9518 119.742 13.3718 120.152 12.9018C120.562 12.4318 121.072 12.0618 121.652 11.8118C122.242 11.5618 122.912 11.4318 123.662 11.4318C124.422 11.4318 125.092 11.5618 125.682 11.8318C126.262 12.1018 126.752 12.4718 127.132 12.9418C127.512 13.4118 127.812 13.9718 128.002 14.5918C128.192 15.2218 128.292 15.8918 128.292 16.6218V17.4418H121.132V17.7818C121.132 18.5818 121.372 19.2318 121.842 19.7418C122.312 20.2518 122.992 20.5118 123.882 20.5118C124.522 20.5118 125.062 20.3718 125.502 20.0918C125.942 19.8118 126.312 19.4318 126.622 18.9518L127.902 20.2218C127.512 20.8618 126.952 21.3818 126.222 21.7618C125.492 22.1418 124.632 22.3318 123.662 22.3318ZM123.662 13.1218C123.292 13.1218 122.942 13.1918 122.632 13.3218C122.322 13.4518 122.052 13.6418 121.832 13.8818C121.612 14.1218 121.442 14.4118 121.322 14.7418C121.202 15.0718 121.142 15.4418 121.142 15.8418V15.9818H125.992V15.7818C125.992 14.9818 125.782 14.3318 125.372 13.8518C124.952 13.3718 124.382 13.1218 123.662 13.1218Z" fill="black"/>
		</svg>
		
		<div class="search-bar">
			<i class="i-search i-20"></i>
			<input type="text" placeholder="Type a keyword to begin your search"/>
		</div>

		<div class="menu-icons text-right">
			<span on:click='{ () => {selected_menu_item =  selected_menu_item == 'menu_settings' ? false : 'menu_settings'}}' class:selected="{selected_menu_item == 'menu_settings'}" class="menu-icon" style="opacity:0.2"><i class="i-administration i-24"></i></span>
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
						<div class='action-item filter-view' on:click="{ () => { if($config.action_dd == 'filter_view') { $config.action_dd = false; } else { $config.action_dd = 'filter_view';setTimeout(() => { filter_input.focus()}, 50)} }}">
							<i class="i-filter i-24"></i><span>Filter</span>
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
								<AppMenu {selected_app} on:menu_change={menu_change_handler} on:menu_hover={menu_hover_handler}></AppMenu>
							</div>
						</div>
					<!--
						<div class='nav-tabs' bind:this={apps_item_holder}>
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
						</div>

					-->
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
													<span class='hub-link btn btn-secondary' class:hub-link-left="{$config.hide_headers}" on:click|preventDefault="{ () => {nav($app_data[a]); }}">Go to {($config.hide_headers ? $app_data[a].name : 'Application')} Hub</span>
												{/if}
											{/if}
										{/if}
										{#if $app_data[a].show_tennants && $app_data[a].tennants && $app_data[a].tennants.length}
											<!-- svelte-ignore a11y-no-onchange -->
											<select bind:value="{selected_tennant}" class='tennant-select btn btn-secondary' on:change="{()=> { fake_tennant_change(a); }}">
												{#each $app_data[a].tennants as tennant}
													<option>{tennant}</option>
												{/each}
											</select>
										{/if}
										{#if slices[a] && slices[a].changing_tennant}
											<div style='text-align:center'>
												<div class='changing-tennant'>
													<div class="icon" style={"background-image:url('./images/svgs_clean/loading.svg')"}></div>
													Loading modules for {selected_tennant}...
												</div>
											</div>
										{:else}
											{#if $app_data[a].has_modules}
												<div class='nav-item-holder' class:limited={$app_data[a].modules_to_paint.length < 3}>
													{#each $app_data[a].modules_to_paint as m, i}
														<div class='nav-item' style="animation-delay:{i*0.02+0.3}s" class:selected="{ window.location.hash == '#' + m.url }" on:click|preventDefault="{ () => {nav(m); }}">
															<div class="icon" style={"background-image:url('./images/svgs_clean/" + m.icon + ".svg')"}></div>
															<b>
																{m.name}
																<span class='tip'>{m.tip}</span>
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
															<p class='exception exception-filter'>There are no modules with this filter</p>
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
														<p>{$app_data[a].tip}</p>
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