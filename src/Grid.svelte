<script>
	import { onMount } from 'svelte';


	let grid_opacity = 5;
	let columns = 18;
	let col_w = 48;
	let gutter = 0;
	let outside_margin = 0;

	$: cols_width = columns * col_w + (columns-1) * gutter;
	$: page_width =  cols_width + outside_margin*2;

	function handleResize() {
		console.log(this, '??');
		gutter = getComputedStyle(document.documentElement).getPropertyValue('--gutter_num');
		outside_margin = getComputedStyle(document.documentElement).getPropertyValue('--margin_num');
	}

	onMount(() => {
		handleResize();
	})
	
</script>

<svelte:window on:resize={handleResize}/>

<div class="nav">
	<div class="page" style="height:100%;width:{page_width}px;border-color:rgba(0,0,0,{grid_opacity/100})">
		<div class="cols" style="height:100%;width:{cols_width}px;max-width: calc(100% - {outside_margin*2}px);">
			<svg width="128" height="32" viewBox="0 0 128 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-top:12px;margin-right:16px">
				<path d="M15.91 10.91L16.5 9.59C16.94 8.62 17.91 8 18.97 8C19.69 8 20.37 8.28 20.88 8.79L21.58 9.49C20.34 10.17 19.5 11.49 19.5 13V14.88C19.5 18.24 17.11 21.13 13.81 21.76L6.91 23.08C6.56 23.15 6.28 23.39 6.16 23.72C6.04 24.05 6.1 24.42 6.32 24.69C10.19 29.48 16.01 30.92 16.26 30.98C16.34 30.99 16.42 31 16.5 31C16.58 31 16.66 30.99 16.73 30.97C16.87 30.94 30 27.64 30 15V3C30 1.9 29.1 1 28 1H5C3.9 1 3 1.9 3 3V18.26L5 16.26V3H28V15C28 25.3 18.22 28.49 16.5 28.96C15.56 28.69 11.96 27.51 9.05 24.7L14.19 23.72C18.43 22.91 21.5 19.19 21.5 14.88V13C21.5 11.9 22.4 11 23.5 11H24.35C24.93 11 25.22 10.3 24.81 9.89L22.3 7.38C21.41 6.49 20.23 6 18.97 6C17.12 6 15.44 7.09 14.68 8.77L14.16 9.92L0 24.09V26.92L15.71 11.21C15.8 11.12 15.86 11.02 15.91 10.91Z" fill="#1A1919"/>
				<path d="M39 22V8H47.96V10.01H41.26V13.9H47.34V15.91H41.26V20H47.96V22H39Z" fill="#1A1919"/>
				<path d="M54.39 22.2398C53.64 22.2398 52.97 22.1098 52.38 21.8598C51.79 21.6098 51.3 21.2398 50.9 20.7698C50.5 20.2998 50.19 19.7198 49.98 19.0498C49.77 18.3798 49.66 17.6198 49.66 16.7898C49.66 15.9598 49.77 15.2098 49.98 14.5298C50.19 13.8598 50.5 13.2798 50.9 12.8098C51.3 12.3398 51.8 11.9698 52.38 11.7198C52.97 11.4698 53.64 11.3398 54.39 11.3398C55.43 11.3398 56.29 11.5698 56.96 12.0398C57.63 12.5098 58.12 13.1298 58.42 13.9098L56.62 14.7498C56.47 14.2698 56.22 13.8798 55.85 13.5998C55.48 13.3098 55 13.1698 54.4 13.1698C53.6 13.1698 52.99 13.4198 52.58 13.9198C52.17 14.4198 51.97 15.0698 51.97 15.8698V17.7298C51.97 18.5298 52.17 19.1798 52.58 19.6798C52.99 20.1798 53.59 20.4298 54.4 20.4298C55.04 20.4298 55.55 20.2698 55.93 19.9598C56.31 19.6498 56.61 19.2298 56.84 18.7098L58.5 19.5898C58.15 20.4498 57.63 21.1098 56.94 21.5698C56.24 22.0098 55.39 22.2398 54.39 22.2398Z" fill="#1A1919"/>
				<path d="M64.56 22.2398C63.84 22.2398 63.18 22.1098 62.59 21.8598C61.99 21.6098 61.49 21.2398 61.08 20.7698C60.66 20.2998 60.34 19.7198 60.12 19.0498C59.89 18.3798 59.78 17.6198 59.78 16.7898C59.78 15.9598 59.89 15.2098 60.12 14.5298C60.35 13.8598 60.67 13.2798 61.08 12.8098C61.49 12.3398 62 11.9698 62.59 11.7198C63.18 11.4698 63.84 11.3398 64.56 11.3398C65.28 11.3398 65.94 11.4698 66.54 11.7198C67.13 11.9698 67.64 12.3398 68.05 12.8098C68.46 13.2798 68.79 13.8598 69.01 14.5298C69.24 15.2098 69.35 15.9598 69.35 16.7898C69.35 17.6198 69.24 18.3698 69.01 19.0498C68.78 19.7298 68.46 20.2998 68.05 20.7698C67.64 21.2398 67.13 21.6098 66.54 21.8598C65.94 22.1098 65.28 22.2398 64.56 22.2398ZM64.56 20.4098C65.31 20.4098 65.91 20.1798 66.37 19.7198C66.82 19.2598 67.05 18.5698 67.05 17.6598V15.8998C67.05 14.9798 66.82 14.2998 66.37 13.8398C65.91 13.3798 65.31 13.1498 64.56 13.1498C63.81 13.1498 63.21 13.3798 62.76 13.8398C62.31 14.2998 62.08 14.9898 62.08 15.8998V17.6598C62.08 18.5798 62.31 19.2598 62.76 19.7198C63.21 20.1798 63.81 20.4098 64.56 20.4098Z" fill="#1A1919"/>
				<path d="M77.54 22.2403C76.63 22.2403 75.8 22.0803 75.06 21.7703C74.32 21.4603 73.68 21.0003 73.15 20.3903C72.62 19.7803 72.21 19.0303 71.93 18.1203C71.64 17.2203 71.5 16.1803 71.5 15.0003C71.5 13.8203 71.64 12.7803 71.93 11.8803C72.22 10.9803 72.62 10.2203 73.15 9.61025C73.68 9.00025 74.31 8.54025 75.06 8.23025C75.8 7.92025 76.63 7.76025 77.54 7.76025C78.45 7.76025 79.27 7.92025 80.02 8.23025C80.76 8.54025 81.4 9.01025 81.93 9.61025C82.46 10.2203 82.87 10.9703 83.15 11.8803C83.44 12.7803 83.58 13.8203 83.58 15.0003C83.58 16.1803 83.44 17.2203 83.15 18.1203C82.86 19.0203 82.45 19.7803 81.93 20.3903C81.4 21.0003 80.77 21.4603 80.02 21.7703C79.27 22.0803 78.45 22.2403 77.54 22.2403ZM77.54 20.2303C78.07 20.2303 78.57 20.1403 79.01 19.9503C79.46 19.7603 79.84 19.4903 80.15 19.1303C80.46 18.7703 80.71 18.3403 80.88 17.8303C81.05 17.3203 81.14 16.7403 81.14 16.1003V13.8903C81.14 13.2503 81.05 12.6703 80.88 12.1603C80.71 11.6503 80.46 11.2203 80.15 10.8603C79.84 10.5003 79.45 10.2303 79.01 10.0403C78.56 9.85025 78.07 9.76025 77.54 9.76025C76.99 9.76025 76.5 9.85025 76.06 10.0403C75.62 10.2303 75.24 10.5003 74.93 10.8603C74.62 11.2203 74.37 11.6503 74.2 12.1603C74.03 12.6703 73.94 13.2503 73.94 13.8903V16.1003C73.94 16.7403 74.03 17.3203 74.2 17.8303C74.37 18.3403 74.62 18.7703 74.93 19.1303C75.24 19.4903 75.62 19.7603 76.06 19.9503C76.49 20.1403 76.99 20.2303 77.54 20.2303Z" fill="#1A1919"/>
				<path d="M85.85 21.9998V11.5698H88.04V13.2998H88.14C88.37 12.7398 88.71 12.2698 89.17 11.8998C89.63 11.5298 90.26 11.3398 91.06 11.3398C92.13 11.3398 92.96 11.6898 93.56 12.3898C94.15 13.0898 94.45 14.0898 94.45 15.3898V21.9998H92.26V15.6598C92.26 14.0298 91.6 13.2098 90.29 13.2098C90.01 13.2098 89.73 13.2498 89.46 13.3198C89.19 13.3898 88.94 13.4998 88.73 13.6498C88.52 13.7998 88.35 13.9798 88.22 14.2098C88.09 14.4398 88.03 14.6998 88.03 15.0098V21.9998H85.85Z" fill="#1A1919"/>
				<path d="M99.46 22.0002C98.71 22.0002 98.15 21.8102 97.79 21.4302C97.42 21.0502 97.24 20.5202 97.24 19.8402V7.16016H99.43V20.2102H100.87V22.0002H99.46Z" fill="#1A1919"/>
				<path d="M103.81 9.71008C103.36 9.71008 103.02 9.60008 102.82 9.39008C102.61 9.18008 102.51 8.90008 102.51 8.57008V8.22008C102.51 7.89008 102.61 7.61008 102.82 7.40008C103.03 7.19008 103.36 7.08008 103.81 7.08008C104.26 7.08008 104.59 7.19008 104.79 7.40008C104.99 7.61008 105.09 7.89008 105.09 8.22008V8.56008C105.09 8.89008 104.99 9.17008 104.79 9.38008C104.59 9.60008 104.27 9.71008 103.81 9.71008ZM102.71 11.5701H104.9V22.0001H102.71V11.5701Z" fill="#1A1919"/>
				<path d="M107.76 21.9998V11.5698H109.95V13.2998H110.05C110.28 12.7398 110.62 12.2698 111.08 11.8998C111.54 11.5298 112.17 11.3398 112.97 11.3398C114.04 11.3398 114.87 11.6898 115.47 12.3898C116.06 13.0898 116.36 14.0898 116.36 15.3898V21.9998H114.17V15.6598C114.17 14.0298 113.51 13.2098 112.2 13.2098C111.92 13.2098 111.64 13.2498 111.37 13.3198C111.1 13.3898 110.85 13.4998 110.64 13.6498C110.43 13.7998 110.26 13.9798 110.13 14.2098C110 14.4398 109.94 14.6998 109.94 15.0098V21.9998H107.76Z" fill="#1A1919"/>
				<path d="M123.37 22.2398C122.62 22.2398 121.95 22.1098 121.36 21.8598C120.77 21.6098 120.27 21.2398 119.86 20.7698C119.45 20.2998 119.13 19.7198 118.91 19.0498C118.69 18.3798 118.58 17.6198 118.58 16.7898C118.58 15.9598 118.69 15.2098 118.91 14.5298C119.13 13.8598 119.45 13.2798 119.86 12.8098C120.27 12.3398 120.78 11.9698 121.36 11.7198C121.95 11.4698 122.62 11.3398 123.37 11.3398C124.13 11.3398 124.8 11.4698 125.39 11.7398C125.97 12.0098 126.46 12.3798 126.84 12.8498C127.22 13.3198 127.52 13.8798 127.71 14.4998C127.9 15.1298 128 15.7998 128 16.5298V17.3498H120.84V17.6898C120.84 18.4898 121.08 19.1398 121.55 19.6498C122.02 20.1598 122.7 20.4198 123.59 20.4198C124.23 20.4198 124.77 20.2798 125.21 19.9998C125.65 19.7198 126.02 19.3398 126.33 18.8598L127.61 20.1298C127.22 20.7698 126.66 21.2898 125.93 21.6698C125.2 22.0498 124.34 22.2398 123.37 22.2398ZM123.37 13.0298C123 13.0298 122.65 13.0998 122.34 13.2298C122.03 13.3598 121.76 13.5498 121.54 13.7898C121.32 14.0298 121.15 14.3198 121.03 14.6498C120.91 14.9798 120.85 15.3498 120.85 15.7498V15.8898H125.7V15.6898C125.7 14.8898 125.49 14.2398 125.08 13.7598C124.66 13.2798 124.09 13.0298 123.37 13.0298Z" fill="#1A1919"/>
			</svg>

			<div style="float:right;margin-top:12px;">

				<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
					<circle cx="16" cy="16" r="16" fill="#272F96"/>
					<path d="M19.5017 9.936V18.972C19.5017 19.536 19.4057 20.046 19.2137 20.502C19.0337 20.958 18.7697 21.348 18.4217 21.672C18.0857 21.996 17.6717 22.248 17.1797 22.428C16.6877 22.608 16.1357 22.698 15.5237 22.698C14.3597 22.698 13.4537 22.398 12.8057 21.798C12.1577 21.186 11.7437 20.376 11.5637 19.368L13.7597 18.918C13.8677 19.458 14.0597 19.878 14.3357 20.178C14.6237 20.466 15.0137 20.61 15.5057 20.61C15.9737 20.61 16.3577 20.466 16.6577 20.178C16.9697 19.878 17.1257 19.422 17.1257 18.81V11.88H13.1657V9.936H19.5017Z" fill="white"/>
				</svg>
			</div>
		</div>
	</div>
