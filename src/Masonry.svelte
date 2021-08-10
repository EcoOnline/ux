<script>
	import Fullscreen from "./components/Fullscreen.svelte";
	import Table from "./components/Table.svelte";
	import Bignumber from "./components/Bignumber.svelte";
	import Chart from "./components/Chart.svelte";


	let components = {
		"table": Table,
		"number": Bignumber,
		"chart": Chart
	}




	/*
	only two modes:
	1) custom layout
	2) flow
	- printing automatically sets to flowstate
	- mobile screen automatically sets to flowstate

	if flowstate overflows 'page' automatically show pagination and/or play pause for presentation
	*/

	let modes = [
		{"code":"mobile", "name": "Mobile (flow)", "paint": "flow", "cols":2, "rows":1000, "pages": 1},
		{"code":"reportP", "name": "Portrait Report (flow)", "paint": "flow", "cols":5, "rows":7, "pages": 20},
		{"code":"reportL", "name": "Landscape Report (flow)", "paint": "flow", "cols":7, "rows":5, "pages": 20},
		{"code":"desktop", "name": "Desktop (fixed)", "paint": "fixed", "cols":12, "rows":1000, "pages": 1}, 
		{"code":"display", "name": "Large Screens (flow)", "paint": "flow", "cols":14, "rows":8, "pages": 10} 
	]


	
	let mode = modes[3];

	let draggable_checkbox = true;
	$: draggable = (draggable_checkbox && mode == modes[3]); //only drag in fixed paint mode

	$: {
		let m = mode;
		let new_sorted_tiles = tiles.sort(function(a,b){
			return a.index - b.index
		});
		//reset tiles whether fixed or flow
		new_sorted_tiles = reset_tiles(new_sorted_tiles)
		if(m.paint == 'flow') {
			new_sorted_tiles = reflow_tiles(new_sorted_tiles)
		} else {
			//console.log(m.name, 'layout should used fixed values');
		}
		tiles = new_sorted_tiles; //force update
	}

	function reset_tiles(tiles) {
		tiles.forEach( (t) => {
			switch (mode.code) {
				case "desktop":
				case "edit":
					t.floww = t.w;
				default:
					if(t.w > mode.cols) {
						t.floww = mode.cols;
					} else {
						t.floww = t.w;
					}
					break;
					

			}
			//reset all tiles
			t.flowp = 0;
			t.flowx = -4000;
			t.flowy = -4000;
		})
		return tiles;
	}
	function reflow_tiles(tiles) {
		let current_page = 0;
		//warning.. deep loop nesting ahead (and dragons)
		tiles.forEach( (t) => {
			//add to the right place
			//always try to slot back into first page.. will take longer
			let current_page = 0;


			let found_a_slot = false;

			while(found_a_slot == false) {
				for(let r=0;r < mode.rows;r++) {
					for(let c=0;c < mode.cols;c++) {
						//check t at position r,c
						t.flowx = c;
						t.flowy = r;
						t.flowp = current_page;

						let ok = true;

						if(c > 0 && t.flowx + t.floww > mode.cols) {
							//off the side of page
							ok = false;
						} else if(r > 0 && t.flowy + t.flowh > mode.rows) {
							//off the bottom of page
							ok = false;
						} else {
							//test for collision
							tiles.every( (test) => {
								//exclude this tile and tiles on other pages
								if(t !== test && test.flowp == current_page){
									if(tiles_intersect_flow(t,test)) {
										//can't go here
										ok = false;
										return false;
										//break out of sorted tiles forEach
									}
								}
								return true;
							});
						}

						
						if(ok) {
							//we found a good slot
							found_a_slot = true;
							console.log('found a slot', t.index, r, c)
							r = mode.rows;
							c = mode.cols;
						} 
					}
				}

				if(!found_a_slot) {
					console.log('going to next page');
					current_page++;
					if(current_page > 1000) {
						found_a_slot = true;
						console.error('didnt find a slot in first 1000 pages')
					}
				}
			}
			
		});
		return tiles
	}

	$: max_rows = Math.max.apply(Math, tiles.map(function(o) { return o.y+o.h; }))
	$: max_flow_rows = Math.max.apply(Math, tiles.map(function(o) { return o.flowy+o.flowh; }))
	$: max_cols = Math.max.apply(Math, tiles.map(function(o) { return o.x+o.w; }))
	$: max_flow_cols = Math.max.apply(Math, tiles.map(function(o) { return o.flowx+o.floww; }))

	$: selected_rows = (mode.paint == 'flow' ? max_flow_rows : max_rows);
	$: selected_cols = (mode.paint == 'flow' ? max_flow_cols : max_cols);

	let orientation = 'landscape'

	$:  {
		orientation = (selected_cols > selected_rows ? 'landscape' : 'portrait');
	}

	let g = 112; 
	let gutter = 16;

	let tiles = [
		{
			"id": "001",
			"t": false,
			"type":"title", 
			"title": "Quarterly Report: Q3 2021",
			"index": 0,
			"x": 0,
			"y": 0,
			"flowp":0,
			"flowx":0,
			"flowy":0,
			"w": 9,
			"h": 1,
			"floww":1,
			"flowh":1
		},
		{
			"id": "002",
			"t": false,
			"type":"number", 
			"title": "Favourite number",
			"data": {
				"content": "27"
			},
			"index": 2,
			"x": 5,
			"y": 1,
			"flowp":0,
			"flowx":0,
			"flowy":0,
			"w": 2,
			"h": 1,
			"floww":1,
			"flowh":1
		},
		{
			"id": "003",
			"t": false,
			"type":"number", 
			"title": "Bad number",
			"data": {
				"content": "13"
			},
			"index": 4,
			"x": 3,
			"y": 1,
			"flowp":0,
			"flowx":0,
			"flowy":0,
			"w": 1,
			"h": 1,
			"floww":1,
			"flowh":1
		},
		{
			"id": "004",
			"t": false,
			"type":"number", 
			"title": "Good number",
			"data": {
				"content": "1",
			},
			"index": 3,
			"x": 4,
			"y": 1,
			"flowp":0,
			"flowx":0,
			"flowy":0,
			"w": 1,
			"h": 1,
			"floww":1,
			"flowh":1
		},
		{
			"id": "005",
			"t": false,
			"type":"chart",
			"title": "What a chart!",
			"data": {
				"content": "doesnt matter"
			},
			"index": 1,
			"x": 0,
			"y": 1,
			"flowp":0,
			"flowx":0,
			"flowy":0,
			"w": 3,
			"h": 2,
			"floww":1,
			"flowh":2
		},
		{
			"id": "006",
			"t": false,
			"type":"chart", 
			"title": "A long skinny line",
			"data": {
				"content": "doesnt matter"
			},
			"index": 5,
			"x": 5,
			"y": 2,
			"flowp":0,
			"flowx":0,
			"flowy":0,
			"w": 4,
			"h": 1,
			"floww":1,
			"flowh":1
		},
		{
			"id": "007",
			"t": false,
			"type":"table",
			"title": "A simple table",
			"data": {
				"fetch": 5,
				"endpoint": "./mock/user.json"
			},
			"index": 6,
			"x": 0,
			"y": 3,
			"flowp":0,
			"flowx":0,
			"flowy":0,
			"w": 9,
			"h": 3,
			"floww":1,
			"flowh":3
		},
		{
			"id": "008",
			"t": false,
			"type":"number", 
			"title": "X",
			"data": {
				"content": "99"
			},
			"index": 7,
			"x": 0,
			"y": 6,
			"flowp":0,
			"flowx":0,
			"flowy":0,
			"w": 1,
			"h": 1,
			"floww":1,
			"flowh":1
		},
		{
			"id": "009",
			"t": false,
			"type":"number", 
			"title": "Y",
			"data": {
				"content": "100"
			},
			"index": 8,
			"x": 1,
			"y": 6,
			"flowp":0,
			"flowx":0,
			"flowy":0,
			"w": 1,
			"h": 1,
			"floww":1,
			"flowh":1
		},
		{
			"id": "010",
			"t": false,
			"type":"number", 
			"title": "Z",
			"data": {
				"content": "101"
			},
			"index": 9,
			"x": 2,
			"y": 6,
			"flowp":0,
			"flowx":0,
			"flowy":0,
			"w": 1,
			"h": 1,
			"floww":1,
			"flowh":1
		},
		{
			"id": "011",
			"t": false,
			"type":"table", 
			"title": "Lots of data",
			"data": {
				"fetch": 20,
				"endpoint": "./mock/user.json"
			},
			"index": 10,
			"x": 0,
			"y": 7,
			"flowp":0,
			"flowx":0,
			"flowy":0,
			"w": 9,
			"h": 3,
			"floww":9,
			"flowh":3
		},
		{
			"id": "012",
			"t": false,
			"type":"table", 
			"title": "Too much data to print",
			"data": {
				"fetch": 200,
				"endpoint": "./mock/user.json"
			},
			"index": 11,
			"x": 0,
			"y": 10,
			"flowp":0,
			"flowx":0,
			"flowy":0,
			"w": 4,
			"h": 3,
			"floww":9,
			"flowh":3
		}
	];

	let pages = [];
	$: {
		pages = [];
		let new_sorted_tiles = tiles.filter( (t) => {
			if(pages.indexOf('page' + t.flowp) < 0) {
				pages.push('page' + t.flowp);
			}
		})
		//console.log('pages now', pages);
	};


	$: sorted_tiles = tiles.sort(function(a,b){
		return a.index - b.index
	})
	function tiles_intersect_flow(t1, t2) {
		let leftof2 = t1.flowx + t1.floww <= t2.flowx;
		let	rightof2 = t1.flowx >= t2.flowx + t2.floww;
		let below2 = t1.flowy + t1.flowh <= t2.flowy;
		let	above2 = t1.flowy >= t2.flowy + t2.flowh;
		return !( leftof2 || rightof2 || below2 || above2 );
	}

	function reflow() {
		/* 
			iterates over tiles (in sorted order) 
			uses mode.cols to determine the edge of the page/screen and reflow below it
		*/
	}

	function calc_dim(n) {
		let calc = (n*g) + (n-1)*gutter;
		//console.log('calculating for', n, calc);
		return calc;
	}
	function calc(t,attr,incgutter){
		let n = t[attr];
		if(mode.paint == 'flow') {
			n = t['flow' + attr];
		}
		return calc_dim(n) + (incgutter ? gutter:0);
	} 

	
	function reset_for_download(t) {
		/*html to canvas doesnt understand css translate so they need to reposition at 0,0 then download, then put back*/
		console.log('reset', t);
		t.downloading = false;
		t.old_flowp = t.flowp;
		t.flowp = 0;
		t.old_flowx = t.flowx;
		t.flowx = 0;
		t.old_flowy = t.flowy;
		t.flowy = 0;
		t.old_x = t.x;
		t.x = 0;
		t.old_y = t.y;
		t.y = 0;
	}
	function download_tiles_action(t, index) {
		

			t.downloading = true;
			tiles = tiles;
			setTimeout(function(){
				html2canvas(t.t, {
					imageTimeout: 0
				}).then(canvas => {
					let resource = canvas.toDataURL("image/png");
					let link = document.createElement('a');
					link.href = resource;
					link.download = "tile_" + (index + 1) + '.png';
					
					let img = document.createElement('img');
					


					img.addEventListener("load", function() { 
						console.log("image loaded", link.download);
						link.click();
						place_back_after_download(t);
						tiles = tiles;
					}, false);
					img.src = resource

					link.appendChild(img);
					
					document.getElementById('downloader_holder').appendChild(link);
					//link.click();
					
				});
			}, 50)

			

	}
	function place_back_after_download(t) {
		t.downloading = false;
		t.flowp = t.old_flowp;
		t.flowx = t.old_flowx;
		t.flowy = t.old_flowy;
		t.x = t.old_x;
		t.y = t.old_y;
	}
	function log(i){
		let t = sorted_tiles[i]

		if(t) {
	    	reset_for_download(t);
	    	tiles = tiles;
	    	setTimeout(function() {
				download_tiles_action(t, i);
			}, 500);
		} else {
			console.log(i, 'is no tile');
		}
	    if (i<sorted_tiles.length - 1){
	       setTimeout(function(){
	           i++;
	           log(i);
	       },1500);
	    } else {
	    	//empty the holder
	    	setTimeout(function(){
	    		downloading_started = false;
	    		document.getElementById('downloader_holder').innerHTML = '';
	    	},3000)
	    }
	}
	let downloading_started = false;

	function download_tiles() {
		downloading_started = true;
		log(0);
	}

	
	function ondrag(e) {
		console.log(e);
		//items = e.detail.items;
	}
	
