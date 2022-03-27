<script>
    import PubNub from 'pubnub'; 
    import { onMount} from 'svelte';
	import QrCode from "svelte-qrcode";
    import SigCanvas from './InputSignatureCanvas.svelte';


    export let f;
    let ref = '';
    let base_url = "https://ecoonline.github.io/ux/public/mobile_signature.html?ref=";
    let qr_value = base_url;
   


    //pusher credentials
    /*
    let app_id = "8549";
    let key = "c5d029ed185464bb76ed";
    let secret = "67fdc58637775aa28ffd";
    let cluster = "mt1";
    */
    let unique_num = (Math.random() + '').substring(2);
    let is_mobile = false;
    let coms_num = unique_num;

    // pubnub creds
    let pubnub = new PubNub({
        publishKey : 'pub-c-c7c40d64-0bf9-4f4f-9678-1342b3f5e289',
        subscribeKey : 'sub-c-fbe7422a-ad0f-11ec-b6fc-9aa0759238d3',
        uuid: unique_num
    });

    function randomref() {
        unique_num = (Math.random() + '').substring(2);
        coms_num = unique_num;
        qr_value = base_url + coms_num;
    }
    function handleSignature(event) {
        pubnub.publish({
            channel : "signature",
            message: {
                uuid: coms_num,
                payload: event.detail.text
            }, function(status, response) {
                console.log('?', status, response);
            }
        });
    }
    

    onMount(() => {

        let queryParams = new URLSearchParams(window.location.search);
        ref = queryParams.get("ref");
        console.log('ref?', ref);
        if(ref) {
            is_mobile = true;
            coms_num = ref;
        } else {
            is_mobile = false;
        }
        qr_value = base_url + coms_num;


        
        pubnub.addListener({
            message: function (m) {
                if(m.message.uuid == coms_num) {
                    console.log('SIGNATURE FROM LEGIT COMMS');
                    console.log(m.message.uuid, m.message.payload);

                    //paint from message onto canvas
                    let img = new Image;
                    img.onload = function(){
                        context.drawImage(img,0,0);
                    };
                    img.src = m.message.payload;
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
        <label for="{f.id}">{f.label}</label>
    {/if}
    {#if f.hint}
        <p>{f.hint}</p>
    {/if}
    <div class="signature-holder">
        <div class="form-control signature-box" class:is_mobile>
            <SigCanvas on:signature="{handleSignature}"></SigCanvas>
        </div>

        {#if !is_mobile}
            <div class="signature-qr">
                <QrCode value={qr_value}/>
                {qr_value}
                <!--or sign with mobile-->
            </div>
        {/if}
    </div>
    <span on:click="{randomref}">test</span>
</div>

<style>
    .signature-holder {
        position:relative;
    }


    .signature-box {
        max-width:480px;
        overflow: visible;
        height:160px;
        padding:0;
    }
    .signature-qr {
        position:absolute;
        top:0;
        left:105%;
        width:160px;
        height:160px;
        padding: 0px 16px;
        font-size: 12px;
        line-height: 24px;
        padding: 12px 16px;
        border-radius: 12px;
        text-align:center;
        border: 1px solid var(--eo-border-input);
    }
    :global(.signature-qr img) {
        width:120px;
        display:block;
        margin:0 auto;
    }
    .is_mobile {
        max-width:100% ! important;
        aspect-ratio: 3;
        height:auto
    }

</style>