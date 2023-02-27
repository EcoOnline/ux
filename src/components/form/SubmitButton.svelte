<script>

    export let channel = 'ANSWER';
    export let f;
</script>
<div class="form-item">
    <div class='btn' on:click={ () => { alert('Submitted. Task Done.')}}>{f.label ? f.label : 'Submit'}</div>
</div>