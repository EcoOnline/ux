<script>
    import Form from './components/form/Form.svelte';
    let channel = 'SAMPLE';
    let samples = {
        "input_tally": [
            {
                item_type: "input_tally",
                id: "tally_sample",
                label: "In order",
                sentiment: "good",
                optional: true,
                answer: ""
            },
            {
                item_type: "input_tally",
                id: "tally_sample2",
                label: "Not in order",
                sentiment: "bad",
                optional: true,
                answer: ""
            }
        ],
        "swatch": [{
            item_type: "swatch",
            id: "swatch_sample",
            label: "Swatch sample",
            hint: "HSL color mode, set the H & S value.",
            optional: true,
            answer: "",
            shortcuts: [
                { value: '235/59%', text: "Primary" },
                { value: '158/77%', text: "Green" },
                { value: '34/100%', text: "Yellow" },
                { value: '0/90%', text: "Red" }
            ]
        }],
        "input_text": [{
            item_type: "input_text",
            id: "text_sample",
            label: "Enter your name",
            hint: "This can be first, last or both.",
            optional: true,
            answer: ""
        }],
        "input_file": [{
            item_type: "input_file",
            id: "file_sample",
            label: "Profile image",
            hint: "Supported format: pdf,  jpeg, png, svg",
            optional: true,
            answer: ""
        }],
        "input_text2": [{
            item_type: "input_text",
            id: "text_sample2",
            label: "What's your favourite colour",
            hint: "Any colour so long as it's blue",
            optional: true,
            answer: "",
            shortcuts: [
                { value: 'Blue', text: "Blue" },
                { value: 'Blue!', text: "Red" },
                { value: 'Blue is best', text: "Green" },
                { value: 'Actually blue', text: "Computer grey", icon:  'ml'}
            ]
        }],
        "random_selector": [{
            item_type: "random_selector",
            id: "rs",
            label: "Choose a game name",
            hint: false,
            optional: false,
            options: [
                {text: "Clash of"},
                {text: "Kings vs"},
                {text: "Hoard of"},
                {text: "Clans vs"},
                {text: "War of"},
                {text: "Heroes vs"},
                {text: "Zombies vs"},
                {text: "Plants vs"},
                {text: "Masters vs"}
            ],
            answer: ""
        },
        {
            item_type: "random_selector",
            id: "rs",
            label: "",
            hint: false,
            optional: false,
            spin_button: true,
            options: [
                {text: "Clans"},
                {text: "Kings"},
                {text: "Heroes"},
                {text: "Plants"},
                {text: "Zombies"},
                {text: "Masters"}
            ],
            answer: ""
        }]
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
    samples[selected_sample].forEach((s)=>{
        f[0].children.push(s);
    })
    
</script>
<div style='margin:32px;'>
    <Form {f} {channel}></Form>
</div>
	
        