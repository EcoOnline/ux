<script>

    import { onMount} from 'svelte';
    import PubSub from 'pubsub-js'
    import Item from './InputMultiItem.svelte';

    export let f;
    let orginal_options = JSON.parse(JSON.stringify(f.options)); //make a copy for resetting

    let dd_in = false;
    let tab="all";

    export let channel = 'ANSWER';

    let item = false;
    let selected = [];
    let selected_shortlist = [];
    let filtered = [];

    function filter_item(item, txt) {
        let item_ok = false;
        if( item.value.toLowerCase().indexOf(txt) >= 0 ) {
            item_ok = true;
        }
        if(item.children) {
            item.children.forEach( (item) => {
                let child_ok = filter_item(item, txt);
                if(child_ok) {
                    item_ok = true;
                }
            });
        };
        return item_ok;
    }

    function cull(arr, txt) {
        let found = false;
        arr.forEach( (item, i) => {
            let found_in_children = false;
            if(Array.isArray(item.children)) {
                item.expanded = (typeof item.expanded !== 'undefined' ? item.expanded : true); //default to open
                if(cull(item.children, txt)) {
                    found_in_children = true;
                }
            }
           /* if( item.value == 'Common Fields' || item.value == 'Report Event') {
                console.log(item.value, txt=='', item.value.toLowerCase().indexOf(txt) >= 0, found_in_children)
            }*/

            if(txt == '' || item.value.toLowerCase().indexOf(txt) >= 0 || found_in_children){
                item.visible = true;
                found = true
            } else {
                item.visible = false;
            }
        });
        return found;
    }

    $: {
        let txt = f.answer;
        recalc();
        /*
        console.log("filtering");
        cull(f.options, f.answer);
        if(f.answer !== '') {
            dd_in = true;
        }
        */
    }
    
    let w = 0;

    function tree_to_selected(arr) {
        let temp_selected = [];
        arr.forEach( (option) => {

            if(option.selected) {
                temp_selected.push(option)
            }
            if(option.children && option.children.length){
                temp_selected = [...temp_selected, ...tree_to_selected(option.children)]
            }
        })
        return temp_selected;
    }
    
    function recalc() {
        
        cull(f.options, f.answer);
        if(f.answer !== '') {
            dd_in = true;
        }
        selected = tree_to_selected(f.options);
        
        if(w>0) {
            let char_width = 12; //rough approximation
            let max_chars = Math.floor(w/char_width);
            let chars_used = 0;
            let num_tags = 0;
            selected.forEach( (tag) => {
                let t_length = tag.value.length > 18 ? 18 : tag.value.length;
                chars_used += t_length;
                if(chars_used < max_chars) {
                    
                    num_tags++;
                }
            });
            selected_shortlist = selected.slice(0, num_tags);
            let answer = JSON.parse(JSON.stringify(f));
            //answer.options = opts;
            PubSub.publish(channel, answer);
        }
    }

    function remove_tag(tag) {
        tag.selected = false;
        f.options = f.options;
        recalc();
    }
    function remove_all_tags() {
        f.options.forEach( (tag) => {
            tag.selected = false;
        }) 
        dd_in = false;
        f.options = f.options;
    }
    function handleItemUpdate(ev) {
        recalc();
    }
    function handleItemUpdate2(ev) {
        recalc();
    }
    let tag_hover = false;


    onMount(() => {
        w = item.offsetWidth;
        recalc();
	})
</script>


