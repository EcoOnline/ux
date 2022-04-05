<script>
    import PubNub from 'pubnub'; 
    import { onMount} from 'svelte';
	import QrCode from "svelte-qrcode";
    import SigCanvas from './InputSignatureCanvas.svelte';


    export let f;
    let ref = '';
    let base_url = "https://ecoonline.github.io/ux/public/mobile_signature.html?ref=";
    let base_mobile = "com.ecoonline.ecomobile://signature?id=";
    let selected_qr = 'url';
    let qr_value = (selected_qr == 'url' ? base_url : base_mobile);
    let dataurl = false;

   

    let unique_num = (Math.random() + '').substring(2);
    let is_mobile = false;
    let coms_num = unique_num;

    $: {
        let c = coms_num;
        let s = selected_qr;
        qr_value = (s == 'url' ? base_url : base_mobile) + c;
    }  

    // pubnub creds
    let pubnub = new PubNub({
        publishKey : 'pub-c-c7c40d64-0bf9-4f4f-9678-1342b3f5e289',
        subscribeKey : 'sub-c-fbe7422a-ad0f-11ec-b6fc-9aa0759238d3',
        uuid: unique_num
    });

    function handleSignature(event) {
        console.log('signature received');
        if(is_mobile) {
            pubnub.publish({
                channel : "signature",
                message: {
                    uuid: coms_num,
                    description: event.detail.signature
                }, function(status, response) {
                    console.log('?', status, response);
                }
            });
        }
    }
    

    onMount(() => {

        let queryParams = new URLSearchParams(window.location.search);
        ref = queryParams.get("ref");
        
        if(ref) {
            console.log('is mobile so setting var to true');
            is_mobile = true;
            coms_num = ref;
        } else {
            is_mobile = false;
        }


        
        pubnub.addListener({
            message: function (m) {
                console.log('message received');
                if(m.message.uuid == coms_num) {
                    console.log('SIGNATURE FROM LEGIT COMMS');
                    dataurl = m.message.description;  
                }
            }
        });

        if(!is_mobile){
            pubnub.subscribe({
                channels: ["signature"]
            });
        }
        

       

	})

</script>



<div class="form-item">
    {#if f.label}
        <label for="{f.id}">{f.label} {#if f.optional}<span class="optional">(Optional)</span>{/if}</label>
    {/if}
    {#if f.hint}
        <p>{f.hint}</p>
    {/if}
    <div class="signature-holder" class:is_mobile class:mandatory={!f.optional}>
        <div class="form-control signature-box">
            <SigCanvas on:signature="{handleSignature}" {dataurl} {is_mobile}></SigCanvas>
        </div>

        {#if !is_mobile}
            <div class="signature-qr">
                <QrCode value={qr_value}/>
                <span class:selected="{selected_qr == 'url'}" on:click="{ () => { selected_qr = 'url'}}">Web-sign</span>
                <span class:selected="{selected_qr == 'mobile'}" on:click="{ () => { selected_qr = 'mobile'}}">Mobile-sign</span>
            </div>
        {/if}
    </div>
</div>

<style>
    .signature-holder {
        position:relative;
        max-width:480px;
    }

    .form-item {
        overflow: visible ! important;
    }

    .signature-box {
        max-width:480px;
        overflow: visible;
        height:160px;
        padding:0;
    }
    .mandatory {
        box-shadow: inset 0 0 0 12px rgb(255,185,0,0.1);
    }
    .signature-qr {
        position:absolute;
        top:0;
        left:105%;
        width:160px;
        height:160px;
        padding: 0px 16px;
        padding: 12px;
        border-radius: 12px;
        text-align:center;
        border: 1px solid var(--eo-border-input);
    }
    .signature-qr span {
        font-size: 12px;
        line-height: 16px;
        margin:4px;
        display:inline-block;
        cursor:pointer
    }
    .signature-qr span.selected {
        border-bottom: 1px solid var(--eo-secondary-500);
    }
    :global(.signature-qr img) {
        width:120px;
        display:block;
        margin:0 auto;
    }
    .is_mobile{
        max-width:100% ! important;
    }
    .is_mobile .signature-box{
        max-width:100% ! important;
        aspect-ratio: 3;
        height:auto
    }

</style>