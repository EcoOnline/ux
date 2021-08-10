<script>
	let thumb_types = [
		"normal",
		"fixed_widths",
		"fixed_heights",
		"cover",
		"squashed"

	]
	let thumb_type = thumb_types[0];


</script>


<div class="page">
	<table>
		<tbody>
			<tr>
				<td>Attribute</td>
				<td>Value</td>
			</tr>
			<tr>
				<td>Attribute</td>
				<td>Value</td>
			</tr>
			<tr>
				<td>Attribute</td>
				<td>Value</td>
			</tr>
			<tr>
				<td colspan="2">
					<select bind:value={thumb_type}>
						{#each thumb_types as th}
							<option value={th}>
								{th}
							</option>
						{/each}
					</select>
				</td>
			</tr>
			<tr>
				<td colspan="2">
					<div class="thumbs" 
						class:normal="{thumb_type == 'normal'}"
						class:fixed_widths="{thumb_type == 'fixed_widths'}"
						class:fixed_heights="{thumb_type == 'fixed_heights'}"
						class:cover="{thumb_type == 'cover'}"
						class:squashed="{thumb_type == 'squashed'}"
					>
						<div class="thumb" style="background-image: url('./images/marvel/captain_portrait.png')">
							<img src="./images/marvel/captain_portrait.png" alt="captain_portrait" />
						</div>
						<div class="thumb" style="background-image: url('./images/marvel/ironman_landscape.png')">
							<img src="./images/marvel/ironman_landscape.png" alt="ironman_landscape" />
						</div>
						<div class="thumb" style="background-image: url('./images/marvel/groot_portrait_skinny.png')">
							<img src="./images/marvel/groot_portrait_skinny.png" alt="groot_portrait_skinny" />
						</div>
						<div class="thumb" style="background-image: url('./images/marvel/spiderman_landscape_skinny.png')">
							<img src="./images/marvel/spiderman_landscape_skinny.png" alt="spiderman_landscape_skinny" />
						</div>


						<div class="thumb" style="background-image: url('./images/marvel/rogue_portrait.png')">
							<img src="./images/marvel/rogue_portrait.png" alt="rogue_portrait" />
						</div>
						<div class="thumb" style="background-image: url('./images/marvel/rocket_landscape.png')">
							<img src="./images/marvel/rocket_landscape.png" alt="rocket_landscape" />
						</div>
						<div class="thumb" style="background-image: url('./images/marvel/spiderman_landscape_skinny.png')">
							<img src="./images/marvel/spiderman_landscape_skinny.png" alt="spiderman_landscape_skinny" />
						</div>
						<div class="thumb" style="background-image: url('./images/marvel/ironman_landscape.png')">
							<img src="./images/marvel/ironman_landscape.png" alt="ironman_landscape" />
						</div>

					</div>
				</td>
			</tr>
		</tbody>
	</table>
</div>
<style>
	.page {
		margin:16px auto;
		background:#fff;
		max-width:900px;
		border-radius:16px;
		box-shadow: 0 4px 4px rgb(0 0 0 / 3%);
		box-sizing:border-box;
		padding:16px;
	}
	table {
		width:100%;
	}
	table td {
		padding:4px;
	}
	.thumbs {
		background: #fafafa;
		display: flex;
		flex-direction: row;
		flex:0 1 auto;
		justify-content: space-evenly;
		flex-wrap:wrap;
	}
	.thumb {
		background-color: #fff;
		display:inline-block;
		text-align:center;
		width: 184px;
		height:100px;
		vertical-align: middle;
		box-shadow: 0 4px 4px rgb(0 0 0 / 3%);
		margin-bottom:16px;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.thumb img {
		/*max-width:150px;*/
		max-width: 184px;
		max-height:100px;
	}

	

	.thumbs.normal .thumb {
		background-image: none ! important;
	}


	.thumbs.fixed_widths .thumb {
		background-image: none ! important;
		width:100px;
		vertical-align: top;
		height:auto;
		align-self:end;
		background-color: transparent;
	}
	.thumbs.fixed_widths .thumb img {
		width:100px;
		height:auto;
		max-height:999px;

	}

	.thumbs.fixed_heights {
		justify-content: start;
	}
	.thumbs.fixed_heights .thumb {
		background-image: none ! important;
		height:100px;
		vertical-align: top;
		width: auto;
		margin-right:16px;
	}
	.thumbs.fixed_heights .thumb img {
		height:100px;
		width:auto;
	}


	.thumbs.cover .thumb {
		background-position: center center;
    	background-size: cover;
	}
	.thumbs.cover .thumb img {
		display:none ! important;
	}


	.thumbs.squashed {
		justify-content: start;
	}
	.thumbs.squashed .thumb {
		background-image: none ! important;
		height:100px;
		width: 100px;
		margin-right:16px;
	}
	.thumbs.squashed .thumb img {
		height:100px;
		width:100px;
	}

</style>