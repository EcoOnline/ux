<script>
	export let t = {
		title: 'Big Number',
		data: {
			content: '-',
            status: 'critical'
		}
	}
</script>


<div class="card card-31">
    <div class="card-header">{t.title}<a href="/" class="i-pin i-20 btn-right" on:click|preventDefault="{ () => { pin_module(t.title)}}"> </a></div>
    <div class="card-body">
        <div class="big-num {t.data.status}">{t.data.content}</div>
    </div>
</div>

<style>
    .big-num { color: var(--eo-primary-500); }
	.big-num.critical { color: var(--eo-critical-500); }
	.big-num.minor { color: var(--eo-border-input); }
	
</style>