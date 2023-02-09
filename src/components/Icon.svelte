<script>
    import { onMount } from "svelte";
    export let key = 'admin_bw';
    export let size = 24;
    let shell;
    let url = 'https://cdn.ecoonline.com/assets/icons/' + key + '.svg';
    let icon = '';
    onMount(async function () {
        const response = await fetch(url);
        if(response.status == 200) {
            icon = await response.text();
            setTimeout(() => {
                let svg = shell.querySelector('svg');
                svg.classList.add(key);
                svg.setAttribute('width', size + 'px');
                svg.setAttribute('height', size + 'px');
            },10)
        }
    });
</script>
<span bind:this={shell}>{@html icon}</span>