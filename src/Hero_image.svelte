<script>

	let drop_region;
	let highlight = false;
	let file_input;
	let images = [];
	let loader_image;
	let downloader;


	let reader = new FileReader();
	
	reader.onload = function(e) {
		loader_image.src = e.target.result;

	}
	function save_image() {
		let new_image = {
			"type": loader_image.width > loader_image.height ? 'web' : 'mobile',
			"src": loader_image.src
		}
		images.unshift(new_image);
		loader_image.src = '';
		images = images;
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
		if(!t.classList.contains('web_image') && !t.classList.contains('mobile_image')) {
			t = t.parentNode.parentNode;
		}
		html2canvas(t).then(canvas => {
			let resource = canvas.toDataURL("image/png");
			downloader.parentNode.href = resource;
			downloader.src = resource;
		});
	}



</script>


<div class="page">
	<img bind:this="{loader_image}" on:load="{save_image}" class="loader_image" src="" alt="loader_img"/>
	<div id="test" class="drop_region" class:highlight="{highlight}" bind:this="{drop_region}"  on:click="{drop_click}" on:drop={drop_file} on:dragenter={highlights} ondragover="return false" on:dragleave={unhighlights} >
		<p>
			Drag an image here or click to select from files.<br>
			Landscape images will get browser UI, portrait images will get mobile UI<br>
			You can then click the image to download it with the frame</p>
		<input bind:this="{file_input}" on:change="{change_file}" type="file">
	</div>
	{#each images as image}
		<div on:click={download_image} class="{(image.type == 'web' ? 'web_image' : 'mobile_image')}"><div><img src="{image.src}" alt="web screen"/></div></div>
	{/each}
	
	<div style="display:none">
		<a download="myImage.png" href="/"><img src="" bind:this="{downloader}" alt="downloader" on:load="{ (e) => (e.target.parentNode.click()) }"/></a>
		<div class="web_image"><div><img src="./images/webtest.png" alt="web screen"/></div></div>
		<div class="mobile_image"><div><img src="./images/mobiletest.png" alt="mobile screen"/></div></div>
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
		max-width:900px;
		border-radius:8px;
		box-shadow: 0 4px 4px rgb(0 0 0 / 3%);
		box-sizing:border-box;
		padding:16px;
	}
	.loader_image {
		position:absolute;
		height:100px;
		opacity:0;
	}
	.drop_region {
		text-align:center;
		border: 2px dashed #eee;
		width: 100%;
		padding: 16px;
		margin: 16px 0px;
		cursor:pointer;
		min-height:300px;
	}
	.drop_region p {
		pointer-events: none;
		user-select: none;
		-webkit-user-select: none;
	}
	.highlight {
		background:#eee;
	}
	.drop_region input {
		position:absolute;
		left:-900px;
	}
	.web_image, .mobile_image {
		position:relative;
		margin:8px;
		display:inline-block;
		vertical-align:top;
		cursor:alias;
	}

	.web_image {
		border:10px solid #eee;
		border-width:30px 10px 10px 10px;
		max-width:600px;
		border-radius:10px;
	}
	.web_image:before, .web_image:after, .web_image>div:before {
		content:'';
		display:block;
		width:10px;
		height:10px;
		border-radius:5px;
		background:#c4c4c4;
		position:absolute;
		left:0px;
		top:-20px;
	}
	.web_image:after {
		left: 20px
	}
	.web_image>div:before {
		left: 40px
	}
	.web_image>div:after {
		content:'';
		display:block;
		height:20px;
		width:130px;
		background:#fff;
		position:absolute;
		top:-20px;
		left:80px;
		border-top-left-radius:4px;
		border-top-right-radius:4px;
	}
	.web_image img {
		max-width:100%;
		float:left;
		user-select: none;
		-webkit-user-select: none;
	}

	.mobile_image {
		max-width:207px;
		min-height:424px;
		border:10px solid #1a1919;
		/*border-width:20px 10px 20px 10px;*/
		border-radius:30px;
		padding:0
	}
	.mobile_image:after {
		content:'';
		display:block;
		position:absolute;
		width:80px;
		height:15px;
		top:0;
		left:50%;
		margin-left:-40px;
		background: #1a1919;
		border-bottom-left-radius: 10px;
		border-bottom-right-radius: 10px;
	}
	.mobile_image>div:before, .mobile_image>div:after {
		content:'';
		display:block;
		position:absolute;
		width:10px;
		height:10px;
		border-radius:5px;
		top:0;
		left:60px;
		background: #000;
		z-index: 1;
	}
	.mobile_image>div:after {
		width:40px;
		left:80px;
	}
	.mobile_image img{
		max-width:100%;
		float:left;
		border-radius:19px;
		user-select: none;
		-webkit-user-select: none;
	}
	
</style>