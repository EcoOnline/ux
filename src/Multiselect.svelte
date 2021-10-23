<script>

	import Items from "./Multiselect-item.svelte";

	/* 
		level doesnt necessarily correspond to depth in hierarchy
	*/
	let maxW = 480;
	$: indent = Math.ceil(maxW/20);

	let src = [
		{
			name: "England",
			level: 1,
			checked: false,
			disabled: false,
			permission: false,

			children: [
				{
					name: "Manchester",
					level: 2,
					checked: false,
					disabled: false,
					permission: true,
					children: [
						{
							name: "Office",
							level: 3,
							checked: false,
							disabled: false,
							permission: true,
							children: [
								
								{
									name: "Floor 1",
									level: 4,
									checked: false,
									disabled: false,
									permission: true,
									children: [
										
									]
								},
								{
									name: "Basement",
									level: 4,
									checked: false,
									disabled: false,
									permission: true,
									children: [
										
									]
								}
							]
						},
						{
							name: "Warehouse",
							level: 3,
							checked: false,
							disabled: false,
							permission: true,
							children: [
								
							]
						}
					]

				},
				{
					name: "Liverpool",
					level: 2,
					checked: false,
					disabled: false,
					permission: true,
					children: [
						{
							name: "Office",
							level: 3,
							checked: false,
							disabled: false,
							permission: true,
							children: [
								
								{
									name: "Floor 1",
									level: 4,
									checked: false,
									disabled: false,
									permission: true,
									children: [
										
									]
								},
								{
									name: "Basement",
									level: 4,
									checked: false,
									disabled: false,
									permission: true,
									children: [
										
									]
								}
							]
						},
						{
							name: "Warehouse",
							level: 3,
							checked: false,
							disabled: false,
							permission: true,
							children: [
								
							]
						}
					]

				},
				{
					name: "Head Office",
					level: 3,
					checked: false,
					disabled: false,
					permission: true,
					children: [
						
					]

				},
			]

		}

	]
	let thumb_type = thumb_types[0];

	$: src_filtered = src.filter( (item) => {
		return item.name !== '';
	}).sort( function(a,b) {
		return a.name.toLowerCase() < b.name.toLowerCase();
	})

</script>


<div class="page">
	<div class="dropdown">
		<div class="dropdown-item">
			special
		</div>
		<Items items={src_filtered} indent=0></Items>)
	</div>
</div>
