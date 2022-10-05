<script>

	/*
		a responsive frame to hold smaller experiments so that they don't have to be continually framed,
	*/

	import Frame from "./Frame.svelte";


	let evolution = 1;
	let show_hint = false;


</script>

<div class='evolution' on:mousedown="{ () => { show_hint = true }}" on:mouseup="{ () => { show_hint = false }}" on:mouseleave="{ () => { show_hint = false }}">
	Evolution: <input class="evolution_slider" type="range" bind:value={evolution} min="1" max="9">

	{#if show_hint}
		<div class="evolution_hint">
			<h3>Evolution {evolution}</h3>
			
			{#if evolution == 1}
				Existing design
			{/if}
			{#if evolution == 2}
				Ev2
			{/if}
			{#if evolution == 3}
				Ev3
			{/if}
			{#if evolution == 4}
				Ev4
			{/if}
			{#if evolution == 5}
				Ev5
			{/if}
		</div>
	{/if}
</div>
<div 
class:ev1={evolution >= 1}
class:ev2={evolution >= 2}
class:ev3={evolution >= 3}
class:ev4={evolution >= 4}
class:ev5={evolution >= 5}
class:ev6={evolution >= 6}
>
	<Frame></Frame>
</div>



<style>
	.evolution {
		background: #1a1919;
		height:50px;
		z-index: 9999;
		position: relative;
		color:#fff;
	}
	.evolution_hint {
		position: absolute;
		top:8px;
		right:8px;
		width:30%;
		border-radius:12px;
		background-color: #1a1919;
		padding:32px;
	}
	








	:global(.ev1 > nav) {
		 top:50px !important;
	}
	:global(.ev1 > nav > .frame) {
		 max-width: 1110px !important;
	}
	:global(.ev1 > main) {
		height: calc( var(--mainH) - 50px ) !important;
	}
	:global(.ev1 .breadcrumb) {
		opacity:0 ! important;
	}

	:global(.ev1:not(.ev2) .sidebarinc) {
		position:absolute ! important;
		background: rgb(77, 86, 97);
		top: 106px;
		left: -8px !important;
		z-index: 9999;
		height: calc( var(--mainH) - 50px ) !important;
		width:251px;
		max-width:251px;
	}
	:global(.ev1:not(.ev2) .sidebarinc .side_menu_wrapper) {
		background: red;
	}
	







	:global(.ev2 > nav > .frame) {
		 max-width: var(--max-page) !important;
	}

	:global(.ev2 .breadcrumb) {
		opacity:1 ! important;
	}
		

</style>