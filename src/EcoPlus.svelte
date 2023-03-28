<script>
	import EcoPlusForm from "./EcoPlusForm.svelte";
	import EcoPlusSDS from "./EcoPlusSDS.svelte";

	let sel;
</script>

<div id="ecoplus_wrapper">
	<div>
		<EcoPlusForm bind:selected={sel}/>
	</div>
	<div class='sds'>
		<EcoPlusSDS bind:selected={sel}/>
	</div>
</div>


<style>
	#ecoplus_wrapper {
		display: flex;
		flex-direction: row;
		width:100%;
		height:100%;
	}
	#ecoplus_wrapper > * {
		display:block;
		flex:1;
		height:100%;
		overflow: auto;
	}

	#ecoplus_wrapper > .sds {
		flex: 1.5;
	}
	

</style>