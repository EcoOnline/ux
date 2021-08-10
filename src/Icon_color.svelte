<script>
	import { onMount } from 'svelte';
	let cookie_monster = {};

	/*
		start 21:13
		functional  23:45
	*/
	function get_random_rot() {
		//randomly select one of 12 angles from 0 - 330 (deg)
		return Math.floor(Math.random() * 13) * 30;
	}

	function get_colstr_from_obj(obj) {
		//take {h:x, s:y, l:z}
		//return "hsl(xdeg y% z%)",
		return "hsl(" + obj.h + " " + obj.s + "% " + obj.l + "%)";
	}

	function get_random_scale(min, max) {
		return Math.floor(Math.random() * ((max - min)*10 + 1))/10 + min;
	}

	async function copytoclip() {
		var copy_value = JSON.stringify(favourites, null, 4);
		await navigator.clipboard.writeText(copy_value);
	}
	function do_paste_fav() {
		if(paste_fav !== '') {
			favourites = JSON.parse(paste_fav)
		} else {

		}
	}

	function bump_L(obj, minimum, maximum, roof, is_random) {
		//takes an HSL obj and increases its lightness returning new HSL obj
		let min = parseFloat(minimum);
		let max =  parseFloat(maximum);
		let r = (max+min)/2;
		if(is_random) {
			r = Math.floor(Math.random() * ((max - min)*10 + 1))/10 + min;
		}
		
		return {
			h: obj.h,
			s: obj.s,
			l: Math.min(parseInt(roof), obj.l * r)
		}
	}
	function bump_S(obj, minimum, maximum, floor, is_random) {
		//takes an HSL obj and randomises its saturation returning new HSL obj
		let min = parseFloat(minimum);
		let max =  parseFloat(maximum);
		let r = (max+min)/2;
		let s = obj.s
		if(is_random) {
			r = Math.floor(Math.random() * ((max - min)*10 + 1))/10 + min;
			s = Math.max(parseInt(floor), obj.s * r);
		}
		
		return {
			h: obj.h,
			s: s,
			l: obj.l
		}
	}
	function remove_from_fav(i) {
		favourites.splice(i,1);
		favourites = favourites;
		store_favs();

	}
	function add_to_fav(t) {
		favourites.push(t);
		favourites = favourites;
		store_favs();
	}
	function clear_fav() {
		favourites = [];
		store_favs()
	}

	function store_favs() {
		set_cookie('favs', JSON.stringify(favourites));
	}
	function retrieve_favs() {

		cookie_monster = get_cookie();
		let favs = cookie_monster.favs || "[]";
		console.log(favs, JSON.parse(favs));
		favourites = JSON.parse(favs);
	}

	function get_cookie() {
		let name = "ECO=";


		console.log('COOOKIIIIEEEE', document.cookie);
		let decodedCookie = decodeURIComponent(document.cookie);
		let ca = decodedCookie.split(';');

		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				var ret = c.substring(name.length, c.length);
				try {
					JSON.parse(ret);
				}
				catch (e) {
					console.warn('error with cookie, couldnt parse', ret, e);
					return {};
				}
				return JSON.parse(ret);
			}
		}
		return {};
	};
	function set_cookie(k, v) {
		cookie_monster[k] = v;
		var d = new Date();
		d.setTime(d.getTime() + (365 * 7 * 24 * 60 * 60 * 1000)); //expires 1 year
		var expires = "expires=" + d.toUTCString();
		var domain = '';
		document.cookie = "ECO=" + encodeURIComponent(JSON.stringify(cookie_monster)) + ";SameSite=None;Secure;" + expires + ";path=/;" + domain;
	}

	onMount(() => {
		retrieve_favs();
		init();
	});


	let show_paste_fav = false;
	let paste_fav = '';

	let col1_lightness_min = 1.1;
	let col1_lightness_max = 1.6;
	let col1_lightness_roof = 90; 
	let col1_lightness_random = true;
	let col1_saturation_min = 0.5;
	let col1_saturation_max = 1.2;
	let col1_saturation_floor = 50; 
	let col1_saturation_random = true;
	let col1_scale_min = 0.8;
	let col1_scale_max = 1.4;

	let col2_lightness_min = 0.9;
	let col2_lightness_max = 1.1;
	let col2_lightness_roof = 70; 
	let col2_lightness_random = false;
	let col2_saturation_min = 0.5;
	let col2_saturation_max = 1.2;
	let col2_saturation_floor = 50; 
	let col2_saturation_random = true;
	let col2_scale_min = 0.8;
	let col2_scale_max = 1.2;

	let harmonious_only = false;




	let icons = [
		"period_statistics",
		"covid",
		"environmental",
		"compliance"
	]

	let icon = icons[0];




	//starting point for our colors
	let palette = [
		{ //light blue
			h: 192,
			s: 80,
			l: 65
		},
		{ //blue
			h: 211,
			s: 100,
			l: 42
		},
		{ //teal
			h: 180,
			s: 55,
			l: 35
		},
		{ //green
			h: 94,
			s: 60,
			l: 55
		},
		{ //yellow
			h: 48,
			s: 90,
			l: 57
		},
		{ //salmon
			h: 9,
			s: 80,
			l: 65
		},
		{ //purple
			h: 251,
			s: 84,
			l: 71
		},
	]

	let favourites = [];
	let test = []

	function init() {
		test = [];

		palette.forEach( (c1, i) => {
			palette.forEach( (c2, j) => {


				if( (!harmonious_only && c1 !== c2) || (harmonious_only && (Math.abs(i-j) < 2 || Math.abs(i-j) == palette.length-1))) {
				//if(c1 !== c2) {

					let random_c = c1;
					random_c = bump_L(random_c, col1_lightness_min, col1_lightness_max, col1_lightness_roof, col1_lightness_random);
					random_c = bump_S(random_c, col1_saturation_min, col1_saturation_max, col1_saturation_floor, col1_saturation_random);

					let random_c2 = c2;
					random_c2 = bump_L(random_c2, col2_lightness_min, col2_lightness_max, col2_lightness_roof, col2_lightness_random);
					random_c2 = bump_S(random_c2, col2_saturation_min, col2_saturation_max, col2_saturation_floor, col2_saturation_random)




					test.push({
						col1: get_colstr_from_obj(random_c),
						col2: get_colstr_from_obj(random_c2),
						rot1: get_random_rot(),
						rot2: get_random_rot(),
						scale1: get_random_scale(col1_scale_min, col1_scale_max),
						scale2: get_random_scale(col2_scale_min, col2_scale_max),
						icon: icon
					})
				}
				
			})
		})
		test = test;
	}

	let zombie_interval = false;


	function play() {
		zombie_interval = setInterval(init, 1000);
	}
	function stop() {
		clearInterval(zombie_interval);
	}
	
