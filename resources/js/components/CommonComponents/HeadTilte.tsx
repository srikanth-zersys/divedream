import React from 'react';

interface headTitle {
    title: string
}

const HeadTilte = ({ title }: headTitle) => {

    const appName = process.env.APP_NAME;

    document.title = `${title} | ${appName}`;

    return (
        <React.Fragment>

        </React.Fragment>
    )
}

export default HeadTilte

