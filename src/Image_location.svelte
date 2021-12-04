<script>
	import { onMount } from 'svelte';
    import {EXIF} from 'exif-js';
    

    

	
	
    /*
    EXIF.getData(img1, function() {
        var make = EXIF.getTag(this, "Make");
        var model = EXIF.getTag(this, "Model");
        var makeAndModel = document.getElementById("makeAndModel");
        makeAndModel.innerHTML = `${make} ${model}`;
    });
    */
    let payload = {
        photo: []
    }
    let exif_data = {};
	
    function get_exif(ev){
        EXIF.getData(ev.target, function(){
            exif_data = EXIF.getAllTags(this);
        })
    }

	let drop_region;
	let highlight = false;
	let file_input;
	let reader = new FileReader();
	reader.onload = function(e) {
		payload.photo.push(e.target.result);
		payload.photo = payload.photo;
		setTimeout(() => {
			file_input.value = '';
		}, 100);
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
	function highlights() {
		highlight = true;
	}

	function unhighlights() {
		highlight = false;
	}
	function handle_files(files) {
		for (var i = 0, len = files.length; i < len; i++) {
			reader.readAsDataURL(files[i]);
		}
	}
		
		
	
</script>


<div class="single_page">
	<div class="pane">
		
		<!-- STEP PHOTO -->

			
        <div class="step" style="height:auto">
    

            <div class="photo_button drop_region" class:highlight="{highlight}" bind:this="{drop_region}"  on:click="{drop_click}" on:drop={drop_file} on:dragenter={highlights} ondragover="return false" on:dragleave={unhighlights} >
                Upload
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M3 26C2.44772 26 2 25.5523 2 25V8C2 7.44772 2.44772 7 3 7H9.46L11.17 4.45C11.354 4.17061 11.6655 4.00173 12 4H20C20.3345 4.00173 20.646 4.17061 20.83 4.45L22.54 7H29C29.5523 7 30 7.44772 30 8V25C30 25.5523 29.5523 26 29 26H3ZM10 16C10 19.3137 12.6863 22 16 22C19.3137 22 22 19.3137 22 16C22 12.6863 19.3137 10 16 10C12.6863 10 10 12.6863 10 16ZM12 16C12 13.7909 13.7909 12 16 12C18.2091 12 20 13.7909 20 16C20 18.2091 18.2091 20 16 20C13.7909 20 12 18.2091 12 16ZM28 24H4V9H10C10.3345 8.99827 10.646 8.82939 10.83 8.55L12.54 6H19.46L21.17 8.55C21.354 8.82939 21.6655 8.99827 22 9H28V24Z" fill="#1A1919"/>
                </svg>
                <input bind:this="{file_input}" on:change="{change_file}" type="file" accept="image/*" capture="camera">
            </div>


            
            {#each payload.photo as pic, i}
                <div on:click="{ () => { payload.photo.splice(i,1); payload.photo = payload.photo}}" class="thumbnail" style="background-image: url({pic})"><img on:load="{ (el)=> { get_exif(el)}}" src="{pic}" alt="upload"/></div>
            {/each}
        </div>

		<!-- STEP LOCATION -->
		
        <div class="step" style="height:auto">
            
            <div class="form-row">
                <label for="event_location">Location</label>
                <input bind:value={payload.event_location} id="event_location" type="text" class="form-control">
            </div>



<pre><code>{JSON.stringify(exif_data, null, 4)}</code></pre>
        </div>
	</div>
</div>

<style>

	
	.pane {
		width:100%;
		max-width:544px;
		margin:50px auto;
		padding:0 32px;
		border-top:1px solid transparent;
	}
	.step {
		height: auto;
		position:relative;
		border-top:1px solid transparent;
	}


	.photo_button {
		padding:32px;
		background:white;
		border-radius:12px;
		margin-bottom:16px;
		line-height:32px;
		cursor:pointer;
		transition: box-shadow 0.5s linear;
	}
	.photo_button.highlight {
		box-shadow: inset 0px 0px 8px rgba(0,0,0,0.5);
	}
	.photo_button:hover {
		box-shadow: 0 4px 16px rgba(0,0,0,0.1)
	}
	.photo_button svg {
		float:right;
	}
	.thumbnail {
		width:114px;
		height:114px;
		border-radius:12px;
		background: #999;
		margin-right:8px;
		margin-bottom:8px;
		display:inline-block;
		background-position: center center;
		background-size: cover;
		cursor:pointer
	}
	.thumbnail:nth-child(4n-1) {
		margin-right:0px;
	}

	.form-row {
		margin: 32px 0;
	}
	.form-row > label {
		display:block;
		font-weight:bold;
	}
	.form-control {
		width: 100%;
		max-width:480px;
		font-size: 20px;
		font-weight: lighter;
		font-family: 'IBM PLEX SANS';
		padding: 11.5px 16px;
		border-radius:12px;
		margin-top:4px;
		background:#fff;
	}
	.drop_region input {
		position:absolute;
		left:-900px;
	}
	@media (max-width: 576px) {
		.pane{
			padding: 0 16px;
		}
		.thumbnail {
			width:109px;
			height:109px;
		}
		.thumbnail:nth-child(4n-1) {
			margin-right:8px;
		}
		.thumbnail:nth-child(3n) {
			margin-right:0px;
		}
	}

</style>