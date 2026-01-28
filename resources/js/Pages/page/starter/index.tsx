import React from 'react'
import { NextPageWithLayout } from '../../../dtos';
import BreadCrumb from '../../../components/CommonComponents/BreadCrumb';
import HeadTilte from '../../../components/CommonComponents/HeadTilte';
import Layout from '../../../layout/Layout';

const Starter: NextPageWithLayout = () => {


    return (
        <React.Fragment>
            <Layout>
                <HeadTilte title='Starter' />
                <BreadCrumb title='Starter' subTitle='UI' />
            </Layout>
        </React.Fragment>
    )
}
export default Starter
