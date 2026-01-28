import React, { useEffect } from 'react';

interface NonLayoutProps {
  children: React.ReactNode;
  breadcrumbTitle?: string;
}

const NonLayout = ({ children, breadcrumbTitle }: NonLayoutProps) => {
  
  const appName = process.env.APP_NAME;

  const title = breadcrumbTitle ? ` ${breadcrumbTitle} | ${appName} ` : `${appName}`;
  useEffect(() => {
    // Remove the attributes for excluded pages
    document.documentElement.setAttribute('class', 'scroll-smooth group')
    document.documentElement.setAttribute('data-mode', 'light')
    document.documentElement.setAttribute('data-colors', 'default')
    document.documentElement.removeAttribute('x-data')
    document.documentElement.removeAttribute('x-init')
    document.documentElement.setAttribute('data-layout', 'default')
    document.documentElement.setAttribute('dx-layout-mode', 'light')
    document.documentElement.removeAttribute('data-content-width')
    document.documentElement.removeAttribute('data-sidebar')
    document.documentElement.setAttribute('data-sidebar-colors','light')
    document.documentElement.removeAttribute('data-nav-type')
    document.documentElement.setAttribute('dir', 'ltr')
  }, [])
  return (
    <React.Fragment>

      <title>{title}</title>

      <main>
        {children}
      </main>
    </React.Fragment>
  )
}

export default NonLayout;
