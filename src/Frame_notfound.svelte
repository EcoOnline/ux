<script>

    //temp to show app / module
    let app = 'platform';
	let module = false;
    let title='404'

    $: {
        let a = app;
        let m = module;
        title = name[window.location.hash.substring(1).replace(/\//gi, '_')] || '404';
    }

	function set_app_module() {
		let hash = window.location.hash;
        console.log('HASH', hash);
        if(hash) {
            let h = hash.substring(1);
            let h_arr = h.split('/');
            app = h_arr[0];
            if(h_arr[1]) {
                module = h_arr[1];
            } else {
                module = false;
            }
        }
		
	}
	set_app_module();


    let name = {
        cm: "Chemical Manager",
        cm_products: 'My Products',
        cm_search: 'Search',
        cm_sds_request: 'SDS Requests',
        cm_locations: 'Locations',
        cm_risk_assessment: 'Risk Assessment',
        cm_reports: 'Reports',
        cm_chemical_approval: 'Chemical Approval',
        cm_exposures: 'Exposures',
        cm_substitution: 'Substitutions',
        cm_actions: 'Actions',
        cm_publisher: 'Publisher',
        cm_amounts: 'Amounts',
        cm_smartforms: 'Smart Forms',
        cm_workplace_description: 'Workplace Descriptions',
        cm_legislation_lists: 'Legislation Lists',
        cm_read_link_qr: 'Read Links/ QR Codes',
        cm_custom_lists: 'Custom Lists',
        cm_analytics: 'Reports & Analytics',
        cm_user_management: 'User Management',
        cm_administration: 'Administration',
        almego: "Almego",
        munio: "Munio Learning",
    }

</script>

<svelte:window on:hashchange={set_app_module}/>
<h1>{title}</h1>
<p>(This page has not been simulated)</p>

