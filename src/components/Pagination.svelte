<script>

	/*
	bugs be here


	behaviour is designed to support

	<(1)2 3 4 5 . 9 >
	< 1(2)3 4 5 . 9 >
	< 1 2(3)4 5 . 9 >
	< 1 2 3(4)5 . 9 >
	< 1 . 4(5)6 . 9 >
	< 1 . 5(6)7 8 9 >
	< 1 . 5 6(7)8 9 >
	< 1 . 5 6 7(8)9 >
	< 1 . 5 6 7 8(9) >



	*/
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';

	let loaded = false;


	export let trigger_request_on_load = true;
	export let total_items;
	export let current_page = 0;
	export let items_per_page_array = [10,20,50,100];
	export let items_per_page_index = 0;
	export let max_pagination_buttons = 7; // must be zero or odd
	export let loop = false;



	export let show_items_range = true;
	export let show_items_per_page_select = true;
	export let show_prev = true;
	export let show_next = true;




	$: items_per_page = items_per_page_array[items_per_page_index];
	let items_marker = items_per_page_array[items_per_page_index];

	$: first_page_item = current_page * items_per_page + 1;
	$: last_page_item = Math.min(first_page_item + items_per_page-1, total_items);
	$: number_of_pages = Math.ceil(total_items/items_per_page);

	//actual number of buttons to show depends on current page and whether first and last are showing
	let number_of_buttons = max_pagination_buttons;
	//console.log(number_of_buttons, number_of_pages)
	let buttons_count_array = [];
	
	/*$: {
		let n = number_of_buttons;
		if(show_last && current_page < number_of_pages - number_of_buttons)
		(max_pagination_buttons == 0 ? 0 : (max_pagination_buttons) + (show_first?2:0) + (show_last?2:0))
	}*/

	$: {
		let i = items_per_page;
		if(items_per_page !== items_marker) {
			current_page = 0;
			items_marker = items_per_page;
		}
	}

	$: {
		let i = items_per_page;
		let c = current_page;
		pagination_change();
	}

	$: {
		number_of_buttons = max_pagination_buttons;
		if(number_of_buttons > 0) {
			buttons_count_array = [...Array(Math.min(number_of_buttons, number_of_pages)).keys()];
		}
	}


	const dispatch = createEventDispatcher();
	function prev() {

		current_page -= 1;
		if(current_page < 0) {
			current_page = number_of_pages - 1;
		}
	}
	function next() {
		current_page += 1;
		if(current_page >= number_of_pages) {
			current_page = 0;
		}
	}
	function go_to_page(n) {
		current_page = n;
	}

	function pagination_change() {
		//may be triggered on load and anytime items per page changes or current page or total items
		dispatch('pagination', {
			current_page: current_page,
			items_per_page: items_per_page,
			total_items: total_items
		});
	}


	onMount(() => {
		loaded = true;
		if(trigger_request_on_load) {
			//console.log('pagination call from onMount');
			pagination_change();
		}
	});

</script>

<div class='pagination_wrapper'>
	{#if total_items}
		{#if show_items_range}
			<span class="total_items">{first_page_item} – {last_page_item} / {total_items}</span> 
		{/if}
		{#if show_items_per_page_select}
			<span class="select_items">
				<select bind:value="{items_per_page_index}">
					{#each items_per_page_array as item, ind}
						<option value="{ind}">{item}</option>
					{/each}
				</select>
			</span>
		{/if}

		{#if number_of_pages > 1}
			<div class="button_wrapper">

				{#if show_prev}
					<button on:click="{prev}" disabled="{!loop && current_page < 1}">&lt;</button>
				{/if}
				{#if number_of_buttons !== 0}
					{#each buttons_count_array as i}
						{#if i == 0 && number_of_buttons == 1}
							<button class="selected">{current_page+1}</button>
						{:else if i == 0}
							<!-- first button -->
							<button on:click="{() => go_to_page(0)}" class:selected={current_page == 0}>1</button>
						{:else if i == number_of_buttons-1}
							<!-- last button -->
							<button on:click="{() => go_to_page(number_of_pages-1)}" class:selected={current_page == number_of_pages-1}>{number_of_pages}</button>
						{:else}
							{#if i == 1 && (i!==number_of_pages-1)  && current_page >= Math.floor(number_of_buttons/2)+1 }
								<!-- second button dots -->
								<button class="refrain">...</button>
							{:else if (i == number_of_buttons - 2) && (number_of_buttons !== number_of_pages-1) && (current_page + Math.floor(number_of_buttons/2) < number_of_pages-1) }
								<!-- n - 1 button dots -->
								<button class="refrain">...</button>
							{:else}
								{#if current_page >= number_of_pages - Math.floor(number_of_buttons/2 + 1) }
									<button on:click="{() => { go_to_page(number_of_pages - (number_of_buttons - i)) } }" class:selected={current_page == (number_of_pages - (number_of_buttons - i))} >{number_of_pages - (number_of_buttons - i)+1}</button>
								{:else if current_page < Math.floor(number_of_buttons/2) }
									<button on:click="{() => go_to_page(i)}" class:selected={current_page == i} >{i+1}</button>
								{:else}
									<button on:click="{() => { go_to_page(i+(current_page - Math.floor(number_of_buttons/2))) } }" class:selected={current_page == (i+(current_page - Math.floor(number_of_buttons/2)))} >{i+1+(current_page - Math.floor(number_of_buttons/2))}</button>
								{/if}
							{/if}
						{/if}
					{/each}
				{/if}

				{#if show_next}
					<button on:click="{next}" disabled="{!loop && current_page >= number_of_pages -1}">&gt;</button>
				{/if}
			</div>
		{/if}
	{/if}
</div>

<style>
	.pagination_wrapper {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
	}
	.pagination_wrapper > *{
		padding: 8px;
	}
	.button_wrapper {
		display: inline-block;
		overflow: visible;
	}
	.total_items {

	}
	button:disabled {
		opacity: 0.2;
	}
	button {
		width: 32px;
		height: 32px;
		line-height: 32px;
		text-align: center;
		border-radius: 16px;
		border: 1px solid var(--eo-primary-500);
		background: #fff;
		color: var(--eo-primary-500);
		float: left;
		margin: 4px;
		padding: 0;
	}
	button.selected {
		background: var(--eo-primary-500);
		color: #fff;
	}
	button.refrain {
		border-color: transparent;
		background-color: transparent;
	}

	select {
		border: 1px solid #d3d3d3;
		padding: 4px 8px;
		border-radius: 4px;
	}

	.total_items {
		font-size: 13px;
		width: 130px;
		text-align: right;
	}
	

</style>