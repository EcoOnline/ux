<script>
	import { flip } from 'svelte/animate';
	import { dndzone } from 'svelte-dnd-action';
    export let items;
    const flipDurationMs = 300;
	function handleDndConsider(e) {
		items = e.detail.items;
	}
	function handleDndFinalize(e) {
		items = e.detail.items;
	}
</script>

<section use:dndzone={{items, flipDurationMs}} on:consider={handleDndConsider} on:finalize={handleDndFinalize}>
	{#each items as item(item.url)}
		<div class='fav-li' animate:flip="{{duration: flipDurationMs}}">
			{item.name}
		</div>
	{/each}
</section>
<!--
<section use:dndzone={{items, flipDurationMs}} on:consider={handleDndConsider} on:finalize={handleDndFinalize}>
	{#each items as item(item.url)}
		<div class='fav-li' animate:flip="{{duration: flipDurationMs}}">
			<div class="icon" style={"background-image:url('./images/svgs_clean/" + item.icon + ".svg')"}></div>
						{item.name} <span>({item.parent_name})</span>
		</div>
	{/each}
</section>
-->



<style>
	section {
		width: 100%;
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

</style>