<script>
	/*
		start 18:38
		end 23:45
	*/

	let guides = false;

	$:{
		document.body.classList.toggle('guides', guides);
	}

	let page_width = getComputedStyle(document.documentElement).getPropertyValue('--page_width');
	
	$:{
		document.documentElement.style.setProperty('--page_width', page_width);
	}

	let menu_item_rows = getComputedStyle(document.documentElement).getPropertyValue('--menu_item_rows');
	let menu_item_height = getComputedStyle(document.documentElement).getPropertyValue('--menu_item_height');
	let menu_item_width = getComputedStyle(document.documentElement).getPropertyValue('--menu_item_width');
	let menu_selected_icon = getComputedStyle(document.documentElement).getPropertyValue('--menu_selected_icon');
	let menu_selected_pill = getComputedStyle(document.documentElement).getPropertyValue('--menu_selected_pill');
	let menu_selected_pill_icon = getComputedStyle(document.documentElement).getPropertyValue('--menu_selected_pill_icon');
	let menu_selected_pill_icon_hover = getComputedStyle(document.documentElement).getPropertyValue('--menu_selected_pill_icon_hover');
	let highlight = getComputedStyle(document.documentElement).getPropertyValue('--highlight');

	$:{ document.documentElement.style.setProperty('--menu_item_rows', menu_item_rows); }
	$:{ document.documentElement.style.setProperty('--menu_item_height', menu_item_height); }
	$:{ document.documentElement.style.setProperty('--menu_item_width', menu_item_width); }
	$:{ document.documentElement.style.setProperty('--menu_selected_icon', menu_selected_icon); }
	$:{ document.documentElement.style.setProperty('--menu_selected_pill', menu_selected_pill); }
	$:{ document.documentElement.style.setProperty('--menu_selected_pill_icon', menu_selected_pill_icon); }
	$:{ document.documentElement.style.setProperty('--menu_selected_pill_icon_hover', menu_selected_pill_icon_hover); }
	$:{ document.documentElement.style.setProperty('--highlight', highlight); }


	let menu_modules_in = false;
	let menu_switcher_in = false;
	let menu_notifications_in = false;

	let modules = [
		{ title: "Incident"},
		{ title: "Action"},
		{ title: "Audit"},
		{ title: "Risk"},
		{ title: "Tracker"},
		{ title: "Environmental Performance (EP)"},
		{ title: "Permit to Work"},
		{ title: "Document"},
		{ title: "Observation"},
		{ title: "Period Statistics"},
		{ title: "Administration"},
		{ title: "Schedule"},
		{ title: "Advanced Root Cause Analysis (ARCA)"},
		{ title: "Corporate Social Responsibility (CSR)"},
		{ title: "Register"},
		{ title: "Lost Time"},
		{ title: "Point of Work"}
	];
	let selected_module = false;

	function clickbody() {
		menu_modules_in = false;
		menu_switcher_in = false;
		menu_notifications_in = false;
	}
</script>
<svelte:body
	on:click={clickbody}
/>

