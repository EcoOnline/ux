<script>
    import InputSwitch from "./components/form/InputSwitch.svelte";

    let f =  {
        options: [
            {value: false, text: "I agree to the terms and conditions"}
        ]
    };

    function submit() {
        
        if (typeof window.messageHandler !== 'undefined') {
            messageHandler.postMessage(f.options[0].value);
        }
    }
	
</script>



<div class="page">
    <div class="card">
        <div class="card-header">
            <h1>SAFETY POLICY</h1>
        </div>
        <div class="card-body">
            <p><i>Last updated Feb 24th 2022</i></p>
            <h4>AGREEMENT TO TERMS</h4>
            <div class="tac-content">
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vel euismod libero. Donec id convallis velit. Suspendisse pellentesque neque sit amet sapien porttitor, at pharetra enim vulputate. Maecenas vel risus accumsan, pulvinar velit sollicitudin, sagittis libero. </p>
                <p>Pellentesque a felis luctus, ullamcorper ipsum quis, malesuada tellus. Duis vestibulum semper sagittis. Sed auctor augue quis elit placerat posuere. Sed facilisis lacinia est nec maximus. Integer at odio sit amet dolor venenatis pulvinar nec ac neque. Curabitur ullamcorper vitae tortor id ultrices. Quisque eget lacinia lacus. Nulla dapibus quam at leo dignissim aliquam.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vel euismod libero. Donec id convallis velit. Suspendisse pellentesque neque sit amet sapien porttitor, at pharetra enim vulputate. Maecenas vel risus accumsan, pulvinar velit sollicitudin, sagittis libero. </p>
                <p>Pellentesque a felis luctus, ullamcorper ipsum quis, malesuada tellus. Duis vestibulum semper sagittis. Sed auctor augue quis elit placerat posuere. Sed facilisis lacinia est nec maximus. Integer at odio sit amet dolor venenatis pulvinar nec ac neque. Curabitur ullamcorper vitae tortor id ultrices. Quisque eget lacinia lacus. Nulla dapibus quam at leo dignissim aliquam.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vel euismod libero. Donec id convallis velit. Suspendisse pellentesque neque sit amet sapien porttitor, at pharetra enim vulputate. Maecenas vel risus accumsan, pulvinar velit sollicitudin, sagittis libero. </p>
                <p>Pellentesque a felis luctus, ullamcorper ipsum quis, malesuada tellus. Duis vestibulum semper sagittis. Sed auctor augue quis elit placerat posuere. Sed facilisis lacinia est nec maximus. Integer at odio sit amet dolor venenatis pulvinar nec ac neque. Curabitur ullamcorper vitae tortor id ultrices. Quisque eget lacinia lacus. Nulla dapibus quam at leo dignissim aliquam.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vel euismod libero. Donec id convallis velit. Suspendisse pellentesque neque sit amet sapien porttitor, at pharetra enim vulputate. Maecenas vel risus accumsan, pulvinar velit sollicitudin, sagittis libero. </p>
                <p>Pellentesque a felis luctus, ullamcorper ipsum quis, malesuada tellus. Duis vestibulum semper sagittis. Sed auctor augue quis elit placerat posuere. Sed facilisis lacinia est nec maximus. Integer at odio sit amet dolor venenatis pulvinar nec ac neque. Curabitur ullamcorper vitae tortor id ultrices. Quisque eget lacinia lacus. Nulla dapibus quam at leo dignissim aliquam.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vel euismod libero. Donec id convallis velit. Suspendisse pellentesque neque sit amet sapien porttitor, at pharetra enim vulputate. Maecenas vel risus accumsan, pulvinar velit sollicitudin, sagittis libero. </p>
                <p>Pellentesque a felis luctus, ullamcorper ipsum quis, malesuada tellus. Duis vestibulum semper sagittis. Sed auctor augue quis elit placerat posuere. Sed facilisis lacinia est nec maximus. Integer at odio sit amet dolor venenatis pulvinar nec ac neque. Curabitur ullamcorper vitae tortor id ultrices. Quisque eget lacinia lacus. Nulla dapibus quam at leo dignissim aliquam.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vel euismod libero. Donec id convallis velit. Suspendisse pellentesque neque sit amet sapien porttitor, at pharetra enim vulputate. Maecenas vel risus accumsan, pulvinar velit sollicitudin, sagittis libero. </p>
                <p>Pellentesque a felis luctus, ullamcorper ipsum quis, malesuada tellus. Duis vestibulum semper sagittis. Sed auctor augue quis elit placerat posuere. Sed facilisis lacinia est nec maximus. Integer at odio sit amet dolor venenatis pulvinar nec ac neque. Curabitur ullamcorper vitae tortor id ultrices. Quisque eget lacinia lacus. Nulla dapibus quam at leo dignissim aliquam.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vel euismod libero. Donec id convallis velit. Suspendisse pellentesque neque sit amet sapien porttitor, at pharetra enim vulputate. Maecenas vel risus accumsan, pulvinar velit sollicitudin, sagittis libero. </p>
                <p>Pellentesque a felis luctus, ullamcorper ipsum quis, malesuada tellus. Duis vestibulum semper sagittis. Sed auctor augue quis elit placerat posuere. Sed facilisis lacinia est nec maximus. Integer at odio sit amet dolor venenatis pulvinar nec ac neque. Curabitur ullamcorper vitae tortor id ultrices. Quisque eget lacinia lacus. Nulla dapibus quam at leo dignissim aliquam.</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vel euismod libero. Donec id convallis velit. Suspendisse pellentesque neque sit amet sapien porttitor, at pharetra enim vulputate. Maecenas vel risus accumsan, pulvinar velit sollicitudin, sagittis libero. </p>
                <p>Pellentesque a felis luctus, ullamcorper ipsum quis, malesuada tellus. Duis vestibulum semper sagittis. Sed auctor augue quis elit placerat posuere. Sed facilisis lacinia est nec maximus. Integer at odio sit amet dolor venenatis pulvinar nec ac neque. Curabitur ullamcorper vitae tortor id ultrices. Quisque eget lacinia lacus. Nulla dapibus quam at leo dignissim aliquam.</p>
            </div>
            <div class="tac">
                <InputSwitch {f}></InputSwitch>
            </div> 
            <div>
                <span class="btn" on:click="{submit}">Submit</span>
            </div>
        </div>
    </div>

</div>


<style>
    .page {
        padding:8px;
    }
    .card {
        height: calc( 100vh - 16px );
        display:flex;
        flex-direction:column;

    }
    .tac-content {
        overflow: auto;
    }
    .card-body {
        display:flex;
        flex-direction:column;
        flex: 1;
	    overflow: auto;
    }
</style>