<script>
	let step = 0;


	document.onkeydown = function(e) {
		e = e || window.event;
		switch (e.key) {
			case "ArrowLeft":
				if(step > 0) { step--; }
				break;
			case "ArrowRight":
				step++;
				break;
		}
	};
</script>



<div class="page">
	<h1>EcoOnline UX Tools & Experiments</h1>

	{#if step === 0}
		<h4>Who am I</h4>
		<ul>
			<li><b>Hayden Chambers</b></li>
			<li>Role: Senior Product Dsigner, UX team</li>
			<li>Came on board with Engage team after nearly 4 years as 'frontend'</li>
			<li>- UX/UI</li>
			<li>- frontend JS coding</li>
		</ul>
		<h4>What do I do now?</h4>
		<ul>
			<li>Started with the rebrand</li>
			<li>Assist with Design System components</li>
			<li>Create icons and ux mockups</li>
			<li>Make Arnfinn lose more hair</li>
			<li>And...</li>
			<li><b>Tools and experiments</b></li>
		</ul>
	{/if}
	{#if step > 0}
		<h4>What are tools and experiments?</h4>
		<ul>
			<li><b>EXPERIMENTS</b></li>
			{#if step > 1}
				<li>- TESTING efficiency: proving ideas before taking to clients</li>
			{/if}
			{#if step > 2}
				<li>- TESTING interaction: sometimes figma and its prototypes aren't enough</li>
			{/if}
			{#if step > 3}
				<li>- DISCOVERY: new ideas or blue ocean strategies</li>
			{/if}
		</ul>
		
	{/if}




	<div class="step">{step}</div>
</div>