<div class="header">
	<div class="page-wrapper">
		<!-- BRAND -->
		<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M0 23.4806C2.5519 21.802 8.1519 17.8792 8.78987 17.3138C10.438 15.9002 16.4278 10.175 16.5342 9.78628C16.5342 9.78628 16.9595 7.84256 18.4835 7.20644C19.6532 6.72934 21.1595 7.0754 22.081 8.64805C22.081 8.64805 23.5201 9.08157 23.5201 9.36429C23.5201 9.541 22.081 10.0605 22.081 10.0605C21.957 10.1135 21.2658 10.5991 21.4076 11.2352C25.2532 22.9859 7.76203 23.781 7.76203 23.781L7.92152 23.9754C10.4025 26.785 13.2203 28.2516 15.9848 29.1174C17.7215 29.1174 28 24.8059 28 14.8223C28 3.83144 28 2.11743 28 2.11743H4.37722V14.7163" stroke="#1A1919" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
		<span class="brand">EcoOnline</span>


		<!-- SEARCH -->
		<div class="search-box">
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
				<path d="M29,27.5859l-7.5521-7.5521a11.0177,11.0177,0,1,0-1.4141,1.4141L27.5859,29ZM4,13a9,9,0,1,1,9,9A9.01,9.01,0,0,1,4,13Z" transform="translate(0 0)"/>
			</svg>
			<input placeholder="Search here" type="text">
		</div>


		<!-- MENU ITEMS -->
		<div class="menu-items">
			<div class="dd" class:in="{menu_modules_in}" on:click|stopPropagation="{() => { menu_modules_in = !menu_modules_in }}">
				<div class="icon-holder">
					<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="32px" height="32px" viewBox="0 0 32 32" xml:space="preserve">
						<rect x="14" y="4" width="4" height="4"/>
						<rect x="4" y="4" width="4" height="4"/>
						<rect x="24" y="4" width="4" height="4"/>
						<rect x="14" y="14" width="4" height="4"/>
						<rect x="4" y="14" width="4" height="4"/>
						<rect x="24" y="14" width="4" height="4"/>
						<rect x="14" y="24" width="4" height="4"/>
						<rect x="4" y="24" width="4" height="4"/>
						<rect x="24" y="24" width="4" height="4"/>
					</svg>
				</div>
				<div class="dd-menu dd-menu-right">
					<div class="dd-header">
						<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="20px" height="20px" viewBox="0 0 32 32" xml:space="preserve">
							<rect x="14" y="4" width="4" height="4"/>
							<rect x="4" y="4" width="4" height="4"/>
							<rect x="24" y="4" width="4" height="4"/>
							<rect x="14" y="14" width="4" height="4"/>
							<rect x="4" y="14" width="4" height="4"/>
							<rect x="24" y="14" width="4" height="4"/>
							<rect x="14" y="24" width="4" height="4"/>
							<rect x="4" y="24" width="4" height="4"/>
							<rect x="24" y="24" width="4" height="4"/>
						</svg>
						 Modules
					</div>
					<div class="dd-items">
						{#each modules as m}
							<div class="dd-item" class:selected={selected_module == m} on:click="{ () => { selected_module = m}}">
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><rect x="6.34" y="19" width="11.31" height="2" transform="translate(-10.63 14.34) rotate(-45)"/><path d="M17,30a1,1,0,0,1-.37-.07,1,1,0,0,1-.62-.79l-1-7,2-.28.75,5.27L21,24.52V17a1,1,0,0,1,.29-.71l4.07-4.07A8.94,8.94,0,0,0,28,5.86V4H26.14a8.94,8.94,0,0,0-6.36,2.64l-4.07,4.07A1,1,0,0,1,15,11H7.48L4.87,14.26l5.27.75-.28,2-7-1a1,1,0,0,1-.79-.62,1,1,0,0,1,.15-1l4-5A1,1,0,0,1,7,9h7.59l3.77-3.78A10.92,10.92,0,0,1,26.14,2H28a2,2,0,0,1,2,2V5.86a10.92,10.92,0,0,1-3.22,7.78L23,17.41V25a1,1,0,0,1-.38.78l-5,4A1,1,0,0,1,17,30Z"/></svg>
								<div class="dd-item-name">{m.title}</div>
								<div class="dd-item-actions">
									<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><path d="M16,4c6.6,0,12,5.4,12,12s-5.4,12-12,12S4,22.6,4,16S9.4,4,16,4 M16,2C8.3,2,2,8.3,2,16s6.3,14,14,14s14-6.3,14-14 S23.7,2,16,2z"/><polygon points="24,15 17,15 17,8 15,8 15,15 8,15 8,17 15,17 15,24 17,24 17,17 24,17 "/></svg>

									<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><path d="M18,28H14a2,2,0,0,1-2-2V18.41L4.59,11A2,2,0,0,1,4,9.59V6A2,2,0,0,1,6,4H26a2,2,0,0,1,2,2V9.59A2,2,0,0,1,27.41,11L20,18.41V26A2,2,0,0,1,18,28ZM6,6V9.59l8,8V26h4V17.59l8-8V6Z"/></svg>


									<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><path d="M27,28V6H19V28H15V14H7V28H4V2H2V28a2,2,0,0,0,2,2H30V28ZM13,28H9V16h4Zm12,0H21V8h4Z"/></svg>

									<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><defs><style>.cls-1{fill:none;}</style></defs><title>settings</title><path d="M27,16.76c0-.25,0-.5,0-.76s0-.51,0-.77l1.92-1.68A2,2,0,0,0,29.3,11L26.94,7a2,2,0,0,0-1.73-1,2,2,0,0,0-.64.1l-2.43.82a11.35,11.35,0,0,0-1.31-.75l-.51-2.52a2,2,0,0,0-2-1.61H13.64a2,2,0,0,0-2,1.61l-.51,2.52a11.48,11.48,0,0,0-1.32.75L7.43,6.06A2,2,0,0,0,6.79,6,2,2,0,0,0,5.06,7L2.7,11a2,2,0,0,0,.41,2.51L5,15.24c0,.25,0,.5,0,.76s0,.51,0,.77L3.11,18.45A2,2,0,0,0,2.7,21L5.06,25a2,2,0,0,0,1.73,1,2,2,0,0,0,.64-.1l2.43-.82a11.35,11.35,0,0,0,1.31.75l.51,2.52a2,2,0,0,0,2,1.61h4.72a2,2,0,0,0,2-1.61l.51-2.52a11.48,11.48,0,0,0,1.32-.75l2.42.82a2,2,0,0,0,.64.1,2,2,0,0,0,1.73-1L29.3,21a2,2,0,0,0-.41-2.51ZM25.21,24l-3.43-1.16a8.86,8.86,0,0,1-2.71,1.57L18.36,28H13.64l-.71-3.55a9.36,9.36,0,0,1-2.7-1.57L6.79,24,4.43,20l2.72-2.4a8.9,8.9,0,0,1,0-3.13L4.43,12,6.79,8l3.43,1.16a8.86,8.86,0,0,1,2.71-1.57L13.64,4h4.72l.71,3.55a9.36,9.36,0,0,1,2.7,1.57L25.21,8,27.57,12l-2.72,2.4a8.9,8.9,0,0,1,0,3.13L27.57,20Z" transform="translate(0 0)"/><path d="M16,22a6,6,0,1,1,6-6A5.94,5.94,0,0,1,16,22Zm0-10a3.91,3.91,0,0,0-4,4,3.91,3.91,0,0,0,4,4,3.91,3.91,0,0,0,4-4A3.91,3.91,0,0,0,16,12Z" transform="translate(0 0)"/></svg>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
			<!--
			<div class="dd">
				<div class="icon-holder">
					<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
						<path d="M26,16.5859V14H24v3a1,1,0,0,0,.293.707L27,20.4141V22H5V20.4141L7.707,17.707A1,1,0,0,0,8,17V13A7.9854,7.9854,0,0,1,20,6.0825V3.8467a9.896,9.896,0,0,0-3-.7959V1H15V3.0508A10.0136,10.0136,0,0,0,6,13v3.5859L3.293,19.293A1,1,0,0,0,3,20v3a1,1,0,0,0,1,1h7v1a5,5,0,0,0,10,0V24h7a1,1,0,0,0,1-1V20a1,1,0,0,0-.293-.707ZM19,25a3,3,0,0,1-6,0V24h6Z"/>
						<circle cx="26" cy="8" r="4" fill="#1CD390"/>
					</svg>
				</div>
			</div>
			-->
		</div>
	</div>
</div>

<div class="contents">
	<div class="page-wrapper">


		<div class="table-wrapper">
			<table>
				<thead>
					<tr>
						<th><input type="checkbox"/></th>
						<th>Product</th>
						<th>Language</th>
						<th>Location</th>
						<th>Supplier</th>
						<th>Hazard Labelling</th>
						<th>Article No.</th>
						<th>SDS</th>
						<th>SPS</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td><input type="checkbox"/></td>
						<td>Ardex A 31</td>
						<td>Norwegian</td>
						<td>221B Baker Street</td>
						<td>C Christoferssen</td>
						<td>- - </td>
						<td>KS468</td>
						<td>
							<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
								<path d="M26,24v4H6V24H4v4H4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2h0V24Z"/>
								<polygon points="26 14 24.59 12.59 17 20.17 17 2 15 2 15 20.17 7.41 12.59 6 14 16 24 26 14"/>
							</svg>
						</td>
						<td>
							<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
								<path d="M26,24v4H6V24H4v4H4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2h0V24Z"/>
								<polygon points="26 14 24.59 12.59 17 20.17 17 2 15 2 15 20.17 7.41 12.59 6 14 16 24 26 14"/>
							</svg>
						</td>
					</tr>
					<tr>
						<td><input type="checkbox"/></td>
						<td>Ardex A 31</td>
						<td>Norwegian</td>
						<td>221B Baker Street</td>
						<td>C Christoferssen</td>
						<td>- - </td>
						<td>KS468</td>
						<td>
							<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
								<path d="M26,24v4H6V24H4v4H4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2h0V24Z"/>
								<polygon points="26 14 24.59 12.59 17 20.17 17 2 15 2 15 20.17 7.41 12.59 6 14 16 24 26 14"/>
							</svg>
						</td>
						<td>
							<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
								<path d="M26,24v4H6V24H4v4H4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2h0V24Z"/>
								<polygon points="26 14 24.59 12.59 17 20.17 17 2 15 2 15 20.17 7.41 12.59 6 14 16 24 26 14"/>
							</svg>
						</td>
					</tr>
					<tr>
						<td><input type="checkbox"/></td>
						<td>Ardex A 31</td>
						<td>Norwegian</td>
						<td>221B Baker Street</td>
						<td>C Christoferssen</td>
						<td>- - </td>
						<td>KS468</td>
						<td>
							<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
								<path d="M26,24v4H6V24H4v4H4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2h0V24Z"/>
								<polygon points="26 14 24.59 12.59 17 20.17 17 2 15 2 15 20.17 7.41 12.59 6 14 16 24 26 14"/>
							</svg>
						</td>
						<td>
							<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
								<path d="M26,24v4H6V24H4v4H4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2h0V24Z"/>
								<polygon points="26 14 24.59 12.59 17 20.17 17 2 15 2 15 20.17 7.41 12.59 6 14 16 24 26 14"/>
							</svg>
						</td>
					</tr>
					<tr>
						<td><input type="checkbox"/></td>
						<td>Ardex A 31</td>
						<td>Norwegian</td>
						<td>221B Baker Street</td>
						<td>C Christoferssen</td>
						<td>- - </td>
						<td>KS468</td>
						<td>
							<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
								<path d="M26,24v4H6V24H4v4H4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2h0V24Z"/>
								<polygon points="26 14 24.59 12.59 17 20.17 17 2 15 2 15 20.17 7.41 12.59 6 14 16 24 26 14"/>
							</svg>
						</td>
						<td>
							<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
								<path d="M26,24v4H6V24H4v4H4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2h0V24Z"/>
								<polygon points="26 14 24.59 12.59 17 20.17 17 2 15 2 15 20.17 7.41 12.59 6 14 16 24 26 14"/>
							</svg>
						</td>
					</tr>
					<tr>
						<td><input type="checkbox"/></td>
						<td>Ardex A 31</td>
						<td>Norwegian</td>
						<td>221B Baker Street</td>
						<td>C Christoferssen</td>
						<td>- - </td>
						<td>KS468</td>
						<td>
							<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
								<path d="M26,24v4H6V24H4v4H4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2h0V24Z"/>
								<polygon points="26 14 24.59 12.59 17 20.17 17 2 15 2 15 20.17 7.41 12.59 6 14 16 24 26 14"/>
							</svg>
						</td>
						<td>
							<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
								<path d="M26,24v4H6V24H4v4H4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2h0V24Z"/>
								<polygon points="26 14 24.59 12.59 17 20.17 17 2 15 2 15 20.17 7.41 12.59 6 14 16 24 26 14"/>
							</svg>
						</td>
					</tr>
					<tr>
						<td><input type="checkbox"/></td>
						<td>Ardex A 31</td>
						<td>Norwegian</td>
						<td>221B Baker Street</td>
						<td>C Christoferssen</td>
						<td>- - </td>
						<td>KS468</td>
						<td>
							<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
								<path d="M26,24v4H6V24H4v4H4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2h0V24Z"/>
								<polygon points="26 14 24.59 12.59 17 20.17 17 2 15 2 15 20.17 7.41 12.59 6 14 16 24 26 14"/>
							</svg>
						</td>
						<td>
							<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
								<path d="M26,24v4H6V24H4v4H4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2h0V24Z"/>
								<polygon points="26 14 24.59 12.59 17 20.17 17 2 15 2 15 20.17 7.41 12.59 6 14 16 24 26 14"/>
							</svg>
						</td>
					</tr>
					<tr>
						<td><input type="checkbox"/></td>
						<td>Ardex A 31</td>
						<td>Norwegian</td>
						<td>221B Baker Street</td>
						<td>C Christoferssen</td>
						<td>- - </td>
						<td>KS468</td>
						<td>
							<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
								<path d="M26,24v4H6V24H4v4H4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2h0V24Z"/>
								<polygon points="26 14 24.59 12.59 17 20.17 17 2 15 2 15 20.17 7.41 12.59 6 14 16 24 26 14"/>
							</svg>
						</td>
						<td>
							<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
								<path d="M26,24v4H6V24H4v4H4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2h0V24Z"/>
								<polygon points="26 14 24.59 12.59 17 20.17 17 2 15 2 15 20.17 7.41 12.59 6 14 16 24 26 14"/>
							</svg>
						</td>
					</tr>
					<tr>
						<td><input type="checkbox"/></td>
						<td>Ardex A 31</td>
						<td>Norwegian</td>
						<td>221B Baker Street</td>
						<td>C Christoferssen</td>
						<td>- - </td>
						<td>KS468</td>
						<td>
							<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
								<path d="M26,24v4H6V24H4v4H4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2h0V24Z"/>
								<polygon points="26 14 24.59 12.59 17 20.17 17 2 15 2 15 20.17 7.41 12.59 6 14 16 24 26 14"/>
							</svg>
						</td>
						<td>
							<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
								<path d="M26,24v4H6V24H4v4H4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2h0V24Z"/>
								<polygon points="26 14 24.59 12.59 17 20.17 17 2 15 2 15 20.17 7.41 12.59 6 14 16 24 26 14"/>
							</svg>
						</td>
					</tr>
					<tr>
						<td><input type="checkbox"/></td>
						<td>Ardex A 31</td>
						<td>Norwegian</td>
						<td>221B Baker Street</td>
						<td>C Christoferssen</td>
						<td>- - </td>
						<td>KS468</td>
						<td>
							<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
								<path d="M26,24v4H6V24H4v4H4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2h0V24Z"/>
								<polygon points="26 14 24.59 12.59 17 20.17 17 2 15 2 15 20.17 7.41 12.59 6 14 16 24 26 14"/>
							</svg>
						</td>
						<td>
							<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
								<path d="M26,24v4H6V24H4v4H4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2h0V24Z"/>
								<polygon points="26 14 24.59 12.59 17 20.17 17 2 15 2 15 20.17 7.41 12.59 6 14 16 24 26 14"/>
							</svg>
						</td>
					</tr>
					<tr>
						<td><input type="checkbox"/></td>
						<td>Ardex A 31</td>
						<td>Norwegian</td>
						<td>221B Baker Street</td>
						<td>C Christoferssen</td>
						<td>- - </td>
						<td>KS468</td>
						<td>
							<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
								<path d="M26,24v4H6V24H4v4H4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2h0V24Z"/>
								<polygon points="26 14 24.59 12.59 17 20.17 17 2 15 2 15 20.17 7.41 12.59 6 14 16 24 26 14"/>
							</svg>
						</td>
						<td>
							<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
								<path d="M26,24v4H6V24H4v4H4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2h0V24Z"/>
								<polygon points="26 14 24.59 12.59 17 20.17 17 2 15 2 15 20.17 7.41 12.59 6 14 16 24 26 14"/>
							</svg>
						</td>
					</tr>
					<tr>
						<td><input type="checkbox"/></td>
						<td>Ardex A 31</td>
						<td>Norwegian</td>
						<td>221B Baker Street</td>
						<td>C Christoferssen</td>
						<td>- - </td>
						<td>KS468</td>
						<td>
							<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
								<path d="M26,24v4H6V24H4v4H4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2h0V24Z"/>
								<polygon points="26 14 24.59 12.59 17 20.17 17 2 15 2 15 20.17 7.41 12.59 6 14 16 24 26 14"/>
							</svg>
						</td>
						<td>
							<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
								<path d="M26,24v4H6V24H4v4H4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2h0V24Z"/>
								<polygon points="26 14 24.59 12.59 17 20.17 17 2 15 2 15 20.17 7.41 12.59 6 14 16 24 26 14"/>
							</svg>
						</td>
					</tr>
					<tr>
						<td><input type="checkbox"/></td>
						<td>Ardex A 31</td>
						<td>Norwegian</td>
						<td>221B Baker Street</td>
						<td>C Christoferssen</td>
						<td>- - </td>
						<td>KS468</td>
						<td>
							<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
								<path d="M26,24v4H6V24H4v4H4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2h0V24Z"/>
								<polygon points="26 14 24.59 12.59 17 20.17 17 2 15 2 15 20.17 7.41 12.59 6 14 16 24 26 14"/>
							</svg>
						</td>
						<td>
							<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
								<path d="M26,24v4H6V24H4v4H4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2h0V24Z"/>
								<polygon points="26 14 24.59 12.59 17 20.17 17 2 15 2 15 20.17 7.41 12.59 6 14 16 24 26 14"/>
							</svg>
						</td>
					</tr>
					<tr>
						<td><input type="checkbox"/></td>
						<td>Ardex A 31</td>
						<td>Norwegian</td>
						<td>221B Baker Street</td>
						<td>C Christoferssen</td>
						<td>- - </td>
						<td>KS468</td>
						<td>
							<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
								<path d="M26,24v4H6V24H4v4H4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2h0V24Z"/>
								<polygon points="26 14 24.59 12.59 17 20.17 17 2 15 2 15 20.17 7.41 12.59 6 14 16 24 26 14"/>
							</svg>
						</td>
						<td>
							<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
								<path d="M26,24v4H6V24H4v4H4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2h0V24Z"/>
								<polygon points="26 14 24.59 12.59 17 20.17 17 2 15 2 15 20.17 7.41 12.59 6 14 16 24 26 14"/>
							</svg>
						</td>
					</tr>
					<tr>
						<td><input type="checkbox"/></td>
						<td>Ardex A 31</td>
						<td>Norwegian</td>
						<td>221B Baker Street</td>
						<td>C Christoferssen</td>
						<td>- - </td>
						<td>KS468</td>
						<td>
							<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
								<path d="M26,24v4H6V24H4v4H4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2h0V24Z"/>
								<polygon points="26 14 24.59 12.59 17 20.17 17 2 15 2 15 20.17 7.41 12.59 6 14 16 24 26 14"/>
							</svg>
						</td>
						<td>
							<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
								<path d="M26,24v4H6V24H4v4H4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2h0V24Z"/>
								<polygon points="26 14 24.59 12.59 17 20.17 17 2 15 2 15 20.17 7.41 12.59 6 14 16 24 26 14"/>
							</svg>
						</td>
					</tr>
					<tr>
						<td><input type="checkbox"/></td>
						<td>Ardex A 31</td>
						<td>Norwegian</td>
						<td>221B Baker Street</td>
						<td>C Christoferssen</td>
						<td>- - </td>
						<td>KS468</td>
						<td>
							<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
								<path d="M26,24v4H6V24H4v4H4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2h0V24Z"/>
								<polygon points="26 14 24.59 12.59 17 20.17 17 2 15 2 15 20.17 7.41 12.59 6 14 16 24 26 14"/>
							</svg>
						</td>
						<td>
							<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
								<path d="M26,24v4H6V24H4v4H4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2h0V24Z"/>
								<polygon points="26 14 24.59 12.59 17 20.17 17 2 15 2 15 20.17 7.41 12.59 6 14 16 24 26 14"/>
							</svg>
						</td>
					</tr>
					<tr>
						<td><input type="checkbox"/></td>
						<td>Ardex A 31</td>
						<td>Norwegian</td>
						<td>221B Baker Street</td>
						<td>C Christoferssen</td>
						<td>- - </td>
						<td>KS468</td>
						<td>
							<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
								<path d="M26,24v4H6V24H4v4H4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2h0V24Z"/>
								<polygon points="26 14 24.59 12.59 17 20.17 17 2 15 2 15 20.17 7.41 12.59 6 14 16 24 26 14"/>
							</svg>
						</td>
						<td>
							<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
								<path d="M26,24v4H6V24H4v4H4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2h0V24Z"/>
								<polygon points="26 14 24.59 12.59 17 20.17 17 2 15 2 15 20.17 7.41 12.59 6 14 16 24 26 14"/>
							</svg>
						</td>
					</tr>
					<tr>
						<td><input type="checkbox"/></td>
						<td>Ardex A 31</td>
						<td>Norwegian</td>
						<td>221B Baker Street</td>
						<td>C Christoferssen</td>
						<td>- - </td>
						<td>KS468</td>
						<td>
							<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
								<path d="M26,24v4H6V24H4v4H4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2h0V24Z"/>
								<polygon points="26 14 24.59 12.59 17 20.17 17 2 15 2 15 20.17 7.41 12.59 6 14 16 24 26 14"/>
							</svg>
						</td>
						<td>
							<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
								<path d="M26,24v4H6V24H4v4H4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2h0V24Z"/>
								<polygon points="26 14 24.59 12.59 17 20.17 17 2 15 2 15 20.17 7.41 12.59 6 14 16 24 26 14"/>
							</svg>
						</td>
					</tr>
					<tr>
						<td><input type="checkbox"/></td>
						<td>Ardex A 31</td>
						<td>Norwegian</td>
						<td>221B Baker Street</td>
						<td>C Christoferssen</td>
						<td>- - </td>
						<td>KS468</td>
						<td>
							<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
								<path d="M26,24v4H6V24H4v4H4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2h0V24Z"/>
								<polygon points="26 14 24.59 12.59 17 20.17 17 2 15 2 15 20.17 7.41 12.59 6 14 16 24 26 14"/>
							</svg>
						</td>
						<td>
							<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
								<path d="M26,24v4H6V24H4v4H4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2h0V24Z"/>
								<polygon points="26 14 24.59 12.59 17 20.17 17 2 15 2 15 20.17 7.41 12.59 6 14 16 24 26 14"/>
							</svg>
						</td>
					</tr>
					<tr>
						<td><input type="checkbox"/></td>
						<td>Ardex A 31</td>
						<td>Norwegian</td>
						<td>221B Baker Street</td>
						<td>C Christoferssen</td>
						<td>- - </td>
						<td>KS468</td>
						<td>
							<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
								<path d="M26,24v4H6V24H4v4H4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2h0V24Z"/>
								<polygon points="26 14 24.59 12.59 17 20.17 17 2 15 2 15 20.17 7.41 12.59 6 14 16 24 26 14"/>
							</svg>
						</td>
						<td>
							<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
								<path d="M26,24v4H6V24H4v4H4a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2h0V24Z"/>
								<polygon points="26 14 24.59 12.59 17 20.17 17 2 15 2 15 20.17 7.41 12.59 6 14 16 24 26 14"/>
							</svg>
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		
		<h4>Controls</h4>
		<label><input type="checkbox" bind:checked={guides}/> <code>Show guides</code></label>
		<label><input type="text" bind:value="{page_width}"/> <code>Max page width</code></label>
		<label><input type="text" bind:value="{menu_item_rows}"/> <code>Full menu rows (not including header)</code></label>
		<label><input type="text" bind:value="{menu_item_height}"/> <code>Menu row height</code></label>
		<label><input type="text" bind:value="{menu_item_width}"/> <code>Menu width</code></label>
		<label><input type="text" bind:value="{menu_selected_icon}"/> <code>Menu selected colour</code></label>
		<label><input type="text" bind:value="{menu_selected_pill}"/> <code>Menu selected pill colour</code></label>
		<label><input type="text" bind:value="{menu_selected_pill_icon}"/> <code>Menu selected pill icon colour</code></label>
		<label><input type="text" bind:value="{menu_selected_pill_icon_hover}"/> <code>Menu pill icon hover</code></label>

		<label><input type="text" bind:value="{highlight}"/> <code>Hover background colour (table and menu item)</code></label>
		
	</div>
</div>

<style>

	.header {
		background:#fff;
		box-shadow:0 1px 1px rgb(0 0 0 / 16%);
		width:100%;
		height:56px;
		position:fixed;
		padding: 12px 0;
		box-sizing: border-box;
		z-index: 10;
	}
	.header svg{
		vertical-align:middle;
	}

	.brand {
		font-weight:600;
		vertical-align:middle;
		padding-left: 5px;
	}
	.search-box {
		height:32px;
		border:1px solid var(--border);
		border-radius: 20px;
		line-height: 32px;
		padding-left: 16px;
		width: 400px;
		max-width: calc(100% - 400px);
		display: inline-block;
		margin-left:32px;

	}
	.search-box input {
		width:calc(100% - 48px);
		border: none;
	}
	.search-box input:focus {
		width:calc(100% - 48px);
		border: none;
		outline:none;
	}
	.menu-items {
		display:inline-block;
		position:absolute;
		right:16px;
		top: -8px;
		width:48px;
	}
	.icon-holder {
		width:48px;
		height:48px;
		border-radius:24px;
		text-align:center;
		line-height:48px;
		cursor:pointer;
		display:inline-block;
	}
	.dd {
		display:inline-block;
		position:relative;
	}
	.dd:hover .icon-holder, .dd.in .icon-holder {
		background-color:var(--highlight);
	}
	.dd-menu {
		/*display:none;*/
		position:absolute;
		background:#fff;
		box-shadow:0 4px 20px rgba(0,0,0,0.16);
		width:auto;
		height:auto;
		max-height:0;
		overflow: hidden;
		transition: max-height 0.5s linear;
		top:64px;
		left:0px;
		min-width:var(--menu_item_width);
		z-index:99;
		border-radius:8px;
	}
	.dd-menu.dd-menu-right {
		left:auto;
		right:-16px;
	}

	.dd.in .icon-holder svg {
		fill: var(--menu_selected_icon);
	}
	.dd.in .dd-menu {
		/*display:block;*/
		overflow: unset;
		max-height: min(80vh, calc(var(--menu_item_height) * (var(--menu_item_rows) + 1) + (var(--menu_item_height)/1.7)) );
	}
	.dd .dd-items {
		max-height:0;
		transition: max-height 0.5s linear;
		overflow:auto;
	}
	.dd.in .dd-items {
		max-height: min(calc(80vh - var(--menu_item_height)), calc(var(--menu_item_height) * var(--menu_item_rows) + (var(--menu_item_height)/1.7)));
		overflow:auto;
	}
	.dd.in .dd-menu:after {
		content:'';
		display:block;
		position:absolute;
		border-left: 10px solid transparent;
		border-right: 10px solid transparent;
		border-bottom: 10px solid var(--surface_reduced);
		border-top: 10px solid transparent;
		right:32px;
		top:-20px;
	}
	.dd-header {
		background:var(--surface_reduced);
		font-weight:600;
		box-shadow:0 1px 1px rgb(0 0 0 / 16%);
		border-top-left-radius:8px;
		border-top-right-radius:8px;
	}
	.dd-header, .dd-item {
		height: var(--menu_item_height);
		padding:16px;
		box-sizing:border-box;
		position:relative;
	}
	.dd-header svg {
		vertical-align: bottom;
	}
	.dd-item svg {
		vertical-align: top;
	}
	.dd-item:hover {
		cursor:pointer;
		background: var(--highlight);
	}
	.dd-item.selected, .dd-item.selected:hover {
		background: var(--brand_blue);
		color:#fff;
		fill:#fff;
	}
	.dd-item-name {
		display:inline-block;
		max-width:calc(var(--menu_item_width) - 80px);
		text-overflow:ellipsis;
		white-space: nowrap;
		overflow:hidden;
	}
	.dd-item-actions {
		position:absolute;
		right:16px;
		padding:4px 12px;
		height:28px;
		border-radius:14px;
		display:none;
		background:#fff;
		box-sizing: border-box;
    	top: 10px;
    	box-shadow:-16px 0 8px var(--highlight);
	}
	.dd-item:hover .dd-item-actions {
		display:inline-block;
	}
	.dd-item.selected .dd-item-actions {
		background: var(--menu_selected_pill);
		display:inline-block;
    	box-shadow:-16px 0 8px var(--brand_blue);
	}
	.dd-item.selected .dd-item-actions svg{
		fill: var(--menu_selected_pill_icon);
	}
	.dd-item .dd-item-actions svg:hover {
		fill: var(--menu_selected_pill_icon_hover);
	}
	



	.contents {
		padding-top:72px;
	}
	.page-wrapper {
		width:var(--page_width);
		max-width:calc(100% - 32px);
		margin: 0 auto;
		padding:0 16px;
		min-height:56px;
		position:relative;
	}
	.contents .page-wrapper {
		min-height: calc(100vh - 72px);
	}
	:global(body.guides .page-wrapper){
		border-left:1px solid rgba(0,0,0,0.1);
		border-right:1px solid rgba(0,0,0,0.1);
	}
	:global(body.guides .contents .page-wrapper:after){
		content: '';
		display: block;
		position: fixed;
		width: var(--page_width);
		height: 100%;
		background: linear-gradient(90deg, rgba(255,0,0,0.1) calc(100% - 16px), rgba(0,0,0,0) 50%, rgba(0,0,0,0) 0), transparent;
		background-size: calc((var(--page_width) + 16px)/16) auto;
		top: 0px;
		pointer-events: none;
		z-index:99;
	}


	label {
		display:block;
		line-height:32px;
	}







</style>