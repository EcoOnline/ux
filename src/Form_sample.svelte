<script>
    import Form from './components/form/Form.svelte';
    let channel = 'SAMPLE';
    let samples = {
        "input_tally": {
            item_type: "input_tally",
            id: "tally_sample",
            label: "In order",
            sentiment: "good",
            optional: true,
            answer: ""
        },
        "input_text": {
            item_type: "input_text",
            id: "text_sample",
            label: "Enter your name",
            hint: "This can be first, last or both.",
            optional: true,
            answer: ""
        }
    }

    let selected_sample = "input_text";
    let params = new URLSearchParams(window.location.search);
    let sample_param = params.get("sample");
    if(sample_param && samples[sample_param]) {

        selected_sample = sample_param;
    }



    let f = [
        {
            item_type: "section",
            label: "Input sample",
            children: []
        }
    ];

    f[0].children.push(samples[selected_sample]);
    console.log(f);
</script>
<div style='margin:32px;'>
    <Form {f} {channel}></Form>
</div>
	
        