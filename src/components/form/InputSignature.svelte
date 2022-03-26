<script>
    import { onMount} from 'svelte';
    export let f;


    //pusher credentials
    let app_id = "8549";
    let key = "c5d029ed185464bb76ed";
    let secret = "67fdc58637775aa28ffd";
    let cluster = "mt1";
    let unique_num = (Math.random() + '').substring(2);
    console.log('unique num', unique_num);

    

    onMount(() => {f
        
        let pusher = new Pusher("key", {
            cluster: "cluster",
        });

        let hear = pusher.subscribe("signature-channel");

        hear.bind("pusher:subscription_succeeded", () => {
            console.log('a subscription was made')
        });

        hear.bind("signature-made", (data) => {
            // Method to be dispatched on trigger.
            console.log('signature made');
        });
        
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
        <div class="signature-box">
            sign here
        </div>
        <div class="signature-qr">
            QR<br>
            or sign with mobile
        </div>
    </div>
    
</div>
