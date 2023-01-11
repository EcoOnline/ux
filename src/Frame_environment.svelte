<script>
    import BC from './components/Breadcrumb.svelte';

    let bc_array = [
            {text: 'Environment', url: '#env'},
            {text: 'Greenhouse Gas', url: '#env/greenhouse'},
            {text: 'Sites', url: '#env/greenhouse/sites'},
            {text: 'SE Head Office', url: '#env/greenhouse/sites/123'},
            {text: 'Business trips by train', url: '#env/greenhouse/sites/123/456'},
            {text: '1-Jul-2023'}
    ]


</script>

<div class="row sticky">
    <div class="col12">
        <BC {bc_array}></BC>
    </div>
</div>

<br>
<h1 class="page-title"><i class="i-epr i-32"></i>Environment</h1>

