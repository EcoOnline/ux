<script>
	/*
		start 8:37
		functional 21:45
	*/


	let two_col = true;

	let list = [
		{
			title: "Red, Amber, Green",
			scoring: true,
			custom: true,
			answers: [
				{
					title: "Red",
					score: -10,
					na: false,
					alert: false
				},
				{
					title: "Amber",
					score: 0,
					na: false,
					alert: false
				},
				{
					title: "Green",
					score: 1,
					na: false,
					alert: false
				},
				{
					title: "Not applicable",
					score: 0,
					na: true,
					alert: false
				}
			]
		},
		{
			title: "1-10 (3x Weighted)",
			scoring: true,
			custom: true,
			answers: [
				{
					title: "1",
					score: 3,
					na: false,
					alert: false
				},
				{
					title: "2",
					score: 6,
					na: false,
					alert: false
				},
				{
					title: "3",
					score: 9,
					na: false,
					alert: false
				},
				{
					title: "4",
					score: 12,
					na: false,
					alert: false
				},
				{
					title: "5",
					score: 15,
					na: false,
					alert: false
				},
				{
					title: "6",
					score: 18,
					na: false,
					alert: false
				},
				{
					title: "7",
					score: 21,
					na: false,
					alert: false
				},
				{
					title: "8",
					score: 24,
					na: false,
					alert: false
				},
				{
					title: "9",
					score: 27,
					na: false,
					alert: false
				},
				{
					title: "10",
					score: 30,
					na: false,
					alert: false
				}
			]
		}
	]

	let list_selected = false;
	let answer_selected = false;

	function add_to_list() {
		let temp = {
			title: "New item",
			scoring: true,
			custom: true,
			answers: [
				{
					title: "A",
					score: 0,
					na: false,
					alert: false
				},
				{
					title: "B",
					score: 1,
					na: false,
					alert: false
				}
			]
		};

		list.push(temp);
		list_selected = list[list.length-1];
		answer_selected = false;
	}
	function add_to_answers() {
		let temp = {
			title: "New Answer",
			score: 0,
			na: false
		}

		list_selected.answers.push(temp);
		list_selected.answers = list_selected.answers;
	}

	function delete_answer(a) {
		let del_list = list_selected.answers.filter( (el) => { 
				return el != a; 
		});
		list_selected.answers = del_list;
	}
	
</script>


<div class="page">
	<div class="col1">
		<div class="col_header">
			Scoring Lists
			<a class="btn btn-inline btn-small float-right" href="/" on:click|preventDefault={add_to_list}>Add scoring list</a>
		</div>
		<div class="col_body">
			<div class="poc_list">
			{#each list as l}
				<div class="item" on:click="{ () => { list_selected = l; answer_selected = false;}}" class:selected="{l == list_selected}">{l.title}</div>
			{/each}
			</div>

			<hr>
			<input type="checkbox" bind:checked={two_col}/> <code>POC 2 column</code>
		</div>
			
	</div>
	{#if list_selected}
		{#if two_col}
			<div class="col2 wide">
				<div class="col_header">
					<input bind:value="{list_selected.title}" type="text" style="margin-bottom:32px;">
				</div>
				<div class="col_body">
					<label><input type="checkbox" bind:checked={list_selected.scoring} /> These answers affect the score</label>
					{#if list_selected.scoring}
						<label><input type="checkbox" bind:checked={list_selected.custom} /> Allow Custom Scoring Weighted Scoring per Question</label>
					{/if}

					<table type="text" style="margin-top:32px;">
						<thead>
							<tr>
								<th>Answer</th>
								<th>NA</th>
								<th>Score</th>
								<th>Alert</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{#each list_selected.answers as a}
								<tr>
									<td><input bind:value="{a.title}" type="text"></td>
									<td><input type="checkbox" bind:checked={a.na} disabled={!list_selected.scoring}/></td>
									<td>
										{#if list_selected.scoring && !a.na}
											<input bind:value="{a.score}" type="number" class="num_input">
										{/if}

									</td>
									<td><input type="checkbox" bind:checked={a.alert}/></td>
									
									<td>
										{#if list_selected.answers.length > 2}
											<span class="aw-datepicker-clear" on:click="{ () => {delete_answer(a)}}"></span>
			  							{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>

					<button on:click={add_to_answers} class="btn btn-inline btn-standard">Add answer</button>
					<button on:click={ () => { list = list; list_selected=false}} class="btn btn-inline">Save</button>
				</div>
			</div>
		{:else}
			<div class="col1">
				<div class="col_header">
					<input bind:value="{list_selected.title}" type="text" style="margin-bottom:32px;">
				</div>
				<div class="col_body">
					<label><input type="checkbox" bind:checked={list_selected.scoring} /> These answers affect the score</label>
					{#if list_selected.scoring}
						<label><input type="checkbox" bind:checked={list_selected.custom} /> Allow Custom Scoring Weighted Scoring per Question</label>
					{/if}
					<div class="poc_list">
						{#each list_selected.answers as a}
							<div class="item" on:click="{ () => answer_selected = a}" class:selected="{a == answer_selected}">
								{a.title}:
								{#if list_selected.scoring && list_selected.custom && !a.na}
									{a.score}
								{:else}
									-
								{/if}
							</div>
						{/each}
					</div>

					<button on:click={add_to_answers} class="btn btn-inline btn-standard">Add answer</button>
					<button on:click={ () => { list = list; list_selected=false}} class="btn btn-inline">Save</button>
				</div>
			</div>
			{#if answer_selected}
				<div class="col1">
					<div class="col_header">
						<input bind:value="{answer_selected.title}" type="text" style="margin-bottom:32px;">
					</div>
					<div class="col_body">
						<label><input type="checkbox" bind:checked={answer_selected.na} /> Na</label>
						{#if !answer_selected.na}
							<input bind:value="{answer_selected.score}" type="number" style="margin:32px 0;">
						{/if}
						<label><input type="checkbox" bind:checked={answer_selected.alert} /> Alert</label>
					
						<button on:click={ () => { list_selected.answers = list_selected.answers; answer_selected = false;}} class="btn btn-inline">Save</button>
					</div>
				</div>
			{/if}

		{/if}
	{/if}
</div>

<style>

	.page {
		display:flex;
		flex-direction: row;
		flex-flow: row;
		height:auto;
		width:1033px;
		max-width:100%;
		margin:0 auto;
	}
	.col1, .col2 {
		border-radius:4px;
		margin:8px;
		background:#fff;
		flex:2;
	}
	.col1 {
		max-width:328px;
	}
	.col_header {
		border-bottom:1px solid rgba(0,0,0,0.2);
		height: 64px;
		padding:16px;
	}
	.col_body {
		padding:16px;
	}

	label {
		display:block;
	}

	input {
		padding: 4px 16px;
	}

	.num_input {
		width:80px;
	}

	span.aw-datepicker-clear {
		margin:0;
		float:none;
		background-position: 0 0;
	}

	.poc_list {
		margin:32px 0;
	}
	.item {
		padding:8px;
		cursor:pointer;
		border-top: 1px solid #dee7f0;
	}
	.selected {
		background:#5bae4f;
		color:#fff;
	}

</style>