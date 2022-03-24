<script>
    import QrCode from "svelte-qrcode";
    let base_url = "https://ecoonline.github.io/ux/public/rapid.html?src=uxdemo";
    let single_page = true;
    $: singlepage_param = (single_page ? '&singlepage=1' : '');
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
        {'code': 'viridor', 'name': 'Viridor'},
        {'code': 'fcc', 'name': 'FCC'}
    ]

    let brand = brands[0];

    $: brand_param = '&b_code=' + encodeURI(brand.code); 
    $: value = base_url + singlepage_param + language_param + brand_param;


</script>


<div class="row">
    <div class="col">
        <h5>Settings</h5>

        <p class="clue">View mode</p>
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label on:click="{ () => { single_page = !single_page }}" >
            <svg class="checkbox" class:checked={single_page} width="26px" height="26px" viewBox="0 0 26 26" version="1.1" xmlns="http://www.w3.org/2000/svg" stroke-width="2" stroke-linecap="round" style="vertical-align:middle">
                <rect x="1" y="1" width="24" height="24" rx="4"></rect>
                <line x1="21" y1="8" x2="11" y2="18"></line>
                <line x1="6" y1="13" x2="11" y2="18"></line>
            </svg>
            Show as a single page
        </label>

        <p class="clue">Language</p>
        <select id="lang" class="form-control" bind:value="{language}">
            {#each languages as item}
                <option value={item}>
                    {item.name}
                </option>
            {/each}
        </select>

        <p class="clue">Brand</p>
        <select id="brand" class="form-control" bind:value="{brand}">
            {#each brands as item}
                <option value={item}>
                    {item.name}
                </option>
            {/each}
        </select>

    </div>
    <div class="col">
        <h5>QR</h5>
        <QrCode {value }/>
    </div>
</div>


<style>
    .clue {
        font-size:0.83em;
        margin-bottom:8px;
        margin-top:32px;
    }
    .checkbox rect {
        fill: #fff;
        stroke: var(--lightgrey);
    }
    .checkbox line {
        stroke: var(--lightgrey);
    }
    .checkbox.checked rect {
        fill: var(--blue);
        stroke: var(--blue);
    }
    .checkbox.checked line {
        stroke: #fff;
    }
    select {
        border: 2px solid var(--lightgrey);
        border-radius:4px;
        line-height:38px;
        height:38px;
        padding:0 8px;
        max-width:320px;
        width: 100%;
        
    }
</style>