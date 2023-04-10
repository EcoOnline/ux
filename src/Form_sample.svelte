<script>
    //Choose a random image from your computer, a screenshot, or a blank page and include it in the below input. Supported formats: pdf,  jpeg, png, svg"
    import Form from './components/form/Form.svelte';
    let channel = 'SAMPLE';
    let samples = {
        "survey1": [
            {
                item_type: "input_select",
                id: "s1",
                label: "What day is it today?",
                hint: false,
                optional: false,
                options: [
                    {text: "Monday"},
                    {text: "Tuesday"},
                    {text: "Wednesday"},
                    {text: "Thursday"},
                    {text: "Friday"},
                    {text: "Saturday"},
                    {text: "Sunday"}
                ],
                answer: new Date().toLocaleString('en-us', {  weekday: 'long' })
            },
            {
                item_type: "input_text",
                id: "s2",
                label: "What's your name?",
                placeholder: 'Jane Doe',
                hint: false,
                optional: false,
                answer: "",
            },
            {
                item_type: "input_text",
                id: "s3",
                label: "What's your native language?",
                placeholder: 'Language',
                hint: false,
                optional: false,
                answer: "",
            },
            {
                item_type: "input_text",
                id: "s4 ",
                label: "Where do you live?",
                placeholder: 'Name a place',
                hint: false,
                optional: false,
                answer: "Earth",
            },
            {
                item_type: "input_text",
                id: "s4 ",
                label: "What time is it now?",
                placeholder: '00:00',
                hint: false,
                optional: false,
                answer: "",
            },
            {
                item_type: "submit_button",
                id: "s5 ",
                label: "Submit"
            }
        ],
        "survey2": [
            {
                item_type: "input_text",
                id: "s2",
                label: "Who are you?",
                placeholder: 'Jane Doe',
                hint: false,
                optional: false,
                answer: "A human being",
            },
            {
                item_type: "input_text",
                id: "s3",
                label: "What was your first job?",
                placeholder: 'Waiter',
                hint: false,
                optional: false,
                answer: "",
            },
            {
                item_type: "input_text",
                id: "s4 ",
                label: "What was the last book you read?",
                placeholder: 'Dune',
                hint: false,
                optional: false,
                answer: "",
            },
            {
                item_type: "input_text",
                id: "s5 ",
                label: "What's your age?",
                placeholder: '65',
                hint: false,
                optional: true,
                answer: "",
            },
            {
                item_type: "input_text",
                id: "s6 ",
                label: "Is your glass half empty or half full?",
                placeholder: '',
                hint: false,
                optional: false,
                answer: "Half full of course",
            },
            {
                item_type: "submit_button",
                id: "s5 ",
                label: "Submit"
            }
        ],
        "survey3": [
            {
                item_type: "input_file",
                id: "file_sample",
                label: "File attachment",
                hint: false,
                optional: false,
                answer: ""
            }
        ],
        "survey4": [
            {
                item_type: "input_file",
                id: "file_sample",
                label: "File attachment",
                hint: false,
                optional: false,
                variant: 2,
                answer: ""
            }
        ],
        "multi_survey1": [
            {
                item_type: "input_multi",
                id: "group_a",
                label: "Group A",
                options: [
                    {
                        "key": "13",
                        "value": "Richard Kim",
                        "selectable": true,
                        "selected": false
                    },
                    {
                        "key": "19",
                        "value": "Kevin Robinson",
                        "selectable": true,
                        "selected": true
                    },
                    {
                        "key": "1",
                        "value": "John Smith",
                        "selectable": true,
                        "selected": false
                    },
                    {
                        "key": "2",
                        "value": "Mary Johnson",
                        "selectable": true,
                        "selected": true
                    },
                    {
                        "key": "3",
                        "value": "Michael Davis",
                        "selectable": true,
                        "selected": false
                    },
                    {
                        "key": "4",
                        "value": "Sarah Thompson",
                        "selectable": true,
                        "selected": true
                    },
                    {
                        "key": "5",
                        "value": "Robert Willams",
                        "selectable": true,
                        "selected": false
                    },
                    {
                        "key": "6",
                        "value": "Jennifer Lee",
                        "selectable": true,
                        "selected": false
                    },
                    {
                        "key": "7",
                        "value": "David Hernandez",
                        "selectable": true,
                        "selected": false
                    },
                    {
                        "key": "8",
                        "value": "Laura Davis",
                        "selectable": true,
                        "selected": true
                    },
                    {
                        "key": "11",
                        "value": "Christopher Brown",
                        "selectable": true,
                        "selected": true
                    },
                    {
                        "key": "16",
                        "value": "Stephanie Chen",
                        "selectable": true,
                        "selected": false
                    },
                    {
                        "key": "17",
                        "value": "Victoria Wilson",
                        "selectable": true,
                        "selected": false
                    },
                    {
                        "key": "9",
                        "value": "Anthony Perez",
                        "selectable": true,
                        "selected": false
                    },
                    {
                        "key": "10",
                        "value": "Adela Chambers",
                        "selectable": true,
                        "selected": true
                    },
                    {
                        "key": "15",
                        "value": "Samantha Garcia",
                        "selectable": true,
                        "selected": true
                    },
                    {
                        "key": "14",
                        "value": "Amanda Collins",
                        "selectable": true,
                        "selected": false
                    },
                    {
                        "key": "11",
                        "value": "Ivan Troubitsine",
                        "selectable": true,
                        "selected": false
                    }
                ],
                answer: ""
            }
        ],
        "multi_survey2": [
            {
                item_type: "input_multi",
                id: "group_b",
                label: "Group B",
                options: [
                    {
                        "key": "13",
                        "value": "Richard Kim",
                        "selectable": true,
                        "selected": false
                    },
                    {
                        "key": "19",
                        "value": "Kevin Robinson",
                        "selectable": true,
                        "selected": true
                    },
                    {
                        "key": "1",
                        "value": "John Smith",
                        "selectable": true,
                        "selected": false
                    },
                    {
                        "key": "2",
                        "value": "Mary Johnson",
                        "selectable": true,
                        "selected": true
                    },
                    {
                        "key": "3",
                        "value": "Michael Davis",
                        "selectable": true,
                        "selected": false
                    },
                    {
                        "key": "4",
                        "value": "Sarah Thompson",
                        "selectable": true,
                        "selected": true
                    },
                    {
                        "key": "5",
                        "value": "Robert Willams",
                        "selectable": true,
                        "selected": false
                    },
                    {
                        "key": "6",
                        "value": "Jennifer Lee",
                        "selectable": true,
                        "selected": false
                    },
                    {
                        "key": "7",
                        "value": "David Hernandez",
                        "selectable": true,
                        "selected": false
                    },
                    {
                        "key": "8",
                        "value": "Laura Davis",
                        "selectable": true,
                        "selected": true
                    },
                    {
                        "key": "11",
                        "value": "Christopher Brown",
                        "selectable": true,
                        "selected": true
                    },
                    {
                        "key": "16",
                        "value": "Stephanie Chen",
                        "selectable": true,
                        "selected": false
                    },
                    {
                        "key": "17",
                        "value": "Victoria Wilson",
                        "selectable": true,
                        "selected": false
                    },
                    {
                        "key": "9",
                        "value": "Anthony Perez",
                        "selectable": true,
                        "selected": false
                    },
                    {
                        "key": "10",
                        "value": "Adela Chambers",
                        "selectable": true,
                        "selected": true
                    },
                    {
                        "key": "15",
                        "value": "Samantha Garcia",
                        "selectable": true,
                        "selected": true
                    },
                    {
                        "key": "14",
                        "value": "Amanda Collins",
                        "selectable": true,
                        "selected": false
                    },
                    {
                        "key": "11",
                        "value": "Ivan Troubitsine",
                        "selectable": true,
                        "selected": false
                    }
                ],
                answer: ""
            }
        ],
        "multi_survey3": [
            {
                item_type: "input_multi",
                id: "group_c",
                label: "Group C",
                options: [
                    {
                        "key": "13",
                        "value": "Richard Kim",
                        "selectable": true,
                        "selected": false
                    },
                    {
                        "key": "19",
                        "value": "Kevin Robinson",
                        "selectable": true,
                        "selected": true
                    },
                    {
                        "key": "1",
                        "value": "John Smith",
                        "selectable": true,
                        "selected": false
                    },
                    {
                        "key": "2",
                        "value": "Mary Johnson",
                        "selectable": true,
                        "selected": false
                    },
                    {
                        "key": "3",
                        "value": "Michael Davis",
                        "selectable": true,
                        "selected": false
                    },
                    {
                        "key": "4",
                        "value": "Sarah Thompson",
                        "selectable": true,
                        "selected": false
                    },
                    {
                        "key": "5",
                        "value": "Robert Willams",
                        "selectable": true,
                        "selected": false
                    },
                    {
                        "key": "6",
                        "value": "Jennifer Lee",
                        "selectable": true,
                        "selected": false
                    },
                    {
                        "key": "7",
                        "value": "David Hernandez",
                        "selectable": true,
                        "selected": false
                    },
                    {
                        "key": "8",
                        "value": "Laura Davis",
                        "selectable": true,
                        "selected": false
                    },
                    {
                        "key": "11",
                        "value": "Christopher Brown",
                        "selectable": true,
                        "selected": false
                    },
                    {
                        "key": "16",
                        "value": "Stephanie Chen",
                        "selectable": true,
                        "selected": true
                    },
                    {
                        "key": "17",
                        "value": "Victoria Wilson",
                        "selectable": true,
                        "selected": false
                    },
                    {
                        "key": "9",
                        "value": "Anthony Perez",
                        "selectable": true,
                        "selected": false
                    },
                    {
                        "key": "10",
                        "value": "Adela Chambers",
                        "selectable": true,
                        "selected": true
                    },
                    {
                        "key": "15",
                        "value": "Samantha Garcia",
                        "selectable": true,
                        "selected": true
                    },
                    {
                        "key": "14",
                        "value": "Amanda Collins",
                        "selectable": true,
                        "selected": false
                    },
                    {
                        "key": "11",
                        "value": "Ivan Troubitsine",
                        "selectable": true,
                        "selected": false
                    }
                ],
                answer: ""
            }
        ],
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
        "input_multi": [
            {
                item_type: "input_multi",
                id: "group_a",
                label: "Group A",
                hint: "Select some names",
                options: [
                    {
                        "key": "1",
                        "value": "John Smith",
                        "selectable": true,
                        "selected": false
                    },
                    {
                        "key": "2",
                        "value": "Mary Johnson",
                        "selectable": true,
                        "selected": true
                    },
                    {
                        "key": "3",
                        "value": "Michael Davis",
                        "selectable": true,
                        "selected": false
                    },
                    {
                        "key": "4",
                        "value": "Sarah Thompson",
                        "selectable": true,
                        "selected": true
                    },
                    {
                        "key": "5",
                        "value": "Robert Willams",
                        "selectable": true,
                        "selected": false
                    },
                    {
                        "key": "6",
                        "value": "Jennifer Lee",
                        "selectable": true,
                        "selected": false
                    },
                    {
                        "key": "7",
                        "value": "David Hernandez",
                        "selectable": true,
                        "selected": false
                    },
                    {
                        "key": "8",
                        "value": "Laura Davis",
                        "selectable": true,
                        "selected": true
                    },
                    {
                        "key": "9",
                        "value": "Anthony Perez",
                        "selectable": true,
                        "selected": false
                    },
                    {
                        "key": "10",
                        "value": "Adela Chambers",
                        "selectable": true,
                        "selected": true
                    },
                    {
                        "key": "11",
                        "value": "Ivan Troubitsine",
                        "selectable": true,
                        "selected": false
                    }
                ],
                answer: ""
            }
        ],
        "input_text": [{
            item_type: "input_text",
            id: "text_sample",
            label: "Enter your name",
            hint: "This can be first, last or both.",
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
        "input_file": [
        {
            item_type: "input_file",
            id: "file_sample",
            label: "Profile image",
            hint: "Supported format: pdf,  jpeg, png, svg",
            optional: true,
            answer: ""
        }],
        "input_file2": [
        {
            item_type: "input_file",
            id: "file_sample",
            label: "Profile image",
            hint: "Supported format: pdf,  jpeg, png, svg",
            optional: true,
            variant: 2,
            multi: true,
            answer: ""
        }],
        "random_selector": [
            {
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
            }
        ]
    }

    let selected_sample = "input_text";
    let params = new URLSearchParams(window.location.search);
    let sample_param = params.get("sample");
    let title = params.get('title') || 'Input sample';
    if(sample_param && samples[sample_param]) {

        selected_sample = sample_param;
    }



    let f = [
        {
            item_type: "section",
            label: title,
            children: []
        }
    ];
    samples[selected_sample].forEach((s)=>{
        f[0].children.push(s);
    })
    
</script>
<div style='margin:32px;' class={selected_sample}>
    <Form {f} {channel}></Form>
</div>


        