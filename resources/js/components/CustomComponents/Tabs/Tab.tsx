import { router, usePage } from '@inertiajs/react';
import React, { ReactNode, useEffect, useState } from 'react';

interface TabsProps {
    children: React.ReactNode;
    ulProps?: string;
    activeTabClass?: string;
    inactiveTabClass?: string;
    otherclass?: string;
    contentProps?: string;
    liprops?: string;
    spanProps?: string;
    onChange?: (tab: string) => void;
}

const Tabs: React.FC<TabsProps> = ({
    children,
    ulProps = '',
    activeTabClass = '',
    inactiveTabClass = '',
    otherclass = '',
    contentProps = '',
    liprops = '',
    spanProps = '',
    onChange,
}) => {
    const { url } = usePage(); // Get the current URL from Inertia
    const [activeTab, setActiveTab] = useState<number>(0);

    // Extract tab labels and content from children
    const tabs = React.Children.toArray(children) as React.ReactElement<TabProps>[];

    // Update the active tab based on the current URL
    useEffect(() => {
        const activeIndex = tabs.findIndex(tab => tab.props.path === url);
        if (activeIndex !== -1) {
            setActiveTab(activeIndex);
        }
    }, [url, tabs]);

    const handleTabClick = (index: number, path?: string) => {
        setActiveTab(index); // Update active tab
        if (path) {
            router.visit(path); // Navigate to the specified path
        }
        const label = tabs[index].props.label;
        if (label && onChange) {
            onChange(label); // Notify parent component of tab change
        }
    };

    return (
        <>
            <ul className={ulProps}>
                {tabs.map((tab, index) => (
                    <li
                        key={index}
                        onClick={() => handleTabClick(index, tab.props.path)}
                        className={liprops}
                        style={{ cursor: 'pointer' }}
                    >
                        <span
                            className={`${
                                activeTab === index ? activeTabClass : inactiveTabClass
                            } ${otherclass}`}
                        >
                            {tab.props.icon}
                            <span className={spanProps}>{tab.props.label}</span>
                        </span>
                    </li>
                ))}
            </ul>
            <div className={contentProps}>{tabs[activeTab]?.props.children}</div>
        </>
    );
};

interface TabProps {
    label?: string; // The label to display on the tab header
    icon?: ReactNode; // Optional icon
    path?: string; // The path to navigate to when the tab is clicked
    children?: ReactNode; // Content to display when this tab is active
}

const Tab: React.FC<TabProps> = ({ children }) => {
    return <>{children}</>;
};

export { Tab, Tabs };
