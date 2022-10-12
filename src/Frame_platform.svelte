<script>
import { writable } from 'svelte/store';
import { createEventDispatcher } from 'svelte';

import MenuSettings from "./Frame_menusettings.svelte";
import AppMenu from "./Frame_appmenu.svelte";
import { config, app_data } from './Frame_menusettings.js';

    const dispatch = createEventDispatcher();

    function nav(str) {
		dispatch('nav', {
			text: str
		});
	}



    let apps_item_holder = false;
    let selected_app = 'platform';

    function menu_change_handler(event){
		if($config.menu_hover) {
			//if hover mode set go straight to app
			nav(event.detail.menu_item)
		} else {
			selected_app = event.detail.menu_item.key;
		}
	}

	function menu_hover_handler(event){
		//sidebar_enter(event.detail.m, event.detail.menu_item, event.detail.index);
	}

</script>


<div class="row">
    <div class="col3 col-sm-2">
        <div class='nav-tabs' bind:this={apps_item_holder}>
            <AppMenu {selected_app} on:menu_change={menu_change_handler} on:menu_hover={menu_hover_handler}></AppMenu>
        </div>
    </div>
    <div class="col9 col-sm-10">
    </div>
</div>


<div style='width:1px;height:1px;overflow:hidden;'>
    <MenuSettings></MenuSettings>
</div>









<style>


</style>