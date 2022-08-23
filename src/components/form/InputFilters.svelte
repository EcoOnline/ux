<script>
import Date from "../table/Date.svelte";

    export let f;
    export let channel;


	import InputCheckbox from "./InputCheckbox.svelte";
	import InputDate from "./InputDate.svelte";
	import InputLookup from "./InputLookup.svelte";
	import InputMatrix from "./InputMatrix.svelte";
	import InputMulti from "./InputMulti.svelte";
    import InputSelect from "./InputSelect.svelte";
	import InputSwitch from "./InputSwitch.svelte";
	import InputText from "./InputText.svelte";

    let components = {
		"input_checkbox": InputCheckbox,
		"input_date": InputDate,
		"input_lookup": InputLookup,
		"input_matrix": InputMatrix,
		"input_multi": InputMulti,
		"input_select": InputSelect,
		"input_switch": InputSwitch,
		"input_text": InputText,
    }
     
    let filter_arr = [
        
    ];

    let can_add_filter_condition = false;
    $: {
        can_add_filter_condition = filter_arr.filter( (c) => { return c.category.type}).length == filter_arr.length;
    }
    

    function add_condition() {
        filter_arr.push({
            category: {},
            statement: {},
            value: '',
            statement_options: []
        });
        filter_arr = filter_arr;
    }
    
    function change_condition(condition) {
        let t = condition.category.type;
        
        switch(t) {
            case 'channel_select': condition.statement_options = [
                {value: 'is', text: "is", input: {
                    item_type: "input_select",
                    id: "filter_channel",
                    label: false,
                    options: [
                        { "value": 1, "text": "Quick Report"},
                        { "value": 2, "text": "Desktop"},
                        { "value": 3, "text": "Mobile"},
                        { "value": 4, "text": "Whatsapp"},
                    ],
                    answer: ""
                }},
                {value: 'isnt', text: "is not", input: {
                    item_type: "input_select",
                    id: "filter_channel",
                    label: false,
                    options: [
                        { "value": 1, "text": "Quick Report"},
                        { "value": 2, "text": "Desktop"},
                        { "value": 3, "text": "Mobile"},
                        { "value": 4, "text": "Whatsapp"},
                    ],
                    answer: ''
                }},
            ];break;


            case 'date': condition.statement_options = [
                {value: 'less_than', text: "is before", input: {
                    item_type: "input_date",
                    id: "filter_date",
                    optional: false,
                    hint: false,
                    answer: ''
                    
                }},
                {value: 'greater_than', text: "is after", input: {
                    item_type: "input_date2",
                    id: "filter_date",
                    optional: false,
                    hint: false,
                    answer: ''
                }},
            ];break;

            case 'text': condition.statement_options = [
                {value: 'contains', text: "contains", input: {
                    item_type: "input_text",
                    id: "filter_text",
                    optional: false,
                    hint: false,
                    placeholder: "Enter part of text",
                    answer: ""
                }},
                {value: 'is', text: "is", input: {
                    item_type: "input_text",
                    id: "filter_text",
                    optional: false,
                    hint: false,
                    placeholder: "Enter exact text",
                    answer: ""
                }}
            ];break;
            
            default: condition.statement_options = [
                {value: 'is', text: "is", input: {
                    item_type: "input_text",
                    optional: false,
                    hint: false,
                    answer: "wtf"
                }},];break;


        }
        condition.statement = condition.statement_options[0];
        filter_arr = filter_arr;
    }


    //(new Date()).toLocaleDateString('en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })
    add_condition();


</script>


<div class="form-item">
    {#if f.label}
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label>{f.label}</label>
    {/if}
    {#if f.hint}
        <p>{f.hint}</p>
    {/if}
    {#each filter_arr as condition, filter_index}

        <div class='filter-row'>
            <div class='filter-col-condition'>
                <!-- svelte-ignore a11y-no-onchange -->
                <select class="form-control"bind:value="{condition.category}" on:change={ () => { change_condition(condition)}}>
                    {#each f.options as option}
                        <option value="{option}">{option.text}</option>
                    {/each}
                </select>
            </div>


            {#if condition.statement_options.length}
                <div class='filter-col-statement'>

                    <select class="form-control" bind:value="{condition.statement}">
                        {#each condition.statement_options as statement_option}
                            <option value="{statement_option}">{statement_option.text}</option>
                        {/each}
                    </select>
                </div>

                <div class='filter-col-value'>
                    {#if components[condition.statement.input.item_type]}
                        <svelte:component this={components[condition.statement.input.item_type]} f={condition.statement.input} {channel}/>
                    {:else}
                        Unknown  <b>{condition.statement.input.item_type}</b> on InputFilters.svelte.
                    {/if}   
                </div>
                
            {/if}
            
        </div>
        {#if filter_index < filter_arr.length -1}
        <p>AND</p>
        {/if}
    {/each}
    {#if can_add_filter_condition}
        <a href="#" on:click|preventDefault="{add_condition}" class='btn btn-secondary'>And...</a>
    {/if}
    
    
</div>

<style>
    .filter-row {
        display: flex;
        flex-direction: row;
        margin-bottom:8px;
    }
    .filter-col-condition {
        width:200px;
        padding-right:8px;
    }
    .filter-col-statement {
        width:140px;
        padding-right:8px;
    }
</style>