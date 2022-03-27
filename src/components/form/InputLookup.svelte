<script>

    import { onMount} from 'svelte';
    import PubSub from 'pubsub-js';
    import Item from './InputLookupItem.svelte';

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

    function handleItemUpdate(ev) {
        f.answer = ev.detail.item.value;
        recalc();
        dd_in = false;
    }
    


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
    {#if dd_in}
        <div class="multi-mask" on:click={ () => { dd_in = false; }}></div>
    {/if}
    <div class="multi-wrapper">
        <div class="form-control">
            <input bind:value="{f.answer}" on:keyup="{ () => { dd_in = true}}" on:focus="{ (ev) => { ev.target.select()}}" type="text" placeholder="{f.placeholder ? f.placeholder : ''}">
            {#if !dd_in}
                <i class="i-chevron-down i-20" on:click="{ () => {f.answer=''; dd_in = !dd_in}}"></i>
            {:else}
                <i class="i-chevron-up i-20" on:click="{ () => { dd_in = !dd_in;}}"></i>
            {/if}
        </div>
        
        <div class="multi-dropdown" class:dd_in>
            {#each f.options as f} 
                <Item {f} on:item_update="{handleItemUpdate}"/>
            {/each}
        </div>

    </div>
    

</div>

<style>
    .form-item {
        overflow: initial;
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
        max-height: 50vh;
    }
    /*
    .tabs {
        margin-left:16px;
    }
    .tabs li a {
        font-weight: 300;
    }
    .select {
        flex:1;
    }
    */
</style>
