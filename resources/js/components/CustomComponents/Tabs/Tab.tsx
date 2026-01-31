import { router, usePage } from '@inertiajs/react';
import React, { ReactNode, useCallback, useEffect, useId, useState } from 'react';

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
    /** Accessible label for the tab list */
    ariaLabel?: string;
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
    ariaLabel = 'Tabs',
}) => {
    const { url } = usePage(); // Get the current URL from Inertia
    const [activeTab, setActiveTab] = useState<number>(0);
    const baseId = useId();

    // Extract tab labels and content from children
    const tabs = React.Children.toArray(children) as React.ReactElement<TabProps>[];

    // Update the active tab based on the current URL
    useEffect(() => {
        const activeIndex = tabs.findIndex(tab => tab.props.path === url);
        if (activeIndex !== -1) {
            setActiveTab(activeIndex);
        }
    }, [url, tabs]);

    const handleTabClick = useCallback((index: number, path?: string) => {
        setActiveTab(index); // Update active tab
        if (path) {
            router.visit(path); // Navigate to the specified path
        }
        const label = tabs[index].props.label;
        if (label && onChange) {
            onChange(label); // Notify parent component of tab change
        }
    }, [tabs, onChange]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
        let newIndex = index;

        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                newIndex = index === 0 ? tabs.length - 1 : index - 1;
                break;
            case 'ArrowRight':
                e.preventDefault();
                newIndex = index === tabs.length - 1 ? 0 : index + 1;
                break;
            case 'Home':
                e.preventDefault();
                newIndex = 0;
                break;
            case 'End':
                e.preventDefault();
                newIndex = tabs.length - 1;
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                handleTabClick(index, tabs[index].props.path);
                return;
            default:
                return;
        }

        // Focus the new tab
        const tabElement = document.getElementById(`${baseId}-tab-${newIndex}`);
        tabElement?.focus();
    }, [tabs, handleTabClick, baseId]);

    const getTabId = (index: number) => `${baseId}-tab-${index}`;
    const getPanelId = (index: number) => `${baseId}-panel-${index}`;

    return (
        <>
            {/* Tab list with proper ARIA roles */}
            <ul className={ulProps} role="tablist" aria-label={ariaLabel}>
                {tabs.map((tab, index) => (
                    <li
                        key={index}
                        role="presentation"
                        className={liprops}
                    >
                        <button
                            id={getTabId(index)}
                            role="tab"
                            type="button"
                            aria-selected={activeTab === index}
                            aria-controls={getPanelId(index)}
                            tabIndex={activeTab === index ? 0 : -1}
                            onClick={() => handleTabClick(index, tab.props.path)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            className={`${
                                activeTab === index ? activeTabClass : inactiveTabClass
                            } ${otherclass}`}
                            style={{ cursor: 'pointer', background: 'none', border: 'none' }}
                        >
                            {tab.props.icon}
                            <span className={spanProps}>{tab.props.label}</span>
                        </button>
                    </li>
                ))}
            </ul>
            {/* Tab panel with proper ARIA roles */}
            <div
                id={getPanelId(activeTab)}
                role="tabpanel"
                aria-labelledby={getTabId(activeTab)}
                tabIndex={0}
                className={contentProps}
            >
                {tabs[activeTab]?.props.children}
            </div>
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
