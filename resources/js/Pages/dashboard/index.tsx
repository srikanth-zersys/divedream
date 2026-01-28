
import React from "react";
import { NextPageWithLayout } from "../../../dtos";
import UserData from "../../../views/dashboard/userData";
import Widgets from "../../../views/dashboard/widgets";
import HeadTilte from "../../components/CommonComponents/HeadTilte";
import Layout from "../../layout/Layout";

const CRM: NextPageWithLayout = () => {

    return (
        <React.Fragment>
            <Layout>
                <HeadTilte title="Dashboard" />
                <div className="grid grid-cols-12 gap-x-space pt-5">
                    <Widgets />
                    <UserData />
                </div>
            </Layout>
        </React.Fragment>
    )
}
export default CRM
