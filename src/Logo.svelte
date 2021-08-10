<script>
	let anim = false;
	let preload = true;
	

	function animate() {
		preload = false;
		anim = !anim;
	}
</script>

<div class:preload class:anim on:click="{animate}" >
	<svg width="100vw" height="100vh" viewBox="-260 -260 1040 1040" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
		
		<path class="p2 accent"></path>
		<circle class="c5 accent" cx="259" cy="259"></circle>
		<circle class="c3 accent" cx="455" cy="63"></circle>

		<path class="p3"></path>
		<path class="p1"></path>
		<circle class="c8" cx="455" cy="455"></circle>
		<circle class="c7" cx="259" cy="455"></circle>
		<circle class="c4" cx="63" cy="259"></circle>
		<circle class="c6" cx="455" cy="259"></circle>
		<circle class="c2" cx="259" cy="63"></circle>
		<circle class="c1" cx="63" cy="63"></circle>
	</svg>
</div>

<style>
	div {
		cursor:pointer;
	}
	div.preload:after {
		content: "( click )";
		display:block;
		color:#fff;
		font-size:13px;
		position: absolute;
		left: 50%;
		top: 50%;
		width:100px;
		margin-left:-50px;
	}

	.preload * {
		-webkit-transition: none !important;
		-moz-transition: none !important;
		-ms-transition: none !important;
		-o-transition: none !important;
	}

	svg {
		margin: 0 auto;
	}
	div {
		text-align:center;
	}
	path {
		stroke: #fff;
		stroke-linecap: round;
		stroke-width: 34;
		transition: all 0.5s ! important; 
		transition-timing-function: cubic-bezier(0, 0, 0.7, 2);
	}

	circle {
		fill:#fff;
		stroke:transparent;
		r:0;
		transition: all 0.5s ! important;
	}

	.c1 { transition-delay: 0s ! important}
	.c2 { transition-delay: 0.1s ! important }
	.c3 { transition-delay: 0.2s ! important }
	.c4 { transition-delay: 0.3s ! important }
	.c5 { transition-delay: 0.4s ! important }
	.c6 { transition-delay: 0.5s ! important }
	.c7 { transition-delay: 0.6s ! important }
	.c8 { transition-delay: 0.7s ! important }

	.p1 { d: path("M-345,1059 L-1341,2055"); transition-delay: 0.6s ! important}
	.p2 { d: path("M-345,863 L-1341,1859"); transition-delay: 0.4s ! important }
	.p3 { d: path("M-541,863 L-1537,1859"); transition-delay: 0.2s ! important }


	.anim circle {
		r:63;
	}

	.anim .p1 {
		d: path("M455,259 L259,455")
	}
	.anim .p2 {
		d: path("M455,63 L259,259");
	}
	.anim .p3 {
		d: path("M259,63 L63,259");
	}
	
</style>