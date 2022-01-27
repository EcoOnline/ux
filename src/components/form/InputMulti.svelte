<script>

    import { onMount} from 'svelte';
    import PubSub from 'pubsub-js'
    import Item from './InputMultiItem.svelte';

    export let f;
    let orginal_options = JSON.parse(JSON.stringify(f.options));

    let dd_in = false;

    let opts = [];
    let tab="all";

    export let channel = 'ANSWER';

    let item = false;
    let selected = [];
    let selected_shortlist = [];
    
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
        selected = tree_to_selected(opts);
   
        
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
            answer.options = opts;
            PubSub.publish(channel, answer);
        }
    }

    function remove_tag(tag) {
        tag.selected = false;
        //opts = JSON.parse(JSON.stringify(f.options));
        f.options = JSON.parse(JSON.stringify(opts));
        recalc();
    }
    function handleItemUpdate(ev) {
        opts = JSON.parse(JSON.stringify(f.options));
        recalc();
    }
    function handleItemUpdate2(ev) {
        console.log('selected update', ev.detail.item)
        f.options = JSON.parse(JSON.stringify(opts));
        recalc();
    }


    onMount(() => {
        opts = JSON.parse(JSON.stringify(orginal_options));
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
    {#if selected_shortlist.length}
        {#each selected_shortlist as tag}
            {#if tag.key == 'record_id'}
                <div class="tag no_delete">{tag.value}</div>
            {:else}
                <div class="tag" on:click="{ () => remove_tag(tag)}">{tag.value}<i class="i-close i-20"></i></div>
            {/if}
        {/each}
        {#if selected_shortlist.length < selected.length}
            <div class="tag no_delete">+{selected.length - selected_shortlist.length}</div>
        {/if}
    {/if}
    <div class="multi-wrapper">
        <div class="form-control">
            <input type="text" placeholder="{f.placeholder ? f.placeholder : ''}">
            {#if !dd_in}
                <i class="i-chevron-down i-20" on:click="{ () => { dd_in = !dd_in}}"></i>
            {:else}
                <i class="i-chevron-up i-20" on:click="{ () => { dd_in = !dd_in}}"></i>
            {/if}
        </div>
        
        <div class="multi-dropdown" class:dd_in>
            <ul class="tabs">
                <li class="select"><a>Select</a></li>
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
    .form-item {
        overflow: initial;
    }
    .tag {
        position:relative;
    }
    .multi-mask {
        background:transparent;
        position:absolute;
        left:0;
        top:0;
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
        height:100vh;
        max-height:0;
        overflow-y:auto;
        transition: all 0.3s ease-out;
    }
    .multi-dropdown.dd_in {
        max-height: 50vh;
        
    }
    .tabs {
        margin-left:16px;
    }
    .tabs li a {
        font-weight: 300;
    }
    .select {
        flex:1;
    }
</style>
