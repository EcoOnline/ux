<script>
	let step = 0;


	document.onkeydown = function(e) {
		e = e || window.event;
		switch (e.key) {
			case "ArrowUp":
				step = 0;
				break;
			case "ArrowLeft":
				if(step > 0) { step--; }
				break;
			case "ArrowRight":
				step++;
				if(step > 9) {
					window.location.href = 'https://ecoonline.github.io/ux/';
				}
				break;
		}
	};
</script>



<div class="page">
	<div class="i i-shield-segment1"><i></i></div>
	<div class="i i-shield-segment2"><i></i></div>

	<h1>EcoOnline UX Tools & Experiments</h1>

	{#if step < 3}
		{#if step > 0}
			<h4>Who am I</h4>
			<ul>
				<li><b>Hayden Chambers</b></li>
				<li>Role: Senior Product Designer, UX team</li>
				<li>Came on board with Engage team after nearly 4 years as 'frontend'</li>
				<li>- UX/UI</li>
				<li>- frontend JS coding</li>
			</ul>
		{/if}
		{#if step > 1}
			<h4>What do I do now?</h4>
			<ul>
				<li>Started with the rebrand</li>
				<li>Assist with Design System components</li>
				<li>Create icons and UX mockups</li>
				<li>Make Arnfinn lose more hair</li>
				<li>And...</li>
				<li><b>Tools & Experiments</b></li>
			</ul>
		{/if}
	{/if}
	{#if step > 2}
		<h4>What are Tools & Experiments?</h4>
		<ul>
			<li><b>EXPERIMENTS</b></li>
			{#if step > 2}
				<li>- TESTING efficiency: proving ideas before taking to clients</li>
			{/if}
			{#if step > 3}
				<li>- TESTING interaction: sometimes figma and its prototypes aren't enough</li>
			{/if}
			{#if step > 4}
				<li>- DISCOVERY: new ideas or blue ocean strategies</li>
			{/if}
		</ul>
		{#if step > 5}
			<ul>
				<li><b>TOOLS</b></li>
				<li>- SCALE: small UX team doesn't want to be a blocker</li>
				{#if step > 6}
					<li>- SCALE: where possible self service without specialized roles/skills</li>
				{/if}
				{#if step > 7}
					<li>- CONSISTENCY: implement our brand in a uniform way</li>
				{/if}
				
			</ul>
			
		{/if}
		{#if step > 8}
			<h4>We now have a github repository for this</h4>
			<p>(Thanks Øyvind)</p>
		{/if}
		
	{/if}
	
	<div class="step">{step}</div>
</div>