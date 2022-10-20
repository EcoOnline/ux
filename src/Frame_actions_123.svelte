<script>
    import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
    import { createEventDispatcher } from 'svelte';
    import Pullout from './components/Pullout.svelte';
    import Form from './components/form/Form.svelte';
    import Slide from './components/Slide.svelte';
    
    const dispatch = createEventDispatcher();

    let single_page = false; //view as tabs

    let form_test = 'Form testttttt';
    let channel = 'ACTION';
    let f = [
        {
            item_type: "section",
            label: "Initial details",
            children: [
                {
                    item_type: "input_select",
                    id: "0_1",
                    label: "Site",
                    readonly: true,
                    hint: false,
                    placeholder: "Click or type to select...",
                    options: [
                        {text: "Carpark"},
                        {text: "Office"},
                        {text: "Warehouse"},
                    ],
                    answer: "Warehouse"
                },
                {
                    item_type: "input_text",
                    id: "0_2",
                    label: "Title",
                    readonly: true,
                    hint: false,
                    answer: "Check fire extinguisher in Block D"
                },
                {
                    item_type: "input_textarea",
                    id: "0_3",
                    label: "Description",
                    readonly: true,
                    hint: false,
                    answer: "Check proper placement and expiry date. Take photos of any irregularities",
                },
                {
                    item_type: "input_date",
                    id: "0_4",
                    label: "Target Date",
                    readonly: true,
                    optional: true,
                    hint: false,
                    answer: ""
                },
                {
                    item_type: "input_select",
                    id: "0_5",
                    label: "Action Type",
                    readonly: true,
                    hint: false,
                    placeholder: "Click or type to select...",
                    options: [
                        {text: "Critical Safety Action"},
                        {text: "CSR"},
                        {text: "External Regulator"},
                        {text: "Fire Alarm"},
                        {text: "Nonconformance Report Logged"},
                        {text: "Sustainability"},
                        {text: "Training"}
                    ],
                    answer: "Critical Safety Action"
                },
                {
                    item_type: "input_matrix",
                    id: "0_6",
                    label: "Priority",
                    readonly: true,
                    hint:"Please action in priority order",
                    matrix: {
                        x_criteria: [
                            
                            {
                                label: "Potential risk if action not taken",
                                options: [
                                    {"label": "Lowest risk, action after all others", "selected": false},
                                    {"label": "Minimal risk, action after daily duties", "selected": false},
                                    {"label": "Risk, action straight after high priority duties", "selected": false},
                                    {"label": "Major risk, action first", "selected": false},
                                ]
                            }
                            
                        ],
                        y_criteria: [
                            {
                                label: "Priority",
                                options: [
                                    {"label": "P", "selected": false},
                                ]
                            },
                        ],
                        values: [
                            [
                                {text: "P1", color: "ok"}
                            ],
                            [
                                {text: "P2", color: "ok"},
                            ],
                            [
                                {text: "P3", color: "warning"},
                            ],
                            [
                                {text: "P4", color: "critical"},
                            ]
                        ]
                        
                    },
                    answer: {text: "P4", color: "critical"}
                },
            ]
        },
        {
            item_type: "section",
            label: "Assignee",
            children: [
                {
                    item_type: "input_select",
                    id: "0_7",
                    label: "Assignee type",
                    readonly: true,
                    hint: false,
                    placeholder: "Click or type to select...",
                    options: [
                        {text: "Employee"},
                        {text: "Contractor"},
                        {text: "Unlisted"},
                    ],
                    answer: "Employee"
                },
                {
                    item_type: "input_text",
                    id: "0_8",
                    label: "Assignee",
                    readonly: true,
                    hint: false,
                    placeholder: "Click or type to select...",
                    answer: "You"
                },
                {
                    item_type: "input_radio",
                    id: "0_9",
                    label: "Allow assignee to reject?",
                    readonly: true,
                    options: [
                        {text: "Yes"},
                        {text: "No"},
                    ],
                    answer: "Yes"
                }
            ]
        },
        {
            item_type: "section",
            label: "Verfication",
            children: [
                
                {
                    item_type: "input_radio",
                    id: "0_10",
                    label: "Allow assignee to self verify?",
                    readonly: true,
                    options: [
                        {text: "Yes"},
                        {text: "No"},
                    ],
                    answer: "Yes"
                }
            ]
        }
    ];
    let f1 = [
        {
            item_type: "section",
            label: "Asignee Completion",
            children: [
                {
                    item_type: "input_textarea",
                    id: "1_1",
                    label: "Outcome",
                    hint: "Describe any aspects of note",
                    answer: ""
                },
                {
                    item_type: "input_date",
                    id: "1_2",
                    label: "Completion Date",
                    hint: false,
                    answer: ""
                },
                {
                    item_type: "input_switch",
                    id: "1_3",
                    label: "",
                    options: [
                        {value: false, text: "Mark this action as completed"}
                    ]
                },
            ]
        }
    ];
    let form_text = '';



    let incident = {
        "status": "In Progress",
        "id": '123',
        updated_date: (new Date()).toISOString(),
        "created_by": "Hayden Chambers",
        "created_date": "2022-02-07T17:06:09.111Z",
        "updated_by": "Hayden Chambers",
        "updated_date": (new Date()).toISOString(),//"2022-02-07T17:06:09.111Z"
        "description": "Check fire extinguisher in Block D"
    }

    function save_incident() {
        incident.status = "In Progress";
        incident.id = "485";
    }

    let inspector_details = false;

    $: {
        let daform = f;
        form_text = JSON.stringify(daform, null, 4);
    }
    let censor_pii = false;
    let censor_mode = false;
    let print_mode = false;
    let print_options = ["overview", "detail"]
    let total_pages = [
        {key: "overview", title: "Overview", type: 'tab'},
        {key: "detail", title: "Detail", type: 'tab' },
        {key: "completion", title: "Completion", type: 'review' },
        {key: "attachments", title: "Attachments", type: 'tool' },
        {key: "links", title: "Links", type: 'tool' }
    ];
    
	function censor_it() {

        let censor_span = document.createElement("span");
        censor_span.classList.add('censor_custom');
        let sel = window.getSelection();
        let selection = window.getSelection().getRangeAt(0);
        let selectedText = sel + '';
        let n = selection.extractContents();

        censor_span.innerText = selectedText;
        selection.insertNode(censor_span);
    }
    document.addEventListener('keydown', (e) => {
        if(e.code == 'Enter' && censor_mode) {
            censor_it();
        }
    });

    function logKey(e) {
        
    }
    
    $:vis_pages = total_pages;
    let filtered_pages = [];
    $: {
        //triggers
        let v = vis_pages;
        let t = tab;
        let s = single_page;
        let p = print_mode;


        filtered_pages = vis_pages.map(({key}) => key);
        if(!s && !p) {
            //single page view
            filtered_pages = filtered_pages.filter( (page) => {
                return page == t;
            })
        }

        if(p) {
            //if in print mode only show the ones that selected to print
            filtered_pages = filtered_pages.filter( (page) => {
                return print_options.indexOf(page) >= 0;
            })
        }
        
    }


    function update_payload_text() {
		console.log(form_test, JSON.stringify(f, null, 4));
	}

    function date_format(str) {
        return (new Date(str)).toLocaleString([], {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'});
        
    }

    let show_drawer = false;
    let mask_block = false;
    let mask_visible = false;
    let pullout = false;
    let add_event = false;

    let events = [];
    let event = {
        event_type: false,
        event_subtype: false,
        reportable: -1,
        type_of_person: false,
        person: '',
        parts_of_body: [],
        illness_type: false,
        medical_bool: false,
        losttime_bool: false
    }

    function show_event_drawer() {
        show_drawer = true;
        mask_block = false;
        mask_visible = true;
        setTimeout(() => {
            pullout = true;
        }, 300);
    }
    function hide_event_drawer() {
        mask_block = false;
        mask_visible = false;
        pullout = false;
        setTimeout(() => {
            show_drawer = false;
        }, 1000);
    }


    let tab = "overview";
    export let tabnav = '';
    export let bodyScroll = 0;

    $: {
        let t = tabnav;
        console.log('tabnav change', t)
        if(tabnav !== '') {
            tab = t;

        }
    }
    /*
    function print_mode(bool) {
        dispatch('print', {
            text: bool
        })
    }
    */

    function nav(str) {
        
		dispatch('nav', {
			text: str
		});
	}


    /*
        crappy code to position the sidemenu bar at the right 'tab'
    */
    let hs = [
        {
            "key": "detail",
            "el": false,
            "y": 40 + (incident.id ? 35 : 0)
        },
        {
            "key": "events",
            "el": false,
            "y": 75 + (incident.id ? 35 : 0)
        },
        {
            "key": "attachments",
            "el": false,
            "y": 180 + (incident.id ? 35 : 0)
        },
        {
            "key": "links",
            "el": false,
            "y": 215 + (incident.id ? 35 : 0)
        },
        {
            "key": "overview",
            "el": false,
            "y": 40
        }
    ];
    function single_page_scroll(key) {
        let sel = hs.filter( (h) => { return h.key == key } );
        if(sel && sel.length) {
            let header = sel[0];
            //document.getElementsByTagName('main')[0].scrollTop = sel[0].el.offsetTop - window.innerHeight/2.5;

            let y = sel[0].el.offsetTop - 112;

            document.getElementsByTagName('main')[0].scroll({
                top: y,
                behavior: 'smooth'
            });
        } else {
            console.log('couldnt find ', key);
        }
    }

    let closest = false;
    let closest_el = hs[0];
    $: {
        let s = bodyScroll;
        let t = window.innerHeight/2.5; //target position third way down page
        if(single_page) {
            closest = false;
            let temp = false;
            hs.forEach( (h) => {
                if(h.el) {
                    let delta = Math.abs(s + t - h.el.offsetTop);
                    if(delta < closest || closest === false) {
                        closest = delta;
                        temp = h;

                    }
                }
            });

            if(closest_el !== temp){
                window.location.hash = "ehs/actions/123/" + temp.key;
                closest_el = temp;
            }
        }
    }


    let counter = 0;
    let start_time = (new Date()).getTime();
    let counter_phrase = '';


    function getTimeDifference(sTimeDifference) {
        const yearDifference   = Math.floor(sTimeDifference / 31536000); // 31536000 - Average Seconds in one Year
        const monthDifference  = Math.floor((sTimeDifference % 31536000) / 2592000); // 2592000 - Average Seconds in one Month (30 Days)
        const dayDifference    = Math.floor((sTimeDifference % 2592000) / 86400); // 86400 - Seconds in one Day
        const hourDifference   = Math.floor((sTimeDifference % 86400) / 3600); // 3600 - Seconds in one Hour
        const minuteDifference = Math.floor((sTimeDifference % 3600) / 60); // 60 - Seconds in one Minute
        const secondDifference = Math.floor(sTimeDifference % 60);
        return {
            year   : yearDifference,
            month  : monthDifference,
            day    : dayDifference,
            hour   : hourDifference,
            minute : minuteDifference,
            second : secondDifference
        };
    }
    
    $: {
        let c = counter;
        let timeObject = getTimeDifference(c);
        let time = '';

        if(timeObject.year > 0) {
            time += timeObject.year;
            time += timeObject.year === 1 ? " Year " : " Years ";
        }
        if(timeObject.month > 0) {
            time += timeObject.month;
            time += timeObject.month === 1 ? " Month " : " Months ";
        }
        if(timeObject.day > 0) {
            time += timeObject.day;
            time += timeObject.day === 1 ? " Day " : " Days ";
        }
        if(timeObject.hour > 0) {
            time += timeObject.hour;
            time += timeObject.hour === 1 ? " Hour " : " Hours ";
        }
        if(timeObject.minute > 0) {
            time += timeObject.minute;
            time += timeObject.minute === 1 ? " Minute " : " Minutes ";
        }
        if(timeObject.second > 0) {
            time += timeObject.second;
            time += timeObject.second === 1 ? " Second " : " Seconds ";
        }
        counter_phrase = time;
    }



    let sub = PubSub.subscribe('MATRIX', read_matrix);
    let matrix = false;
    let matrix_holder = false;
    let matrix_drawer = false;
    let matrix_fs = true;
    let matrix_col_selected = -1;
    let matrix_row_selected = -1;
    function select_criteria_y(i,j) {
        matrix_col_selected = i;
        matrix.y_criteria[j].options.forEach( (el) => {
            el.selected = false; //deselect this column
        })
        matrix.y_criteria[j].options[i].selected = true; //select the row in this column
        matrix.y_criteria =  matrix.y_criteria;
    }
    function select_criteria_x(i, j) {
        let currently_selected = matrix.x_criteria[j].options[i].selected;
        matrix.x_criteria[j].options.forEach( (el) => {
            el.selected = false; //deselect this column
        })
        matrix.x_criteria[j].options[i].selected = !currently_selected; //select the row in this column

        //iterate over all columns and find highest row selected
        let highest_row = -1;
        matrix.x_criteria.forEach( (col) => {
            col.options.forEach( (row, i) => {
                if(row.selected && i > highest_row) {
                    highest_row = i;
                }
            })
        })
        matrix_row_selected = highest_row;
    }
    function matrix_pick(i,j) {
        matrix_row_selected = i;
        matrix_col_selected = j;

        matrix.x_criteria.forEach( (col) => {
            col.options.forEach( (row, x) => {
                row.selected = false;
                if(matrix_row_selected == x) {
                    row.selected = true;
                }
               
            })
        })
        matrix.y_criteria.forEach( (col) => {
            col.options.forEach( (row, x) => {
                row.selected = false;
                if(matrix_col_selected == x) {
                    row.selected = true;
                }
               
            })
        })
        matrix.x_criteria = matrix.x_criteria;
        matrix.y_criteria = matrix.y_criteria;

        console.log('done matrix pick', i,j)
    }
    function read_matrix(msg, data) {
        matrix_holder = data
        matrix = data.matrix;
        matrix_drawer = true;
        matrix_col_selected = -1;
        matrix_row_selected = -1;

        matrix.values.forEach( (row, i) => {
            row.forEach( (col, j) => {
                if(col == matrix_holder.answer) {
                    matrix_col_selected = j;
                    matrix_row_selected = i;
                }
            })
        })

    }
    function matrix_cancel() {
        matrix_drawer = false;
    }
    function matrix_save() {
        matrix_holder.answer = matrix.values[matrix_row_selected][matrix_col_selected];
        f = f;
        matrix_drawer = false;
    }

    let audio;

    onMount(() => {
        audio.volume = 0.1;
    });    
</script>
<!-- svelte-ignore a11y-media-has-caption -->
<audio src="./sound/click.mp3" bind:this={audio}></audio>
<div class="row sticky">
    <div class="col12 col-md-6">
        <ul class="breadcrumb">
            <li><a href="#platform"><i class="i-16 i-platform"></i></a></li>
            <li><a href="#ehs">EHS</a></li>
            <li><a href="#ehs/actions">Actions</a></li>
            <li>123</li>
        </ul>
    </div>
    <div class="col12 col-md-6 menu-bar">
        <div class="menu-icons">
            
            {#if single_page}
                <a title="View as tabs" href="/" on:click|preventDefault="{ () => { single_page = false}}" class='i-page-tabs i-24'> </a>
            {:else}
                <a title="View as a single page" href="/" on:click|preventDefault="{ () => { single_page = true}}"  class='i-page-single i-24'> </a>
            {/if}
            <a href="/" class='i-attachment i-24'> </a>
            <a href="/" class='i-printer i-24' on:click|preventDefault="{ () => { print_mode = !print_mode }}"> </a>
        </div>
        <div class="menu-buttons">
            <a href="/" class='btn btn-secondary' on:click|preventDefault="{save_incident}">Save Progress</a>
            <a href="#ehs/actions/submit" class='btn'>Submit</a>
        </div>
    </div>
</div>
<div class="row">
    <div class="sidebarinc col3 d960up-block">
        <div class="side_menu_wrapper" style="position:sticky;top:56px">
            <h1 class="page-title"><i class="i-actions i-32"></i> Action</h1>
            <div class="card">
                <div class="card-body inspector-details-card">
                    {#if inspector_details}
                        <a href="/" on:click|preventDefault="{ () => { inspector_details = false} }" class="i-chevron-up i-24" style="position:absolute;top:8px;right:8px;"> </a>
                    {:else}
                        <a href="/" on:click|preventDefault="{ () => { inspector_details = true} }" class="i-chevron-down i-24" style="position:absolute;top:8px;right:8px;"> </a>
                    {/if}
                    <div class="inspector-details-table" class:inspector_details>
                        <div>
                            <div>Status</div>
                            <div>{incident.status}</div>
                        </div>
                        <div>
                            <div>Creator</div>
                            <div>{incident.created_by}</div>
                        </div>
                        <div>
                            <div>Date created</div>
                            <div>{date_format(incident.created_date)}</div>
                        </div>
                        <div>
                            <div>Date updated</div>
                            <div>{date_format(incident.updated_date)}</div>
                        </div>
                    </div>
                </div>
            </div>
            {#if single_page}
                <h4>Contents</h4>
                <ul class="side_menu single_page">
                    <li><a href="#ehs/actions/123/overview" on:click="{ () => single_page_scroll('overview')}">Overview</a></li>
                    <li><a href="#ehs/actions/123/detail" on:click="{ () => single_page_scroll('detail')}">Details</a></li>
                    <li><a href="#ehs/actions/123/attachments" on:click="{ () => single_page_scroll('attachments')}">Attachments</a></li>
                    <li><a href="#ehs/actions/123/links" on:click="{ () => single_page_scroll('links')}">Links</a></li>
                    <li>Submit</li>
                    <li class="fake-bar active" style="height:{closest_el.y}px"></li>
                </ul>
            {:else}
                <h4>Tabs</h4>
                <ul class="side_menu">
                    <li class:active="{tab == 'overview'}"><a href="#ehs/actions/123/overview">Overview</a></li>
                    <li class:active="{tab == 'detail'}"><a href="#ehs/actions/123/detail"on:mouseenter="{ () => { audio.play();} }">Details</a></li>
                </ul>
                <h4>Review</h4>
                <ul class="side_menu">
                    <li class:active="{tab == 'completion'}"><a href="#ehs/actions/123/completion">Completion</a></li>
                </ul>
                <h4>Tools</h4>
                <ul class="side_menu">
                    <li class:active="{tab == 'attachments'}"><a href="#ehs/actions/123/attachments"on:mouseenter="{ () => { audio.play();}}"  on:click="{ () => nav('ehs/actions/123/attachments')}">Attachments</a></li>
                    <li class:active="{tab == 'links'}"><a href="#ehs/actions/123/links"on:mouseenter="{ () => { audio.play();}}"  on:click="{ () => nav('ehs/actions/123/links')}">Links</a></li>
                </ul>
            {/if}
        </div>
    </div>
    <div class="col12 col-md-9">
        {#if print_mode}
        <div class="card" in:fly="{{ y: -200, duration: 1000 }}" out:fade>
            <div class="card-header">
                Print options
            </div>
            <div class="card-body print-options">
                {#each vis_pages as page}
                    <label><input type="checkbox" value="{page.key}" bind:group={print_options}> {page.title}</label>
                {/each}
                <br>
                <label><input type="checkbox" bind:checked="{censor_pii}"> Censor PII</label>
                <label><input type="checkbox" bind:checked="{censor_mode}"> Custom Censor</label>
                {#if censor_mode}
                    select text and hit 'Return'
                {/if}
                <hr class='small'>
                <div class='btn' on:click={ () => { window.print()}}>Print</div>
            </div>
        </div>
        {/if}
        {#if filtered_pages.length == 0}
            {#if print_mode}
                <h1>Printing nothing saves trees :)</h1>
            {:else}
                <h1>Nothing to see here</h1>
            {/if}
        {/if}
        {#if filtered_pages.indexOf('overview') >= 0}
            <h1 class="page-title">Overview</h1>
            <div class="overview_grid">
                
                <div class="card overview_1">
                    <div class="card-header">Record ID</div>
                    <div class="card-body">
                        <p>123</p>
                    </div>
                </div>
                <div class="card overview_2">
                    <div class="card-header">Status</div>
                    <div class="card-body">
                        <p>In Progress</p>
                    </div>
                </div>
                <div class="card overview_3">
                    <div class="card-body">
                        <table class="overview_combined">
                            <tr>
                                <td><i class= "i-actions i-20"></i> <b>Action priority</b></td>
                                <td>P4</td>
                            </tr>
                            <tr>
                                <td><i class="i-location i-20"></i> <b>Location</b></td>
                                <td>Warehouse</td>
                            </tr>
                            <tr>
                                <td><i class="i-time i-20"></i> <b>Last update</b></td>
                                <td>{date_format(incident.updated_date)}</td>
                            </tr>
                        </table>
                        <p></p>

                    </div>
                </div>
                <div class="card overview_4">
                    <div class="card-header">Elapsed time</div>
                    <div class="card-body">
                        <p>1 day, 3 hours</p>
                    </div>
                </div>
                <div class="card overview_5">
                    <div class="card-header">Channel</div>
                    <div class="card-body">
                        <p><i class="i-desktop i-20"></i> Desktop</p>
                    </div>
                </div>
                <div class="card overview_6">
                    <div class="card-header">Assigned by</div>
                    <div class="card-body">
                        <p class="pii" class:censor_pii>A Einstein</p>
                    </div>
                </div>
                <div class="card overview_10">
                    <div class="card-header">Title</div>
                    <div class="card-body">
                        <p>{incident.description}</p>
                    </div>
                </div>
            </div>
            <a href="#ehs/actions/123/completion" class="btn" style='margin-top:16px'>Complete</a>
        {/if}
        {#if filtered_pages.indexOf('detail') >= 0}
            <h1 bind:this="{hs[0].el}" class="page-title">Details</h1>
            <Form {f} {channel}></Form>
        {/if}
        {#if filtered_pages.indexOf('completion') >= 0}
            <h1 bind:this="{hs[0].el}" class="page-title">Completion</h1>
            <Form f={f1} {channel}></Form>
        {/if}

        
        {#if filtered_pages.indexOf('attachments') >= 0}
            <div>
                <h1 bind:this="{hs[4].el}" class="page-title">Attachments</h1>
            </div>
            <div class="card">
                <div class="card-body blank_state">
                    <img src="./images/illustrations/attachments.png" alt="attachments illustration">
                    <h5>Add an attachment</h5>
                    <p>To add photos or video drag and drop here or select files.</p>
                </div>
            </div>
            <div class="text-right">
                {#if !single_page}
                <a class="btn btn-secondary btn-left" href="#ehs/actions/123/detail" on:click="{ () => nav('ehs/actions/123/detail')}">Back</a>
                {/if}

                <a href="/" on:click|preventDefault="{show_event_drawer}" class="btn btn-secondary">Select files</a>
                
                {#if !single_page}
                <span class="btn disabled">Next</span>
                {/if}
            </div>

        {/if}

        
        {#if filtered_pages.indexOf('links') >= 0}
            <div>
                <h1 bind:this="{hs[5].el}" class="page-title">Links & Actions</h1>
            </div>
            <div class="card">
                <div class="card-body blank_state">
                    <img src="./images/illustrations/links.png" alt="links illustration">
                    <h5>Take action, prevent further incidents.</h5>
                    <p>You can assign multiple corrective actions. We can send reminders and even escalate if they aren't completed on time.</p>
                </div>
            </div>
            <div class="text-right">
                {#if !single_page}
                <a class="btn btn-secondary btn-left" href="#ehs/actions/123/detail" on:click="{ () => nav('ehs/actions/123/detail')}">Back</a>
                {/if}

                <a href="/" on:click|preventDefault="{show_event_drawer}" class="btn btn-secondary">Search record</a>
                <a href="/" on:click|preventDefault="{show_event_drawer}" class="btn btn-secondary">Add action</a>
                
                {#if !single_page}
                <span class="btn disabled">Next</span>
                {/if}
            </div>

        {/if}



    </div>
</div>

{#if show_drawer}
    <div class="drawer">
        <div class="mask" class:visible="{mask_visible}" class:block="{mask_block}"></div>
        <div class="pullout" class:in="{pullout}">
            <div class="pullout-head">
                <h2>Add event <span class="close" on:click="{hide_event_drawer}"><i class="i-close i-24"></i></span></h2>
            </div>
            <div class="pullout-body form">

                <div class="form-item">
                    <label>Event type</label>
                    <select bind:value="{event.event_type}" class="form-control">
                        <option>Accident</option>
                        <option>Occupational Illness</option>
                        <option>Environmental</option>
                        <option>Incident</option>
                        <option>Security</option>
                        <option>Process Safety</option>
                        <option>Near Miss</option>
                    </select>
                </div>
                <div class="form-item">
                    <label>Event sub-type</label>
                    <select class="form-control">
                        <option>Riddor</option>
                    </select>
                </div>
                <div class="form-item">
                    <label>Legally reportable?</label>
                    
                    <div class="form-control radio inline">
                        <input type="radio"> Yes
                    </div>
                    <div class="form-control radio inline">
                        <input type="radio"> No
                    </div>
                </div>
                <div class="form-item">
                    <label>Type of person affected</label>
                    <select class="form-control">
                        <option>Employee</option>
                    </select>
                </div>
                <div class="form-item">
                    <label>Person</label>
                    <input bind:value="{event.person}" type="text" class="form-control" />
                </div>
                <div class="form-item">
                    <label>Parts of the body affected</label>
                    <input type="text" class="form-control" />
                </div>
                <div class="form-item">
                    <label>Illness type</label>
                    <input type="text" class="form-control" />
                </div>
                <div class="form-item">
                    <label class="switch">
                        <input type="checkbox" bind:checked={event.medical_bool}>
                        <span class="slider"></span>
                    </label>
                    Was the person given medical care?
                </div>
                <div class="form-item">
                    <label class="switch">
                        <input type="checkbox" bind:checked={event.losttime_bool}>
                        <span class="slider"></span>
                    </label>
                    Is there Lost Time involved?
                </div>
                <div class="form-item">
                    <span class="btn">Add event</span>
                    <span class="btn btn-secondary" on:click="{hide_event_drawer}">Cancel</span>
                </div>
            </div>
        </div>
    </div>
{/if}

<!-- svelte-ignore a11y-no-onchange -->
<!-- svelte-ignore a11y-label-has-associated-control -->
<Pullout fs={matrix_fs} canfs={true} show_drawer={matrix_drawer} title="Pre controls risk rating" on:close={matrix_cancel}>
    <div slot="nofs">
        {#if matrix}

            {#each matrix.y_criteria as ycrit, j}
                <div class="form-item">
                    <label>{ycrit.label}</label>
                    <select class="form-control" on:change="{ (ev) => { select_criteria_y(parseInt(ev.target.value, 8), j)}}">
                        <option value=-1>Select one...</option>
                        {#each ycrit.options as option, i}
                            <option value={i} selected={option.selected}>{option.label}</option>
                        {/each}
                    </select>
                </div>
            {/each}
            {#each matrix.x_criteria as xcrit, j}
                <div class="form-item">
                    <label>{xcrit.label}</label>
                    <select class="form-control" on:change="{ (ev) => { select_criteria_x(parseInt(ev.target.value, 8), j)}}">
                        <option value=-1>Select one...</option>
                        {#each xcrit.options as option, i}
                            <option value={i} selected={option.selected}>{option.label}</option>
                        {/each}
                    </select>
                </div>
            {/each}
            <div class="form-item">
                <div class="matrix_cell" 
                    class:ok={matrix_col_selected >= 0 && matrix_row_selected >= 0 && matrix.values[matrix_row_selected][matrix_col_selected].color == 'ok'} 
                    class:warning={matrix_col_selected >= 0 && matrix_row_selected >= 0 && matrix.values[matrix_row_selected][matrix_col_selected].color == 'warning'} 
                    class:critical={matrix_col_selected >= 0 && matrix_row_selected >= 0 && matrix.values[matrix_row_selected][matrix_col_selected].color == 'critical'} 
                    >{(matrix_col_selected < 0 || matrix_row_selected < 0 ? '': matrix.values[matrix_row_selected][matrix_col_selected].text)}</div>
            </div>
            <div class="form-item">
                <span class="btn" on:click="{matrix_save}" class:disabled="{matrix_row_selected < 0 || matrix_col_selected < 0}">Save</span>
                <span class="btn btn-secondary" on:click="{matrix_cancel}">Cancel</span>
            </div>
        {/if}
    </div>
    <div slot="fs">
        {#if matrix}
            <p style="width:100%;max-width:480px">
                To choose the appropriate severity first choose the matrix row by scanning down each description and finding the lowest one appropriate to this event. Then choose the matrix column by scanning across from that row choosing the column with the number of people at risk in this event.
            </p>
            <table class="matrix_table" style="width:{window.innerWidth-64}px">
                <tbody>
                    <tr>
                        <td colspan="{matrix.x_criteria.length}"><h4>Description</h4></td>
                        <td width="364px"><h4>{matrix.y_criteria[0].label}</h4></td>
                    </tr>
                    <tr>
                        {#each matrix.x_criteria as xcrit}
                            <td style="width: calc((100% - 364px) / 4)">
                                <h4>{xcrit.label}</h4>
                            </td>
                        {/each}
                        <td>
                            {#each matrix.y_criteria[0].options as {label, selected}, i}
                                <div class="matrix_cell" class:selected="{matrix.y_criteria[0].options[i].selected}" on:click="{ () => { select_criteria_y(i, 0)}}">{label}</div>
                            {/each}
                        </td>
                    </tr>
                    {#each matrix.x_criteria[0].options as row, i}

                        <tr>
                            {#each matrix.x_criteria as col, j}
                                <td class="criteria" class:selected="{matrix.x_criteria[j].options[i].selected}" on:click="{ () => { select_criteria_x(i, j)}}">{matrix.x_criteria[j].options[i].label}</td>
                            {/each}
                            <td>
                                {#each matrix.values[i] as {text, color}, j}
                                    <div class="matrix_cell" class:highlight="{i==matrix_row_selected && j==matrix_col_selected}" class:ok={color == 'ok'} class:warning={color == 'warning'} class:critical={color == 'critical'} on:click="{ () => { matrix_pick(i,j)}}">{text}</div>
                                {/each}
                            </td>
                        </tr>
                    {/each}
                    <tr>
                        <td colspan="{matrix.x_criteria.length}"></td>
                        <td>
                            <span class="btn" on:click="{matrix_save}" class:disabled="{matrix_row_selected < 0 || matrix_col_selected < 0}">Save</span>
                            <span class="btn btn-secondary" on:click="{matrix_cancel}">Cancel</span>
                        </td>
                    </tr>
                </tbody>
            </table>

        {/if}
    </div>
</Pullout>

<style>
    .matrix_table {
        width:100%;
        padding:0;
        border-spacing: 8px;
    }
    .matrix_table td {
        vertical-align:top;
        
    }
    .matrix_table h4 {
        line-height:64px;
        margin: 0 4px;
    }
    .matrix_table .criteria {
        font-size: 14px;
        background: #f0f0f0;
        padding: 4px;
        cursor:pointer;
        border-radius:8px;
    }
    .matrix_table .criteria:hover {
        background: #ece9f0;
    }
    .matrix_table td.selected {
        background: #e3e1f0; /*eo-primary-50?*/
    }
    
    .matrix_cell {
        background: #f0f0f0;
        display:inline-block;
        width:auto;
        min-width:64px;
        height:64px;
        line-height:64px;
        text-align:center;
        font-weight:900;
        border-radius:8px;
        margin:0 4px;
        border:1px solid transparent;
        color: var(--black);
        cursor:pointer;
    }
    .matrix_cell.selected {
        background: #e3e1eb; /*eo-primary-50?*/
    }
    .matrix_cell.highlight {
        box-shadow: 0 0 0 4px var(--eo-primary-500);
    }
    .matrix_cell.ok {
        background: var(--eo-secondary-500);
        border:1px solid var(--eo-secondary-500);
    }
    .matrix_cell.warning {
        background: var(--eo-warning-500);
        border:1px solid var(--eo-warning-500);
    }
    .matrix_cell.critical {
        background: var(--eo-critical-500);
        border:1px solid var(--eo-critical-500);
    }
    .inspector-details-card{
        overflow:auto;
        position: relative;
    } 
    
    .inspector-details-table div {
        white-space: nowrap;
    }
    
    .inspector-details-table > div {
        display:flex;
        flex-direction: row;
        align-items: center;
        height:0px;
        overflow: hidden;
        transition: all 0.3s linear;
    }
    
    .inspector-details-table > div:first-child {
        height:24px;
    }
    .inspector-details-table > div > div:first-child {
        width:0;
        overflow:hidden;
        transition: all 0.3s linear;
    }
    .inspector-details-table {
        margin-top: 0px;
        transition: all 0.3s linear;
        font-size:14px;
    }
    .inspector-details-table.inspector_details {
        margin-top: 0px;
    }
    .inspector-details-table.inspector_details > div{
       height:24px;
    }
    .inspector-details-table.inspector_details > div > div:first-child {
        width:50%;
    }


.menu-bar {
       display:flex;
       flex-direction:row;
    }
    .menu-icons {
        flex:1;
        text-align:left;
        padding: 6px 8px 0 8px;
    }
    .menu-icons a {
        margin: 0 8px;
    }
    .menu-buttons {
        vertical-align: middle;
    }
    .menu-buttons .btn{
        margin-right:0;
        margin-left:8px;
    }
    @media (min-width: 960px) {
        .menu-icons {
            text-align:right
        }
    }
    .radio {
        display:block;
    }
    .radio.inline {
        width: 222px;
        float:left;
        padding: 8px 16px;
    }
    .radio.inline:last-child {
        margin-left:16px;
    }

    .card {
        margin-bottom:16px;
    }
    
    .card h4 {
        margin-bottom: 8px;
    }
    .side_menu {
        margin:0;
        padding:0;
        position:relative;
    }
    .side_menu li {
        margin:0 0 8px 0;
        padding:4px 0 4px 20px;
        height:auto;
        position:relative;
    }
    .side_menu li a {
        display:block;
        text-decoration:none;
        cursor: pointer;
    }
    .side_menu li:before {
        display:block;
        content:'';
        position:absolute;
        left:0;
        top:0;
        border-radius:2px;
        width: 4px;
        height:100%;
        background: var(--eo-border-reduced);
        transition: height 0.3s linear, top 0.3s linear;
    }
    .side_menu li:hover:before {
        top:10%;
        height:80%;
        background: var(--eo-border);
    }
    .side_menu li.active:before {
        background: var(--eo-secondary-500);
    }

    .side_menu.single_page .fake-bar {
        display:block;
        position:absolute;
        left:0;
        top:-5px;
        border-radius:2px;
        width: 4px;
        padding:0;
        height:40px;
        background: var(--eo-secondary-500);
        z-index:100;
        transition: height 0.3s linear;
    }
    .side_menu.single_page li:before {
        top:-5px;
        height: calc(100% + 10px);
    }
    .side_menu.single_page li.active:before {
        top:0px;
        height: 100%;
    }


    .blank_state {
        padding:48px;
        text-align:center;
    }
    .blank_state img {
        width:120px;
    }
    .blank_state h5 {
        font-size:21px;
        margin:8px 0;
        font-weight:300;
    }






    /*quick hack for overview layout*/
.overview_1 { grid-area: cell1; background: var(--black); color:#fff; }
.overview_2 { grid-area: cell2; background: #007CFF; color:#fff;  }
.overview_3 { grid-area: cell3; }
.overview_4 { grid-area: cell4; }
.overview_5 { grid-area: cell5; }
.overview_6 { grid-area: cell6; }
.overview_10 { grid-area: cell10; }

.overview_grid {
  display: grid;
  grid-template-areas:
    'cell1'
    'cell2'
    'cell3'
    'cell4'
    'cell5'
    'cell6'
    'cell10';
  grid-gap: 16px;
}
@media (min-width: 600px) {
    .overview_grid {
  display: grid;
  grid-template-areas:
    'cell1 cell2'
    'cell3 cell3'
    'cell4 cell5'
    'cell6'
    'cell10 cell10';
  grid-gap: 16px;
}
    }
@media (min-width: 960px) {
    .overview_grid {
  display: grid;
  grid-template-areas:
    'cell1 cell3 cell3'
    'cell2 cell3 cell3'
    'cell4 cell5 cell6'
    'cell10 cell10 cell10';
  grid-gap: 16px;
}
    }
.overview_combined {
    margin-top:16px;
}
.overview_combined td {
    padding-right:16px;
    padding-bottom:16px;
}
.overview_grid .card {
    margin:0;
}
.overview_grid .card p {
    margin-bottom:8px;
}

.print-options label {
    margin-right:16px;
}
.censor_pii {
    filter:blur(5px)
}
div :global(.censor_custom) {
    filter:blur(5px)
}
</style>
	
        