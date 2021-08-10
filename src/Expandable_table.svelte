<script>
	import Pagination from "./Pag.svelte";
	let pag_array = [5];
	let loading = -1; //-1 never loaded, 0 loaded, 1 loading, 2 unloaded

	let tablewrapper = false;


	function reveal() {
		if(loading < 0) {
			loading = 1;
			setTimeout(function() { 
				loading=0;
				tablewrapper.scrollLeft = 0;
			}, 3000);
		} else {
			loading = 0;
			tablewrapper.scrollLeft = 0;
		}
	}
	function conceal() {
		loading = 2;
	}
</script>
<code>
	Sample of table-in-table. Only first row is 'working'.
</code>
<div class="page">
	<div class="sticky-wrapper" bind:this="{tablewrapper}">
			<table class="table">
				<thead>
					<tr>
						<th>Record ID</th>
						<th>Status</th>
						<th>Site</th>
						<th>Event Time</th>
						<th>Location Level 1</th>
						<th>Legally Privileged</th>
						<th>Open Actions</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td class="nowrap"><div class="i i-incident i-l"><i></i></div> <b>485</b></td>
						<td class="nowrap">Awaiting Sign Off 1</td>
						<td class="nowrap">Amox Distribution Hub</td>
						<td class="nowrap">15 Jun 2021 02:04</td>
						<td class="nowrap">Main Office Block</td>
						<td>x</td>
						<td>
							<span class="badge badge-success">0/3</span>  
							{#if (loading == -1 || loading == 2)}
								<svg on:click|preventDefault="{reveal}" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
									<polygon points="16,22 6,12 7.4,10.6 16,19.2 24.6,10.6 26,12 "/>
								</svg>
							{:else}
								<svg on:click|preventDefault="{conceal}" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
									<polygon points="16,10 26,20 24.6,21.4 16,12.8 7.4,21.4 6,20 "/>
								</svg>
							{/if}
						</td>
					</tr>
					{#if loading == 1}
						<tr>
							<td colspan="100" class="nowrap" style="text-align:center">
								<div class="i i-spinner i-s" style="margin-right:16px"><i></i></div> Loading Links...
							</td>
						</tr>
					{:else if loading == 0}
						<tr class="subtable-holder">
							<td colspan="100">
								
								<table class="table subtable">
									<thead>
										<tr>
											<th>Record ID</th>
											<th>Status</th>
											<th>Creation Date</th>
											<th class="fat"></th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td class="nowrap"><div class="i i-action i-l"><i></i></div> <b>45</b></td>
											<td class="nowrap"><span class="badge badge-success">Complete</span></td>
											<td class="nowrap">15 Jun 2021 14:04</td>
											<td class="fat"></td>
										</tr>
										<tr>
											<td class="nowrap"><div class="i i-action i-l"><i></i></div> <b>47</b></td>
											<td class="nowrap"><span class="badge badge-success">Complete</span></td>
											<td class="nowrap">15 Jun 2021 14:04</td>
											<td class="fat"></td>
										</tr>
										<tr>
											<td class="nowrap"><div class="i i-action i-l"><i></i></div> <b>54</b></td>
											<td class="nowrap"><span class="badge">In Progress</span></td>
											<td class="nowrap">15 Jun 2021 14:04</td>
											<td class="fat"></td>
										</tr>
									</tbody>
								</table>
							</td>
						</tr>
					{/if}
					<tr>
						<td class="nowrap"><div class="i i-incident i-l"><i></i></div> <b>487</b></td>
						<td class="nowrap">Awaiting Investigation</td>
						<td class="nowrap">Amox Distribution Hub</td>
						<td class="nowrap">15 Jun 2021 02:04</td>
						<td class="nowrap">Main Office Block</td>
						<td>x</td>
						<td><span class="badge badge-error">4/5</span></td>
					</tr>
					<tr>
						<td class="nowrap"><div class="i i-incident i-l"><i></i></div> <b>491</b></td>
						<td class="nowrap">Awaiting Investigation</td>
						<td class="nowrap">Amox Distribution Hub</td>
						<td class="nowrap">15 Jun 2021 02:04</td>
						<td class="nowrap">Main Office Block</td>
						<td>x</td>
						<td><span class="badge">1/3</span></td>
					</tr>
					<tr>
						<td class="nowrap"><div class="i i-incident i-l"><i></i></div> <b>499</b></td>
						<td class="nowrap">Closed</td>
						<td class="nowrap">Amox Distribution Hub</td>
						<td class="nowrap">15 Jun 2021 02:04</td>
						<td class="nowrap">Main Office Block</td>
						<td>x</td>
						<td><span class="badge">2/10</span></td>
					</tr>
					<tr>
						<td class="nowrap"><div class="i i-incident i-l"><i></i></div> <b>502</b></td>
						<td class="nowrap">Awaiting Investigation</td>
						<td class="nowrap">Amox Distribution Hub</td>
						<td class="nowrap">15 Jun 2021 02:04</td>
						<td class="nowrap">Main Office Block</td>
						<td>x</td>
						<td><span class="badge badge-success">0/9</span></td>
					</tr>
					
				</tbody>
			</table>
		</div>
		<div class="pagination-holder">
			<Pagination 
				total_items=55
				current_page=0
				items_per_page_array={pag_array}
				items_per_page_index=0
				max_pagination_buttons=7
				loop={false}

				show_items_range={false}
				show_items_per_page_select={false}

				
			/>
		</div>
</div>
<style>
	svg {
		vertical-align: middle;
		cursor: pointer;
	}
</style>