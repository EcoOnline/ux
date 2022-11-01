<script>
    import { createEventDispatcher } from 'svelte';
    import PubSub from 'pubsub-js'

    import Pullout from './components/Pullout.svelte';
    import Modal from './components/Modal.svelte';

    import Form from './components/form/Form.svelte';
    import RecordID from "./components/table/RecordID.svelte";
    import Status from "./components/table/Status.svelte";
    import Channel from "./components/table/Channel.svelte";
    import DateComp from "./components/table/Date.svelte";
    import BooleanComp from "./components/table/Boolean.svelte";

    let filter_modal = false;
   

	let components = {
		"title": RecordID,
		"revision": DateComp,
		"next_revision": DateComp,
		"published": BooleanComp
	}
    
    const dispatch = createEventDispatcher();


    let tab = "overview";
    export let tabnav = '';

    $: {
        let t = tabnav;
        if(tabnav !== '') {
            tab = t;

        }
    }
    
    let columns = [
        {
            "key": "section",
            "value": "Common Fields",
            "children": [
                {
                    "key": "title",
                    "value": "Title",
                    "selectable": false,
                    "selected": true,
                    "pii": false,
                    "sortable": true,
                    "sorted": "desc"
                },
                {
                    "key": "product",
                    "value": "Product",
                    "selectable": true,
                    "selected": true,
                    "pii": false,
                    "sortable": true
                },
                {
                    "key": "locations",
                    "value": "Locations",
                    "selectable": true,
                    "selected": true,
                    "pii": false,
                    "sortable": true
                },
                {
                    "key": "language",
                    "value": "Language",
                    "selectable": true,
                    "selected": true,
                    "pii": false,
                    "sortable": true
                },
                {
                    "key": "general",
                    "value": "General",
                    "selectable": true,
                    "selected": false,
                    "pii": false,
                    "sortable": true
                },
                {
                    "key": "health",
                    "value": "Health",
                    "selectable": true,
                    "selected": true,
                    "pii": false,
                    "sortable": true
                },
                {
                    "key": "fire",
                    "value": "Fire",
                    "selectable": true,
                    "selected": true,
                    "pii": false,
                    "sortable": true
                },
                {
                    "key": "environment",
                    "value": "Environment",
                    "selectable": true,
                    "selected": true,
                    "pii": false,
                    "sortable": true
                },
                {
                    "key": "revision",
                    "value": "Revised",
                    "selectable": true,
                    "selected": true,
                    "pii": false,
                    "sortable": true,
                    "sortable_type": "date"
                },
                {
                    "key": "next_revision",
                    "value": "Next revision",
                    "selectable": true,
                    "selected": true,
                    "pii": false,
                    "sortable": true,
                    "sortable_type": "date"
                },
                {
                    "key": "published",
                    "value": "Published",
                    "selectable": true,
                    "selected": true,
                    "pii": false,
                    "sortable": false
                },
                {
                    "key": "actions",
                    "value": "Actions",
                    "selectable": false,
                    "selected": true,
                    "pii": false,
                    "sortable": false
                }
            ]
        }
    ];
    let edit_columns = [];
    let table_settings_form = [];
    let channel = "TABLE";
    let sub = PubSub.subscribe(channel, read_answer);

    function read_answer(msg, data) {
        if(data.id == "table_settings_multi") { 
            edit_columns = data.options;
        }
    }
    function save_table_settings() {
        columns = edit_columns;
        table_settings_form[0].options = edit_columns;
        table_cancel();
        /*
        table_settings_form.options = columns;
        table_settings_form = table_settings_form;
        */
    }

    let selected_columns = [];

    $: {
        let temp_sel = {};
        let c = columns;
        c.forEach( (group) => {
            group.children.forEach( (col) => {
                if(col.selected == true) {
                    temp_sel[col.key] = col;
                }
            });
        })
        selected_columns = temp_sel;
    }
    
    let table_data = [
        { 
            "title": "Acetone",
            "product": "CH3COCH3",
            "locations": ["Chemical storage"],
            "language": "en",
            "general": "6/15",
            "health": "4/5",
            "fire": "1/5",
            "environment": "1/5",
            "revision": "2022-04-22T13:08:10.430Z",
            "next_revision": "2022-11-22T13:08:10.430Z",
            "published": true,
            "actions": []
        },
        { 
            "title": "Acetone",
            "product": "CH3COCH3",
            "locations": ["Workshop", "Office"],
            "language": "no",
            "general": "9/15",
            "health": "4/5",
            "fire": "2/5",
            "environment": "3/5",
            "revision": "2022-04-22T13:08:10.430Z",
            "next_revision": "2022-11-22T13:08:10.430Z",
            "published": true,
            "actions": []
        }
    ];
    
    function sort_table(th) {

        if(!th.sortable) {
            console.log('cant sort this column');
            return false;
        }
        
        let new_sort_dir = th.sorted == 'desc' ? 'asc' : 'desc';
        let new_sort_key = th.key;
        //remove old key
        let c = selected_columns[sort_key];
        if(c) {
            delete c.sorted;
        }
        //update new
        th.sorted = new_sort_dir;
        sort_dir = new_sort_dir;
        sort_key = new_sort_key;
        columns = columns;
    }

    let sort_key = 'record_id';
    let sort_dir = 'desc';

    $:table_data_sorted = table_data.sort((a, b) => {
        
        let A = (a[sort_key] + '').toLowerCase();
        let B = (b[sort_key] + '').toLowerCase();

        if(sort_dir == 'desc') {
            return A<B ? 1 : -1;
        } else {
            return A>B ? 1 : -1;
        }

       

    })

    let table_drawer = false;
    
    $: {
        let s = table_drawer;
        if(s) {
            table_settings_form = [
                {
                    item_type: "input_multi",
                    id: "table_settings_multi",
                    label: "Columns to show",
                    hint: "All users will see these changes. Any that contain personally identifiable information will be redacted if the user doesn't have permission.",
                    max_warning: {
                        value: 10,
                        message: 'If you have too many columns this page may become unresponsive for all users. You can always pin this table to your own dashboard to customize further.'
                    },
                    options: JSON.parse(JSON.stringify(columns)),
                    answer: ""
                }
            ];
        }
    }
    function table_cancel() {
        table_drawer = false;
    }



    

    function nav(str) {
		dispatch('nav', {
			text: str
		});
	}

    let pin_title = 'Pin module';
    let pin_drawer = false;
    let pin_form = [
        {
            item_type: "input_select",
            id: "pin_module_dashboard",
            label: "Select a dashboard to pin it to",
            options: [
                { "value": 1, "text": "Dashboard 1"},
                { "value": 2, "text": "Dashboard 2"},
                { "value": 3, "text": "Dashboard 3"},
                { "value": 4, "text": "Dashboard 4"},
                { "value": 5, "text": "Dashboard 5"}
            ],
            answer: ""
        },
        {
            item_type: "input_checkbox",
            id: "pin_module_navigate",
            options: [
                { "value": false, "text": "Open the dashboard after you pin it?"}
            ],
            answer: ""
        }
    ]
    function pin_module(title) {
        pin_title = "Pin " + title;
        pin_drawer = true;
    }
    function pin_save() {
        pin_drawer = false;
        if(pin_form[1].options[0].value) {
            alert('Pinned');
            window.location.hash = "#ehs/dashboards";
        } else {
            alert('Pinned')
        }
    }
    function pin_cancel() {
        pin_drawer = false;
    }




    let table_filter_form = [
        {
            item_type: "input_filters",
            id: "0_1",
            label: "Only show rows where:",
            options: [
                {value: '', text: "Select one", type: null},
                {value: 'channel', text: "Channel", type: 'channel_select'},
                {value: 'date_created', text: "Date created on", type: 'date'},
                {value: 'creator', text: "Creator", type: 'text'}
            ],
            answer: ''
        }
    ];


