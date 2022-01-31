<script>
    import { createEventDispatcher } from 'svelte';
    import PubSub from 'pubsub-js'

    import Form from './components/form/Form.svelte';
    import RecordID from "./components/table/RecordID.svelte";
    import Status from "./components/table/Status.svelte";


   

	let components = {
		"record_id": RecordID,
		"status": Status
	}
    
    const dispatch = createEventDispatcher();


    let tab = "dashboard";
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
                    "key": "record_id",
                    "value": "Record ID",
                    "selectable": false,
                    "selected": true,
                    "pii": false
                },
                {
                    "key": "channel",
                    "value": "Channel",
                    "selectable": true,
                    "selected": true,
                    "pii": false
                },
                
                {
                    "key": "created_date",
                    "value": "Date created on",
                    "selectable": true,
                    "selected": true,
                    "pii": false
                },
                {
                    "key": "created_by",
                    "value": "Creator",
                    "selectable": true,
                    "selected": true,
                    "pii": true
                },
                {
                    "key": "updated_date",
                    "value": "Date updated on",
                    "selectable": true,
                    "selected": false,
                    "pii": false
                },
                {
                    "key": "updated_by",
                    "value": "Updated by",
                    "selectable": true,
                    "selected": false,
                    "pii": true
                },
                {
                    "key": "status",
                    "value": "Status",
                    "selectable": true,
                    "selected": true,
                    "pii": false
                },
                {
                    "key": "group",
                    "value": "Group",
                    "selectable": true,
                    "selected": false,
                    "pii": false
                },
                {
                    "key": "division",
                    "value": "Division",
                    "selectable": true,
                    "selected": false,
                    "pii": false
                },
                {
                    "key": "sector",
                    "value": "Sector",
                    "selectable": true,
                    "selected": false,
                    "pii": false
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
                },
                {
                    "key": "primary_event_type",
                    "value": "Event",
                    "selectable": true,
                    "selected": true,
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
        hide_table_drawer();
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
            "created_date": "2022-01-24T3:48:19.430Z",
            "created_by": "Mike Wazowski",
            "update_date": "2022-01-24T3:48:19.430Z",
            "update_by": "Mike Wazowski",
            "group": "Ireland",
            "division": "Cork",
            "sector": "Plumbing",
            "record_id": 485,
            "channel": "rapid",
            "primary_event_type": "Near miss",
            "date_time": "2022-01-24T3:48:19.430Z",
            "time_relative": "9hr 42min",
            "location": "Main Office",
            "custom_field_shift": "Yellow Shift",
            "open_actions": 0,
            "total_actions": 2,
            "open_total_actions": "0/2",
            "status": "in_progress"
        }
    ]

    let table_settings_pullout = false;
    let show_drawer = false;

    $: {
        let s = show_drawer;
        if(s) {
            table_settings_form = [
                {
                    item_type: "input_multi",
                    id: "table_settings_multi",
                    label: "Columns to show",
                    hint: "All users will see these changes. Any that contain personally identifiable information will be redacted if the user doesn't have permission.",
                    max_warning: {
                        value: 10,
                        message: "If you have too many columns this page may become unresponsive for all users. You can always pin this table to your own dashboard to customize further."
                    },
                    options: JSON.parse(JSON.stringify(columns)),
                    answer: ""
                }
            ];
        }
    }



    let mask_block = false;
    let mask_visible = false;
    let pullout = false;

    function show_table_drawer() {
        show_drawer = true;
        mask_block = false;
        mask_visible = true;
        setTimeout(() => {
            table_settings_pullout = true;
        }, 300);
    }
    function hide_table_drawer() {
        mask_block = false;
        mask_visible = false;
        table_settings_pullout = false;
        setTimeout(() => {
            show_drawer = false;

            table_settings_form.options = columns;
            table_settings_form = table_settings_form;
        }, 1000);
    }

    function nav(str) {
		dispatch('nav', {
			text: str
		});
	}
</script>

