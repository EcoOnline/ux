<script>
	let button_width = getComputedStyle(document.documentElement).getPropertyValue('--button_width'); 
	let button_text = "Hello";
	let button_icon = false;
	$: {
		let c = button_width;
		document.documentElement.style.setProperty('--button_width', c);
	}


	let supported_to_languages = [
		{ code: 'da', name: 'Danish', translations: [{translatedText:'Hej'}]},
		{ code: 'en', name: 'English', translations: [{translatedText:'Hello'}]},
		{ code: 'fi', name: 'Finnish', translations: [{translatedText:'Hei'}]},
		{ code: 'no', name: 'Norwegian', translations: [{translatedText:'Hallo'}]},
		{ code: 'sv', name: 'Swedish', translations: [{translatedText:'Hej'}]}
	];
	let supported_from_languages = [
		{ code: 'da', name: 'Danish'},
		{ code: 'en', name: 'English'},
		{ code: 'es', name: 'Spanish'},
		{ code: 'fi', name: 'Finnish'},
		{ code: 'no', name: 'Norwegian'},
		{ code: 'sv', name: 'Swedish'}
	];

	let source_language = supported_from_languages[1];

	/* translation */
	function translate() {
		supported_to_languages.forEach( (lang, i) => {
			if(lang.code !== source_language.code) {
				//make the request
				setTimeout(function(){
					translate_to(lang, i+1)
				}, i*500)//stagger request to avoid rate limiting
			} else {
				let plucked_lang = supported_to_languages.filter( (lang) => {
					return lang.code == source_language.code
				});
				plucked_lang[0].result = button_text; //of course
			}
		});
	}
	function translate_to(lang, i) {
		lang.result = ''; //reset any previous translation

		/*
			todo: store previous translations in a db
			so that person 1 looks up "hello", google translates
			then next request pulls from our db
		*/

		if(i===1 || true) {
			let querystring = "q=" + encodeURI(button_text) + "&target=" + lang.code + "&source=" + source_language.code;
			const xhr = new XMLHttpRequest();
			xhr.withCredentials = true;
			xhr.addEventListener("readystatechange", function () {
				if (this.readyState === this.DONE) {
					console.log(this.responseText);
					let result = JSON.parse(this.responseText);
					lang.translations = result.data.translations; 
					supported_to_languages = supported_to_languages;
				}
			});
			xhr.open("POST", "https://google-translate1.p.rapidapi.com/language/translate/v2");
			xhr.setRequestHeader("content-type", "application/x-www-form-urlencoded");
			//xhr.setRequestHeader("accept-encoding", "application/json"); //not permitted by browser
			xhr.setRequestHeader("x-rapidapi-key", "bb96e0c586mshd5af051ba1a7fb2p11a1d0jsndc902a5d9cba");
			xhr.setRequestHeader("x-rapidapi-host", "google-translate1.p.rapidapi.com");
			xhr.send(querystring);
		} else {
			console.log('throttling', lang.name);
		}
		supported_to_languages = supported_to_languages;
	}


</script>
<div class="page">
	<div class="content">
		<h2>Button text tester</h2>
		<div class="form-row">
		<input class="form-control" style="width:72px" type="text" bind:value={button_width}> max width to be decided by UX team for DS
		</div>
		<div class="form-row">
			<a href="/ecoonline/" class="btn">
				{#if button_icon}
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path fill-rule="evenodd" clip-rule="evenodd" d="M8 11L3 6.00005L3.7 5.30005L8 9.60005L12.3 5.30005L13 6.00005L8 11Z" fill="white"/>
					</svg>
				{/if}
				{button_text}
			</a> <input class="form-control" type="text" bind:value={button_text}>
			<label> <input type="checkbox" bind:checked="{button_icon}"> Show icon</label>
			<select class="form-control" style="width:100px" bind:value={source_language}>
				{#each supported_from_languages as lang}
					<option value={lang}>
						{lang.name}
					</option>
				{/each}
			</select>
		</div>
		


		<hr>
		Translate "{button_text}" from {source_language.name}
		<a href="/ecoonline/" class="btn" on:click|preventDefault="{translate}">Go</a><br>
		<p>Please use <b>sparingly</b> as we only have 500 characters per month. If it proves useful we can expand the character limit.</p>
		{#each supported_to_languages as lang}
			{#if lang.code !== source_language.code && lang.translations.length}
				<div class="form-row">
					<!--<code>{JSON.stringify(lang)}</code>-->
					<a href="/ecoonline/" class="btn">
						{#if button_icon}
							<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path fill-rule="evenodd" clip-rule="evenodd" d="M8 11L3 6.00005L3.7 5.30005L8 9.60005L12.3 5.30005L13 6.00005L8 11Z" fill="white"/>
							</svg>
						{/if}

						{lang.translations[0].translatedText}
					</a> {lang.name} <span class="dull">(full text: {lang.translations[0].translatedText})</span>

					{#if lang.translations.length > 1}
						Other translations:
						<select class="form-control">
							{#each lang.translations as t}
							<option>{t.translatedText}</option>
							{/each}
						</select>
					{/if}
				</div>
			{/if}
		{/each}
	</div>
</div>
