<script>
	import { config } from './Frame_menusettings.js';

	let menu_hover_icons = [
		'none',
		'bento',
		'arrow'
	];

	let btoa_str = '';

	$: {
		let c = $config;
		btoa_str = btoa(JSON.stringify(c));
		console.log('updated btoa_str', btoa_str);
		console.log('hide_headers?', c.hide_headers);
		console.log('multi tennant?', c.multi_tennant);
	}

	function apply_config_change_to_url() {
		
		let c = $config;
		console.log('config about to apply to url', btoa_str);
		console.log('hide_headers?', c.hide_headers);
		console.log('multi tennant?', c.multi_tennant);

		window.location.href = window.location.protocol + '//' +
		window.location.host +
		window.location.pathname +
		'?origin=' + origin + 
		'&menu=' + btoa_str + 
		'&ran=' + Math.random() +
		window.location.hash;
	}

	//preload config from url param
	let params = new URLSearchParams(document.location.search);
	let menu = params.get("menu");
	let origin = params.get("origin");
	if(menu) {
		
		try {
			let str = atob(menu);
			let c = JSON.parse(str);
			console.log('load config from url', c);

			config.set(c);




		} catch (error) {
			console.error("couldnt parse search");
		}
	} else {
		console.warn('no menu param');
	}

	/*
	let config = {
		apps: ['home','ehs', 'cm'],
		user_level: 'admin',
		multi_tennant: false,
		view_mode: 'tabbed',
		menu_hover: false,
		menu_hover_icon: 'bento',
		svg_show: false,
		toggle_view: true,
		sort_view: false,
		filter_view: false,
		action_dd: false,
		sort_key: 'default',
		anim_dd_grow: false,
		anim_navi_grow: false,
		anim_navi_wave: false
	}
	*/
</script>
<!--
<code style='max-width:400px;word-wrap: break-word;'>
	{btoa_str}
</code>
-->
<div>
	<b>Apps:</b><br>
	<label><input type='checkbox' bind:group={$config.apps} value="home"> Home (aka platform)</label><br>
	<label><input type='checkbox' bind:group={$config.apps} value="ehs"> EcoOnline EHS</label><br>
	<label><input type='checkbox' bind:group={$config.apps} value="cm"> Chemical Manager</label><br>
	<label><input type='checkbox' bind:group={$config.apps} value="munio"> Munio Learning</label><br>
	<label><input type='checkbox' bind:group={$config.apps} value="crisis"> Crisis Manager (mocked as connected with permissions but no modules)</label><br>
	<label><input type='checkbox' bind:group={$config.apps} value="almego"> Almego (mocked as connected but no permission to modules)</label><br>
	<label><input type='checkbox' bind:group={$config.apps} value="staysafe"> StaySafe (mocked as not connected to EcoId)</label><br>
</div>
<hr>

<div>
	<b>User level:</b><br>
	<select bind:value="{$config.user_level}">
		<option value='basic'>Basic</option>
		<option value='multi'>Multiple modules</option>
		<option value='admin'>Admin level</option>
	</select><br>
</div>
<hr>
<div>
	<b>Tennants:</b><br>
	<label><input type='checkbox' bind:checked={$config.multi_tennant}> Show multi-tennants / organisations</label>
</div>	
<hr>

<div>
	<b>View options:</b><br>
	<select bind:value="{$config.view_mode}">
		<option value='tabbed'>Tabbed View</option>
		<option value='single'>Single-page View</option>
	</select><br>
	(note: behaviour adapts based on whether youre on small screens and/or only have one app)
	<br>
	{#if $config.view_mode == 'tabbed'}
		<label><input type='checkbox' bind:checked="{$config.menu_hover}"> Hover tabs to change (unchecked requires a click)</label><br>
		{#if $config.menu_hover}
			<label><input type='checkbox' bind:checked="{$config.svg_show}"> Show protected hover region</label><br>
			Hover Icon: <select bind:value="{$config.menu_hover_icon}">
				{#each menu_hover_icons as icon}
					<option>{icon}</option>
				{/each}
			</select><br>
		{/if}
	{/if}
	<label><input type='checkbox' bind:checked="{$config.hide_headers}"> Hide headers</label><br>
	<label><input type='checkbox' bind:checked="{$config.menu_upsell}"> Show upsell (discover + new + updated) (phase 2) </label><br>
	<label><input type='checkbox' bind:checked="{$config.toggle_view}"> Allow user to toggle view mode (only works with 2 or more products)(phase 2) </label><br>
	<label><input type='checkbox' bind:checked="{$config.sort_view}"> Allow user to sort icon order (phase 2 or 3) </label><br>
	<label><input type='checkbox' bind:checked="{$config.filter_view}"> Allow user to filter modules (phase3) </label><br>
	
</div>

<hr>
<div>
	<b>Animations:</b><br>
	<label><input type='checkbox' bind:checked={$config.anim_dd_grow}> Dropdown grow — grow/shrink towards top right</label><br>
	<label><input type='checkbox' bind:checked={$config.anim_navi_grow}> Nav item grow</label><br>
	<label><input type='checkbox' bind:checked={$config.anim_navi_wave}> Nav item slide — slight genie effect to modules</label><br>
</div>
<hr>

<div on:click={apply_config_change_to_url} class="btn">Apply Settings</div>