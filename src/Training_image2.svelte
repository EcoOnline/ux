<script>

	let drop_region;
	let highlight = false;
	let file_input;
	let images = [];
	let loader_image;
	let downloader;

	let blendmodes = [
		"multiply",
		"soft-light",
		"overlay"
	]
	let blendmode = blendmodes[0];
	let opacity = 25;

	let colors = [
		"#47C9EB",
		"#007CFF",
		"#34B2A7",
		"#92D65C",
		"#B2A1F7",
		"#EB6047",
		"#F6D965",
		"#ECA047"
	]
	let lesson_types = [
		{"code": "E", "name": "E-Lesson"},
		{"code": "M", "name": "Micro-Lesson"}
	];
	let lesson_type = lesson_types[0];
	let categories = [
		{"code": "01", "color": colors[0], "name": "Safety Management & Culture"},
		{"code": "02", "color": colors[1], "name": "Accidents Hazards & Strain Factors"},
		{"code": "03", "color": colors[2], "name": "Personal Protective Equipment"},
		{"code": "04", "color": colors[3], "name": "Psychosocial Factors"},
		{"code": "05", "color": colors[4], "name": "Chemical Management"},
		{"code": "06", "color": colors[5], "name": "Legislation"},
		{"code": "07", "color": colors[6], "name": "Human Factor"},
		{"code": "08", "color": colors[7], "name": "First Aid and Fire Safety"}
	];
	let category = categories[0];
	let course_number = '123';
	let segment = 1;
	let src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
	
	let logos = [
		{"code": "eco", "name": "EcoOnline"},
		{"code": "ihasco", "name": "iHasco"}
	]
	let logo = logos[0]
	let include_logo = true;
	let include_code = true;
	$: whole_course_code = category.code + lesson_type.code + course_number;


	let reader = new FileReader();
	
	reader.onload = function(e) {
		loader_image.src = e.target.result;
	}
	function save_image() {
		src = loader_image.src;
		segment = Math.floor(Math.random() * 4) + 1;

		/*
		let new_image = {
			"code": whole_course_code,
			"lesson_type": lesson_type,
			"category": category,
			"segment": Math.floor(Math.random() * 4) + 1,
			"x": "center",
			"y": "center",
			"src": loader_image.src
		}
		console.log(new_image);
		images.unshift(new_image);
		loader_image.src = '';
		images = images;
		*/
	}
	function drop_click() {
		file_input.click();
	} 

	function change_file() {
		let files = file_input.files;
		handle_files(files);
	}
	function drop_file(e) {
		e.preventDefault();
		let files = e.dataTransfer.files;
		handle_files(files);
		unhighlights();
	}


	function handle_files(files) {
		for (var i = 0, len = files.length; i < len; i++) {
			reader.readAsDataURL(files[i]);
		}
	}
	
	function highlights() {
		highlight = true;
	}
	function unhighlights() {
		highlight = false;
	}

	function download_image(e) {
		let t = e.target;
		t = t.parentNode.previousElementSibling;
		/*
		if(!t.classList.contains('web_image') && !t.classList.contains('mobile_image')) {
			t = t.parentNode.parentNode;
		}
		*/
		html2canvas(t, {
			imageTimeout: 0,
			width: 560,
			height:373.33,
			backgroundColor:category.color
		}).then(canvas => {
			let resource = canvas.toDataURL("image/png");
			downloader.parentNode.href = resource;
			downloader.src = resource;
			downloader.parentNode.setAttribute("download", whole_course_code);
		});
	}



</script>