</script>

<hr>
<h4>Big segment</h4>
<input type="checkbox" bind:checked="{col1_lightness_random}"> Randomise lightness<br>
Lighten <input type="text" bind:value={col1_lightness_min}> - <input type="text" bind:value={col1_lightness_max}>times original (max) <input type="text"  bind:value={col1_lightness_roof}> (100 = white)<br>
<input type="checkbox" bind:checked="{col1_saturation_random}"> Randomise saturation<br>
Saturation <input type="text" bind:value={col1_saturation_min}> - <input type="text" bind:value={col1_saturation_max}>times original (min) <input type="text"  bind:value={col1_saturation_floor}> (0 = grey)<br>
Scale <input type="text" bind:value={col1_scale_min}> - <input type="text" bind:value={col1_scale_max}><br>
<h4>Little segment</h4>
<input type="checkbox" bind:checked="{col2_lightness_random}"> Randomise lightness<br>
Lighten <input type="text" bind:value={col2_lightness_min}> - <input type="text" bind:value={col2_lightness_max}>times original (max) <input type="text"  bind:value={col2_lightness_roof}> (100 = white)<br>
<input type="checkbox" bind:checked="{col2_saturation_random}"> Randomise saturation<br>
Saturation <input type="text" bind:value={col2_saturation_min}> - <input type="text" bind:value={col2_saturation_max}>times original (min) <input type="text"  bind:value={col2_saturation_floor}> (0 = grey)<br>
Scale <input type="text" bind:value={col2_scale_min}> - <input type="text" bind:value={col2_scale_max}><br>
<input type="checkbox" bind:checked="{harmonious_only}" on:change="{init}"> Harmonious combinations only<br>

