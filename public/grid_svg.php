<?php
	header('Content-type: image/svg+xml');
	echo'<?xml version="1.0" standalone="no"?>'
?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 <?= $_GET['w']+$_GET['g'] ?> 100" width="<?= $_GET['w']+$_GET['g'] ?>" height="100">
	<rect x="0" y="0" width="<?= $_GET['w'] ?>" height="100" fill="red"/>

	<rect x="<?= $_GET['w']/3 ?>" y="0" width="1" height="100" fill="black"/>
	<rect x="<?= $_GET['w']/3*2 ?>" y="0" width="1" height="100" fill="black"/>
</svg>