</script>

{#if orientation == 'landscape'}
	<style type="text/css">
		@media print{@page {size: a4 landscape}}
	</style>
{:else}
	<style type="text/css">
		@media print{@page {size: a4 portrait}}
	</style>
{/if}


<div class="app-area" class:downloading="{downloading_started}">
	<div class="grid-tools">
		<select bind:value="{mode}">
			{#each modes as m}
				<option value={m}>{m.name}</option>
			{/each}
		</select>

		<Fullscreen></Fullscreen>
		| 
		<a href="/" class="btn" on:click|preventDefault="{download_tiles}">Download all tiles</a>


		<code style="float:right">{calc_dim(selected_cols)+1}px x {calc_dim(selected_rows)+1}px : {selected_cols} x {selected_rows} {orientation}</code>
	</div>
	{#each pages as p}
		<div class="grid {mode.code}" draggable="{draggable}" on:drag="{ondrag}" style="width:{calc_dim(selected_cols)+1}px; height:{calc_dim(selected_rows)+1}px;">
			{#each sorted_tiles as t}
				{#if p == 'page' + t.flowp }
					<div bind:this="{t.t}" class="tile {t.type}" class:downloading="{t.downloading}" style="transform: translate({calc(t,'x',true)}px, {calc(t, 'y', true)}px); width:{calc(t, 'w', false)}px; height:{calc(t, 'h',false)}px;">
						<span class="index_number">{t.index}</span>

						
						{#if typeof components[t.type] == 'function'}
							<svelte:component this={components[t.type]} {t}/>
						{:else}
							<h4>{t.title}</h4>
							[{t.type}]
						{/if}
					</div>
				{/if}
			{/each}
			
		</div>
	{/each}
	{#if downloading_started}
	<div class="download_in_progress"><span>Download in progress...</span></div>
	{/if}
	<div id="downloader_holder" style="display:none"><!-- holds the tiles-as-images for download--></div>
</div>

