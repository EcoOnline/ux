<script>
	

	export let bc_array = []; //ordered array not including home which is always prepended
	export let contractable = true;
	export let contracted = true;

	function toggle_contract() {
		contracted = !contracted;
	}
	
</script>

<div class="breadcrumb" class:contracted>
	<a href="/"><i class='i-platform-blue i-16'></i></a> 
	{#each bc_array as link, index}
		<!-- paint contractor -->
		{#if bc_array.length > 5 && index == 1 && contractable}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<span on:click={toggle_contract}>
				{#if contracted}
					<!--[<i class='i-arrow-right i-16'></i>]-->
					<span class='separator'>/</span> <a>...</a> 
				{:else}
				<span class='separator'>/</span> <i class='contractor i-arrow-left i-16'></i> 
				{/if}
			</span>
		{/if}

		
		<span class='link' class:essential={index == 0 || index == bc_array.length-2  || index == bc_array.length-1}>
			<span class='separator'>/</span>

			<!-- paint link-->
			{#if link.url}
				<a href="{link.url}"><span>{link.text}</span></a>
			{:else}
				<span>{link.text}</span>
			{/if}

		</span>
		


	{/each}
</div>

<style>
	.breadcrumb { 
		display: flex;
		padding-top:4px;
		height:24px;
	}
	.breadcrumb a {
		color:var(--eo-primary-500);
		text-decoration: underline !important;
	}
	.breadcrumb a span {
		text-decoration: underline !important;
	}
	.breadcrumb span, .breadcrumb a {
		display: inline-block;
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
		vertical-align: top;
	}
	.breadcrumb span.separator {
		opacity:0.5;
		min-width:15px;
		max-width:30px;
		text-align: center;
		transition: all linear 0.5s;
	}
	.breadcrumb .contractor {
		opacity:0.5;
		text-align: center;
	}
	.breadcrumb .link {
		max-width:200px;
		transition: all linear 0.5s;
	}
	.breadcrumb.contracted .link:not(.essential) {
		max-width:0;
	}
	.breadcrumb.contracted .link:not(.essential) ~ .separator {
		opacity:0;
		max-width: 0;
		min-width: 0;
	}


</style>