import React, { useEffect, useState } from 'react'
import { Link } from '@inertiajs/react';

interface BreadcrumbItems {
    title?: string;
    subTitle: string;
    backLink?: string;
}

const BreadCrumb = ({ title, subTitle, backLink }: BreadcrumbItems) => {

    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        setHydrated(true);  // Ensures that hydration is completed
    }, []);

    if (!hydrated) {
        return null; // Prevent render until hydrated
    }
    return (
        <React.Fragment>

            <div className="flex-col items-start gap-1 page-heading sm:flex-row sm:items-center border-b border-gray-200 dark:border-dark-900 pb-4">
                <h3 className="grow group-data-[nav-type=pattern]:text-white dark:text-white">{title}</h3>
                <ul className="breadcrumb *:before:content-['\EA6E'] dark:text-white">
                    <li className="breadcrumb-item dark:text-white"><Link href={`/${backLink}`}>{subTitle}</Link></li>
                    <li className="breadcrumb-item active dark:text-white">{title}</li>
                </ul>
            </div>
        </React.Fragment>
    )
}

export default BreadCrumb
