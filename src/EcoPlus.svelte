<script>
	import EcoPlusSDS from "./EcoPlusSDS.svelte";
</script>

<div id="ecoplus_wrapper">
	<div>
		EcoPlus form
	</div>
	<div>
		<EcoPlusSDS />
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
	

</style>