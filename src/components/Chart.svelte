<script>
	import { onMount } from 'svelte';

	let svg = false;

	export let t = {
		title: '-',
		data: {
			content: '-'
		}
	}

	let number_of_points = 10;
	let xscale = 100/number_of_points;
	let path = '';

	for(let i = 0; i <= number_of_points; i++) {
		if(i==0) {
			path += 'M';
		} else {
			path += 'L';
		}
		path += (i*xscale) + ' ';
		path += (Math.floor((Math.random() * 101))) + ' ';
	}

	function set_dims() {
		svg.setAttribute('width', svg.width.baseVal.value + 'px');
		svg.setAttribute('height', svg.height.baseVal.value + 'px');
	}



	onMount(() => {
		//set width and height for printing purposes
		//this may need to be done after flow change and editing
		setTimeout(set_dims, 1000);
	});
	
</script>
<h4>{t.title}</h4>
<svg bind:this="{svg}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
	<path d="{path}" fill="none" stroke-width="2" vector-effect="non-scaling-stroke"/>
</svg>



<style>
	svg {
		width: 100%;
		height: calc(100% - 30px);
		border-bottom: 1px solid var(--table-row-border);
		margin-top: 8px;
		stroke: var(--eo-secondary-500);
	}
</style>