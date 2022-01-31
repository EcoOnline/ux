<script>

    export let obj; //assumes this is a date string

    let str = JSON.parse(JSON.stringify(obj));
    
    $: formatted = (new Date(obj + '')).toLocaleString([], {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'});

</script>
<span title="UTC: {obj}">{formatted}</span>