<div class="page">
	

	<img bind:this="{loader_image}" on:load="{save_image}" class="loader_image" src="" alt="loader_img"/>
	
	<div class="courses">

		<div class="course" class:include_code class:include_logo>
			<div class="training_img category_{category.code}" style="background-color: {category.color};border-bottom:16px solid {category.color}">
				
				<div style="background-image:url({src})"></div>
				<div class="overlay" style="background-color: {category.color};opacity:{opacity/100}"></div>
				<div class="testsvg"></div>
				{#if logo.code == 'eco'}
					<svg style="right:32px" fill="#fff" class="logo" width="48" height="48" viewBox="0 0 43 43" xmlns="http://www.w3.org/2000/svg">
						<path fill="#fff" d="M21.8074 15.1033L22.5949 13.3708C23.1461 12.0845 24.4324 11.2708 25.8236 11.2708C26.7686 11.2708 27.6611 11.6383 28.3174 12.3208L29.2361 13.2395C27.6086 14.132 26.5061 15.8645 26.5061 17.8333V20.7733C26.5061 25.0258 23.6186 28.6745 19.5236 29.6983L10.6249 31.877C10.1786 31.982 9.8111 32.3233 9.67985 32.7695C9.5486 33.2158 9.6536 33.6883 9.9686 34.0295C15.0349 39.6208 21.9911 41.3533 22.2799 41.432C22.3849 41.4583 22.4899 41.4583 22.5949 41.4583C22.6999 41.4583 22.8049 41.4583 22.9099 41.432C23.0411 41.3795 40.2874 37.0483 40.2874 20.4583V4.70825C40.2874 3.2645 39.1061 2.08325 37.6624 2.08325H7.47485C6.0311 2.08325 4.84985 3.2645 4.84985 4.70825V23.267L7.47485 20.642V4.70825H37.6624V20.4583C37.6624 33.977 24.8261 38.1507 22.5686 38.7808C21.4136 38.4395 17.0824 37.0483 13.4074 33.8195L20.1274 32.2183C25.4299 30.9058 29.1049 26.207 29.1049 20.747V17.8333C29.1049 16.3895 30.2861 15.2083 31.7299 15.2083H32.8324C33.5936 15.2083 33.9611 14.2895 33.4361 13.7645L30.1286 10.457C29.0261 9.302 27.4249 8.64575 25.8236 8.64575C23.3824 8.64575 21.1774 10.0633 20.1799 12.2683L19.4974 13.7908L0.912354 32.3758V36.1033L21.5186 15.4708C21.6499 15.3658 21.7286 15.2345 21.8074 15.1033Z"/>
					</svg>
				{:else if logo.code == 'ihasco'}
					<svg style="right:24px" fill="#fff" class="logo" width="58" height="50" viewBox="0 0 29 25" xmlns="http://www.w3.org/2000/svg">
						<path fill="#fff" fill-rule="evenodd" clip-rule="evenodd" d="M17.3659 4.06787H6.48462C6.29027 4.06787 6.11069 4.17154 6.01349 4.33983L0.572869 13.7702C0.475794 13.9385 0.47567 14.146 0.572738 14.3142L6.01336 23.7446C6.11056 23.9129 6.29027 24.0168 6.48462 24.0168H17.3659C17.5602 24.0168 17.7398 23.9132 17.837 23.7449C17.837 23.7448 17.837 23.7449 17.837 23.7449L23.2778 14.3142C23.3749 14.1459 23.3748 13.9385 23.2776 13.7702C23.1804 13.6019 23.0008 13.4983 22.8065 13.4983H12.8672L17.8371 4.88381C17.9342 4.71548 17.9342 4.50812 17.837 4.33983C17.7398 4.17154 17.5602 4.06787 17.3659 4.06787ZM12.8672 14.5864L17.3659 22.384L21.8645 14.5864H12.8672ZM11.9264 13.4983L6.48462 4.06787L11.9255 13.4983L11.9264 13.4983ZM11.9252 15.1311L7.42662 22.9287H16.4239L11.9252 15.1311ZM6.48462 22.384L1.98599 14.5864H10.9833L6.48462 22.384ZM10.9833 13.4983L6.48462 5.70066L1.98599 13.4983H10.9833ZM7.42662 5.156L11.9252 12.9536L16.4239 5.156H7.42662Z"/>
						<path fill="#fff" fill-rule="evenodd" clip-rule="evenodd" d="M22.1175 0.983887L28.5001 12.0471H15.7349L22.1175 0.983887ZM17.6189 10.959H26.6161L22.1175 3.16135L17.6189 10.959Z"/>
					</svg>
				{/if}
				<code>{whole_course_code}</code>
				<div data-html2canvas-ignore class="drop_region" class:highlight="{highlight}" bind:this="{drop_region}"  on:click="{drop_click}" on:drop={drop_file} on:dragenter={highlights} ondragover="return false" on:dragleave={unhighlights} >
					<p>
						Drag an image here<br> or click to select from files.<br>
					<input bind:this="{file_input}" on:change="{change_file}" type="file">
				</div>
			</div>
			<div class="course-body">
				
				<select class="form-control" bind:value="{category}">
					{#each categories as cat}
						<option value="{cat}">{cat.name}</option>
					{/each}
				</select>
				<input bind:value="{opacity}" type="range" min="10" max="90" step="5"> <span style="font-size:0.6em">{opacity}</span>
				<div style="color:#999">(Leave opacity as is unless it absolutely needs adjusting because of image darkness etc)<br><br></div>
				
				<!--
				<select class="form-control" bind:value="{blendmode}">
					{#each blendmodes as bm}
						<option value="{bm}">{bm}</option>
					{/each}
				</select>

				<div style="color:#999">(Select the color mode that shows the best color, for light images it will probably be 'multiply' for dark 'soft-light')<br><br></div>
				-->
				<label><input type="checkbox" bind:checked={include_logo}> Include logo</label>
				{#if include_logo}
					<select class="form-control" bind:value="{logo}">
						{#each logos as logo}
							<option value="{logo}">{logo.name}</option>
						{/each}
					</select>
				{/if}
				<label><input type="checkbox" bind:checked={include_code}> Include course code</label>
				{#if include_code}
					
					<select class="form-control" bind:value="{lesson_type}">
						{#each lesson_types as lesson}
							<option value="{lesson}">{lesson.name}</option>
						{/each}
					</select>
					<input class="form-control" type="text" bind:value="{course_number}">
				{/if}
				<a href="./" class="btn" on:click|preventDefault="{ (e) => { download_image(e);} }">Download</a>
				

			</div>
		</div>

	</div>


	<div style="display:none">
		<a download="myImage.png" href="/"><img src="" style="width:1200px" bind:this="{downloader}" alt="downloader" on:load="{ (e) => (e.target.parentNode.click()) }"/></a>
	</div>


</div>
<style>
	:global(html), :global(body) {
		user-select: none;
		-webkit-user-select: none;
	}
	.page {
		margin:16px auto;
		background:#fff;
		max-width:920px;
		border-radius:8px;
		box-shadow: 0 4px 4px rgb(0 0 0 / 3%);
		box-sizing:border-box;
		padding:16px;
	}
	.loader_image {
		position:absolute;
		opacity:0;
		left: 4000px;
	}
	.drop_region {
		text-align:center;
		cursor:pointer;
	}
	.drop_region p {
		pointer-events: none;
		user-select: none;
		-webkit-user-select: none;
		margin: 163px 0;
		z-index: 100;
	}
	.highlight {
		background:#eee;
	}
	.drop_region input {
		position:absolute;
		left:-900px;
	}
	.form-control {
		width: 100%;
		background: #fff;
		padding: 12px 16px;	
		border: 1px solid #d3d3d3;
		border-radius: 4px;
		font-size: 16px;
		margin-bottom: 4px;
	}
	.courses {
		text-align: center;
	}
	.course {
		display: inline-block;
		margin: 0 auto;
		width: 560px;
		overflow: auto;
	}
	.training_img {
		float: left;
		width: 560px;
		height: 373.33px;
		position: relative;
		overflow: hidden;
	}
	.training_img > div {
		width: 100%;
		height: 100%;
		background-position: center center;
		background-repeat: no-repeat;
		background-size: cover;
		z-index: 1;
    	position: absolute;
	}
	.training_img code{
		display: none;
		position: absolute;
		top: 8px;
		right: 12px;
		width: 100%;
		text-align: right;
		font-size: 24px;
		color: #fff;
		font-weight: 600;
		z-index: 10;
	}
	.training_img .logo {
		position: absolute;
		z-index: 3;
		display: none;
		top: 12px;
	}
	.include_code .training_img code {
		display: block;
	}
	.include_logo .training_img .logo {
		display: block;
	}

	label {
		display: block;
		margin-bottom: 4px;
	}

	.include_code .logo {
		top: 42px;
	}
	.course-body {
		width: 560px;
		height: 560px;
		background: #EEEFF2;
		float: left;
		padding: 32px;
		text-align: left;
	}

	.btn {
		padding: 8px 16px;
		text-decoration: none;
		height: 40px;
		display: inline-block;
		border: 1px solid #272F96;
		border-radius: 20px;
		margin: 32px 0 0 0;
		cursor: pointer;
		background: #fff;
		font-size: 16px;
	}
	.btn:hover {
		background: #fafafa;
		box-shadow: 0 4px 20px rgba(0,0,0,0.2);
	}

</style>