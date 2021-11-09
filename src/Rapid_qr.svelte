<script>
	import QrCode from "svelte-qrcode";

    let show_settings = false;



    let base_url = "https://ecoonline.github.io/ux/public/rapid.html?";

    
    let can_supply_photos = true;
    $: photo_param = (can_supply_photos ? 'photo=1' : '');
    let single_page = false;
    $: singlepage_param = (single_page ? '&singlepage=1' : '');

    let location = false;
    let location_text = 'Main Office';
    $: location_param = (location ? '&loc=' + encodeURI(location_text) : '');




    let languages = [
        {'code': 'en', 'name': 'English'},
        {'code': 'no', 'name': 'Norwegian'},
        {'code': 'fi', 'name': 'Finnish'}
    ]
    let language = languages[0];
    $: language_param = '&lang=' + language.code;


    let brands = [
        {'code': 'no_brand', 'name': 'No Brand',},
        {'code': 'mercedes', 'name': 'Mercedes Benz'},
        {'code': 'metsa', 'name': 'Metsa'},
        {'code': 'viridor', 'name': 'Viridor'}
    ]

    let brand = brands[0];

    $: brand_param = '&b_code=' + encodeURI(brand.code); 

    let person = false;
    let people = {
        'en': 'John Smith',
        'fi': 'Matti Meikäläinen',
        'no': 'Ola Nordmann'
    }
    let person_text = '';
    $: {
        let l = language_param;
        let p = person;
        person_text = people[language.code];
        console.log('checking person text', person_text);
    }
    $: person_param = person ? '&person=' + encodeURI(person_text) : ''; 
    

    
    $: value = base_url + photo_param + singlepage_param + location_param + language_param + brand_param + person_param;

	
</script>

<div>
    
    <QrCode {value }/>


    <hr>
    {#if !show_settings}
        <span class="toggle" on:click="{ () => { show_settings = !show_settings}}">Show settings ↓</span>
    {:else}
        
        <span class="toggle" on:click="{ () => { show_settings = !show_settings}}">Hide settings ↑</span><br>

        <div class="row">
            <label><input type="checkbox" bind:checked={location}> Set location</label>
            {#if location}
                <input type="text" class="form-control" bind:value="{location_text}" />
            {/if}
        </div>
        <div class="row">
            <label><input type="checkbox" bind:checked={person}> Set person</label>
        </div>
        <div class="row">
            <label><input type="checkbox" bind:checked={single_page}> Single page</label>
        </div>
        <div class="row">
        
            <label for="lang">Language</label>
            <select id="lang" class="form-control" bind:value="{language}">
                {#each languages as item}
                    <option value={item}>
                        {item.name}
                    </option>
                {/each}
            </select>
        </div>
        <div class="row">
            <label for="brand">Brand</label>
            <select id="brand" class="form-control" bind:value="{brand}">
                {#each brands as item}
                    <option value={item}>
                        {item.name}
                    </option>
                {/each}
            </select>
        </div>

        <hr>
        <code><b>{value.length}</b> {value}</code>
    {/if}
</div>

<style>
    .toggle {
        display: inline-block;
        margin-bottom:32px;
        font-size:14px;
        cursor:pointer
    }

    .row {
        padding: 8px 0;
    }
</style>