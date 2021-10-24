<script>
	import Items from "./Multiselect-item.svelte";

	/* 
		level doesnt necessarily correspond to depth in hierarchy
	*/
	let maxW = 360;
	$: indentW = Math.ceil(maxW/20);
    let search_word = '';
	let src = [
		{
			id:"0",
			name: "England",
			level: 1,
			checked: false, 
			disabled: false, //can be disabled if not at the same level of another selected item
			permission: false, //might not have rights at this item
			open: false,
			children: [
				{
					id:"0-0",
					name: "Manchester",
					level: 2,
					checked: false,
					disabled: false,
					permission: true,
					open: false,
					children: [
						{
							id:"0-0-0",
							name: "Office",
							level: 3,
							checked: false,
							disabled: false,
							permission: true,
							open: false,
							children: [
								
								{
									id:"0-0-0-0",
									name: "Floor 1",
									level: 4,
									checked: false,
									disabled: false,
									permission: true,
									open: false,
									children: [
										
									]
								},
								{
									id:"0-0-0-1",
									name: "Basement",
									level: 4,
									checked: false,
									disabled: false,
									permission: true,
									open: false,
									children: [
										
									]
								}
							]
						},
						{
							id:"0-0-1",
							name: "Warehouse",
							level: 3,
							checked: false,
							disabled: false,
							permission: true,
							open: false,
							children: [
								
							]
						}
					]

				},
				{
					id:"0-1",
					name: "Liverpool",
					level: 2,
					checked: false,
					disabled: false,
					permission: true,
					open: false,
					children: [
						{
							id:"0-1-0",
							name: "Office",
							level: 3,
							checked: false,
							disabled: false,
							permission: true,
							open: false,
							children: [
								
								{
									id:"0-1-0-0",
									name: "Floor 1",
									level: 4,
									checked: false,
									disabled: false,
									permission: true,
									open: false,
									children: [
										
									]
								},
								{
									id:"0-1-0-1",
									name: "Basement",
									level: 4,
									checked: false,
									disabled: false,
									permission: true,
									open: false,
									children: [
										
									]
								}
							]
						},
						{
							id:"0-1-1",
							name: "Warehouse",
							level: 3,
							checked: false,
							disabled: false,
							permission: true,
							open: false,
							children: [
								
							]
						}
					]

				},
				{
					id:"0-2",
					name: "Head Office",
					level: 3,
					checked: false,
					disabled: false,
					permission: true,
					open: false,
					children: [
						
					]

				}
			]

		},
        {
			id:"1",
			name: "Ireland",
			level: 1,
			checked: false, 
			disabled: false, //can be disabled if not at the same level of another selected item
			permission: false, //might not have rights at this item
			open: false,
			children: [
				{
					id:"1-0",
					name: "Dublin",
					level: 2,
					checked: false,
					disabled: false,
					permission: true,
					open: false,
					children: [
                        {
							id:"1-0-0",
							name: "Office",
							level: 3,
							checked: false,
							disabled: false,
							permission: true,
							open: false,
							children: []
                        },
                        {
							id:"1-0-1",
							name: "Pump Station",
							level: 3,
							checked: false,
							disabled: false,
							permission: true,
							open: false,
							children: []
                        }
                    ]
                },
                {
					id:"1-1",
					name: "Galway",
					level: 2,
					checked: false,
					disabled: false,
					permission: true,
					open: false,
					children: [
                        {
							id:"1-1-0",
							name: "Solar farm",
							level: 3,
							checked: false,
							disabled: false,
							permission: true,
							open: false,
							children: []
                        },
                        {
							id:"1-1-1",
							name: "Pump Station 2",
							level: 3,
							checked: false,
							disabled: false,
							permission: true,
							open: false,
							children: []
                        }
                    ]
                }
            ]
        }
	];
    
    // add super nesting to see it in effect 
    let temp_id = src.length + '';
    let temp_pos = src;
    for(let i = 0; i < 20;i++) {
        let temp_obj = {
            id: temp_id,
			name: "Test" + (i+1),
			level: 1,
			checked: false, 
			disabled: false, //can be disabled if not at the same level of another selected item
			permission: false, //might not have rights at this item
			open: false,
			children: []
        };
        temp_pos.push(temp_obj);
        temp_id += '-0';
        temp_pos = temp_pos[temp_pos.length-1].children
    }
    src = src;


	let level_checked = -1;
	let global_open = false;
	let dd_open = false;
	
	$: src_filtered = src.sort( function(a,b) {
		return a.name.toLowerCase() < b.name.toLowerCase();
	});

	let number_checked = 0
	$: {
		let s = src;
		number_checked = count_checked(s);
	};
	function count_checked(arr) {
		let count = 0;
		arr.forEach( (item) => {
			count += item.checked ? 1 : 0;
			count += count_checked(item.children);
		})
		return count;
	}
    let checked_set = []
	$: {
		let s = src;
        checked_set = [];
		list_checked(s);
	};
	function list_checked(arr) {
		arr.forEach( (item) => {
            if(item.checked) {
                checked_set.push(item);
            }
            list_checked(item.children);
		})
	}



	function click_open() {
		global_open = !global_open;
		toggle_open(src, global_open);
		src = src;
	}
    function click_badge(item) {
        item.checked = false;
        if(number_checked < 2 ){
            level_checked = -1;
            activate_levels(src);
        }
        src=src
    }
	function toggle_open(arr, bool) {
		arr.forEach((item) => {
			item.open = bool;
			toggle_open(item.children, bool);
		});
	}

	function block_other_levels(arr) {
		arr.forEach( (item) => {
			if(item.level !== level_checked) {
				item.disabled = true;
			}
			block_other_levels(item.children);
		});
	}
	function activate_levels(arr) {
		arr.forEach( (item) => {
			item.disabled = false;
			activate_levels(item.children);
		});
	}

	
	function handleCheck(event) {
		let item = event.detail;
		src = src; //trigger repaint
		if(item.checked === true) {
			if(level_checked < 0) {
				level_checked = item.level;
				//go and disable all other levels

				console.log('time to disable other levels');
				block_other_levels(src);
				src = src;
			} else {
				console.log('already disabled other levels')
			}
		} else {
			if(number_checked < 2 ){
				level_checked = -1;
				activate_levels(src);
				src = src;
			}
		}

		setTimeout(() => {
			dd_open = true;
		},10);
	}


