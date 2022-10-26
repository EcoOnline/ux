<script>
    import { createEventDispatcher } from 'svelte';
    import PubSub from 'pubsub-js'
    import QrCode from "svelte-qrcode";

    import Pullout from './components/Pullout.svelte';

    import Form from './components/form/Form.svelte';


    import RecordID from "./components/table/RecordID.svelte";
    import Status from "./components/table/Status.svelte";
    import Channel from "./components/table/Channel.svelte";
    import DateComp from "./components/table/Date.svelte";


   

	let components = {
		"record_id": RecordID,
		"status": Status,
		"channel": Channel,
		"created_date": DateComp
	}
    
    const dispatch = createEventDispatcher();

    let tab = "qrcodes";
    export let tabnav = '';

    let channel = "QR";
    let sub = PubSub.subscribe(channel, read_answer);

    function read_answer(msg, data) {
        fx = strip(f);
        console.log('f updated', msg, data)
    }
    let new_qr = false;

    let f = [
        {
            item_type: "section",
            label: "Prefilled details",
            children: [
                {
                    item_type: "input_lookup",
                    id: "0_1",
                    label: "Site",
                    hint: "You can pre-define this QR for a particular site or leave blank to be filled in by the reporter",
                    placeholder: "Click or type to select...",
                    options: [
                        {
                            "key": "a",
                            "value": "England",
                            "selectable": true,
                            "selected": false,
                            "children": [
                                {
                                    "key": "aa",
                                    "value": "London HQ",
                                    "selectable": true,
                                    "selected": false,
                                    "children": [
                                        {
                                            "key": "aaa",
                                            "value": "Main Office",
                                            "selectable": true,
                                            "selected": false
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "key": "a",
                            "value": "Ireland",
                            "selectable": true,
                            "selected": false,
                            "children": [
                                {
                                    "key": "aa",
                                    "value": "Dublin HQ",
                                    "selectable": true,
                                    "selected": false,
                                    "children": [
                                        {
                                            "key": "aaa",
                                            "value": "Main Office",
                                            "selectable": true,
                                            "selected": false
                                        },
                                        {
                                            "key": "aab",
                                            "value": "Warehouse",
                                            "selectable": true,
                                            "selected": false
                                        }
                                    ]
                                },
                                {
                                    "key": "ab",
                                    "value": "Galway Shipping",
                                    "selectable": true,
                                    "selected": false,
                                    "children": [
                                        {
                                            "key": "aba",
                                            "value": "Main Office",
                                            "selectable": true,
                                            "selected": false
                                        },
                                        {
                                            "key": "abb",
                                            "value": "Packing bay",
                                            "selectable": true,
                                            "selected": false
                                        }
                                    ]
                                }
                            ]
                        }
                    ],
                    answer: ""
                },
                {
                    item_type: "input_switch",
                    id: "0_2",
                    label: "",
                    clamp: true,
                    options: [
                        {value: false, text: "Allow user to say “I don’t know”"}
                    ]
                },
                {
                    item_type: "input_switch",
                    id: "0_3",
                    label: "",
                    clamp: true,
                    options: [
                        {value: false, text: "Add ‘specific location’ eg reporter can type “By the stairs”"}
                    ]
                },
                {
                    item_type: "input_multi",
                    id: "04",
                    label: "What type of incidents are permitted?",
                    hint: "You can enable all event types or just a sub-set for this QR",
                    options: [
                        {
                            "key": "nearmiss",
                            "value": "Near Miss",
                            "selectable": true,
                            "selected": true,
                            "pii": false,
                            "sortable": true,
                            "sorted": "desc"
                        },
                        {
                            "key": "hazard",
                            "value": "Hazard",
                            "selectable": true,
                            "selected": true,
                            "pii": false,
                            "sortable": true,
                            "sorted": "desc"
                        },
                        {
                            "key": "slip",
                            "value": "Slip Trip & Fall",
                            "selectable": true,
                            "selected": true,
                            "pii": false,
                            "sortable": true,
                            "sorted": "desc"
                        },
                        {
                            "key": "vehicle",
                            "value": "Vehicle Accident",
                            "selectable": true,
                            "selected": false,
                            "pii": false,
                            "sortable": true,
                            "sorted": "desc"
                        },
                        {
                            "key": "fatality",
                            "value": "Fatal Accident",
                            "selectable": true,
                            "selected": false,
                            "pii": false,
                            "sortable": true,
                            "sorted": "desc"
                        }
                    ],
                    answer: ""
                },
                {
                    item_type: "input_switch",
                    id: "0_5",
                    label: "",
                    clamp: true,
                    options: [
                        {value: false, text: "Allow user to say “I don’t know”"}
                    ]
                },
                {
                    item_type: "input_text",
                    id: "0_8",
                    label: "Who is reporting?",
                    hint: false,
                    placeholder: "Click or type to select...",
                    options: [
                        {value: '', text: "Select one"},
                        {value: 'PP', text: "Passport"},
                        {value: 'ID', text: "National ID"},
                    ],
                    answer: ""
                },
                {
                    item_type: "input_switch",
                    id: "0_9",
                    label: "",
                    clamp: true,
                    options: [
                        {value: false, text: "Allow anonymous reporting"}
                    ]
                }/*,
                {
                    item_type: "input_switch",
                    id: "0_10",
                    label: "",
                    clamp: true,
                    options: [
                        {value: false, text: "Add ‘specific location’ eg reporter can type “By the stairs”"}
                    ]
                },*/
            ]
        },
        {
            item_type: "section",
            label: "Other options",
            children: [
                {
                    item_type: "input_select",
                    id: "1_0",
                    label: "Status",
                    hint: "When reports with this QR are submitted they should be",
                    placeholder: "Click or type to select...",
                    options: [
                        {value: 'in_progress', text: "In Progress"},
                        {value: 'awaiting_triage', text: "Awaiting Triage"},
                    ],
                    answer: ""
                },
                {
                    item_type: "input_text",
                    id: "1_1",
                    label: "Assign to",
                    hint: "This QR code can generate reports automatically assigned to a person",
                    placeholder: "Click or type to select...",
                    answer: ""
                }
            ]
        }
    ];
    let fx = [];
    let url = 'https://ecoonline.github.io/ux/public/rapid.html?singlepage=1&fx=';
    let value = '';

    $: {
        //too big value = url +  encodeURIComponent(JSON.stringify(fx))
        let str = JSON.stringify(fx);
        let l = str.length;

        console.log(l, str);
        value = url + btoa(l + '');
    }
    
    function strip(arr) {
        let temp = [];
        arr.forEach( (item) => {
            let temp_obj = {id: item.id, answer: item.answer, options: (item.options? [item.options[0]] : [])};
            if(item.children){
                temp_obj.children = strip(item.children)
            }
            temp.push(temp_obj)
        })
        return temp;
    }

    $: {
        let t = tabnav;
        if(tabnav !== '') {
            tab = t;
        }
    }
    let qrs = [];
    
    let prefilled_qrs = [
        { 
            "created_date": "2022-03-12T13:08:10.430Z",
            "created_by": "Mike Wazowski",
            "updated_date": "2022-01-24T3:48:19.430Z",
            "updated_by": "Mike Wazowski",
            "record_id": 5,
            "use_count": 0,
            "location": false,
        },
        { 
            "created_date": "2022-01-19T08:08:10.430Z",
            "created_by": "Mike Wazowski",
            "updated_date": "2022-01-24T3:48:19.430Z",
            "updated_by": "Mike Wazowski",
            "record_id": 4,
            "use_count": 15,
            "location": false,
        },
        { 
            "created_date": "2021-12-25T21:08:10.430Z",
            "created_by": "Mike Wazowski",
            "updated_date": "2022-01-24T3:48:19.430Z",
            "updated_by": "Mike Wazowski",
            "record_id": 3,
            "use_count": 127,
            "location": "Packing Bay",
        }
    ]
    

    function nav(str) {
		dispatch('nav', {
			text: str
		});
	}

</script>

<div class="row sticky">
    <div class="col12 col-sm-6">
        <ul class="breadcrumb">
            <li><a href="#home" on:click="{ () => {nav('home')}}">EcoOnline</a></li>
            <li><a href="#ehs" on:click="{ () => {nav('ehs')}}">EHS</a></li>
            <li><a href="#ehs/incidents" on:click="{ () => {nav('incidents')}}">Incidents</a></li>
            <li>Incidents Admin</li>
        </ul>
    </div>
    <!--
    <div class="col12 col-sm-6 text-right">
        <a title="Incidents" href="#ehs/incidents" on:click="{ () => {nav('incidents')}}" class="menu-icon"><i class='i-dashboard i-24'></i></a>
        <a title="Summary" href="#ehs/incidents/summary" on:click="{ () => {nav('summary')}}" class="menu-icon"><i class='i-summary i-24'></i></a>
        <a title="Incident Admin" href="#ehs/incidents/incidents_admin" on:click="{ () => {nav('incidents_admin')}}" class="menu-icon selected"><i class='i-tool i-24'></i></a>
        <a title="Query" href="#ehs/incidents/queries_new" on:click="{ () => {nav('queries_new')}}" class="menu-icon"><i class='i-filter i-24'></i></a>
        <a title="New Incident" href="#ehs/incidents/incidents_new" on:click="{ () => {nav('incidents_new')}}" class='btn'>New</a>
    </div>
    -->
    <!--
    <div class="col12 col-sm-7 text-right">
        <a href="#ehs/incidents/" on:click="{ () => {nav('incidents')}}" class="menu-icon"><i class='i-dashboard i-24'></i></a>
        <a href="#ehs/incidents/summary" on:click="{ () => {nav('summary')}}" class="menu-icon"><i class='i-summary i-24'></i></a>
        <a href="#ehs/incidents/admin" on:click="{ () => {nav('admin')}}" class="menu-icon"><i class='i-tool i-24'></i></a>
    
        <a href="/" class="btn">Add QR Code</a>
    </div>
    -->
</div>


<h1 class="page-title"><i class="i-tool i-32"></i>Incidents Admin</h1>
<ul class="tabs">
    <li><a href="#ehs/incidents/overview" class:active="{tab == 'overview'}" on:click ="{ () => { tab = 'overview';}}">Overview</a></li>
    <li><a href="#ehs/incidents/queries_new" class:active="{tab == 'query'}" on:click ="{ () => { tab = 'queries_new';}}">Query</a></li>
    <li><a href="#ehs/incidents/summary" class:active="{tab == 'summary'}" on:click ="{ () => { tab = 'summary'; }}">Summary</a></li>
    <li><a href="#ehs/incidents/admin" class="active" on:click ="{ () => { tab = 'admin'; }}">Admin</a></li>
</ul>

<!--
<ul class="tabs">
    <li><a href="#ehs/incidents/incidents_admin/qrcodes" class:active="{tab == 'qrcodes'}" on:click ="{ () => { tab = 'qrcodes';}}">QR codes</a></li>
    <li><a href="#ehs/incidents/incidents_admin/templates" class:active="{tab == 'templates'}" on:click ="{ () => { tab = 'templates'; }}">Templates</a></li>
    <li><a href="#ehs/incidents/incidents_admin/lists" class:active="{tab == 'lists'}" on:click ="{ () => { tab = 'lists'; }}">Response Lists</a></li>
</ul>-->
{#if tab == 'qrcodes'}
        
        <!--<div class="col3 d960up-block">
            <div class="side_menu_wrapper" style="position:sticky;top:56px">
               
                
                <h4>Admin Sections</h4>
                <ul class="side_menu">
                    <li class:active="{tab == 'qrcodes'}"><a href="#ehs/incidents/incidents_admin/qrcodes" on:click="{ () => { tab = 'qrcodes'; }}">QR Codes</a></li>
                    <li class:active="{tab == 'templates'}"><a href="#ehs/incidents/incidents_admin/templates" on:click="{ () => { tab = 'templates'; }}">Templates</a></li>
                </ul>
            </div>
        </div>
        -->

    <div class="row">
        {#if new_qr}
        <div class="col3 d960up-block"></div>
            <div class="col12 col-md-6">
                <h2 style="">New Quick Report QR Code</h2>
                <Form {f} {channel}></Form>
                <a href="#" class="btn mb2" on:click|preventDefault="{() => { qrs = prefilled_qrs; new_qr = false}}">Save QR code</a>
                <a href="#" class="btn btn-secondary mb2" on:click|preventDefault="{() => { new_qr = false}}">Cancel</a>
            </div>
            <div class="col3 d960up-block">
                <div style="position:sticky;top: 0px;">
                    <h2>&nbsp;</h2>
                    <div class="card">
                        <div class="card-body">
                            <h3 style="font-weight:100;font-size:20px">QR test</h3>
                        
                            <div class="text-center mb2 mt2"><QrCode {value }/></div>
                        </div> 
                    </div>
                </div>
            </div>
        {:else}

            
            {#if qrs.length}
                <div class="col12 col-9-md">
                    <a href="/" class="btn btn-right mt1" on:click|preventDefault="{ () => { new_qr = true} }">Add QR Code</a>
                    <h2 style="">Quick Report QR Codes</h2>
                    <div class="sticky-wrapper">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Record ID</th>
                                    <th>Uses</th>
                                    <th>Created By</th>
                                    <th>Creation Date</th>
                                    <th>Location</th>
                                    <th>Actions</th>
                                    
                                </tr>
                            </thead>
                            <tbody>
                                {#each qrs as row}
                                    <tr>
                                        <td><svelte:component this={components.record_id} obj={row.record_id} /></td>
                                        <td>{row.use_count}</td>
                                        <td>{row.created_by}</td>
                                        <td><svelte:component this={components.created_date} obj={row.created_date} /></td>
                                        <td>{row.location ? row.location : 'Not specified'}</td>
                                        <td>
                                            <a href="#ehs/incidents/" on:click="{ () => {nav('dashboard')}}" class="btn-right i-trash i-24 ml2"> </a>
                                            <a href="#ehs/incidents/" on:click="{ () => {nav('dashboard')}}" class="btn-right i-qr i-24"> </a>
                                            <a href="#ehs/incidents/" on:click="{ () => {nav('dashboard')}}" class="btn-right i-edit i-24"> </a>
                                            <a href="#ehs/incidents/" on:click="{ () => {nav('dashboard')}}" class="btn-right i-link i-24"> </a>
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                        <div class="pagination-wrapper"><div class="pagination"> </div></div>
                    </div>
                </div>
            {:else}
                <div class="col3 d960up-block"></div>
                <div class="col12 col-md-6">
                    <h2 style="">Quick Report QR Codes</h2>
                    <div class="card">

                        <div class="card-body text-center">
                            <svg class="mt2 mb1" width="128" height="128" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M61.7604 16.2498C62.8904 16.6598 63.4704 17.9198 63.0604 19.0398L50.4104 53.8098C49.1704 57.2198 47.5504 60.3698 45.6104 63.2498C43.2404 62.8398 40.8704 62.2198 38.5304 61.3598C17.4404 53.6898 6.56045 30.3498 14.2404 9.2498C15.3804 6.1198 16.8704 3.2098 18.6404 0.549805L61.7604 16.2498Z" fill="#D1F2FA"/>
                                <path d="M24.04 35.2401C27.86 37.4801 30.54 40.9701 31.85 44.9001L27.7 52.2201C23.29 59.9701 14.3 63.3501 6.22 60.8801C6.08 60.8301 5.96 60.7601 5.85 60.6601C2.08 57.0701 0.02 52.0701 0 46.9601L0.02 45.7001C0.02 44.8101 0.16 43.8001 0.43 42.6501C0.63 41.8001 0.91 40.9101 1.25 40.0401C6.47 32.8701 16.26 30.6701 24.04 35.2401Z" fill="#EB6047"/>
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M53.21 20.54H56.49V8.5C56.49 7.94 56.05 7.5 55.49 7.5H43.37V10.76H53.21V20.54ZM10.78 20.63H7.5V8.59C7.5 8.04 7.94 7.59 8.5 7.59H20.62V10.85H10.78V20.63ZM7.5 55.5C7.5 56.05 7.94 56.5 8.5 56.5H20.62V53.23H10.78V43.45H7.5V55.5ZM55.49 56.4C56.05 56.4 56.49 55.95 56.49 55.4V43.36H53.21V53.14H43.37V56.4H55.49ZM17.12 27.7C16.64 27.7 16.25 27.31 16.25 26.83V17.12C16.25 16.64 16.64 16.25 17.12 16.25H26.83C27.31 16.25 27.7 16.64 27.7 17.12V26.83C27.7 27.31 27.31 27.7 26.83 27.7H17.12ZM24.84 19.11H19.11V24.84H24.84V19.11ZM47.75 17.12C47.75 16.64 47.35 16.25 46.87 16.25H37.16C36.68 16.25 36.29 16.64 36.29 17.12V26.83C36.29 27.31 36.68 27.7 37.16 27.7H46.87C47.35 27.7 47.75 27.31 47.75 26.83V17.12ZM44.88 24.84H39.15V19.11H44.88V24.84ZM26.83 36.29C27.31 36.29 27.7 36.68 27.7 37.16V46.87C27.7 47.35 27.31 47.75 26.83 47.75H17.12C16.64 47.75 16.25 47.35 16.25 46.87V37.16C16.25 36.68 16.64 36.29 17.12 36.29H26.83ZM19.11 44.88H24.84V39.15H19.11V44.88ZM33.43 30.56H47.75V33.43H33.43V47.75H30.56V33.43H16.25V30.56H30.56V16.25H33.43V30.56ZM47.75 36.29H37.16C36.68 36.29 36.29 36.68 36.29 37.16V47.75H39.15V39.15H47.75V36.29ZM44.88 41.42H42.02V47.75H44.88V41.42Z" fill="#1A1919"/>
                                </svg>
                            <h1>Create your first QR code for rapid reporting</h1>
                            <p>By configuring a QR code your company can make reporting incidents faster & easier.</p>
                            <a href="#" class="btn mt2 mb2" on:click|preventDefault="{ () => { new_qr = true} }">Add QR Code</a>
                        </div>
                    </div>
                </div>

            {/if}
        {/if}
    </div>
    
    {:else if tab == 'templates'}
    <div class="row">
        <div class="col12">
        <h2>Templates</h2>
        </div>
    </div>
    {:else if tab == 'lists'}
    <div class="row">
        <div class="col12">
        <h2>Response Lists</h2> </div>
    </div>
{/if}


<style>
    .sticky-wrapper {
        box-shadow:0 6px 10px rgba(186, 191, 195, 0.2);
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
</style>
	
        