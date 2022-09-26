import { writable } from 'svelte/store';

export const app_data = writable(
   {
		home: {
			name: 'Home',
			key: 'platform',
			icon: 'platform',
			url: 'platform',
			has_ecoid: true,
			has_modules: true,
			modules_to_paint: [],
			modules: [
				{
					name: 'eCourseLibrary',
					icon: 'ecourse_library',
					url: 'platform/ecourse_library'
				},
				{
					name: 'Classroom Training',
					icon: 'classroom',
					url: 'platform/classroom'
				},
				{
					name: 'Webinars',
					icon: 'webinars',
					url: 'platform/webinars'
				},
				{
					name: 'Resources',
					icon: 'resources',
					url: 'platform/resources'
				},
				{
					name: 'Ideas',
					icon: 'ideas_portal',
					url: 'platform/ideas_portal'
				},
				{
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
			modules_to_paint: [], /* actual list based on user type in settings */
			modules: [
				{
					name: 'Incidents',
					icon: 'incidents',
					url: 'ehs/incidents'
				},
				{
					name: 'Actions',
					icon: 'actions',
					url: 'ehs/actions'
				},
				{
					name: 'Audits & Inspections',
					icon: 'audits',
					url: 'ehs/audits'
				},
				{
					name: 'Observation',
					icon: 'observations',
					url: 'ehs/observations'
				},
				{
					name: 'Risk Assessment',
					icon: 'risk_assessment',
					url: 'ehs/risk_assessment'
				},
				{
					name: 'Hazard Assessment',
					icon: 'hazard_assessment',
					url: 'ehs/hazard_assessment'
				},
				{
					recent: true, /* newly purchased or released */
					name: 'Scheduling',
					icon: 'scheduling',
					url: 'ehs/scheduling'
				},
				{
					name: 'Environmental',
					icon: 'epr',
					url: 'ehs/environmental'
				},
				{
					name: 'Period Statistics',
					icon: 'period_statistics',
					url: 'ehs/period_statistics'
				},
				{
					name: 'Register',
					icon: 'register',
					url: 'ehs/register'
				},
				{
					name: 'Advanced RCA',
					icon: 'advanced_rca',
					url: 'ehs/advanced_rca'
				},
				{
					name: 'Documents',
					icon: 'documents',
					url: 'ehs/document'
				},
				{
					name: 'COVID-19 Tracker',
					icon: 'tracker',
					url: 'ehs/tracker'
				},
				{
					name: 'Point of Work',
					icon: 'pow_ra',
					url: 'ehs/pow_ra'
				},
				{
					name: 'Lost Time',
					icon: 'lost_time',
					url: 'ehs/lost_time'
				},
				{
					discover: true,
					name: 'Permit to Work',
					icon: 'permit_to_work',
					url: 'https://www.ecoonline.com/health-and-safety/permit-to-work-software'
				},
				{
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
			modules_to_paint: [], /* actual list based on user type in settings */
			modules: [
				{
					name: 'My Products',
					icon: 'cm',
					url: 'cm/products'
				},
				{
					name: 'Search',
					icon: 'search',
					url: 'cm/search'
				},
				{
					name: 'SDS Requests',
					icon: 'sds_request',
					url: 'cm/sds_request'
				},
				{
					name: 'Locations',
					icon: 'locations',
					url: 'cm/locations'
				},
				{
					name: 'Risk Assessment',
					icon: 'risk_assessment',
					url: 'cm/risk_assessment'
				},
				{
					name: 'Reports',
					icon: 'reports',
					url: 'cm/reports'
				},
				{
					updated: true, /* newly purchased or released */
					name: 'Chemical Approval',
					icon: 'chemical_approval',
					url: 'cm/chemical_approval'
				},
				{
					name: 'Exposures',
					icon: 'exposure_register',
					url: 'cm/exposures'
				},
				{
					name: 'Substitutions',
					icon: 'substitution',
					url: 'cm/substitution'
				},
				{
					name: 'Actions',
					icon: 'actions',
					url: 'cm/actions'
				},
				{
					name: 'Publisher',
					icon: 'sds',
					url: 'cm/publisher'
				},
				{
					name: 'Amounts',
					icon: 'amount',
					url: 'cm/amounts'
				},
				{
					name: 'Smart Forms',
					icon: 'smartforms',
					url: 'cm/smartforms'
				},
				{
					name: 'Workplace Descriptions',
					icon: 'workplace_description',
					url: 'cm/workplace_description'
				},
				{
					name: 'Legislation Lists',
					icon: 'legislation',
					url: 'cm/legislation_lists'
				},
				{
					name: 'Read Links/ QR Codes',
					icon: 'read_link_qr',
					url: 'cm/read_link_qr'
				},
				{
					name: 'Custom Lists',
					icon: 'custom_lists',
					url: 'cm/custom_lists'
				},
				{
					name: 'Reports & Analytics',
					icon: 'analytics',
					url: 'cm/analytics'
				},
				{
					name: 'User Management',
					icon: 'user_management',
					url: 'cm/user_management'
				},
				{
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
			modules: [
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
			]
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
					name: 'My Courses',
					icon: 'classroom',
					url: 'munio/courses'
				},
				{
					name: 'Administration',
					icon: 'administration',
					url: 'munio/administration'
				}
			]
		},
		crisis: {
			name: 'Crisis Manager',
			key: 'crisis',
			icon: 'crisis_manager',
			url: 'crisis',
			has_ecoid: true,
			has_modules: true,
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
			has_ecoid: true,
			has_modules: false, //meaning EcoId hasnt been integrated
			external_login: 'https://staysafeapp.com/en-nz/lone-worker-solution/lone-worker-hub/',
			external_marketing: 'https://www.ecoonline.com/news/ecoonline-acquires-staysafe-a-uk-based-specialist-in-lone-worker-protection',
			show_tennants: true,
			tennants: [],
			modules_to_paint: [], 
			modules: []
		}
    }
);