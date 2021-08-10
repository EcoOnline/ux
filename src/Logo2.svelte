<script>
	let anim = false;
	let bob = false;
	let preload = true;
	

	function animate() {
		preload = false;

		if(!anim) {
			anim = true;
			setTimeout(function() {
				bob = true;
				setTimeout(function() {
					bob = false;
					
				}, 200);
			}, 5000);
		} else {
			anim = false;
			bob = false;
		}
		

	}
</script>

<div class:preload class:anim class:bob on:click="{animate}" >
	<svg width="493px" height="476px" viewBox="0 0 493 576" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
		<path d="M113.2,268.5 C113,237.6 112.9,102.1 112.9,60.3 C112.9,53.5 118.4,48 125.2,48 L500.1,48 C507.2,48 512.9,53.7 512.9,60.8 L512.9,251.1 C514.1,308.2 496.2,367.7 457.4,415.7 C422.2,459.4 374.9,491.3 315.8,505.6 C313.9,506.1 311.9,506.1 309.9,505.7 C217.6,485.2 168.3,415.7 168.3,415.7 C168.3,415.7 205.5,417.4 251.9,406 C287.5,396.7 314.8,385.3 335.9,373 C432.5,316.7 415.1,227.2 403.8,206.7 C397.4,193.4 408.5,184.9 412.8,183.8 C414.8,183.26 422.86,180.67 436.99,176.03 C437.69,175.39 438.05,174.53 438.05,173.46 C437.95,171.86 436.99,171.01 436.99,171.01 C436.99,171.01 412.8,156.20 412.8,156.20 C411.3,154.50 405.5,137.9 383.8,131.5 C364.4,125.8 349.6,133.7 346.6,135 C317.9,149.7 319,179.7 319,179.7 L186.2,310.7 L38,410.7"></path>
	</svg>
</div>

<style>
	div {
		text-align:center
	}
	svg {
		margin:120px 100px 120px 0px;
	}
	path {
		fill: none;
		stroke-width: 0;
		stroke: #FFFFFF;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-dasharray: 0,2500;
		transition: stroke-dasharray 0.1s,  d 0.2s ! important; 
		transition-timing-function: linear ! important;
	}
	.anim path {
		stroke-width: 17;
		transition: stroke-dasharray 4s,  d 0.2s ! important; 
		stroke-dasharray:2500,2500;
	}

	.bob path {
		d: path("M113.2,268.5 C113,237.6 112.9,102.1 112.9,60.3 C112.9,53.5 118.4,48 125.2,48 L500.1,48 C507.2,48 512.9,53.7 512.9,60.8 L512.9,251.1 C514.1,308.2 496.2,367.7 457.4,415.7 C422.2,459.4 374.9,491.3 315.8,505.6 C313.9,506.1 311.9,506.1 309.9,505.7 C217.6,485.2 168.3,435.7 168.3,435.7 C168.3,435.7 205.5,437.4 251.9,426 C287.5,416.7 314.8,405.3 335.9,393 C432.5,336.7 415.1,247.2 403.8,226.7 C397.4,213.4 408.5,204.9 412.8,203.8 C414.8,203.266667 422.863745,200.677493 436.991236,196.032478 C437.698051,195.390005 438.051458,194.535436 438.051458,193.468769 C437.951458,191.868769 436.991236,191.011986 436.991236,191.011986 C436.991236,191.011986 412.8,176.209225 412.8,176.209225 C411.3,174.509225 405.5,157.9 383.8,151.5 C364.4,145.8 349.6,153.7 346.6,155 C317.9,169.7 319,199.7 319,199.7 L186.2,330.7 L38,410.7");
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
</style>