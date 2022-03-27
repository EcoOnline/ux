<script>
	
    import Form from './components/form/Form.svelte';
	let channel = 'MOBILE_SIGNATURE';
	let f = [
        {
            item_type: "section",
            children: [
                {
                    item_type: "input_signature",
                    id: "0_11",
                    label: "Signature required",
                    optional: false,
                    answer: ""
                }
            ]
        }
    ];

</script>
<main>
	<div class="frame">
		<Form {f} {channel}/>
	</div>
</main>


<style>
	
	 :global(body){
		overflow:hidden;
	}
	
	main {
		padding: 0 16px;
		width:100%;
		text-align: center;
		overflow-y: scroll;
	}

	main {
		height:100%;
		padding-bottom: 16px;
	}
	.frame {
		text-align: left;
		margin: 0 auto;
		max-width:1328px;
		padding:0;
		height:100%;

	}
</style>