import React from "react";
import { NextPageWithLayout } from "../../../dtos";
import HeadTilte from "../../../components/CommonComponents/HeadTilte";
import BreadCrumb from "../../../components/CommonComponents/BreadCrumb";
import Layout from "../../../layout/Layout";
import { EditUser } from "../../../components/UserComponent/edit-users";
import { usePage } from "@inertiajs/react";

// Type for the page props
interface PageProps {
    user?: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
        roles: {
            id: number;
            name: string;
        }[];
        status: string;
        role: string;
    };
}

const EditUserPage: NextPageWithLayout = () => {
    // Get user data and other props from Inertia page props
    const { user, roles } = usePage<PageProps>().props;

    return (
        <React.Fragment>
            <HeadTilte title="Edit User" />
            <Layout>
                 <BreadCrumb title="Edit User" subTitle="View Users" backLink="user-management" />
                <div className="max-w-3xl border border-stroke mx-auto bg-white dark:bg-gray-900 dark:border-gray-700 p-6 rounded-lg shadow-1 mt-8">
                    <EditUser
                        userData={
                            user
                                ? {
                                      id: user.id,
                                      name: user.name,
                                      email: user.email,
                                      phone: user.phone,
                                      role:
                                          user.roles && user.roles.length > 0
                                              ? user.roles[0].name
                                              : "",
                                      status: user.status,
                                  }
                                : undefined
                        }

                        rolesData = {roles}
                       
                    />
                </div>
            </Layout>
        </React.Fragment>
    );
};

export default EditUserPage;
