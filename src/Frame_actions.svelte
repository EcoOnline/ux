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

    let filter_modal = false;
   

	let components = {
		"record_id": RecordID,
		"status": Status,
		"channel": Channel,
		"created_date": DateComp
	}
    
    const dispatch = createEventDispatcher();


    let tab = "overview";
    export let tabnav = '';

    $: {
        let t = tabnav;
        if(tabnav !== '') {

            if(t == 'submit') {

                t = 'overview';
                table_data[0].status = 'awaiting_verification';
                window.location.hash = '#ehs/actions';
            }
            tab = t;

        }
    }
   
    let columns = [
        {
            "key": "section",
            "value": "Common Fields",
            "children": [
                {
                    "key": "record_id",
                    "value": "Record ID",
                    "selectable": false,
                    "selected": true,
                    "pii": false,
                    "sortable": true,
                    "sorted": "desc"
                },
                
                {
                    "key": "created_date",
                    "value": "Date created on",
                    "selectable": true,
                    "selected": true,
                    "pii": false,
                    "sortable": true,
                    "sortable_type": "date"
                },
                {
                    "key": "created_by",
                    "value": "Creator",
                    "selectable": true,
                    "selected": true,
                    "pii": true,
                    "sortable": true
                },
                {
                    "key": "updated_date",
                    "value": "Date updated on",
                    "selectable": true,
                    "selected": false,
                    "pii": false,
                    "sortable": true,
                    "sortable_type": "date"
                },
                {
                    "key": "updated_by",
                    "value": "Updated by",
                    "selectable": true,
                    "selected": false,
                    "pii": true,
                    "sortable": true
                },
                {
                    "key": "status",
                    "value": "Status",
                    "selectable": true,
                    "selected": true,
                    "pii": false,
                    "sortable": true
                },
                {
                    "key": "group",
                    "value": "Group",
                    "selectable": true,
                    "selected": false,
                    "pii": false,
                    "sortable": true
                },
                {
                    "key": "division",
                    "value": "Division",
                    "selectable": true,
                    "selected": false,
                    "pii": false,
                    "sortable": true
                },
                {
                    "key": "sector",
                    "value": "Sector",
                    "selectable": true,
                    "selected": false,
                    "pii": false,
                    "sortable": true
                }
            ]
        },
        {
            "key": "section",
            "value": "Report Event",
            "children": [
                {
                    "key": "site",
                    "value": "Site",
                    "selectable": true,
                    "selected": false,
                    "pii": false
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
            "created_date": "2022-01-22T13:08:10.430Z",
            "created_by": "Mike Wazowski",
            "updated_date": "2022-01-24T3:48:19.430Z",
            "updated_by": "Mike Wazowski",
            "group": "Ireland",
            "division": "Cork",
            "sector": "Plumbing",
            "record_id": 123,
            "linked_record_id": false,
            "priority": "P4",
            "date_time": "2022-01-24T03:48:19.430Z",
            "time_relative": "9hr 42min",
            "location": "Main Office",
            "custom_field_shift": "Yellow Shift",
            "status": "in_progress"
        },
        { 
            "created_date": "2022-01-22T03:48:19.430Z",
            "created_by": "James P Sullivan",
            "updated_date": "2022-01-24T3:48:19.430Z",
            "updated_by": "Fungus",
            "group": "Ireland",
            "division": "Cork",
            "sector": "Plumbing",
            "record_id": 122,
            "linked_record_id": false,
            "priority": "P4",
            "date_time": "2022-01-24T03:48:19.430Z",
            "time_relative": "9hr 42min",
            "location": "Main Office",
            "custom_field_shift": "Yellow Shift",
            "status": "in_progress"
        }
    ]
    
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
            <li><a href="#ehs">EHS</a></li>
            <li>Actions</li>
        </ul>
    </div>
    <div class="col12 col-sm-7 text-right">
        <a title="New Action" href="#ehs/incidents/action_new" on:click|preventDefault="{ () => { return false; }}" class='btn'>New</a>
        
    </div>
</div>


<h1 class="page-title"><i class="i-actions i-32"></i>Actions</h1>


{#if tab == 'overview'}
    <div class="row">
        <div class="col12 col-md-6">
            <div class="row">
                <div class="col6">
                    <div class="card card-31">
                        <div class="card-header">Open Actions<a href="/" class="i-pin i-20 btn-right" on:click|preventDefault="{ () => { pin_module('Open Events')}}"> </a></div>
                        <div class="card-body">
                            <div class="big-num">42</div>
                        </div>
                    </div>
                </div>
                <div class="col6">
                    <div class="card card-31">
                        <div class="card-header">Awaiting Verification<a href="/" class="i-pin i-20 btn-right" on:click|preventDefault="{ () => { pin_module('Awaiting investigation')}}"> </a></div>
                        <div class="card-body">
                            <div class="big-num minor">7</div>
                        </div>
                    </div>
                </div>
                <div class="col6">
                    <div class="card card-31">
                        <div class="card-header">Awaiting Signoff<a href="/" class="i-pin i-20 btn-right" on:click|preventDefault="{ () => { pin_module('Awaiting Signoff')}}"> </a></div>
                        <div class="card-body">
                            <div class="big-num minor">3</div>
                        </div>
                    </div>
                </div>
                <div class="col6">
                    <div class="card card-31">
                        <div class="card-header">Open High Priority<a href="/" class="i-pin i-20 btn-right" on:click|preventDefault="{ () => { pin_module('High Potential Severity')}}"> </a></div>
                        <div class="card-body">
                            <div class="big-num critical">1</div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
        <div class="col12 col-md-6">
            <div class="card card-32">
                <div class="card-header">Actions by Priority<a href="/" class="i-pin i-20 btn-right" on:click|preventDefault="{ () => { pin_module('Events by Type')}}"> </a></div>
                <div class="card-body">
                    <svg xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink" version="1.1"  class="demo_graph" viewBox="0 0 428 203" width="90%"  display="block">
                        
                        <!-- horizontal grid lines -->
                        <path class="grid_lines" d="M 35 162 L 407 162 M 35 138 L 407 138 M 35 114 L 407 114 M 35 91 L 407 91 M 35 67 L 407 67 M 35 43 L 407 43 M 35 19 L 407 19"></path>
                        
                        <rect class="leg1" x=39 y=150 width=29 height=12 />
                        <rect class="leg1" x=76 y=138 width=29 height=24 />
                        <rect class="leg1" x=225 y=150 width=29 height=12 />
                        <rect class="leg1" x=262 y=150 width=29 height=12 />
                        <rect class="leg1" x=299 y=150 width=29 height=12 />
                        <rect class="leg1" x=374 y=126 width=29 height=36 />


                        <rect class="leg2" x=39 y=138 width=29 height=12 />
                        <rect class="leg2" x=76 y=114 width=29 height=24 />
                        <rect class="leg2" x=151 y=150 width=29 height=12 />
                        <rect class="leg2" x=225 y=138 width=29 height=12 />
                        <rect class="leg2" x=262 y=126 width=29 height=24 />
                        <rect class="leg2" x=374 y=114 width=29 height=12 />
                                        
                        
                        <rect class="leg3" x=76 y=55 width=29 height=60 />
                        <rect class="leg3" x=113 y=138 width=29 height=24 />
                        <rect class="leg3" x=188 y=138 width=29 height=24 />
                        
                        <rect class="leg4" x=262 y=114 width=29 height=12 />
                        <rect class="leg4" x=374 y=102 width=29 height=12 />
                                       
                        <rect class="leg5" x=76 y=31 width=29 height=24 />
                                        
                        <!-- X axis with ticks -->
                        <path class="axis" d="M 34 162 L 408 162 M 35 162 L 35 167 M 72 162 L 72 167 M 109 162 L 109 167 M 147 162 L 147 167 M 184 162 L 184 167 M 221 162 L 221 167 M 258 162 L 258 167 M 295 162 L 295 167 M 333 162 L 333 167 M 370 162 L 370 167 M 407 162 L 407 167" ></path>
                        <!-- Y axis with ticks -->
                        <path class="axis" d="M 35 162 L 35 19 M 35 162 L 30 162 M 35 138 L 30 138 M 35 114 L 30 114 M 35 91 L 30 91 M 35 67 L 30 67 M 35 43 L 30 43 M 35 19 L 30 19"></path>

                        <text x="40.1" y="170" opacity="1"><tspan x="41.95" y="180" dy="0">2021 </tspan><tspan x="45.38" y="180" dy="12.5">-01 </tspan></text>
                        <text x="374.9" y="170" opacity="1"><tspan x="376.75" y="180" dy="0">2021 </tspan><tspan x="380.18" y="180" dy="12.5">-10 </tspan></text>
                        <text x="77.3" y="170" opacity="1"><tspan x="79.15" y="180" dy="0">2021 </tspan><tspan x="82.58" y="180" dy="12.5">-02 </tspan></text>
                        <text x="114.5" y="170" opacity="1"><tspan x="116.35" y="180" dy="0">2021 </tspan><tspan x="119.78" y="180" dy="12.5">-03 </tspan></text>
                        <text x="151.7" y="170" opacity="1"><tspan x="153.55" y="180" dy="0">2021 </tspan><tspan x="156.98" y="180" dy="12.5">-04 </tspan></text>
                        <text x="188.9" y="170" opacity="1"><tspan x="190.75" y="180" dy="0">2021 </tspan><tspan x="194.18" y="180" dy="12.5">-05 </tspan></text>
                        <text x="226.1" y="170" opacity="1"><tspan x="227.95" y="180" dy="0">2021 </tspan><tspan x="231.38" y="180" dy="12.5">-06 </tspan></text>
                        <text x="263.3" y="170" opacity="1"><tspan x="265.15" y="180" dy="0">2021 </tspan><tspan x="268.58" y="180" dy="12.5">-07 </tspan></text>
                        <text x="300.5" y="170" opacity="1"><tspan x="302.35" y="180" dy="0">2021 </tspan><tspan x="305.78" y="180" dy="12.5">-08 </tspan></text>
                        <text x="337.7" y="170" opacity="1"><tspan x="339.55" y="180" dy="0">2021 </tspan><tspan x="342.98" y="180" dy="12.5">-09 </tspan></text>
                        <text x="21.41" y="155.2" opacity="1"><tspan x="21.41" y="167.2" dy="0">0</tspan></text>
                        <text x="13.81" y="12.2" opacity="1"><tspan x="13.81" y="24.2" dy="0">12</tspan></text>
                        <text x="21.41" y="131.37" opacity="1"><tspan x="21.41" y="143.37" dy="0">2</tspan></text>
                        <text x="21.41" y="107.54" opacity="1"><tspan x="21.41" y="119.54" dy="0">4</tspan></text>
                        <text x="21.41" y="83.7" opacity="1"><tspan x="21.41" y="95.7" dy="0">6</tspan></text>
                        <text x="21.41" y="59.87" opacity="1"><tspan x="21.41" y="71.87" dy="0">8</tspan></text>
                        <text x="13.81" y="36.04" opacity="1"><tspan x="13.81" y="48.04" dy="0">10</tspan></text>
                        
                    </svg>
                </div>
            </div>
        </div>
        
    </div>
    <div class="row">
        <div class="col12">
            <h4 style="">Latest Actions
                <a href="/" class="i-pin i-20 btn-right" on:click|preventDefault="{ () => { pin_module('Latest Events')}}"> </a>
                <a href="/" class="i-settings i-20 btn-right"  on:click|preventDefault="{ () => { table_drawer=true;}}"> </a>
                <a href="/" class="i-filter i-20 btn-right" on:click|preventDefault="{ () => { filter_modal=true; }}"> </a>
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
                        <!--
                        <tr>
                            <td><b>485</b></td>
                            <td>Full Report</td>
                            <td>[]</td>
                            <td>Near Miss</td>
                            <td>9hr 4min</td>
                            <td>Main Office</td>
                            <td>Yellow</td>
                            <td>0</td>
                            <td>In Progress</td>
                        </tr>
                        -->
                    </tbody>
                </table>
                <div class="pagination-wrapper"><div class="pagination"> </div></div>
            </div>
        </div>
        
    </div>
 {:else if tab == 'summary'}
    <h2>Summary</h2>
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


    .big-num { color: var(--eo-primary-500); }
	.big-num.critical { color: var(--eo-critical-500); }
	.big-num.minor { color: var(--eo-border-input); }
</style>
	
        