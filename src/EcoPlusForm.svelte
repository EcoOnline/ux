<script>
	
	let form_data = [
		{
			/* product name obtained by ML */
			ml: {
				confirmed: false,
				value_obtained: true,
				value: "1,1,1-Trifluoroacetone",
				rects: [{
					x0: 220,
					y0: 180,
					x1: 397,
					y1: 210
				}]
			},
			f: {
				item_type: "input_text",
				id: "f1",
				label: "Product name",
				placeholder: '',
				hint: false,
				optional: true,
				answer: "1,1,1-Trifluoroacetone",
			}
		},
		{
			/* 
				reach obtained by earlier version not ml 
				ml has no suggestions
			*/
			ml: {
				confirmed: false,
				value_obtained: false,
				value: "",
				rects: []
			},
			f: {
				item_type: "input_text",
				id: "f2",
				label: "REACH Reg. No., comments",
				placeholder: '',
				hint: false,
				optional: true,
				answer: "None available",
			}
		},
		{
			/* 
				cas no obtained by ML 
				ML in wrong place
			*/
			ml: {
				confirmed: false,
				value_obtained: true,
				value: "T62804",
				rects: [{
					x0: 216,
					y0: 207,
					x1: 270,
					y1: 227
				}]
			},
			f: {
				item_type: "input_text",
				id: "f3",
				label: "CAS No.",
				placeholder: '',
				hint: false,
				optional: true,
				answer: "T62804",
			}
		}
	];

	export let selected;// = form_data[0];
</script>

<div class='wrapper'>
	{#each form_data as item}
		<div class='form_item' class:selected={selected && selected.f.id == item.f.id}>
			<label>{item.f.label}</label>
			<input type="text" class="form-control" bind:value={item.f.answer}/>
			<div class="shield" on:click={ () => { selected = item }}></div>
		</div>
	{/each}
</div>


<div style="margin:32px;text-align:center">
	<div style='margin:0 auto;width:240px;height:8px;overflow:hidden;border-radius:4px;background:#E4E7EB'>
		<div class='simulated-progress'></div>
	</div>
</div>
	


<style>
	.simulated-progress {
		width: 0px;
		border-radius:4px;
		background-color:#1CD994;
		height:8px;
		animation: simulation 3s linear infinite;
	}

	@keyframes simulation {
  		0% {width: 0%;}
  		30% {width: 10%;}
  		70% {width: 90%;}
  		100% {width: 100%;}
	}



	.wrapper {
		position: relative;
	}

	.form_item {
		border-bottom:1px solid #eee;
		padding:8px 16px;
		margin:8px 16px 0 16px;
		border-radius: 8px;
		position: relative;
		min-height: 60px;
	}
	.form_item.selected {
		z-index: 99;
		box-shadow: 0 0 16px rgba(23,173,211,0.6);
	}
	.shield {
		position: absolute;
		width:100%;
		height:100%;
		top:0;
		left: 0;
	}
	.form-control {
		max-width: 280px;
		float:right;
		padding:8px 16px;
	}
</style>