<script>
    export let obj;

    let status_list = {
        "rapid": {
            value: "Quick Report",
            icon: "qr"
        },
        "eco": {
            value: "Desktop",
            icon: "desktop"
        }
    }
</script>
{#if status_list[obj]}
    <span><i class="i-{status_list[obj].icon} i-20"></i> {status_list[obj].value}</span>
{:else}
    ?? {obj}
{/if}

<style>
    span {
        white-space: nowrap;
    }
</style>