</div>
<div class="page" style="width:{page_width}px;border-color:rgba(0,0,0,{grid_opacity/100})">
	<div class="cols" style="max-width: calc(100% - {outside_margin*2}px);">
		<p>
			<input bind:value="{grid_opacity}" type="range" min="0" max="30" step="1">{grid_opacity} grid opacity<br>
			<input bind:value="{columns}" type="number"> cols<br>
			<input bind:value="{col_w}" type="number"> col_width<br>
			<input bind:value="{gutter}" type="number"> gutter<br>
			<input bind:value="{outside_margin}" type="number"> margin<br>
			page width: {page_width}
		</p>

		<div class="row">
			<div class="col-full col-m-half">
				<h3>Group Header</h3>
				<div class="tile-container">
					<div class="tile">
						<div class="icon" style="background-image:url(./images/platform_svgs_clean/platform.svg)"></div>
						<b>Platform</b>
					</div>
					<div class="tile">
						<div class="icon" style="background-image:url(./images/platform_svgs_clean/ehs.svg)"></div>
						<b>EcoOnline EHS</b>
					</div>
					<div class="tile">
						<div class="icon" style="background-image:url(./images/platform_svgs_clean/chemical_manager.svg)"></div>
						<b>Chemical Manager</b>
						<span>Big Company<span>
					</div>
					<div class="tile">
						<div class="icon" style="background-image:url(./images/platform_svgs_clean/chemical_manager.svg)"></div>
						<b>Chemical Manager</b>
						<span>Little Company<span>
					</div>
					<div class="tile">
						<div class="icon" style="background-image:url(./images/platform_svgs_clean/chemical_manager.svg)"></div>
						<b>Chemical Manager</b>
						<span>Very long company name that doesn't end<span>
					</div>
					<div class="tile">
						<div class="icon" style="background-image:url(./images/platform_svgs_clean/learning_manager.svg)"></div>
						<b>Learning Manager</b>
					</div>
					
				</div>
			</div>
			<div class="col-full col-m-half">
				<h3>Group Header</h3>
				<div class="tile-container">
					<div class="tile">
						<div class="icon" style="background-image:url(./images/platform_svgs_clean/analytics.svg)"></div>
						<b>Dashboards & Analytics</b>
					</div>
					<div class="tile">
						<div class="icon" style="background-image:url(./images/platform_svgs_clean/reseller.svg)"></div>
						<b>Reseller</b>
					</div>
					<div class="tile">
						<div class="icon" style="background-image:url(./images/platform_svgs_clean/publisher.svg)"></div>
						<b>Publisher</b>
					</div>
					<div class="tile">
						<div class="icon" style="background-image:url(./images/platform_svgs_clean/safety_manager.svg)"></div>
						<b>Safety Manager</b>
					</div>
					<div class="tile">
						<div class="icon" style="background-image:url(./images/platform_svgs_clean/chem_doc.svg)"></div>
						<b>Chemdoc</b>
					</div>
					<div class="tile">
						<div class="icon" style="background-image:url(./images/platform_svgs_clean/safe_doc.svg)"></div>
						<b>Safedoc</b>
					</div>
					<div class="tile">
						<div class="icon" style="background-image:url(./images/platform_svgs_clean/chemi_control.svg)"></div>
						<b>Chemicontrol</b>
					</div>
				</div>
			</div>
		</div>



		<div class="grid" style="background:transparent url(./grid_svg.php?w={col_w}&g={gutter});opacity:{grid_opacity/100}"></div>
		
	</div>
