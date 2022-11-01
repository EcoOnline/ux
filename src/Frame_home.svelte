<script>
import { writable } from 'svelte/store';
import { createEventDispatcher } from 'svelte';
import Modal from './components/Modal.svelte';
import FavList from './components/FavList.svelte';
//import SortableList from 'svelte-sortable-list';


import MenuSettings from "./Frame_menusettings.svelte";
import AppMenu from "./Frame_appmenu.svelte";
import { config, app_data, slices, favourites } from './Frame_menusettings.js';
    import BigNumber from './components/cards/BigNumber.svelte';
    import Channel from './components/table/Channel.svelte';

let nav_item_holder;
let selected_tennant;
let favourite_filter = '';
let favourite_results = [];
function fav_toggle(m) {
	let i = $favourites.indexOf(m);
	let f = $favourites;
	if(i<0) {
		//add
		console.log('add', i, m);
		f.push(m);
	} else {
		//remove
		console.log('remove', i, m);
		f.splice(i,1);
	}
	$favourites = f;
}

$: {
	let f = favourite_filter.toLowerCase();
	let res = [];

	if(f.length > 1) {
		//filter down results
		for (const [app, prod] of Object.entries($app_data)) {
			let v = prod.modules.filter( (m) => {
				m.parent_name = prod.name;
				return m.name.toLowerCase().indexOf(f) >= 0 && $favourites.indexOf(m) < 0;
			})
			res.push(...v);
		}
	}
	console.log('favs', $favourites, 'res', res);
	res = res.concat($favourites); 
	favourite_results = res;
}

let favourites_modal = false;

const dispatch = createEventDispatcher();

function nav(str) {
	window.location.hash = '#' + str;
	dispatch('nav', {
		text: str
	});
}

const sortList = ev => {
	console.log(ev.detail)
	$favourites = ev.detail;

};



let apps_item_holder = false;
let selected_app = 'home';

function menu_change_handler(event){
	if($config.menu_hover) {
		//if hover mode set go straight to app
		nav(event.detail.menu_item.key)
	} else {
		selected_app = event.detail.menu_item.key;
	}
}

function menu_hover_handler(event){
	if($config.menu_hover) {
		//if hover mode set go straight to app
		selected_app = event.detail.menu_item.key;
	}
	//sidebar_enter(event.detail.m, event.detail.menu_item, event.detail.index);
}

</script>

