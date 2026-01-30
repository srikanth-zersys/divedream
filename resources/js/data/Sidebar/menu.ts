import { MegaMenu } from "../../dtos";

const menu: MegaMenu[] = [
    {
        title: "Dashboard",
        icon: "gauge",
        link: "/dashboard",
        separator: false,
        children: []
    },
    {
        title: "Bookings",
        icon: "calendar-check",
        link: "/admin/bookings",
        separator: false,
        children: [
            { title: "All Bookings", link: "/admin/bookings" },
            { title: "Calendar", link: "/admin/bookings/calendar" },
            { title: "Create Booking", link: "/admin/bookings/create" },
        ]
    },
    {
        title: "Schedules",
        icon: "calendar-days",
        link: "/admin/schedules",
        separator: false,
        children: [
            { title: "All Schedules", link: "/admin/schedules" },
            { title: "Calendar", link: "/admin/schedules/calendar" },
            { title: "Create Schedule", link: "/admin/schedules/create" },
        ]
    },
    {
        title: "Quotes",
        icon: "file-text",
        link: "/admin/quotes",
        separator: false,
        children: [
            { title: "All Quotes", link: "/admin/quotes" },
            { title: "Create Quote", link: "/admin/quotes/create" },
        ]
    },
    {
        title: "Products",
        icon: "package",
        link: "/admin/products",
        separator: true,
        children: [
            { title: "All Products", link: "/admin/products" },
            { title: "Create Product", link: "/admin/products/create" },
        ]
    },
    {
        title: "Members",
        icon: "users",
        link: "/admin/members",
        separator: false,
        children: [
            { title: "All Members", link: "/admin/members" },
            { title: "Create Member", link: "/admin/members/create" },
        ]
    },
    {
        title: "Instructors",
        icon: "user-cog",
        link: "/admin/instructors",
        separator: false,
        children: [
            { title: "All Instructors", link: "/admin/instructors" },
            { title: "Create Instructor", link: "/admin/instructors/create" },
        ]
    },
    {
        title: "Equipment",
        icon: "wrench",
        link: "/admin/equipment",
        separator: false,
        children: [
            { title: "All Equipment", link: "/admin/equipment" },
            { title: "Create Equipment", link: "/admin/equipment/create" },
            { title: "Maintenance", link: "/admin/equipment?filter=maintenance" },
        ]
    },
    {
        title: "Locations",
        icon: "map-pin",
        link: "/admin/locations",
        separator: true,
        children: [
            { title: "All Locations", link: "/admin/locations" },
            { title: "Create Location", link: "/admin/locations/create" },
        ]
    },
    {
        title: "Waivers",
        icon: "file-signature",
        link: "/admin/waivers",
        separator: false,
        children: [
            { title: "All Waivers", link: "/admin/waivers" },
            { title: "Create Waiver", link: "/admin/waivers/create" },
        ]
    },
    {
        title: "Reports",
        icon: "bar-chart-2",
        link: "/admin/reports",
        separator: false,
        children: [
            { title: "Overview", link: "/admin/reports" },
            { title: "Revenue", link: "/admin/reports/revenue" },
            { title: "Bookings", link: "/admin/reports/bookings" },
            { title: "Members", link: "/admin/reports/members" },
            { title: "Instructors", link: "/admin/reports/instructors" },
            { title: "Equipment", link: "/admin/reports/equipment" },
        ]
    },
    {
        title: "Settings",
        icon: "settings",
        link: "/admin/settings",
        separator: true,
        children: [
            { title: "General", link: "/admin/settings/general" },
            { title: "Branding", link: "/admin/settings/branding" },
            { title: "Booking Rules", link: "/admin/settings/booking" },
            { title: "Notifications", link: "/admin/settings/notifications" },
            { title: "Payments", link: "/admin/settings/payments" },
            { title: "Team", link: "/admin/settings/team" },
            { title: "Email", link: "/admin/settings/email" },
            { title: "Billing", link: "/admin/settings/billing" },
        ]
    },
];

export { menu };
