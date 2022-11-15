<script>
	let show_ad = false;

	let ads = [
		{
			icon: 'ehs',
			name: 'EcoOnline EHS',
			headline: 'Health and safety software that engages your entire workforce',
			copy: 'H&S software is only as good as the engagement it achieves. At EcoOnline, we pride ourselves on offering the most intuitive and user-friendly modules to captivate your workforce.',
			url: 'https://www.ecoonline.com/health-and-safety-software'
		}
	]
	let ad = ads[0]
</script>

<div class='wrapper' class:show_ad>
	<div class='tile' on:mouseenter={ () => { show_ad = true}} on:mouseleave={ () => { show_ad = false}}>
		<div class="icon" style="background-image:url('https://ecoonline.github.io/ux/public/images/svgs_clean/{ad.icon}.svg"></div>
		<span class='tease'>Do you know about {ad.name}?</span>
		<div class='pitch'>
			<h4>{ad.headline}</h4>
			<p>{ad.copy}</p>
			<!-- svelte-ignore security-anchor-rel-noreferrer -->
			<a href="{ad.url}" target='_blank' rel='help'>Learn more</a>
		</div>
	</div>
</div>


<style>
	
	 :global(body){
		overflow:hidden;
		background:transparent;
		font-family: "IBM Plex Sans", sans-serif;
		font-weight:400;
		font-size:16px;
		position: relative;
	 }

	 .wrapper {
		width: 600px;
		position:absolute;
		bottom:0;
		right:0;
	 }

	 .tile {
		border-radius:12px;
		padding:8px;
		background:transparent;
		transition: background 0.2s linear, box-shadow 0.4s linear ;
		overflow: auto;
		margin-bottom:8px;
	 }

	 .icon {
		width: 48px;
		aspect-ratio: 1;
		margin-right:8px;
		background-color: transparent;
		background-position: center center;
		background-repeat:no-repeat;
		background-size:cover;
		transition: all 0.2s linear;
		vertical-align: middle;
		float:left;
	 }
	.tease {
		float:left;
		line-height:48px;
	}
	.pitch {
		opacity:0;
		display:none;
		float:left;
		max-width:520px;
	}

	.show_ad .tease {
		display:none;
	}
	.show_ad .pitch {
		opacity:1;
		display:inline-block;
	}

	.show_ad .tile {
		background-color: #fff;
		box-shadow: 0 6px 10px 0 rgb(186 191 195 / 20%);
	}
	.pitch h4 {
		margin-top:12px;
	}
	.pitch a {
		overflow: hidden;
		text-overflow: ellipsis;
		border-radius: 54px;
		padding: 0 16px;
		color: #fff;
		background: #272F96;
		border: 1px solid #272F96;
		text-decoration: none;
		vertical-align: middle;
		display: inline-block;
		white-space: nowrap;
		line-height: 32px;
		text-align: center;
		margin-right:8px;
		margin-left:0;
		margin-bottom: 16px;
		cursor:pointer;
		position:relative;
	}
	.pitch a:hover {
		background: #1c237e;
		border: 1px solid #1c237e;
	}
</style>