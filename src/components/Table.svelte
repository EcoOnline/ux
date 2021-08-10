<script>
	import Pagination from "./Pagination.svelte";

	export let t = {
		data: {
			fetch: 10,
			endpoint: './mock/user.json'
			
		}
	}
	export let columns = [];
	export let rows = [];

	//vars
	$:total_items = rows.length;



	let current_page = 0;
	let items_per_page_array = [5]
	let items_per_page_index = 0;
	let items_to_show = items_per_page_array[items_per_page_index];
	let number_of_buttons = 5;

	let start = 0;
	$: end = start + items_to_show;
	$: rows_to_show = rows.slice(start, end)




	let tablewrapper = false;


	if(t.data.endpoint) {
		getMock().then(json => {
			//little white lie .. I'm actually pulling all the table data first
			//rather than pulling the other 'pages' on print
			let total_data = json.slice(0, t.data.fetch);

			total_data.forEach( (row, index) => {
				if(index == 0) {
					columns = Object.keys(row);
				}
				rows.push(Object.values(row));
			})
			rows = rows; //update array
		});
	} else {
		console.log('no endpoint')
	}

	async function getMock() {
		const res = await fetch(t.data.endpoint);
		const json = await res.json();
		if (res.ok) {
			return json;
		} else {
			throw new Error(text);
		}
	}

	function handle_pagination(event) {
		start = event.detail.items_per_page * event.detail.current_page;
	}

</script>

<h4>{t.title}</h4>
<div class="sticky-wrapper" bind:this="{tablewrapper}" style="max-height: calc(100% - 80px); margin-top:8px">
	<table class="table">
		<thead>
			<tr>
				{#each columns as col}
					<th>{col}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each rows_to_show as tr}
				<tr>
					{#each tr as td}
						<td>{td}</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
<Pagination 
	total_items={total_items}
	current_page={current_page}
	items_per_page_array={items_per_page_array}
	items_per_page_index={items_per_page_index}
	max_pagination_buttons={number_of_buttons}
	loop={false}
	show_items_range={false}
	show_items_per_page_select={false}

	on:pagination={handle_pagination}
/>
