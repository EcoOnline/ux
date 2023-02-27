<script>
    export let f;
    let variant = f.variant? f.variant : 1;
    let multi = f.multi? f.multi : false;


    let drop_region;
	let highlight = false;
	let file_input;
	let reader = new FileReader();
    let temp_name = '';
    let xfiles = [];
	function onloader(e) {

        let temp = {
            name: file_input.value ? file_input.value.replace(/^.*?([^\\\/]*)$/, '$1') : this.name,
            data: e.target.result
        }
        if(multi) {
            xfiles.unshift(temp);
        } else {
            xfiles[0] = temp;
        }
        xfiles = xfiles;
		setTimeout(() => {
			file_input.value = '';
		}, 100);
	}
    /*
    reader.onload = function(e) {
        let temp = {
            name: file_input.value ? file_input.value.replace(/^.*?([^\\\/]*)$/, '$1') : temp_name,
            data: e.target.result
        }
        if(multi) {
            xfiles.push(temp)
        } else {
            xfiles[0] = temp;
        }
        xfiles = xfiles;
		setTimeout(() => {
			file_input.value = '';
		}, 100);
	}
    */
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
            let reader = new FileReader();
            reader.onload = onloader;
            temp_name = files[i].name;
            reader.name = files[i].name;
			reader.readAsDataURL(files[i]);
		}
	}

    function remove_file(xfile) {

        console.log('hejihrej');
        xfiles.splice(xfiles.indexOf(xfile), 1);
        xfiles = xfiles;
    }
</script>


<div class="form-item">
    {#if f.label}
        <label for="{f.id}">{f.label}</label>
    {/if}
    {#if f.hint}
        <p>{f.hint}</p>
    {/if}
    {#if f.readonly}
        <div class='readonly'>{f.answer}</div>
    {:else}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div class="fake_input variant{variant}" class:highlight="{highlight}" bind:this="{drop_region}"  on:click="{drop_click}" on:drop={drop_file} on:dragenter={highlights} ondragover="return false" on:dragleave={unhighlights} >
                {#if variant==2}
                    <div class='file_list'>
                        {#each xfiles as xfile}
                            <div class="file_item" class:one_file={!multi}><span>{xfile.name}</span> <i class="i-20 i-close" on:click|stopPropagation={ () => { remove_file(xfile)}}></i></div>
                        {/each}
                    </div>
                {/if}
                <span class="fake_file var var1">{xfiles.length &&xfiles[0].name ? xfiles[0].name : ' '} {#if xfiles.length}<i class="i-20 i-close" on:click|stopPropagation={ () => { remove_file(xfiles[0])}}></i>{/if}</span>
                <span class="fake_button var var1"><i class='i-20 i-upload'></i> Browse file</span>
                {#if !multi && !xfiles.length}
                    <span class="fake_text var var2"><i class='i-20 i-upload'></i> <span>Browse file</span> or drop it here</span>
                {/if}
                <input bind:this="{file_input}" on:change="{change_file}" type="file" accept="image/*" capture="camera">
            </div>
    {/if}

    
</div>


<style>

.fake_input {
		background:white;
		margin-bottom:16px;
		cursor:pointer;
        display: flex;
        flex-direction:row;
        flex-wrap: wrap;
        font-size:16px;
        line-height:24px;
        padding:0px 16px;
        border-radius: 8px;
        border:1px solid var(--eo-border-input);
        width:100%;
        max-width: 480px;
        outline: none;
		transition: box-shadow 0.5s linear;
	}

    .variant2 .var1 {display:none}
    .variant1 .var2 {display:none}

    .variant2 {
        /*border-radius: 16px;*/
        border-style:dashed;
        padding:0px 8px;
    }

    .file_list {
        width:100%;
        max-height: 150px;
        overflow: auto;
    }

    .file_item {
        background:white;
		margin-top:8px;
        display: flex;
        flex-direction:row;
        font-size:12px;
        line-height:32px;
        padding:0px 8px 0 16px;
        border-radius: 4px;
        border:1px solid var(--eo-border-input);
        flex:1;
        align-items: center;
    }
    .one_file {
        margin-bottom:8px;
    }
    .file_item span {
        flex:1;
    }
    
    .fake_input:hover {
		background: #EBECFF;
	}
    .fake_file {
        flex:1;
    }
    .fake_file {
        line-height:24px;
        padding:12px 0px;
        /*pointer-events: none;*/
    }
    .fake_text {
        pointer-events: none;
        line-height:24px;
        padding:12px 0;
        text-align: center;
        flex:1;
    }
    .fake_text i {
        opacity:0.5
    }
    .fake_text span {
        color: var(--eo-primary-500);
        text-decoration: underline;
    }
    .fake_button {
        line-height:24px;
        padding:12px 0 12px 16px;
        border-left:1px solid var(--eo-border-input);
        pointer-events: none;
    }
	.fake_input.highlight {
        border-style:dashed;
		background: #EBECFF;

	}
	.fake_input:hover {
		box-shadow: 0 4px 16px rgba(0,0,0,0.1)
	}
	.fake_input input {
		position:absolute;
		left:-900px;
	}
</style>