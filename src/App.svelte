<script>
	let stroke_max = 126;
	let stroke_width = 34;
	let radius_max = 62;
	let radius = 62;

	function handleMousemove(event) {
		stroke_width = Math.round(stroke_max * event.clientX/ window.innerWidth);
		radius = Math.round(radius_max * event.clientY/ window.innerHeight) + 1;
	}
</script>


<svelte:window on:mousemove={handleMousemove}/>

<div>
	<svg width="128px" height="128px" viewBox="0 0 520 520" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
		
		<path class="accent" d="M455,63 L259,259" stroke-width="{stroke_width}"></path>
		<circle class="accent" cx="259" cy="259" r="{radius}"></circle>
		<circle class="accent" cx="455" cy="63" r="{radius}"></circle>

		<path d="M259,63 L63,259" stroke-width="{stroke_width}"></path>
		<path d="M455,259 L259,455" stroke-width="{stroke_width}"></path>
		<circle cx="455" cy="455" r="{radius}"></circle>
		<circle cx="259" cy="455" r="{radius}"></circle>
		<circle cx="63" cy="259" r="{radius}"></circle>
		<circle cx="455" cy="259" r="{radius}"></circle>
		<circle cx="259" cy="63" r="{radius}"></circle>
		<circle cx="63" cy="63" r="{radius}"></circle>
	</svg>
	<p>
	(move mouse left and right for line thickness<br>
	up and down for circle radius)
	</p>
</div>

<style>
	div {
		margin-top:50px;
	}
	path {
		stroke: #000;
		stroke-linecap: butt;
	}

	path.accent {
		stroke:#0A81FF;
	}

	circle {
		fill:#000;
		stroke:transparent;
	}
	circle.accent {
		fill:#0A81FF;
	}
	
</style>