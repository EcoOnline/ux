<script>

	let drop_region;
	let highlight = false;
	let file_input;
	let images = [];
	let loader_image;
	let downloader;



	let colors = [
		"#47C9EB",
		"#007CFF",
		"#34B2A7",
		"#92D65C",
		"#B2A1F7",
		"#EB6047",
		"#F6D965",
		"#ECA047",
        "#236987", //"#0088c2" //Praxis 42
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
		{"code": "08", "color": colors[7], "name": "First Aid and Fire Safety"},
		{"code": "P42", "color": colors[8], "name": "Praxis 42"}
	];
	let category = categories[0];
	let course_number = '123';
	let segment = 1;
	let src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
	
	let include_code = false;
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

		<div class="course" class:include_code>
			<div class="training_img category_{category.code}" style="background-color: {category.color};border-bottom:16px solid {category.color}">
				
				<div style="background-image:url({src})"></div>
				<div class="segment segment_{segment}">
					<svg width="296" height="256" viewBox="0 0 148 128" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M85.4016 3.1743C115.54 11.1993 137.956 33.9316 147.37 61.9616C132.544 102.147 94.3679 127.963 53.5746 127.033C52.8407 127.007 52.1103 126.812 51.4606 126.47C27.8672 113.668 11.0325 91.4064 4.27793 65.6056L2.76175 59.224C1.62367 54.7503 0.999499 49.4226 0.88924 43.2409C0.777046 36.9509 1.29596 30.0691 2.42664 23.3437C24.5313 3.71931 55.2728 -4.84805 85.4016 3.1743Z" fill="{category.color}"/>
					</svg>
				</div>
				<code>{whole_course_code}</code>
				<div class="logo">
                    {#if category.code == 'P42'}
                        <!--<svg width="64" height="69" style="margin-top:-10px;" viewBox="0 0 64 69" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M57.8954 0.25H51.4938C50.1521 0.25 48.8999 0.922606 48.159 2.04113L23.7254 38.9291L17.1244 28.3505C16.3937 27.1796 15.111 26.4681 13.7309 26.4681H8.70172C6.28453 26.4681 4.85984 29.1804 6.23166 31.1707L22.2301 54.3808L60.2705 5.08272C61.7923 3.1105 60.3865 0.25 57.8954 0.25Z" fill="white"/>
                            <path d="M30.2751 66.7644L23.2769 55.6269L30.1055 47.1035L40.8868 62.3242C42.7632 64.9732 40.869 68.6362 37.6227 68.6362H33.662C32.2863 68.6362 31.0071 67.9292 30.2751 66.7644Z" fill="white"/>
                            <path d="M13.9862 66.7655L21.084 55.4774L15.5513 48.0007L4.82864 62.2288C2.84226 64.8646 4.72263 68.6362 8.02308 68.6362H10.6C11.9752 68.6362 13.2541 67.9297 13.9862 66.7655Z" fill="white"/>
                        </svg>-->

                        <svg width="47" height="64" viewBox="0 0 47 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.8498 19.5556H4.43619C3.32761 19.5556 2.62021 20.7386 3.14485 21.7152L17.5764 48.5785C18.0397 49.4409 19.2704 49.458 19.7576 48.6089L46.3859 2.19537C46.9466 1.21811 46.2411 0 45.1145 0H37.4936C36.8273 0 36.2113 0.354295 35.8762 0.930212L19.0139 29.9103L13.7471 20.6587C13.3589 19.9767 12.6345 19.5556 11.8498 19.5556Z" fill="#049CE4"/>
                            <path d="M11.8408 42.6472L0.544711 62.1268C0.0624127 62.9585 0.662515 64.0002 1.62394 64.0002H9.92209C10.5884 64.0002 11.2045 63.6459 11.5396 63.07L18.2944 51.4609C17.2168 51.3449 16.1866 50.7365 15.5982 49.6414L11.8408 42.6472Z" fill="black" fill-opacity="0.8"/>
                            <path d="M19.1814 51.4456L25.9451 63.07C26.2802 63.6459 26.8963 64.0002 27.5626 64.0002H35.8607C36.8222 64.0002 37.4223 62.9585 36.94 62.1268L25.9142 42.3906L21.7054 49.7266C21.1292 50.7309 20.1816 51.3024 19.1814 51.4456Z" fill="black" fill-opacity="0.8"/>
                        </svg>
                            
                            
                        
                        
                    {:else}
                        <svg width="64" height="64" viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21.8074 15.1033L22.5949 13.3708C23.1461 12.0845 24.4324 11.2708 25.8236 11.2708C26.7686 11.2708 27.6611 11.6383 28.3174 12.3208L29.2361 13.2395C27.6086 14.132 26.5061 15.8645 26.5061 17.8333V20.7733C26.5061 25.0258 23.6186 28.6745 19.5236 29.6983L10.6249 31.877C10.1786 31.982 9.8111 32.3233 9.67985 32.7695C9.5486 33.2158 9.6536 33.6883 9.9686 34.0295C15.0349 39.6208 21.9911 41.3533 22.2799 41.432C22.3849 41.4583 22.4899 41.4583 22.5949 41.4583C22.6999 41.4583 22.8049 41.4583 22.9099 41.432C23.0411 41.3795 40.2874 37.0483 40.2874 20.4583V4.70825C40.2874 3.2645 39.1061 2.08325 37.6624 2.08325H7.47485C6.0311 2.08325 4.84985 3.2645 4.84985 4.70825V23.267L7.47485 20.642V4.70825H37.6624V20.4583C37.6624 33.977 24.8261 38.1507 22.5686 38.7808C21.4136 38.4395 17.0824 37.0483 13.4074 33.8195L20.1274 32.2183C25.4299 30.9058 29.1049 26.207 29.1049 20.747V17.8333C29.1049 16.3895 30.2861 15.2083 31.7299 15.2083H32.8324C33.5936 15.2083 33.9611 14.2895 33.4361 13.7645L30.1286 10.457C29.0261 9.302 27.4249 8.64575 25.8236 8.64575C23.3824 8.64575 21.1774 10.0633 20.1799 12.2683L19.4974 13.7908L0.912354 32.3758V36.1033L21.5186 15.4708C21.6499 15.3658 21.7286 15.2345 21.8074 15.1033Z" fill="white"/>
                        </svg>
                    {/if}
				</div>
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
				<label><input type="checkbox" bind:checked={include_code}> Include course code</label>
				
					
				<select class="form-control" bind:value="{lesson_type}">
					{#each lesson_types as lesson}
						<option value="{lesson}">{lesson.name}</option>
					{/each}
				</select>
				<input class="form-control" type="text" bind:value="{course_number}">
				
				<a href="./" class="btn" on:click|preventDefault="{ (e) => { download_image(e);} }">Download</a> [filename: {whole_course_code}.png]
				

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
	.include_code .training_img code {
		display: block;
	}

	label {
		display: block;
		margin-bottom: 4px;
	}
	.segment {
		position: absolute;
		text-align: right;
		top: -1000px;
		right: -1000px;
		transform-origin: 50% 50%;
	}
	.segment_1 {
		top: -100px;
		right: -140px;
	}
	.segment_2 {
		transform: rotate(45deg);
		top: -200px;
		right: -146px;
	}
	.segment_3 {
		transform: rotate(60deg);
		top: -226px;
		right: -142px;
	}
	.segment_4 {
		transform: rotate(-30deg);
		top: -46px;
		right: -208px;
	}
	.logo {
		position: absolute;
		top: 32px;
		right: 26px;
		width: 100%;
		text-align: right;
	}
	.include_code .logo {
		top: 42px;
	}
	.include_code .segment_1 {
		top: -90px;
	}
	.include_code .segment_2 {
		top: -190px;
	}
	.include_code .segment_3 {
		top: -216px;
	}
	.include_code .segment_4 {
		top: -36px;
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