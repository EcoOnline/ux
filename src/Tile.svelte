<script>
	export let modnum;
</script>

<div class="tile mod-{modnum}">
	<svg width="64px" height="64px" viewBox="0 0 64 64" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
		<path class="segment-large" d="M0.258688955,28.1588818 C-0.276094685,27.2255152 0.0456087735,26.0166721 0.971733808,25.4778212 L29.6405414,8.7965595 C32.4469899,7.16363917 35.37218,5.92513542 38.3528226,5.06408515 C39.7435973,6.71892853 41.0073969,8.52108293 42.1204135,10.4649932 C52.1653386,27.9987741 46.2044503,50.4191144 28.8064733,60.5423078 C26.2229257,62.0454754 23.5326396,63.1930134 20.7911667,64 L0.258688955,28.1588818 Z" ></path>
		<path class="segment-small" d="M18.1650625,14.8364788 C17.8237765,14.2369489 18.0291756,13.4603541 18.6202739,13.114166 L36.9196141,2.39782565 C38.7111449,1.3487708 40.5778743,0.553155837 42.4808794,0 C43.3681641,1.06307493 44.1750539,2.22085892 44.8858621,3.46962636 C51.2968618,14.7336322 47.491832,29.1369592 36.3872433,35.6403149 C34.7381683,36.6059356 33.0208557,37.3432153 31.270993,37.861566 L18.1650625,14.8364788 Z"></path>
		<path d="M24.3264,56.1919 C23.6264,55.842 23.1014,55.142 23.2764,54.267 L26.4264,33.617 L18.0264,33.617 C17.5014,33.617 16.9764,33.442 16.6264,32.917 C16.2764,32.567 16.2764,32.042 16.2764,31.517 L21.5264,8.767 C21.7014,7.892 22.4014,7.367 23.2764,7.367 L40.776,7.367 C41.301,7.367 41.826,7.542 42.176,8.067 C42.526,8.417 42.526,8.942 42.526,9.467 L39.376,23.117 L47.776,23.117 C48.476,23.117 49.001,23.467 49.351,24.167 C49.701,24.692 49.526,25.392 49.176,26.092 L26.4264,55.842 C26.0764,56.192 25.5514,56.3669 25.0264,56.3669 C24.8514,56.3669 24.5014,56.3669 24.3264,56.1919 Z M35.1764,26.617 L38.676,10.867 L24.6764,10.867 L20.3014,30.117 L30.6264,30.117 L27.8264,48.142 L44.276,26.617 L35.1764,26.617 Z" fill="#1A1919"></path>
	</svg>
	<b>Actions</b>
</div>


<style>
	.tile {
		display:inline-block;
		margin:8px;
		width:168px;
		height:168px;
		border-radius:16px;
		background:#fff;
		text-align:center;
		box-shadow:0 10px 16px rgba(0,0,0,0.05);
		overflow:hidden;
		cursor:pointer;
		transition:all 0.5s linear;
	}
	.tile * {
		transition:all 0.5s linear;
	}
	.tile svg {
		margin-top:28px;
	}
	.tile .segment-large {
		fill: #FCF3CF;
	}
	.tile .segment-small {
		fill:#EB6047;
	}
	.tile b {
		display:block;
		margin:16px 16px;
		font-size:16px;

	}

	.tile:hover {
		transform: translate(0, -2px);
		box-shadow:0 16px 16px rgba(0,0,0,0.1);

	}



	.tile.mod-1:hover .segment-large {
		transform: translate(15px, 3px) scale(0.8);
	}
	.tile.mod-1:hover .segment-small {
		transform: translate(10px, 5px) scale(0.8);
	}

	.tile.mod-2:hover .segment-large {
		transform: translate(0, -3px) scale(1.2);
	}
	.tile.mod-2:hover .segment-small {
		transform: translate(-10px, 5px) scale(1.2);
	}

	.tile.mod-3:hover .segment-large {
		transform: rotate(3deg);
		transform-origin:50% 50%;
	}
	.tile.mod-3:hover .segment-small {
		transform: rotate(-3deg);
	}

	.tile.mod-4:hover .segment-large {
		fill:transparent;
	}
	.tile.mod-4:hover .segment-small {
		fill:transparent;
	}


	.tile.mod-5:hover .segment-large {
		fill:transparent;
		stroke:#FCF3CF;
	}
	.tile.mod-5:hover .segment-small {
		fill:transparent;
		stroke:#EB6047;
	}

	.tile.mod-6:hover .segment-large {
		opacity:0.5;
	}
	.tile.mod-6:hover .segment-small {
		opacity:0.5;
	}

	.tile.mod-7:hover .segment-large {
		transform: translate(-100px, -100px) scale(5);
		opacity:0.5;
	}
	.tile.mod-7:hover .segment-small {
		transform: translate(-150px, -50px) scale(5);
		opacity:0.5;
	}

	@keyframes pulse-animation {
		0% {
			box-shadow: 0 0 0 0px rgba(255, 153, 0, 0.2);
		}
		100% {
			box-shadow: 0 0 0 10px rgba(255, 153, 0, 0);
		}
	}


</style>
