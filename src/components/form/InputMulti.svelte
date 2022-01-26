<script>
    import { onMount} from 'svelte';
    export let f;

    let item = false;
    let selected = [];
    let selected_shortlist = [];

    function tree_selected(arr) {
        let temp_selected = []
        arr.forEach( (option) => {

            if(option.selected) {
                temp_selected.push(option)
            }
            if(option.children && option.children.length){
                temp_selected = [...temp_selected, ...tree_selected(option.children)]
            }
        })
        return temp_selected;
    }
    $: {
        selected = tree_selected(f.options);
        console.log('selected!!', selected);
    }

    onMount(() => {
		console.log("item", item.offsetWidth);

        
	})
</script>


<div class="form-item" bind:this="{item}">
    {#if f.label}
        <label for="{f.id}">{f.label}</label>
    {/if}
    {#if f.hint}
        <p>{f.hint}</p>
    {/if}
    {#if selected.length}
        {#each selected_shortlist as tag}
            tag
        {/each}
    {/if}
    <input id="{f.id}" bind:value="{f.answer}" type="text" placeholder="{f.placeholder ? f.placeholder : ''}" class="form-control">
    multiiii
</div>
