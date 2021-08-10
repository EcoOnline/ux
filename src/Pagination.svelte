<script>
	import Pagination from "./Pag.svelte";

	/*
	DEMO 1
	*/
	//data
	let demo1 = [...Array(927).keys()];
	let demo1show = demo1.slice(0);
	//vars
	let total_items1 = demo1.length;
	let current_page1 = 0;
	let items_per_page_array1 = [5,10,20,50,100,500,1000]
	let items_per_page_index1 = 4;
	let number_of_buttons1 = 7;
	//show config 
	let show_items_range1 = true;
	let show_items_per_page_select1 = true;
	let show_prev_and_next1 = true;
	//functions
	function handlePagination1(event) {
		console.log('1', event.detail);
		let start = event.detail.items_per_page * event.detail.current_page;
		let end = start + event.detail.items_per_page;
		demo1show = demo1.slice(start, end);
	}



	/*
		DEMO2
	*/
	let demo2 = [
		"./images/corp/eco_corporate_presentation1.jpg",
		"./images/corp/eco_corporate_presentation2.jpg",
		"./images/corp/eco_corporate_presentation3.jpg",
	]
	let img;
	//vars
	let total_items2 = demo2.length;
	let current_page2 = 0;
	let items_per_page_array2 = [1]
	let items_per_page_index2 = 0;
	let number_of_buttons2 = 0;
	let loop2 = true;
	let show_items_range2 = false;
	let show_items_per_page_select2 = false;
	//functions
	function handlePagination2(event) {
		console.log('2', event.detail);
		img.style.backgroundImage = "url('" + demo2[event.detail.current_page] + "')";
	}

	/*
		DEMO3
	*/
	let demo3 = [
		"./images/corp/eco_corporate_presentation1.jpg",
		"./images/corp/eco_corporate_presentation2.jpg",
		"./images/corp/eco_corporate_presentation3.jpg",
	]
	let img3;
	//vars
	let total_items3 = demo3.length;
	let current_page3 = 0;
	let items_per_page_array3 = [1]
	let items_per_page_index3 = 0;
	let number_of_buttons3 = 1;
	let loop3 = true;
	let show_items_range3 = false;
	let show_items_per_page_select3 = false;
	//functions
	function handlePagination3(event) {
		console.log('3', event.detail);
		img3.style.backgroundImage = "url('" + demo2[event.detail.current_page] + "')";
	}



</script>

<div class="page">
	<div class="narrow">
		
		<div class="demo2">
			<div bind:this={img}></div>
		</div>


		<Pagination 
			total_items={total_items2}
			current_page={current_page2}
			items_per_page_array={items_per_page_array2}
			items_per_page_index={items_per_page_index2}
			max_pagination_buttons={number_of_buttons2}
			loop={loop2}

			show_items_range={show_items_range2}
			show_items_per_page_select={show_items_per_page_select2}

			on:pagination={handlePagination2}
		/>
		
	</div>
	<div class="wide">
		<div class="demo1">
			{#each demo1show as d}
				<div>item {d + 1}</div>
			{/each}
		</div>
		<Pagination
			total_items={total_items1}
			current_page={current_page1}
			items_per_page_array={items_per_page_array1}
			items_per_page_index={items_per_page_index1}
			max_pagination_buttons={number_of_buttons1}

			show_items_range={show_items_range1}
			show_items_per_page_select={show_items_per_page_select1}
			show_prev={show_prev_and_next1}
			show_next={show_prev_and_next1}

			on:pagination={handlePagination1}
		>
		</Pagination>
		<hr>
		<input type="checkbox" bind:checked={show_items_range1}> Show items range<br>
		<input type="checkbox" bind:checked={show_items_per_page_select1}> Show items per page<br>
		<input type="checkbox" bind:checked={show_prev_and_next1}> Show prev and next<br>
		{number_of_buttons1} Number of buttons<br>
		<select bind:value={number_of_buttons1}>
			<option value=0 selected={number_of_buttons1 == 0}>0</option>
			<option value=1 selected={number_of_buttons1 == 1}>1</option>
			<option value=5 selected={number_of_buttons1 == 5}>5</option>
			<option value=7 selected={number_of_buttons1 == 7}>7</option>
			<option value=9 selected={number_of_buttons1 == 9}>9</option>
			<option value=11 selected={number_of_buttons1 == 11}>11</option>
		</select>
	</div>
	<div>
		<div class="demo3">
			<div bind:this={img3}></div>
		</div>


		<Pagination 
			total_items={total_items3}
			current_page={current_page3}
			items_per_page_array={items_per_page_array3}
			items_per_page_index={items_per_page_index3}
			max_pagination_buttons={number_of_buttons3}
			loop={loop3}

			show_items_range={show_items_range3}
			show_items_per_page_select={show_items_per_page_select3}

			on:pagination={handlePagination3}
		/>
	</div>
</div>

<style>
	.demo1 {
		width: 100%;
		max-height: 200px;
		overflow: auto;
		border: 1px solid grey;
	}
	.demo1 > div{
		border-bottom: 1px dotted grey;
		padding: 5px;
	}

	.demo2 {
		width: 100%;
		height: 200px;
	}
	.demo2 > div{
		height:100%;
		background-size: cover;
		background-position: center center;
	}
	.demo3 {
		width: 100%;
		height: 400px;
	}
	.demo3 > div{
		height:100%;
		background-size: cover;
		background-position: center center;
	}

	hr {
		margin: 30px 0;
		height: 0;
		border: none;
		border-top: 1px solid rgba(0,0,0,0.4);
	}
	.page {
		display: flex;
		flex-direction: row;
		height:100%;
		padding: 10px;
		border: 1px solid red;
	}

	.page > div {

		flex: 2;
		margin: 10px;
		padding: 10px;
		height: clacl(100% - 20px);
		background: #c4c4c4;
	} 

	.page > div.narrow {
		flex: 1;
	}

	.page > div.wide {
		flex: 4;
	}
	select {
		border: 1px solid #d3d3d3;
		padding: 4px 8px;
		border-radius: 4px;
	}
	

</style>