</script>

<div class="row sticky">
    <div class="col12 col-sm-5">
        <ul class="breadcrumb">
            <li><a href="#home"><i class="i-16 i-platform"></i></a></li>
            <li><a href="#cm">Chemical Manager</a></li>
            <li>Risk Assessments</li>
        </ul>
    </div>
    <div class="col12 col-sm-7 text-right">
        <a title="New Incident" href="#ehs/incidents/incidents_new" on:click="{ () => {nav('incidents_new')}}" class='btn'>New</a>
        
    </div>
</div>


<h1 class="page-title"><i class="i-risk-assessment i-32"></i>Risk Assessments</h1>


{#if tab == 'overview'}
    
    <div class="row">
        <div class="col12">
            <h4 style="">All Risk Assessments
                <a href="/" class="i-pin i-20 btn-right" on:click|preventDefault="{ () => { pin_module('Latest Events')}}"> </a>
                <a href="/" class="i-settings i-20 btn-right"  on:click|preventDefault="{ () => { table_drawer=true;}}"> </a>
                <!--<a href="/" class="i-filter i-20 btn-right" on:click|preventDefault="{ () => { filter_modal=true; }}"> </a>-->
            </h4>
            <div class="sticky-wrapper">
                <table class="table">
                    <thead>
                        <tr>
                            {#each Object.entries(selected_columns) as [k, th]}
                                <th on:click="{ () => { sort_table(th)}}"class:sortable="{th.sortable}" class:asc="{th.sorted == 'asc'}" class:desc="{th.sorted == 'desc'}">{th.value}</th>
                            {/each}
                        </tr>
                    </thead>
                    <tbody>
                        {#each table_data_sorted as row}
                            <tr>
                                {#each Object.entries(selected_columns) as [k, th]}
                                    <td>
                                        {#if components[th.key]}
                                            <svelte:component this={components[th.key]} obj={row[th.key]} />
                                        {:else}
                                            {row[th.key]}
                                        {/if}
                                    </td>
                                {/each}
                            </tr>
                        {/each}
                    </tbody>
                </table>
                <div class="pagination-wrapper"><div class="pagination"> </div></div>
            </div>
        </div>
        
    </div>
{/if}


<Pullout show_drawer={table_drawer} title="Table settings" on:close={table_cancel}>
    <Form f={table_settings_form} {channel}></Form>
    <div class="form-item">
        <span class="btn" on:click="{save_table_settings}">Save</span>
        <span class="btn btn-secondary" on:click="{table_cancel}">Cancel</span>
    </div>
</Pullout>

<Pullout show_drawer={pin_drawer} title={pin_title} on:close={pin_cancel}>
    <Form f={pin_form}></Form>
    <span class="btn" on:click="{pin_save}">Pin</span>
    <!--<span class="btn btn-secondary" on:click="{pin_cancel}">Pin and Open Dashboard</span>-->
    <span class="btn btn-secondary" on:click="{pin_cancel}">Cancel</span>
</Pullout>

<Modal show_modal={filter_modal} title={'Filter Table'}>
    <Form f={table_filter_form}></Form>
</Modal>

<style>
    .sticky-wrapper {
        box-shadow:0 6px 10px rgba(186, 191, 195, 0.2);
    }


    .demo_graph .axis {
        fill: none;
        stroke-linecap:butt;
        stroke-linejoin: round;
        stroke: var(--eo-border);
        stroke-width:1;
        stroke-opacity:1;
    }
    .demo_graph .grid_lines {
        fill: none;
        stroke-linecap:butt;
        stroke-linejoin: round;
        stroke: var(--eo-border-reduced);
        stroke-width:1;
        stroke-opacity:1;
    }
    .demo_graph text {
        font-size:10px;
    }
    .demo_graph rect { 
        opacity:0.9;
        transition: opacity 0.5s linear;
    }
    .demo_graph .leg1 { fill: #404387; }
    .demo_graph .leg2 { fill: #29788E; }
    .demo_graph .leg3 { fill: #22A784; }
    .demo_graph .leg4 { fill: #79D151; }
    .demo_graph .leg5 { fill: #FDE724; }

    .demo_graph rect:hover { cursor:pointer;opacity:1 ! important }
    .demo_graph:hover rect {opacity:0.5}



</style>
	
        