<div class="row sticky">
    <div class="col12 col-sm-5">
        <ul class="breadcrumb">
            <li><a href="#platform" on:click="{ () => {nav('platform')}}">EcoOnline</a></li>
            <li><a href="#ehs" on:click="{ () => {nav('ehs')}}">EHS</a></li>
            <li>Incidents</li>
        </ul>
    </div>
    <div class="col12 col-sm-7 text-right">
       <!--<a href="/" class='btn btn-secondary'>Summary</a>-->
        <a href="#ehs/incidents/queries_new" on:click="{ () => {nav('queries_new')}}" class='btn btn-secondary'>Query</a>
        <a href="#ehs/incidents/incidents_new" on:click="{ () => {nav('incidents_new')}}" class='btn'>New</a>
    </div>
</div>

<ul class="tabs">
    <li><a href="#ehs/incidents/dashboard" class:active="{tab == 'dashboard'}" on:click ="{ () => { tab = 'dashboard';}}">Dashboard</a></li>
    <li><a href="#ehs/incidents/summary" class:active="{tab == 'summary'}" on:click ="{ () => { tab = 'summary'; }}">Summary</a></li>
    <li><a href="#ehs/incidents/admin" class:active="{tab == 'admin'}" on:click ="{ () => { tab = 'admin'; }}">Admin</a></li>
    <!--<li><a href="/" class:active="{tab == 'query'}" on:click|preventDefault ="{ () => { tab = 'query';}}">Query</a></li>-->
</ul>
{#if tab == 'dashboard'}
    <div class="row">
        <div class="col12 col-md-6">
            <div class="row">
                <div class="col6">
                    <div class="card card-31">
                        <div class="card-header">Open Events<a href="/" class="i-pin i-20 btn-right"> </a></div>
                        <div class="card-body">
                            <div class="big-num">40</div>
                        </div>
                    </div>
                </div>
                <div class="col6">
                    <div class="card card-31">
                        <div class="card-header">Awaiting Investigation<a href="/" class="i-pin i-20 btn-right"> </a></div>
                        <div class="card-body">
                            <div class="big-num minor">11</div>
                        </div>
                    </div>
                </div>
                <div class="col6">
                    <div class="card card-31">
                        <div class="card-header">Awaiting SignOff<a href="/" class="i-pin i-20 btn-right"> </a></div>
                        <div class="card-body">
                            <div class="big-num minor">3</div>
                        </div>
                    </div>
                </div>
                <div class="col6">
                    <div class="card card-31">
                        <div class="card-header">High Potential Severity<a href="/" class="i-pin i-20 btn-right"> </a></div>
                        <div class="card-body">
                            <div class="big-num danger">1</div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
        <div class="col12 col-md-6">
            <div class="card card-32">
                <div class="card-header">Events by Type<a href="/" class="i-pin i-20 btn-right"> </a></div>
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
            <h4 style="">Latest Events
                <a href="/" class="i-pin i-20 btn-right"> </a>
                <a href="/" class="i-settings i-20 btn-right"  on:click|preventDefault="{show_table_drawer}"> </a>
            </h4>
            <div class="sticky-wrapper">
                <table class="table">
                    <thead>
                        <tr>
                            {#each Object.entries(selected_columns) as [k, th]}
                                <th>{th.value}</th>
                            {/each}
                            <!--
                            <th>Record ID</th>
                            <th>Report Type</th>
                            <th>Source</th>
                            <th>Event Type</th>
                            <th>When</th>
                            <th>Location</th>
                            <th>Shift</th>
                            <th>Open Actions</th>
                            <th>Status</th>-->
                        </tr>
                    </thead>
                    <tbody>
                        {#each table_data as row}
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


{#if show_drawer}
    <div class="drawer">
        <div class="mask" class:visible="{mask_visible}" class:block="{mask_block}"></div>
        <div class="pullout" class:in="{table_settings_pullout}">
            <div class="pullout-head">
                <h2>Table settings <span class="close" on:click="{hide_table_drawer}"><i class="i-close i-24"></i></span></h2>
            </div>
            <div class="pullout-body form">

               
                <Form f={table_settings_form} {channel}></Form>
               
                <div class="form-item">
                    <span class="btn" on:click="{save_table_settings}">Save</span>
                    <span class="btn btn-secondary" on:click="{hide_table_drawer}">Cancel</span>
                </div>
            </div>
        </div>
    </div>
{/if}

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
	
        