<script>
	import QrCode from "svelte-qrcode";
    let base_url = "https://www.google.com?"
    let location = false;
    let location_text = 'hi';
    
    $: location_param = (location ? '&l=' + location_text : '');

    $: value = base_url + location_param;

	
</script>

<div>
    <input type="checkbox" bind:checked={location}>
    <QrCode {value }/>


</div>

