<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    function nav(str) {
		dispatch('nav', {
			text: str
		});
	}
    let tab = "apps";
    export let tabnav = '';
    $: {
        let t = tabnav;
        tab = (t == '' ? 'apps' : t);
    }

</script>

<h2>EcoOnline Home</h2>

<ul class="tabs">
    <li><a href="#platform" class:active="{tab == 'apps'}">Applications</a></li>
    <li><a href="#platform/news" class:active="{tab == 'news'}">News</a></li>
    <li><a href="#platform/dashboards" class:active="{tab == 'dashboards'}">Dashboards</a></li>
</ul>


{#if tab == 'apps'}
    <div class="row">
        <div class="col3 col-sm-2">
            sidebar
        </div>
    </div>
{/if}

        