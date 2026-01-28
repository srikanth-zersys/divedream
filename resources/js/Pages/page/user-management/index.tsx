import React from "react";
import { NextPageWithLayout } from "../../../dtos";
import BreadCrumb from "../../../components/CommonComponents/BreadCrumb";
import HeadTilte from "../../../components/CommonComponents/HeadTilte";
import Layout from "../../../layout/Layout";
import ViewUsersComponent from "../../../components/UserComponent/view-users";

interface UserData {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    created_at: string;
}


interface ViewUsersPageProps {
    users: {
        data: UserData[];
        current_page?: number;
        total?: number;
        last_page?: number;
    };

}

// Use the props interface with NextPageWithLayout
const ViewUsersPage: React.FC<ViewUsersPageProps> & NextPageWithLayout = ({
    users
}) => {
    return (
        <React.Fragment>
            <HeadTilte title="User Manager" />
            {/* Breadcrumb for navigation */}
            <BreadCrumb title="User manager" subTitle="Dashboard" backLink="dashboard"/>
            {/* Pass the users data received as props to the component */}
            <ViewUsersComponent
                usersData={users?.data || []}
                // Pass pagination data if needed
                pagination={{
                    currentPage: users?.current_page,
                    total: users?.total,
                    lastPage: users?.last_page,
                }}
            />
        </React.Fragment>
    );
};

// Assign the layout
ViewUsersPage.layout = (page) => <Layout>{page}</Layout>;

export default ViewUsersPage;
