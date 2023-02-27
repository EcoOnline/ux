<script>
	
    import { onMount } from 'svelte';



	let canvas = false;
	let words = [];
	let progress = 0;
	let show_progress = false;
	let pdf_src = './pdfs/sds_sample.pdf';
	let pdfjsLib = window['pdfjs-dist/build/pdf'];
	let w = 100;
	let svg_width=100;
	let svg_height=100;

	let rect = {
		x0: -10,
		y0: -10,
		x1: -5,
		y1: -5
	}

	pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';


	$: selected_words = words.filter( (w) => {
		return (
			w.bbox.x0 > rect.x0 &&
			w.bbox.x1 < rect.x1 &&
			w.bbox.y0 > rect.y0 &&
			w.bbox.y1 < rect.y1
		)
	});

	$: selected_term = selected_words.reduce( (a, b) => a + ' ' + b.text, '');
	
	async function get_pdf() {
		let loadingTask = pdfjsLib.getDocument(pdf_src);
		loadingTask.promise.then(function(pdf) {
			console.log('PDF loaded');
	
			// Fetch the first page
			var pageNumber = 1;
			pdf.getPage(pageNumber).then(function(page) {
				console.log('Page loaded');
				
				var scale = w/595;
				var viewport = page.getViewport({scale: scale});
				var context = canvas.getContext('2d');
				canvas.height = viewport.height;
				canvas.width = viewport.width;
				svg_height = viewport.height;
				svg_width = viewport.width;

				// Render PDF page into canvas context
				var renderContext = {
					canvasContext: context,
					viewport: viewport
				};
				var renderTask = page.render(renderContext);
				renderTask.promise.then(function () {
					console.log('Page rendered');
					//time to read with OCR
					show_progress = true;
					
					Tesseract.recognize(
  						canvas,
  						'eng',
  						{ logger: m => progress = (m.progress*100).toFixed(0) }
					).then((job) => {
  						words = job.data.words;
						show_progress = false;
					})
					
				});
			});
		}, function (reason) {
			// PDF loading error
			console.error(reason);
		});
	}
	

	let boxing = false;
	
	function startRect(e){
		rect.startx = e.offsetX;
		rect.starty = e.offsetY;
		rect.x0 = e.offsetX;
		rect.y0 = e.offsetY;
		rect.x1 = e.offsetX;
		rect.y1 = e.offsetY;
		boxing=true;
	}
	function dragRect(e){
		if(boxing) {
			if(e.offsetX < rect.startx) {
				rect.x0 = e.offsetX;
			} else {
				rect.x1 = e.offsetX;
			}
			if(e.offsetY < rect.starty) {
				rect.y0 = e.offsetY;
			} else {
				rect.y1 = e.offsetY;
			}
		}
	}
	function stopRect(e){
		boxing=false;
	}

	onMount(() => {
		w = canvas.parentNode.clientWidth;
		//boundings_ctx = boundings.getContext('2d');
		get_pdf();
	});
</script>

