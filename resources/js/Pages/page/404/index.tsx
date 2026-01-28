import React from 'react';
import FourZeroFour from '../../../components/CommonComponents/FourZeroFour';
import HeadTilte from '../../../components/CommonComponents/HeadTilte';
import { NextPageWithLayout } from '../../../dtos';

const PageNotFoundError : NextPageWithLayout = () => {

    return (
        <React.Fragment>
            
            <HeadTilte title='404'/>
            {/* page not found */}
            <FourZeroFour />

        </React.Fragment>
    )
}
export default PageNotFoundError;
