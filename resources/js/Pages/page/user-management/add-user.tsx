import React from "react";
import { NextPageWithLayout } from "../../../dtos";
import BreadCrumb from "../../../components/CommonComponents/BreadCrumb";
import HeadTilte from "../../../components/CommonComponents/HeadTilte";
import Layout from "../../../layout/Layout";
import AddUsers from "../../../components/UserComponent/add-users";

const AddUsersPage: NextPageWithLayout = () => {
    return (
        <React.Fragment>
            <HeadTilte title="Add User" />
            <Layout>
                <BreadCrumb title="Add User" subTitle="View Users" backLink="user-management" />
                <div className="max-w-3xl border border-stroke mx-auto bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white p-6 rounded-lg shadow-1 mt-8">
                    <AddUsers  />
                </div>
            </Layout>
        </React.Fragment>
    );
};
export default AddUsersPage;
