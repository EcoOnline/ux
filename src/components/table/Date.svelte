
<script>
    export let obj; //assumes this is a date string

    let str = '';
    try {
        let d = new Date(obj);
        str = d.toLocaleString();
    } catch (error) {
        str = obj;
    }
</script>
{str}
