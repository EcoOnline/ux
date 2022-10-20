<script>
    import { onMount } from 'svelte';
    import BigNumber from '../cards/BigNumber.svelte';
    import Channel from '../table/Channel.svelte';
    export let f;
    let repeat = 5;
    let top = '8px';
    let transition = 'none';

    function select() {
        let r = Math.floor(Math.random() * f.options.length);

        let index = (repeat-1) * f.options.length;
        top = '8px';
        transition = 'none';
        setTimeout(() => {
            transition = 'top 5s ease-out';
            top = (index + r) * -40 + 8 + 'px'; //40 = height of each element
        },50)

    }

</script>


<div class="form-item">
    {#if f.label}
        <label for="{f.id}">{f.label} {#if f.optional}<span class="optional">(Optional)</span>{/if}</label>
    {/if}
    {#if f.hint}
        <p>{f.hint}</p>
    {/if}
    {#if f.readonly}
        <div class='readonly'>{f.answer}</div>
    {:else}
        <div class="form-control">
            <ul style="top:{top};transition:{transition}">
                {#each Array(5) as num}
                    {#each f.options as option}
                        <li>{option.text}</li>
                    {/each}
                {/each}
            </ul>
        </div>

        <div class='btn' on:click={select}>Spin</div>
    {/if}


</div>





<style>
.form-control {
    height:40px;
    overflow: hidden;
    position: relative;
    display: inline-block;
    vertical-align: middle;
}

ul {
    margin:0;
    padding:0;
    position:absolute;
    display: flex;
    flex-direction: column;
}
ul li {
    height: 40px;
}



</style>