<h1>EcoOnline Home</h1>
<div class="row">
    <div class="col3 col-md-3 d960up-block">
        <div class='nav-tabs' bind:this={apps_item_holder}>
            <AppMenu {selected_app} on:menu_change={menu_change_handler} on:menu_hover={menu_hover_handler}></AppMenu>
        </div>
    </div>
    <div class="col12 col-md-9">


		
			
			{#if selected_app == 'home'}
				<h2>Favourites</h2>
				<div class='row'>
					{#each $favourites as m, i}
						<div class="col6 col-sm-4 col-md-3 col-lg-2 col-xl-1">
							<div class='tile' style="animation-delay:{i*0.02+0.3}s" class:selected="{ window.location.hash == '#' + m.url }" on:click|preventDefault="{ () => {nav(m.url); }}">
								<div class="icon" style={"background-image:url('./images/svgs_clean/" + m.icon + ".svg')"}></div>
								<b>
									{m.name}
									{#if m.tip}
										<span class='tip'>{m.tip}</span>
									{/if}
								</b>
								{#if $config.menu_upsell}
									
									{#if m.discover}
										<span class='badge badge-discover'>Discover</span>
									{/if}

								{/if}
							</div>
						</div>
					{/each}
					<div class="col6 col-sm-4 col-md-3 col-lg-2 col-xl-1">
						<div class='tile inset' on:click|preventDefault="{ () => { favourites_modal = true }}">
							<div class="icon" style="opacity:0.3;background-image:url('./images/icons/add--alt.svg')"></div>
							<b>
								Add Favourite
							</b>
						</div>
					</div>
				</div>

				<h2>Helpful links</h2>
				<div class='nav-page' bind:this={nav_item_holder}>
					
					
					
					{#if $app_data[selected_app].has_modules}
						<div class='row'>
							{#each $app_data[selected_app].modules_to_paint as m, i}
							<div class="col6 col-sm-4 col-md-3 col-lg-2 col-xl-1">
									<div class='tile' style="animation-delay:{i*0.02+0.3}s" class:selected="{ window.location.hash == '#' + m.url }" on:click|preventDefault="{ () => {nav(m.url); }}">
										<div class="icon" style={"background-image:url('./images/svgs_clean/" + m.icon + ".svg')"}></div>
										<b>
											{m.name}
											{#if m.tip}
												<span class='tip'>{m.tip}</span>
											{/if}
										</b>
										{#if $config.menu_upsell}
											
											{#if m.discover}
												<span class='badge badge-discover'>Discover</span>
											{/if}

										{/if}
									</div>
								</div>
							{:else}
								{#if filter_key !== ''}
									<p class='exception exception-filter'>There are no modules with this filter</p>
								{:else}
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
					
					{/if}
						
				

				</div>
			{:else}
			
				<h2>
					<div class="icon" style={"background-image:url('./images/svgs_clean/" + $app_data[selected_app].icon + ($app_data[selected_app].key == selected_app ? '' : 'bw') + ".svg')"}></div>
					
					<span>{$app_data[selected_app].name}</span>
					
				</h2>
				
				
				<div class='nav-page' bind:this={nav_item_holder}>
				

					{#if $app_data[selected_app].has_ecoid}

						{#if ($app_data[selected_app].has_modules && $app_data[selected_app].modules_to_paint.length) || !$app_data[selected_app].has_modules}
							{#if !$config.menu_hover}
								
								<span class='hub-link btn btn-secondary' class:hub-link-left="{$config.hide_headers}" on:click|preventDefault="{ () => {nav($app_data[selected_app].key); }}">Go to {($config.hide_headers ? $app_data[selected_app].name : 'Product')} Hub</span>
								
							{/if}
						{/if}
						{#if $app_data[selected_app].show_tennants && $app_data[selected_app].tennants && $app_data[selected_app].tennants.length}
							<!--
							<select bind:value="{selected_tennant}" class='tennant-select btn btn-secondary' on:change="{()=> { fake_tennant_change(a); }}">
								{#each $app_data[selected_app].tennants as tennant}
									<option>{tennant}</option>
								{/each}
							</select>
							-->
						{/if}
						{#if $slices[selected_app] && $slices[selected_app].changing_tennant}
							<div style='text-align:center'>
								<div class='changing-tennant'>
									<div class="icon" style={"background-image:url('./images/svgs_clean/loading.svg')"}></div>
									Loading modules for {selected_tennant}...
								</div>
							</div>
						{:else}
							{#if $app_data[selected_app].has_modules}
								<div class='row' style='margin-top:16px;'>
									{#each $app_data[selected_app].modules_to_paint as m, i}
									<div class="col6 col-sm-4 col-md-3 col-lg-2 col-xl-1">
											<div class='tile' on:click|preventDefault="{ () => {nav(m.url); }}">
												<div class="icon" style={"background-image:url('./images/svgs_clean/" + m.icon + ".svg')"}></div>
												<b>
													{m.name}
													{#if m.tip}
														<span class='tip'>{m.tip}</span>
													{/if}
												</b>
												{#if $config.menu_upsell}
													
													{#if m.discover}
														<span class='badge badge-discover'>Discover</span>
													{/if}

												{/if}
											</div>
										</div>
									{:else}
										{#if filter_key !== ''}
											<p class='exception exception-filter'>There are no modules with this filter</p>
										{:else}
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
								<div class='nav-item-holder limited'>

									<div class='nav-item'>
										<div class="icon" style={"background-image:url('./images/svgs_clean/" + $app_data[selected_app].icon + ".svg')"}></div>
										<b>
											{$app_data[selected_app].name}
											<span class='tip'>{$app_data[selected_app].tip}</span>
										</b>
									</div>
									<div class='exception exception-nomodules'>
										<p>{$app_data[selected_app].tip}</p>
									</div>
								</div>
							{/if}
						
						{/if}
					{:else}
						<div class='nav-item-holder limited'>
							<div class='exception'>
								<h3>Access</h3>
								<p>We’ve added <i>{$app_data[selected_app].name}</i> to the exciting suite of EcoOnline products. If you’re an existing client of this product you can access it here or learn more about what it can do for your company.</p>
								{#if $app_data[selected_app].external_login}
									<a href='{$app_data[selected_app].external_login}' target='_blank' class='btn'>Login</a>
								{/if}
								{#if $app_data[selected_app].external_marketing}
									<a href='{$app_data[selected_app].external_marketing}' target='_blank' class='btn btn-secondary'>Learn More</a>
								{/if}
							</div>
						</div>
					{/if}

				</div>
				
			
			{/if}		
			

    </div>
</div>
<div style='width:1px;height:1px;overflow:hidden;'>
    <MenuSettings></MenuSettings>
</div>


<Modal w={'512px'} show_modal={favourites_modal} title={'Add your favourites'} on:close={ () => { favourites_modal = false}}>
    <div>
		<div class="form-item">
			<label>Search</label>
			<p>Search for the shortcut you want to add to your favourites.</p>
			<input type="text" class='form-control' bind:value={favourite_filter}>
		</div>
		{#if favourite_filter.length > 1 && !favourite_results.length }
			<div>
				No modules with this search.
			</div>
		{:else}
		

			<ul class='fav_list'>
				{#each favourite_results as m}
					<li class="fav-li" class:selected={$favourites.indexOf(m) >= 0} on:click={ () => { fav_toggle(m) }}>
						<div class="icon" style={"background-image:url('./images/svgs_clean/" + m.icon + ".svg')"}></div>
						{m.name} <span>({m.parent_name})</span></li>
				{/each}
			</ul>
		{/if}

		<div class='btn btn-right' on:click='{ () => {favourite_filter='';favourites_modal = false;} }'>Done</div>
	</div>
</Modal>








<style>
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

	.fav_list {
		padding:0;
		margin-top:32px;
		margin-bottom:32px;
		max-height:200px;
		overflow: auto;
	}
	.fav-li .icon {
		width:24px;
		height:24px;
		aspect-ratio: 1;
		margin-right:12px;
		background-color: transparent;
		background-position: center center;
		background-repeat:no-repeat;
		background-size:cover;
		transition: all 0.2s linear;
		display: inline-block;
		vertical-align: middle;
	}
	.fav-li {
		border-radius:8px;
		margin-bottom: 4px;
		height:40px;
		line-height:40px;
		padding:0 16px;
		cursor:pointer;
		overflow:hidden;
	}
	.fav-li.selected {
		background: rgba(26,25,25,10%);
	}

	.tile.inset {
		background: #F9f9f9;
		box-shadow: inset 2px 2px 8px rgba(25,25,25,10%);
	}
	.tile.inset:hover {
		background: transparent;

		transform: scale(0.99);
		box-shadow: inset 2px 2px 8px rgba(25,25,25,20%);
	}
	.tile.inset:hover .icon {
		transform: scale(0.95);
	}	
</style>