<div class='wrapper'>
	<div class='header'>
		<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M16 25C14.8449 25.001 13.7076 24.7157 12.6897 24.1698C11.6719 23.6238 10.8051 22.8341 10.167 21.8713L11.833 20.7639C12.2892 21.4515 12.9084 22.0155 13.6355 22.4057C14.3625 22.7958 15.1749 23 16 23C16.8251 23 17.6374 22.7958 18.3645 22.4057C19.0916 22.0155 19.7108 21.4515 20.167 20.7639L21.833 21.8713C21.1949 22.8341 20.3281 23.6238 19.3102 24.1698C18.2924 24.7157 17.1551 25.001 16 25V25Z" fill="white"/>
			<path d="M20 14.0001C19.6044 14.0001 19.2178 14.1174 18.8889 14.3372C18.56 14.5569 18.3036 14.8693 18.1522 15.2347C18.0009 15.6002 17.9613 16.0023 18.0384 16.3903C18.1156 16.7782 18.3061 17.1346 18.5858 17.4143C18.8655 17.694 19.2219 17.8845 19.6098 17.9617C19.9978 18.0388 20.3999 17.9992 20.7654 17.8479C21.1308 17.6965 21.4432 17.4401 21.6629 17.1112C21.8827 16.7823 22 16.3957 22 16.0001C22.0026 15.7367 21.9526 15.4755 21.853 15.2317C21.7535 14.9879 21.6062 14.7663 21.42 14.5801C21.2338 14.3939 21.0122 14.2466 20.7684 14.1471C20.5246 14.0475 20.2634 13.9975 20 14.0001V14.0001Z" fill="white"/>
			<path d="M12 14.0001C11.6044 14.0001 11.2178 14.1174 10.8889 14.3372C10.56 14.5569 10.3036 14.8693 10.1522 15.2347C10.0009 15.6002 9.96126 16.0023 10.0384 16.3903C10.1156 16.7782 10.3061 17.1346 10.5858 17.4143C10.8655 17.694 11.2219 17.8845 11.6098 17.9617C11.9978 18.0388 12.3999 17.9992 12.7654 17.8479C13.1308 17.6965 13.4432 17.4401 13.6629 17.1112C13.8827 16.7823 14 16.3957 14 16.0001C14.0026 15.7367 13.9526 15.4755 13.853 15.2317C13.7534 14.9879 13.6062 14.7663 13.42 14.5801C13.2338 14.3939 13.0122 14.2466 12.7684 14.1471C12.5246 14.0475 12.2634 13.9975 12 14.0001V14.0001Z" fill="white"/>
			<path d="M30 16V14H28V10C27.9988 8.9395 27.577 7.92278 26.8271 7.17289C26.0772 6.423 25.0605 6.00119 24 6H22V2H20V6H12V2H10V6H8C6.9395 6.00119 5.92278 6.423 5.17289 7.17289C4.423 7.92278 4.00119 8.9395 4 10V14H2V16H4V21H2V23H4V26C4.00119 27.0605 4.423 28.0772 5.17289 28.8271C5.92278 29.577 6.9395 29.9988 8 30H24C25.0605 29.9988 26.0772 29.577 26.8271 28.8271C27.577 28.0772 27.9988 27.0605 28 26V23H30V21H28V16H30ZM26 26C25.9994 26.5302 25.7885 27.0386 25.4135 27.4135C25.0386 27.7885 24.5302 27.9994 24 28H8C7.46975 27.9994 6.9614 27.7885 6.58646 27.4135C6.21152 27.0386 6.00061 26.5302 6 26V10C6.00061 9.46975 6.21152 8.9614 6.58646 8.58646C6.9614 8.21152 7.46975 8.00061 8 8H24C24.5302 8.00061 25.0386 8.21152 25.4135 8.58646C25.7885 8.9614 25.9994 9.46975 26 10V26Z" fill="white"/>
			</svg>
			

		{#if show_progress}
			{#if progress < 30}
				Reading the PDF 
			{:else if progress < 70}
				Hmmn interesting 
			{:else}
				OK nearly done 
			{/if}
			{progress}% 
		{/if}
		{selected_term} 
	</div>
	<canvas class="viewport" bind:this={canvas}></canvas>
	<svg class="viewport" width={svg_width} height={svg_height} viewBox="0 0 {svg_width} {svg_height}" xmlns="http://www.w3.org/2000/svg" on:mousedown={startRect} on:mousemove={dragRect} on:mouseup={stopRect}>
		{#each selected_words as word}
			<rect x="{word.bbox.x0}" y="{word.bbox.y0}" width="{(word.bbox.x1-word.bbox.x0)}" height="{(word.bbox.y1-word.bbox.y0)}" fill="rgba(23,173,211,0.5)"/>
		{/each}
		<rect x="{rect.x0}" y="{rect.y0}" width="{(rect.x1-rect.x0)}" height="{(rect.y1-rect.y0)}" rx="4" stroke="rgb(23,173,211)" stroke-width="4" fill="transparent"/>
	</svg>
</div>
	


<style>
	.wrapper {
		position: relative;
	}
	.header {
		height:70px;
		color:#fff;
		background:var(--black);
		padding: 8px;
		position: fixed;
		width: 100%;
		z-index: 99;
	}
	.viewport {
		position:absolute;
		top:70px;
		left:0;
	}
</style>