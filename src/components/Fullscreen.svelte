<script>
	function fullscreen() {
		let el = document.body;
		if (el.requestFullscreen) {
			el.requestFullscreen();
		} else if (el.webkitRequestFullscreen) {
			el.webkitRequestFullscreen();
		} else if (el.msRequestFullscreen) {
			el.msRequestFullscreen();
		} else {
			alert('Full screen not supported');
		}
	}

	function exitfullscreen() {
		let el = document.body;
		if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (document.webkitExitFullscreen) {
			document.webkitExitFullscreen();
		} else if (document.msExitFullscreen) {
			document.msExitFullscreen();
		}
		document.body.classList.remove('fs');
	}
	document.addEventListener("fullscreenchange", function () {
		console.log("fschange fullscreenchange");
		document.body.classList.toggle('fs', document.fullscreenElement);
	}, false);

	document.addEventListener("mozfullscreenchange", function () {
		console.log("fschange mozfullscreenchange");
		document.body.classList.toggle('fs', document.mozFullScreen);
	}, false);

	document.addEventListener("webkitfullscreenchange", function () {
		console.log("fschange webkitfullscreenchange");
		document.body.classList.toggle('fs', document.webkitIsFullScreen);
	}, false);
</script>
<!-- relies on fs class on body and global css -->
<a href="/" class="btn hidefs" on:click|preventDefault="{fullscreen}">Go Fullscreen</a>
<a href="/" class="btn showfs" on:click|preventDefault="{exitfullscreen}">Exit Fullscreen</a>