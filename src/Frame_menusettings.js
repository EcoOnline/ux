import { writable } from 'svelte/store';

export const config = writable({
	apps: ['home','ehs', 'cm'],
	user_level: 'admin',
	multi_tennant: false,
	view_mode: 'tabbed',
	menu_hover: false,
	menu_hover_item: false,
	menu_hover_icon: 'bento',
	hide_headers: false,
	menu_upsell: true,
	svg_show: false,
	toggle_view: true,
	sort_view: false,
	filter_view: false,
	action_dd: false,
	sort_key: 'default',
	anim_dd_grow: false,
	anim_navi_grow: false,
	anim_navi_wave: false,
	nav_to_hub:true //when given context go to app hub page (false should take you to platform with app preselected)
});



/*
	app has modules 									HOME EHS CS MUNIO
	app has no modules									CRISIS
	app has modules but you have no permission			ALMEGO
	app not integrated									STAY SAFE

*/
export let favourites = writable([]);
export const app_data = writable({
	home: {
		name: 'Home',
		key: 'home',
		icon: 'platform',
		url: 'home',
		has_ecoid: true,
		has_modules: true,
		modules_to_paint: [],
		modules: [
			{
				id: '1_1',
				name: 'eCourseLibrary',
				icon: 'ecourse_library',
				url: 'platform/ecourse_library'
			},
			{
				id: '1_2',
				name: 'Classroom Training',
				icon: 'classroom',
				url: 'platform/classroom'
			},
			{
				id: '1_3',
				name: 'Webinars',
				icon: 'webinars',
				url: 'platform/webinars'
			},
			{
				id: '1_4',
				name: 'Resources',
				icon: 'resources',
				url: 'platform/resources'
			},
			{
				id: '1_5',
				name: 'Ideas',
				icon: 'ideas_portal',
				url: 'platform/ideas_portal'
			},
			{
				id: '1_6',
				name: 'Contact Us',
				icon: 'mail',
				url: 'platform/mail'
			}
		]
	},
	ehs: {
		name: 'EcoOnline EHS',
		key: 'ehs',
		icon: 'ehs',
		url: 'ehs',
		has_ecoid: true,
		has_modules: true,
		show_tennants: true,
		tennants: ["Production", "Testing"],
		modules_to_paint: [], 
		modules: [
			{
				id: '2_1',
				name: 'Incidents',
				icon: 'incidents',
				url: 'ehs/incidents'
			},
			{
				id: '2_2',
				name: 'Actions',
				icon: 'actions',
				url: 'ehs/actions'
			},
			{
				id: '2_3',
				name: 'Audits & Inspections',
				icon: 'audits',
				url: 'ehs/audits'
			},
			{
				id: '2_4',
				name: 'Observation',
				icon: 'observations',
				url: 'ehs/observations'
			},
			{
				id: '2_5',
				name: 'Risk Assessment',
				icon: 'risk_assessment',
				url: 'ehs/risk_assessment'
			},
			{
				id: '2_6',
				name: 'Hazard Assessment',
				icon: 'hazard_assessment',
				url: 'ehs/hazard_assessment'
			},
			{
				recent: true, 
				id: '2_7',
				name: 'Scheduling',
				icon: 'scheduling',
				url: 'ehs/scheduling'
			},
			{
				id: '2_8',
				name: 'Environmental',
				icon: 'epr',
				url: 'ehs/environmental'
			},
			{
				id: '2_9',
				name: 'Period Statistics',
				icon: 'period_statistics',
				url: 'ehs/period_statistics'
			},
			{
				id: '2_10',
				name: 'Register',
				icon: 'register',
				url: 'ehs/register'
			},
			{
				id: '2_11',
				name: 'Advanced RCA',
				icon: 'advanced_rca',
				url: 'ehs/advanced_rca'
			},
			{
				id: '2_12',
				name: 'Documents',
				icon: 'documents',
				url: 'ehs/document'
			},
			{
				id: '2_13',
				name: 'COVID-19 Tracker',
				icon: 'tracker',
				url: 'ehs/tracker'
			},
			{
				id: '2_14',
				name: 'Point of Work',
				icon: 'pow_ra',
				url: 'ehs/pow_ra'
			},
			{
				id: '2_15',
				name: 'Lost Time',
				icon: 'lost_time',
				url: 'ehs/lost_time'
			},
			{
				discover: true,
				id: '2_16',
				name: 'Permit to Work',
				icon: 'permit_to_work',
				url: 'https://www.ecoonline.com/health-and-safety/permit-to-work-software'
			},
			{
				id: '2_17',
				name: 'Administration',
				icon: 'administration',
				url: 'ehs/administration'
			}
		]
	},
	cm: {
		name: 'Chemical Manager',
		key: 'cm',
		icon: 'cm',
		url: 'cm',
		has_ecoid: true,
		has_modules: true,
		show_tennants: true,
		tennants: ["Big Company", "Little Company"],
		modules_to_paint: [], 
		modules: [
			{
				id: '3_1',
				name: 'My Products',
				icon: 'cm',
				url: 'cm/products'
			},
			{
				id: '3_2',
				name: 'Search',
				icon: 'search',
				url: 'cm/search'
			},
			{
				id: '3_3',
				name: 'SDS Requests',
				icon: 'sds_request',
				url: 'cm/sds_request'
			},
			{
				id: '3_4',
				name: 'Locations',
				icon: 'locations',
				url: 'cm/locations'
			},
			{
				id: '3_5',
				name: 'Risk Assessment',
				icon: 'risk_assessment',
				url: 'cm/risk_assessment'
			},
			{
				id: '3_6',
				name: 'Reports',
				icon: 'reports',
				url: 'cm/reports'
			},
			{
				updated: true, 
				id: '3_7',
				name: 'Chemical Approval',
				icon: 'chemical_approval',
				url: 'cm/chemical_approval'
			},
			{
				id: '3_8',
				name: 'Exposures',
				icon: 'exposure_register',
				url: 'cm/exposures'
			},
			{
				id: '3_9',
				name: 'Substitutions',
				icon: 'substitution',
				url: 'cm/substitution'
			},
			{
				id: '3_10',
				name: 'Actions',
				icon: 'actions',
				url: 'cm/actions'
			},
			{
				id: '3_11',
				name: 'Publisher',
				icon: 'sds',
				url: 'cm/publisher'
			},
			{
				id: '3_12',
				name: 'Amounts',
				icon: 'amount',
				url: 'cm/amounts'
			},
			{
				id: '3_13',
				name: 'Smart Forms',
				icon: 'smartforms',
				url: 'cm/smartforms'
			},
			{
				id: '3_1',
				name: 'Workplace Descriptions',
				icon: 'workplace_description',
				url: 'cm/workplace_description'
			},
			{
				id: '3_14',
				name: 'Legislation Lists',
				icon: 'legislation',
				url: 'cm/legislation_lists'
			},
			{
				id: '3_15',
				name: 'Read Links/ QR Codes',
				icon: 'read_link_qr',
				url: 'cm/read_link_qr'
			},
			{
				id: '3_16',
				name: 'Custom Lists',
				icon: 'custom_lists',
				url: 'cm/custom_lists'
			},
			{
				id: '3_17',
				name: 'Reports & Analytics',
				icon: 'analytics',
				url: 'cm/analytics'
			},
			{
				id: '3_18',
				name: 'User Management',
				icon: 'user_management',
				url: 'cm/user_management'
			},
			{
				id: '3_19',
				name: 'Administration',
				icon: 'administration',
				url: 'cm/administration'
			}
		]
	},
	almego: {
		name: 'Almego',
		key: 'almego',
		icon: 'sds',
		url: 'almego',
		has_ecoid: true,
		has_modules: true,
		show_tennants: false,
		tennants: false,
		modules_to_paint: [],
		modules: []
	},
	munio: {
		name: 'Munio Learning',
		key: 'munio',
		icon: 'training',
		url: 'munio',
		has_ecoid: true,
		has_modules: true,
		show_tennants: true,
		tennants: [],
		modules_to_paint: [], 
		modules: [
			{
				id: '4_1',
				name: 'My Courses',
				icon: 'classroom',
				tip: 'One location for all your learning',
				url: 'munio/courses'
			},
			{
				id: '4_2',
				name: 'Administration',
				icon: 'administration',
				tip: 'Set up all your organisational learning',
				url: 'munio/administration'
			}
		]
	},
	crisis: {
		name: 'Crisis Manager',
		tip: 'Be prepared for any event with digital crisis management',
		key: 'crisis',
		icon: 'crisis_manager',
		url: 'crisis',
		has_ecoid: true,
		has_modules: false,
		show_tennants: true,
		tennants: [],
		modules_to_paint: [],
		modules: []
	},
	staysafe: {
		name: 'StaySafe',
		key: 'staysafe',
		icon: 'locations',
		url: 'staysafe',
		has_ecoid: false, //meaning EcoId hasnt been integrated
		has_modules: false, 
		external_login: 'https://staysafeapp.com/en-nz/lone-worker-solution/lone-worker-hub/',
		external_marketing: 'https://www.ecoonline.com/news/ecoonline-acquires-staysafe-a-uk-based-specialist-in-lone-worker-protection',
		show_tennants: true,
		tennants: [],
		modules_to_paint: [], 
		modules: []
	}
});

//hacks for app settings
export const slices = writable({
	ehs: {
		basic: [0,5],
		multi: [0,10],
		admin: [0],
		changing_tennant: false
	},
	cm: {
		basic: [0,10],
		multi: [0,-3],
		admin: [0],
		changing_tennant: false
	},
	munio: {
		basic: [0,-1],
		multi: [0,-1],
		admin: [0],
		changing_tennant: false
	}
});

/* almego modules
{
				name: 'Documents',
				icon: 'documents',
				url: 'almego/document'
			},
			{
				name: 'Reports',
				icon: 'reports',
				url: 'almego/reports'
			},
			{
				name: 'Administration',
				icon: 'administration',
				url: 'almego/administration'
			}
*/