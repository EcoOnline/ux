<script>
	export let t = {
		title: '',
		data: {
			conent: '-'
		}
	}
</script>
<h4>{t.title}</h4>
<h1>{t.data.content}</h1>

<style>
	h1 {
		color: var(--eo-primary-500);
	}
</style>