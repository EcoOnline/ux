<script>
    export let obj;

    let status_list = {
        "in_progress": {
            value: "In Progress",
            color: "success"
        },
        "awaiting_triage": {
            value: "Awaiting Triage",
            color: "warning"
        },
        "awaiting_investigation": {
            value: "Awaiting Investigation",
            color: "critical"
        }
    }
</script>
{#if status_list[obj]}
    <span class="badge {status_list[obj].color}">{status_list[obj].value}</span>
{:else}
    <span class="badge unknown">{obj}</span>
{/if}

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
        white-space: nowrap;
    }
    .badge.success {
        background-color: var(--eo-secondary-500);
        color:var(--black);
    }
    .badge.warning {
        background-color: var(--eo-warning-500);
        color:var(--black);
    }
    .badge.critical {
        background-color: var(--eo-critical-500);
        color:#fff;
    }
</style>