</div>



<style>


	:global(:root){
		/* desktop vars */
		--gutter_num: 16;
		--columns_num: 18;
		--col_w_num: 48;
		--margin_num: 16;

		--outside_margin: var(--margin_num) + 'px';
		--cols_width: var(--col_w_num) + 'px';


		--tile_width: 100%;
	}

		/*
	let gutter = 16;
	let outside_margin = 24;

	$: cols_width = columns * col_w + (columns-1) * gutter;
	$: page_width =  cols_width + outside_margin*2;
	}
	*/
	@media screen and (min-width: 600px) {
		:global(:root){
			/* bigger than mobile */
			--margin_num: 24;
			--tile_width: 176px;
		}
	}

	@media screen and (min-width: 1800px) {
		:global(:root){
			/* mobile vars */

			--tile_width: 240px;
		}
	}




	.nav {
		height:56px;
		width:100%;
		background:#fff;
		border-bottom:1px solid #BABFC3;

	}
	.page {
		display:inline-block;
		padding:0;
		margin:0 auto;
		background:#fff;
		background:transparent;
		max-width:100%;
		position:relative;
		text-align:left;
		border-left:1px solid #d3d3d3;
		border-right:1px solid #d3d3d3;
	}
	.cols {
		display:inline-block;
		padding:0;
		margin:0 var(--outside_margin);
		width: var(--cols_width);
		position:relative;
		/*overflow:hidden;*/
	}
	.nav .cols * {
		/*vertical-align:middle;*/
	}
	.grid {
		position:absolute;
		top:0;
		left:0;
		width:100%;
		height:100%;
		pointer-events: none
	}
	
	.tile-container {
		margin-left: -8px;
		width: calc(100% + 16px);
		display: flex;
		flex-wrap: wrap;
		flex-direction:row;
	}
	.tile {
		display:inline-block;
		width:var(--tile_width);
		height:var(--tile_width);
		border-radius:16px;
		background:#fff;
		text-align:center;
		box-shadow:0 6px 10px rgba(186, 191, 195, 0.2);
		margin:8px;
		cursor:pointer;
		transition: all 0.2s linear;
		vertical-align:top;
		float:left;
	}
	.tile .icon {
		width:64px;
		height:64px;
		margin:32px auto 8px auto;
		background-color: transparent;
		background-position: center center;
		background-repeat:no-repeat;
		background-size:cover;
		transition: all 0.2s linear;
	}
	.tile b {
		display:block;
		line-height:24px;
	}
	.tile span {
		display:block;
		font-size:0.83em;
		line-height:16px;
		width: calc(100% - 16px);
		margin:0 8px;
		white-space:nowrap;
		overflow:hidden;
		text-overflow:ellipsis;
	}
	.tile .tools {
		/*border-top:1px solid #eee;*/
		padding:4px;
		display:none;
	}
	.tile .tools a {
		display:inline-block;
		width:20px;
		height:20px;
		margin:0 2px;
		background-color: transparent;
		background-position: center center;
		background-repeat:no-repeat;
		background-size:cover;
		border-radius:2px;
		transition: all 0.2s linear;
		opacity:0.8;
	}
	.tile .tools a:hover {
		transform: scale(1.1);
		opacity:1;
	}
	.tile .tools a.add 			{ background-image:url(./images/icons/add.svg) }
	.tile .tools a.filter 		{ background-image:url(./images/icons/filter.svg) }
	.tile .tools a.summary 		{ background-image:url(./images/icons/summary.svg) }
	.tile .tools a.tool 		{ background-image:url(./images/icons/tool.svg) }

	.tile:hover {
		transform: scale(1.02);
		box-shadow:0 10px 10px rgba(186, 191, 195, 0.3);
	}
	.tile:hover .icon {
		transform: scale(1.05);
	}
	.tile:hover .tools {
		display:block;
	}






	.row {
		display:block;
	}


	.col-full {
		min-width:100%;
		overflow:auto;
	}

	@media (min-width: 1016px) { 
		.row {
			display:flex;
			flex-direction:row;
		}
		.col-m-half {
			flex:1;
			margin-right:16px;
			min-width:auto;
			
		}
		.col-m-half:last-child {
			margin-right:0;
		}
	}
</style>