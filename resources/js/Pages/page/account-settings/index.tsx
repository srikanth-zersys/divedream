import React from "react";
import { NextPageWithLayout } from "../../../dtos";
import HeadTilte from "../../../components/CommonComponents/HeadTilte";
import Layout from "../../../layout/Layout";
import CommonAccount from "../../../components/AccountSettings";

const AccountSettingPage: NextPageWithLayout = ({user, roles}) => {
    return (
        <React.Fragment>
            <Layout>
                <HeadTilte title="Dashboard" />
                <div className=" gap-x-space pt-5">
                    <CommonAccount UserData={user} RolesData={roles}/>
                </div>
            </Layout>
        </React.Fragment>
    )
}
export default AccountSettingPage