<script>
    export let obj;

    let status_list = {
        "in_progress": {
            value: "In Progress",
            color: "success"
        }
    }
</script>

<span class="badge {status_list[obj].color}">{status_list[obj].value}</span>

<style>
    .badge {
        font-weight:bold;
        font-size:11px;
        line-height: 12px;
        text-transform: uppercase ;
        padding:2.5px 8px;
        background-color: var(--eo-border);
        color: var(--eo-border-input);
        border-radius:4px;
    }
    .badge.success {
        background-color: var(--eo-secondary-500);
        color:#fff;
    }
</style>