</script>


<div class="page" on:click={ () => { dd_open = false; }}>
    <div class="filter-box">
        <b>Filter:</b>
        Locations
        <div class="comp" style="width:{maxW}px"  on:click|stopPropagation={ () => { console.log('comp click');}}>
            <div class="form-control">
                <input bind:value={search_word} type="text" class="" placeholder="Select or type" on:focus={ () => { dd_open = true }}>
                
                {#if dd_open}
                    <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                        <path d="M29,27.5859l-7.5521-7.5521a11.0177,11.0177,0,1,0-1.4141,1.4141L27.5859,29ZM4,13a9,9,0,1,1,9,9A9.01,9.01,0,0,1,4,13Z" transform="translate(0 0)"/>
                    </svg>
                {:else}
                    <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                        <polygon points="16,22 6,12 7.4,10.6 16,19.2 24.6,10.6 26,12 "/>
                    </svg>
                {/if}
                
            </div>
            <div class="dropdown" class:dd_open style="width:{maxW}px">
                <div class="dropdown-item">
                    <svg on:click="{click_open}" width="24" height="24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 32 32" style="enable-background:new 0 0 32 32;" xml:space="preserve">
                        {#if global_open}
                            <polygon points="16,10 26,20 24.6,21.4 16,12.8 7.4,21.4 6,20 "/>
                        {:else}
                            <polygon points="16,22 6,12 7.4,10.6 16,19.2 24.6,10.6 26,12 "/>
                        {/if}
                    </svg>
                </div>
                <Items items={src_filtered} {search_word} indent={0} {indentW} on:handleCheck="{handleCheck}"></Items>
            </div>
        </div>
        {#each checked_set as item, index}
            {#if index < 2}
                <div class="badge" on:click|stopPropagation={() => { click_badge(item)}}>{item.name} 
                    <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><polygon points="24 9.4 22.6 8 16 14.6 9.4 8 8 9.4 14.6 16 8 22.6 9.4 24 16 17.4 22.6 24 24 22.6 17.4 16 24 9.4"/></svg>
                </div>
            {:else if index == 2}
                <div class="badge end">+{checked_set.length-2}</div>
            {/if}
        {/each}

        <a class="btn">Filter</a>
	</div>
    <!--
	<pre><code>{JSON.stringify(src, null, 4)}</code></pre>
    -->

    <p class="note" style="max-width:480px">
        - Search currently only works with correct capitalization eg Office not office and words that start with not contain but it should be a propper search<br>
        - Haven't put menu in "All locations", "Suggestions", "Selected"<br>
        - Global close/open all should change when all are expanded even if its manually<br>
    </p>
</div>




<style>
    .filter-box {
        border-radius:12px;
        padding:16px;
        background: #fff;
    }
    .filter-box > b{
       display: inline-block;
       margin-right:32px
    }
    .comp {
        display:inline-block;
    }
    .badge {
        background: #d3d3d3;
        color: #1a1919;
        font-size: 11px;
        text-transform: uppercase;
        line-height: 20px;
        padding: 2px 24px 2px 8px;
        border-radius: 25px;
        display: inline-block;
        vertical-align: top;
        margin: 8px 4px 0 0;
        position:relative;
        cursor: pointer;
    }
    .badge.end {
        padding: 2px 8px;
    }
    .badge svg{
        fill:#444;
        vertical-align: middle;
        position: absolute;
        right: 4px;
    }
	.form-control {
		width:100%;
		position:relative;
	}
	.form-control svg {
		position:absolute;
		right:8px;
		top: 8px;
		vertical-align: middle;
	}
	.form-control input {
		border:none;
		background:transparent;
		outline:none;
		width: 100%;
        height: 32px;
        z-index: 1;
        position: relative;
	}
	.dropdown {
		display:none;
		border:1px solid #d3d3d3;
		border-radius:4px;
		height: calc( 6.5 * 48px); 
		overflow-y: auto;
		position:absolute;
        background:#fff;
	}
	.dropdown.dd_open {
		display:block;
	}
	.dropdown-item {
        height:48px;
        border-bottom:1px solid #d3d3d3;
        margin-top:-1px;
        margin-bottom:-1px;
        box-sizing: border-box;
        padding:14px 8px;
        color:#1a1919;
    }


    .btn {
        height: 32px;
        max-width: var(--button_width);
        overflow: hidden;
        text-overflow: ellipsis;
        border-radius: 54px;
        padding: 0 16px;
        color: #fff;
        background: var(--eo-primary-500);
        text-decoration: none;
        vertical-align: middle;
        white-space: nowrap;
        line-height: 32px;
        min-width:  var(--button_min_width);
        text-align: center;
        float:right;
        margin-top:6px;
    }

</style>