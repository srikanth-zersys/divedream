import React, { ReactNode } from 'react';
import Layout from './Layout';
import NonLayout from './NonLayout';
interface LayoutWrapperProps {
    children: ReactNode; 
    layout?: string;
}

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children, layout }) => {
    if (layout === 'none') {
        return <NonLayout>{children}</NonLayout>; // Use NonLayout for 'none'
    }
    return <Layout>{children}</Layout>; // Use Layout for 'default'
};

export default LayoutWrapper;