<div class="form-item" bind:this="{item}">
    {#if f.label}
        <label for="{f.id}">{f.label}</label>
    {/if}
    {#if f.hint}
        <p>{f.hint}</p>
    {/if}
    {#if f.max_warning}
        {#if selected.length >= f.max_warning.value}
            <div class="idea"><i class="i-idea i-24"></i><p>{f.max_warning.message}</p></div>
        {/if}
    {/if}
    {#if dd_in}
        <div class="multi-mask" on:click={ () => { dd_in = false;f.answer=''; }}></div>
    {/if}
    
    <div class="multi-wrapper">
        <div class="form-control" style="padding-left:12px;">
            {#if selected_shortlist.length}

                {#if selected_shortlist.length == 1}
                    <div class="tag" class:tag_hover><span  on:click="{ () => { tab ='selected';dd_in = true;}}" on:mouseenter={ () => { tag_hover = true;}} on:mouseleave={ () => { tag_hover = false;}}>{selected_shortlist[0].value}</span><i class="i-close i-20" on:click="{ () => remove_tag(selected_shortlist[0])}"></i></div>
                {:else}
                    <div class="tag" class:tag_hover><span  on:click="{ () => { tab = 'selected'; dd_in = true;}}" on:mouseenter={ () => { tag_hover = true;}} on:mouseleave={ () => { tag_hover = false;}}>{selected_shortlist.length} selected</span><i class="i-close i-20" on:click="{ () => remove_all_tags()}"></i></div>
                {/if}

            {/if}
            <input bind:value="{f.answer}" on:focus="{ (ev) => { ev.target.select()}}" type="text" placeholder="{f.placeholder ? f.placeholder : ''}">
            {#if !dd_in}
                <i class="i-chevron-down i-20" on:click="{ () => { tab = 'all';dd_in = !dd_in}}"></i>
            {:else}
                <i class="i-chevron-up i-20" on:click="{ () => { tab = 'all';dd_in = !dd_in; f.answer=''}}"></i>
            {/if}
        </div>
        
        <div class="multi-dropdown" class:dd_in>
            <ul class="tabs">
                <li><a href="#ehs/incidents/dashboard" class:active="{tab == 'all'}" on:click|preventDefault ="{ () => { tab = 'all';}}">All</a></li>
                <li><a href="#ehs/incidents/dashboard" class:active="{tab == 'selected'}" on:click|preventDefault ="{ () => { tab = 'selected'; }}">Selected</a></li>
            </ul>
            {#if tab == 'all'}
                {#each f.options as f} 
                    <Item {f} on:item_update="{handleItemUpdate}"/>
                {/each}
            


            {:else if tab == 'selected'}
                {#each selected as f}
                    <Item {f} on:item_update="{handleItemUpdate2}"/>
                {/each}
            {/if}
        </div>

    </div>
    

</div>

<style>
    .form-control:hover {
        background: #fff ! important
    }
    .form-item {
        overflow: initial;
    }
    .tag {
        background-color: #E4E7EB;
        position:relative;
        margin-right:8px;
        white-space: nowrap;
        border-radius:4px;
        margin-top:4px;
        height:24px;
        display: flex;
    }
    .tag.tag_hover {
        background-color: #D0D6DC !important;
    }
    .tag .i-close {
        vertical-align: text-bottom;
        margin-top:2px;
        margin-left:2px;
        border-radius:4px;
    }
    .tag .i-close:hover {
        background-color: rgba(0,0,0,0.2) !important;
    }
    .multi-mask {
        background:transparent;
        position:absolute;
        left:0;
        top:60px;
        width:100%;
        height:100%;
    }
    .multi-wrapper {
        position:relative;
    }

    .idea {
        padding:8px;
        display:flex;
        flex-direction:row;
        align-items: center;
        border:1px solid var(--eo-border-reduced);
        border-radius:8px;
        margin-bottom:8px;
    }
    .idea p {
        flex: 1;
	    font-size: 14px;
	    margin: 0 0 0 8px;
        padding: 0;
    }

    .multi-dropdown {
        width:100%;
        max-width: 480px;
        box-shadow:0 6px 10px rgba(186, 191, 195, 0.2);
        background:#fff;
        border-radius: 8px;
        position: absolute;
        left:0;
        height:auto;
        max-height:0;
        overflow-y:auto;
        transition: all 0.3s ease-out;
        z-index: 200;
    }
    .multi-dropdown.dd_in {
        max-height: 300px;
    }

    .tabs {
        margin-left:16px;
    }
    .tabs li a {
        font-weight: 300;
    }
    
</style>
