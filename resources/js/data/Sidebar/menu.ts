import { MegaMenu } from "../../dtos";

const menu : MegaMenu[] = [
    {
        title: "Dashboard",
        icon: "gauge",
        link: "/dashboard",
        separator: false,
        children: [
        ]
    },
    {
        title: "User Manager",
        icon: "users",
        link: route('users.index'),
        separator: false,
        children: [
        ]
    }
];

export { menu };