<h4>Icon</h4>
<select bind:value="{icon}">
	{#each icons as ico}
		<option value={ico}>
			{ico}
		</option>
	{/each}
</select>


<br><br>
<div class="controls">
	<button on:click="{init}">Generate</button> <a href="./" on:click|preventDefault="{play}">Play</a> <a href="./" on:click|preventDefault="{stop}">Stop</a>
</div>
<hr>
<h4>Favourites 
	{#if favourites.length}
		<span on:click="{clear_fav}">Clear</span>
	{:else}
		<span on:click="{() => { show_paste_fav = !show_paste_fav }}">Paste in here</span> 
	{/if}
</h4>
{#if show_paste_fav}
	<textarea bind:value="{paste_fav}"></textarea><br>
	<a on:click|preventDefault="{ () => { do_paste_fav();show_paste_fav= false; }}">Do it</a><br><br>
{/if}
{#if favourites.length}
	{#each favourites as t, i}
		<div class="tile" title="col1: {t.col1}, col2:  {t.col2}" on:click="{ () => { remove_from_fav(i) }}">
			
			<!-- segment 1 -->
			<svg class="seg1" width="108px" height="108px" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" style="transform: rotate({t.rot1}deg) scale({t.scale1});">
				<path d="M21.42,0 C26.58,0 31.29,1.91 34.89,5.06 L34.89,14.78 C34.89,25.08 27.73,33.71 18.12,35.97 C17.96,36 17.79,36 17.63,35.97 C11.74,34.59 6.78,30.82 3.81,25.73 L3.11,24.47 C2.61,23.59 2.16,22.49 1.78,21.19 C1.49,20.23 1.27,19.18 1.11,18.11 C2.27,7.92 10.92,0 21.42,0 Z" fill="{t.col1}"></path>
			</svg>

			<!-- segment 2 -->
			<svg class="seg2" width="48px" height="48px" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" style="transform: rotate({t.rot2}deg) scale({t.scale2});">
				<path d="M18,3.06 C25.48,3.065 32.09,6.85 36,12.60 C35.04,22.55 27.78,30.67 18.27,32.91 C18.09,32.94 17.91,32.94 17.74,32.91 C11.48,31.44 6.2,27.43 3.04,22.01 L2.29,20.67 C1.75,19.73 1.28,18.56 0.87,17.17 C0.46,15.76 0.15,14.18 0,12.6 C3.91,6.84 10.52,3.06 18,3.06 Z" fill="{t.col2}"></path>
			</svg>


			<!-- icons -->

			{#if t.icon == 'period_statistics'}
				<!-- period statistics -->
				<svg class="icon" width="96" height="96" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
					<path d="M10.0599 17.88C10.3678 17.9549 10.6831 17.9952 10.9999 18C11.7943 17.9998 12.5706 17.7631 13.2299 17.32L16.4499 20.19C15.934 21.1697 15.8612 22.3232 16.2499 23.36C16.8033 24.952 18.2951 26.0264 19.9804 26.0465C21.6657 26.0667 23.1829 25.0283 23.7741 23.4499C24.3653 21.8716 23.9037 20.092 22.6199 19L25.1599 13.91C26.1617 14.1359 27.2122 13.9446 28.0699 13.38C29.5488 12.4774 30.2786 10.7254 29.8776 9.03989C29.4766 7.35437 28.0361 6.1186 26.3092 5.97869C24.5823 5.83877 22.9617 6.82651 22.2946 8.42548C21.6275 10.0245 22.0656 11.8711 23.3799 13L20.8399 18.09C20.5641 18.0294 20.2824 17.9992 19.9999 18C19.2056 18.0002 18.4293 18.2369 17.7699 18.68L14.5499 15.81C15.0659 14.8303 15.1387 13.6768 14.7499 12.64C14.2009 11.0602 12.727 9.98874 11.0549 9.95391C9.38277 9.91908 7.86551 10.9282 7.25119 12.4838C6.63688 14.0394 7.05521 15.8129 8.29994 16.93L3.99994 25V2H1.99994V28C1.99994 29.1046 2.89537 30 3.99994 30H29.9999V28H4.66994L10.0599 17.88ZM25.9999 8C27.1045 8 27.9999 8.89543 27.9999 10C27.9999 11.1046 27.1045 12 25.9999 12C24.8954 12 23.9999 11.1046 23.9999 10C23.9999 8.89543 24.8954 8 25.9999 8ZM21.9999 22C21.9999 23.1046 21.1045 24 19.9999 24C18.8954 24 17.9999 23.1046 17.9999 22C17.9999 20.8954 18.8954 20 19.9999 20C21.1045 20 21.9999 20.8954 21.9999 22ZM10.9999 12C12.1045 12 12.9999 12.8954 12.9999 14C12.9999 15.1046 12.1045 16 10.9999 16C9.89537 16 8.99994 15.1046 8.99994 14C8.99994 12.8954 9.89537 12 10.9999 12Z"/>
				</svg>
			{:else if t.icon == 'environmental'}
				<!-- environmental -->
				<svg class="icon" width="96" height="96" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
					<path d="M24.9999 2.47803C22.7837 2.48169 20.6201 3.15414 18.7922 4.40741C16.9643 5.66069 15.5571 7.43645 14.7548 9.50243C14.1121 8.57007 13.2526 7.80772 12.2502 7.28091C11.2477 6.75409 10.1324 6.47857 8.99994 6.47803H5.99994V9.47803C6.002 11.3339 6.74016 13.1132 8.05247 14.4255C9.36478 15.7378 11.1441 16.476 12.9999 16.478H13.9999V25.5273C11.703 25.7519 9.55618 26.7701 7.92894 28.4067L9.34294 29.8208C10.1795 28.9844 11.1911 28.344 12.3049 27.9456C13.4187 27.5471 14.607 27.4007 15.7842 27.5167C16.9614 27.6328 18.0982 28.0084 19.1128 28.6167C20.1274 29.2249 20.9944 30.0506 21.6515 31.0342L23.3131 29.9214C22.4934 28.6964 21.4124 27.6681 20.1479 26.9105C18.8834 26.153 17.4668 25.6849 15.9999 25.54V16.478H16.9999C19.9163 16.4747 22.7123 15.3147 24.7745 13.2525C26.8366 11.1904 27.9966 8.39439 27.9999 5.47803V2.47803H24.9999ZM12.9999 14.478C11.6743 14.4765 10.4034 13.9493 9.46607 13.0119C8.52872 12.0745 8.00145 10.8036 7.99994 9.47803V8.47803H8.99994C10.3256 8.47946 11.5965 9.0067 12.5339 9.94407C13.4713 10.8814 13.9985 12.1524 13.9999 13.478V14.478H12.9999ZM25.9999 5.47803C25.9973 7.86416 25.0482 10.1518 23.361 11.8391C21.6737 13.5263 19.3861 14.4754 16.9999 14.478H15.9999V13.478C16.0026 11.0919 16.9516 8.80424 18.6389 7.11699C20.3262 5.42974 22.6138 4.48067 24.9999 4.47803H25.9999V5.47803Z"/>
				</svg>
			{:else if t.icon == 'covid'}
				<!-- covid -->
				<svg class="icon" width="96" height="96" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
					<path d="M15.4998 13.551C16.3282 13.551 16.9998 12.8795 16.9998 12.051C16.9998 11.2226 16.3282 10.551 15.4998 10.551C14.6714 10.551 13.9998 11.2226 13.9998 12.051C13.9998 12.8795 14.6714 13.551 15.4998 13.551Z" fill="black"/>
					<path d="M20.4998 17.551C21.3282 17.551 21.9998 16.8795 21.9998 16.051C21.9998 15.2226 21.3282 14.551 20.4998 14.551C19.6714 14.551 18.9998 15.2226 18.9998 16.051C18.9998 16.8795 19.6714 17.551 20.4998 17.551Z" fill="black"/>
					<path d="M15.9998 17.551C16.5521 17.551 16.9998 17.1033 16.9998 16.551C16.9998 15.9987 16.5521 15.551 15.9998 15.551C15.4475 15.551 14.9998 15.9987 14.9998 16.551C14.9998 17.1033 15.4475 17.551 15.9998 17.551Z" fill="black"/>
					<path d="M16.4998 22.551C17.3282 22.551 17.9998 21.8795 17.9998 21.051C17.9998 20.2226 17.3282 19.551 16.4998 19.551C15.6714 19.551 14.9998 20.2226 14.9998 21.051C14.9998 21.8795 15.6714 22.551 16.4998 22.551Z" fill="black"/>
					<path d="M11.4998 18.551C12.3282 18.551 12.9998 17.8795 12.9998 17.051C12.9998 16.2226 12.3282 15.551 11.4998 15.551C10.6714 15.551 9.99982 16.2226 9.99982 17.051C9.99982 17.8795 10.6714 18.551 11.4998 18.551Z" fill="black"/>
					<path d="M27.9998 13.551V15.551H25.949C25.7522 13.5976 24.9818 11.7461 23.7347 10.2297L25.1714 8.79323L26.5857 10.2077L27.9998 8.79373L23.7576 4.55103L22.3436 5.96513L23.7576 7.37913L22.3206 8.81563C20.8043 7.56879 18.953 6.79852 16.9998 6.60183V4.55103H18.9998V2.55103H12.9998V4.55103H14.9998V6.60183C13.0466 6.79852 11.1953 7.56879 9.67902 8.81563L8.24202 7.37913L9.65602 5.96513L8.24202 4.55103L3.99982 8.79373L5.41392 10.2077L6.82822 8.79323L8.26492 10.2297C7.01787 11.7461 6.24743 13.5976 6.05062 15.551H3.99982V13.551H1.99982V19.551H3.99982V17.551H6.05062C6.24743 19.5044 7.01787 21.3559 8.26492 22.8723L6.82822 24.3088L5.41392 22.8943L3.99982 24.3083L8.24202 28.551L9.65602 27.1369L8.24202 25.7229L9.67902 24.2864C11.1953 25.5333 13.0466 26.3035 14.9998 26.5002V28.551H12.9998V30.551H18.9998V28.551H16.9998V26.5002C18.953 26.3035 20.8043 25.5333 22.3206 24.2864L23.7576 25.7229L22.3436 27.1369L23.7576 28.551L27.9998 24.3083L26.5857 22.8943L25.1714 24.3088L23.7347 22.8723C24.9818 21.3559 25.7522 19.5044 25.949 17.551H27.9998V19.551H29.9998V13.551H27.9998ZM15.9998 24.551C14.4176 24.551 12.8708 24.0818 11.5553 23.2028C10.2397 22.3237 9.21428 21.0743 8.60878 19.6125C8.00328 18.1507 7.84485 16.5422 8.15353 14.9903C8.46222 13.4385 9.22414 12.013 10.343 10.8942C11.4618 9.77535 12.8872 9.01343 14.4391 8.70474C15.9909 8.39606 17.5995 8.55449 19.0613 9.15999C20.5231 9.76549 21.7725 10.7909 22.6516 12.1065C23.5306 13.4221 23.9998 14.9688 23.9998 16.551C23.9974 18.672 23.1537 20.7054 21.654 22.2052C20.1542 23.705 18.1208 24.5486 15.9998 24.551Z" fill="black"/>
				</svg>
			{:else}
				<!-- compliance -->
				<svg class="icon" width="96" height="96" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
					<path d="M15.9999 30.6521C19.3124 30.6521 22.1405 29.4802 24.4843 27.1365C26.828 24.7927 27.9999 21.9646 27.9999 18.6521V6.6521L15.9999 2.6521L3.99988 6.6521V18.6521C3.99988 21.9646 5.17175 24.7927 7.5155 27.1365C9.85925 29.4802 12.6874 30.6521 15.9999 30.6521ZM15.9999 28.4021C13.3124 28.4021 11.0155 27.449 9.10925 25.5427C7.203 23.6365 6.24988 21.3396 6.24988 18.6521V8.3396L15.9999 4.9021L25.7499 8.3396V18.6521C25.7499 21.3396 24.7968 23.6365 22.8905 25.5427C20.9843 27.449 18.6874 28.4021 15.9999 28.4021ZM15.0936 21.9167L23.6059 13.4627L21.9905 11.9284L15.0936 18.7771L11.04 14.7422L9.45718 16.2679L15.0936 21.9167Z"/>
				</svg>
			{/if}
		</div>
	{/each}
	<a href="./" on:click|preventDefault="{copytoclip}">Copy to clipboard and send to Hayden</a>
{:else}
	<p>Click a tile to add here</p>
{/if}

<hr>
{#each test as t, j}
	<div class="tile" title="col1: {t.col1}, col2:  {t.col2}" on:click="{ () => { add_to_fav(t); }}">
		
		<!-- segment 1 -->
		<svg class="seg1" width="108px" height="108px" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" style="transform: rotate({t.rot1}deg) scale({t.scale1});">
			<path d="M21.42,0 C26.58,0 31.29,1.91 34.89,5.06 L34.89,14.78 C34.89,25.08 27.73,33.71 18.12,35.97 C17.96,36 17.79,36 17.63,35.97 C11.74,34.59 6.78,30.82 3.81,25.73 L3.11,24.47 C2.61,23.59 2.16,22.49 1.78,21.19 C1.49,20.23 1.27,19.18 1.11,18.11 C2.27,7.92 10.92,0 21.42,0 Z" fill="{t.col1}"></path>
		</svg>

		<!-- segment 2 -->
		<svg class="seg2" width="48px" height="48px" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" style="transform: rotate({t.rot2}deg) scale({t.scale2});">
			<path d="M18,3.06 C25.48,3.065 32.09,6.85 36,12.60 C35.04,22.55 27.78,30.67 18.27,32.91 C18.09,32.94 17.91,32.94 17.74,32.91 C11.48,31.44 6.2,27.43 3.04,22.01 L2.29,20.67 C1.75,19.73 1.28,18.56 0.87,17.17 C0.46,15.76 0.15,14.18 0,12.6 C3.91,6.84 10.52,3.06 18,3.06 Z" fill="{t.col2}"></path>
		</svg>


		<!-- icons -->

			{#if t.icon == 'period_statistics'}
				<!-- period statistics -->
				<svg class="icon" width="96" height="96" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
					<path d="M10.0599 17.88C10.3678 17.9549 10.6831 17.9952 10.9999 18C11.7943 17.9998 12.5706 17.7631 13.2299 17.32L16.4499 20.19C15.934 21.1697 15.8612 22.3232 16.2499 23.36C16.8033 24.952 18.2951 26.0264 19.9804 26.0465C21.6657 26.0667 23.1829 25.0283 23.7741 23.4499C24.3653 21.8716 23.9037 20.092 22.6199 19L25.1599 13.91C26.1617 14.1359 27.2122 13.9446 28.0699 13.38C29.5488 12.4774 30.2786 10.7254 29.8776 9.03989C29.4766 7.35437 28.0361 6.1186 26.3092 5.97869C24.5823 5.83877 22.9617 6.82651 22.2946 8.42548C21.6275 10.0245 22.0656 11.8711 23.3799 13L20.8399 18.09C20.5641 18.0294 20.2824 17.9992 19.9999 18C19.2056 18.0002 18.4293 18.2369 17.7699 18.68L14.5499 15.81C15.0659 14.8303 15.1387 13.6768 14.7499 12.64C14.2009 11.0602 12.727 9.98874 11.0549 9.95391C9.38277 9.91908 7.86551 10.9282 7.25119 12.4838C6.63688 14.0394 7.05521 15.8129 8.29994 16.93L3.99994 25V2H1.99994V28C1.99994 29.1046 2.89537 30 3.99994 30H29.9999V28H4.66994L10.0599 17.88ZM25.9999 8C27.1045 8 27.9999 8.89543 27.9999 10C27.9999 11.1046 27.1045 12 25.9999 12C24.8954 12 23.9999 11.1046 23.9999 10C23.9999 8.89543 24.8954 8 25.9999 8ZM21.9999 22C21.9999 23.1046 21.1045 24 19.9999 24C18.8954 24 17.9999 23.1046 17.9999 22C17.9999 20.8954 18.8954 20 19.9999 20C21.1045 20 21.9999 20.8954 21.9999 22ZM10.9999 12C12.1045 12 12.9999 12.8954 12.9999 14C12.9999 15.1046 12.1045 16 10.9999 16C9.89537 16 8.99994 15.1046 8.99994 14C8.99994 12.8954 9.89537 12 10.9999 12Z"/>
				</svg>
			{:else if t.icon == 'environmental'}
				<!-- environmental -->
				<svg class="icon" width="96" height="96" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
					<path d="M24.9999 2.47803C22.7837 2.48169 20.6201 3.15414 18.7922 4.40741C16.9643 5.66069 15.5571 7.43645 14.7548 9.50243C14.1121 8.57007 13.2526 7.80772 12.2502 7.28091C11.2477 6.75409 10.1324 6.47857 8.99994 6.47803H5.99994V9.47803C6.002 11.3339 6.74016 13.1132 8.05247 14.4255C9.36478 15.7378 11.1441 16.476 12.9999 16.478H13.9999V25.5273C11.703 25.7519 9.55618 26.7701 7.92894 28.4067L9.34294 29.8208C10.1795 28.9844 11.1911 28.344 12.3049 27.9456C13.4187 27.5471 14.607 27.4007 15.7842 27.5167C16.9614 27.6328 18.0982 28.0084 19.1128 28.6167C20.1274 29.2249 20.9944 30.0506 21.6515 31.0342L23.3131 29.9214C22.4934 28.6964 21.4124 27.6681 20.1479 26.9105C18.8834 26.153 17.4668 25.6849 15.9999 25.54V16.478H16.9999C19.9163 16.4747 22.7123 15.3147 24.7745 13.2525C26.8366 11.1904 27.9966 8.39439 27.9999 5.47803V2.47803H24.9999ZM12.9999 14.478C11.6743 14.4765 10.4034 13.9493 9.46607 13.0119C8.52872 12.0745 8.00145 10.8036 7.99994 9.47803V8.47803H8.99994C10.3256 8.47946 11.5965 9.0067 12.5339 9.94407C13.4713 10.8814 13.9985 12.1524 13.9999 13.478V14.478H12.9999ZM25.9999 5.47803C25.9973 7.86416 25.0482 10.1518 23.361 11.8391C21.6737 13.5263 19.3861 14.4754 16.9999 14.478H15.9999V13.478C16.0026 11.0919 16.9516 8.80424 18.6389 7.11699C20.3262 5.42974 22.6138 4.48067 24.9999 4.47803H25.9999V5.47803Z"/>
				</svg>
			{:else if t.icon == 'covid'}
				<!-- covid -->
				<svg class="icon" width="96" height="96" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
					<path d="M15.4998 13.551C16.3282 13.551 16.9998 12.8795 16.9998 12.051C16.9998 11.2226 16.3282 10.551 15.4998 10.551C14.6714 10.551 13.9998 11.2226 13.9998 12.051C13.9998 12.8795 14.6714 13.551 15.4998 13.551Z" fill="black"/>
					<path d="M20.4998 17.551C21.3282 17.551 21.9998 16.8795 21.9998 16.051C21.9998 15.2226 21.3282 14.551 20.4998 14.551C19.6714 14.551 18.9998 15.2226 18.9998 16.051C18.9998 16.8795 19.6714 17.551 20.4998 17.551Z" fill="black"/>
					<path d="M15.9998 17.551C16.5521 17.551 16.9998 17.1033 16.9998 16.551C16.9998 15.9987 16.5521 15.551 15.9998 15.551C15.4475 15.551 14.9998 15.9987 14.9998 16.551C14.9998 17.1033 15.4475 17.551 15.9998 17.551Z" fill="black"/>
					<path d="M16.4998 22.551C17.3282 22.551 17.9998 21.8795 17.9998 21.051C17.9998 20.2226 17.3282 19.551 16.4998 19.551C15.6714 19.551 14.9998 20.2226 14.9998 21.051C14.9998 21.8795 15.6714 22.551 16.4998 22.551Z" fill="black"/>
					<path d="M11.4998 18.551C12.3282 18.551 12.9998 17.8795 12.9998 17.051C12.9998 16.2226 12.3282 15.551 11.4998 15.551C10.6714 15.551 9.99982 16.2226 9.99982 17.051C9.99982 17.8795 10.6714 18.551 11.4998 18.551Z" fill="black"/>
					<path d="M27.9998 13.551V15.551H25.949C25.7522 13.5976 24.9818 11.7461 23.7347 10.2297L25.1714 8.79323L26.5857 10.2077L27.9998 8.79373L23.7576 4.55103L22.3436 5.96513L23.7576 7.37913L22.3206 8.81563C20.8043 7.56879 18.953 6.79852 16.9998 6.60183V4.55103H18.9998V2.55103H12.9998V4.55103H14.9998V6.60183C13.0466 6.79852 11.1953 7.56879 9.67902 8.81563L8.24202 7.37913L9.65602 5.96513L8.24202 4.55103L3.99982 8.79373L5.41392 10.2077L6.82822 8.79323L8.26492 10.2297C7.01787 11.7461 6.24743 13.5976 6.05062 15.551H3.99982V13.551H1.99982V19.551H3.99982V17.551H6.05062C6.24743 19.5044 7.01787 21.3559 8.26492 22.8723L6.82822 24.3088L5.41392 22.8943L3.99982 24.3083L8.24202 28.551L9.65602 27.1369L8.24202 25.7229L9.67902 24.2864C11.1953 25.5333 13.0466 26.3035 14.9998 26.5002V28.551H12.9998V30.551H18.9998V28.551H16.9998V26.5002C18.953 26.3035 20.8043 25.5333 22.3206 24.2864L23.7576 25.7229L22.3436 27.1369L23.7576 28.551L27.9998 24.3083L26.5857 22.8943L25.1714 24.3088L23.7347 22.8723C24.9818 21.3559 25.7522 19.5044 25.949 17.551H27.9998V19.551H29.9998V13.551H27.9998ZM15.9998 24.551C14.4176 24.551 12.8708 24.0818 11.5553 23.2028C10.2397 22.3237 9.21428 21.0743 8.60878 19.6125C8.00328 18.1507 7.84485 16.5422 8.15353 14.9903C8.46222 13.4385 9.22414 12.013 10.343 10.8942C11.4618 9.77535 12.8872 9.01343 14.4391 8.70474C15.9909 8.39606 17.5995 8.55449 19.0613 9.15999C20.5231 9.76549 21.7725 10.7909 22.6516 12.1065C23.5306 13.4221 23.9998 14.9688 23.9998 16.551C23.9974 18.672 23.1537 20.7054 21.654 22.2052C20.1542 23.705 18.1208 24.5486 15.9998 24.551Z" fill="black"/>
				</svg>
			{:else}
				<!-- compliance -->
				<svg class="icon" width="96" height="96" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
					<path d="M15.9999 30.6521C19.3124 30.6521 22.1405 29.4802 24.4843 27.1365C26.828 24.7927 27.9999 21.9646 27.9999 18.6521V6.6521L15.9999 2.6521L3.99988 6.6521V18.6521C3.99988 21.9646 5.17175 24.7927 7.5155 27.1365C9.85925 29.4802 12.6874 30.6521 15.9999 30.6521ZM15.9999 28.4021C13.3124 28.4021 11.0155 27.449 9.10925 25.5427C7.203 23.6365 6.24988 21.3396 6.24988 18.6521V8.3396L15.9999 4.9021L25.7499 8.3396V18.6521C25.7499 21.3396 24.7968 23.6365 22.8905 25.5427C20.9843 27.449 18.6874 28.4021 15.9999 28.4021ZM15.0936 21.9167L23.6059 13.4627L21.9905 11.9284L15.0936 18.7771L11.04 14.7422L9.45718 16.2679L15.0936 21.9167Z"/>
				</svg>
			{/if}

			<!--
			<span style="font-size:8px">
			{t.scale1}<br>
			{t.scale2}
			</span>
			-->
	</div>
	{#if (!harmonious_only && (j+1)%6==0) || (harmonious_only && (j+1)%3==0)}
	<hr>
	{/if}



{/each}



<style>
	.tile {
		background: #fff;
		border-radius:4px;
		display:inline-block;
		width:130px;
		height:130px;
		text-align:center;
		margin:16px;
		box-shadow:0 10px 16px rgba(0,0,0,0.2);
		overflow:hidden;
		position:relative;
	}

	.tile svg {
		position:absolute;
		left:65px;
		top:65px;
		margin-left:-54px;
		margin-top:-54px;
	}
	.tile svg.seg2 {
		margin-left:-34px;
		margin-top:-16px;

	}
	.tile svg.icon {
		margin-left:-48px;
		margin-top:-48px;

	}

	h4 span {
		text-decoration:underline;
		display:inline-block;
		margin-left:16px;
		font-weight:100;
	}
	.controls {
		background:#fafafa;
		position:sticky;
		top:0;
		z-index:100;

	}
	button {
		background:#f0f0f0;
		border:1px solid #999;
		padding:16px 32px;
		border-radius:100px;
		outline:none;
		cursor:pointer;

	}
	button:hover {
		background:#eee;
	}
	button:active {
		background:#ddd;
	}

</style>