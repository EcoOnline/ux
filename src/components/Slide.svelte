<script>

    import { hslide } from './slide.js';

	let slides = [
		{ img: './images/trees/t2.jpeg' },
		{ img: './images/trees/t3.jpeg' },
		{ img: './images/trees/t4.jpeg' },
		{ img: './images/trees/t5.jpeg' },
		{ img: './images/trees/t7.jpeg' },
		{ img: './images/trees/t8.jpeg' }
	]
	
	let cur = 0;
	
	function changeSlide(slide) {
		cur = slide;
	}
	
	const clamp = (number, min, max) => Math.min(Math.max(number, min), max);
	const transition_args = {
		duration: 500,
	}
	
	function prev(e) {
		cur = clamp( --cur, 0, slides.length-1 )
	}
	
	function next(e) {
		cur = clamp( ++cur, 0, slides.length-1 )
	}
	
  const ARROW_LEFT = 37;
	const ARROW_RIGHT = 39;
	function handleShortcut(e) {
        if (e.keyCode === ARROW_LEFT ) {
						prev();
        }
		    if (e.keyCode === ARROW_RIGHT ) {
            next();
        }
    }

</script>

<svelte:window on:keyup={handleShortcut} />

<div class="extra-outer-wrapper">
	<div class="outer-wrapper">
		<div class="inner-wrapper">
			{#each slides as slide, id}
				{#if id === cur}
				<div
						 style="background-image:url({slide.img})"
						 class="slide"
						 in:hslide={transition_args}
						 out:hslide={transition_args}
				>	
				</div>
				{/if}
			{/each}
			<div class="controls">
				<button on:click="{()=>prev()}">
					&lt;
				</button>
				<button on:click="{()=>next()}">
					&gt;
				</button>
			</div>
		</div>
	</div>
</div>

<div class="dots">
	{#each slides as slide, i}
		<button on:click={()=>changeSlide(i)} class="dot" class:selected={cur == i}>{i+1}</button>
	{/each}
</div>

<style>
	
	:global(html) {
		font-size: 62.5%;
	}
	
	:global(body) {
		font-size: 1.4rem;
	}

	button {
		background: transparent;
		color: #FFF;
		border-color: transparent;
		width: 3.2rem;
		height: 3.2rem;
	}
	
	button:hover,
	button:focus{
		background: rgba(0,0,0,0.5);
	}
	
	.dots {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 8px;
	}
	
	.dot {
		width: 8px;
		height: 8px;
		background: #000;
		border-radius: 100%;
		font-size: 0;
		margin: 0.3rem;
		opacity: 0.3;
        padding:0;
	}
	
	.dot.selected {
		opacity: 1;
	}

	.extra-outer-wrapper {
		width: 80%;
		margin: 0 auto;
	}

	.outer-wrapper {
		width: 100%;
		padding: 0 0 56.25%;
		position: relative;
	}
	
	.inner-wrapper {
		height: 100%;
		width: 100%;
		display: flex;
		position: absolute;
	}

	.controls button:first-child {
		position: absolute;
		left: 0;
		top: calc(50% - 1.2rem);
	}
	
	.controls button:last-child {
		position: absolute;
		right: 0;
		top: calc(50% - 1.2rem);
	}
	
	.slide {
		flex: 1 0 auto;
		width: 100%;
		height: 100%;
		background: red;
	  align-items: center;
		justify-content: center;
		display: flex;
		text-align: center;
		font-weight: bold;
		font-size: 2rem;
		color: white;
        background-repeat: no-repeat;
        background-position: center center;
        background-size:contain;
        background-color:#eee;
        border-radius: 4px;
	}
	
	.controls {
		text-align: center;
		width: 100%;
		display: block;
	}
</style>