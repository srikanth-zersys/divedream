import React, { useEffect, useState } from 'react'
import Footer from './Footer'
import { useDispatch, useSelector } from 'react-redux';
import Topbar from './Topbar';
// import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { AppDispatch, RootState } from '../slices/reducer';
import { LAYOUT_TYPES, SIDEBAR_SIZE } from '../components/Constants/layout';
import { changeHTMLAttribute, setNewThemeData } from '../slices/layout/utils';
import { changeSidebarSize } from '../slices/thunk';
import { MainMenu, MegaMenu, SubMenu } from '../dtos';
import { menu } from '../data';
import { FlashMessages } from '../components/ui/FlashMessages';

interface LayoutProps {
  children: React.ReactNode;
  breadcrumbTitle?: string;
}

const Layout = ({ children, breadcrumbTitle }: LayoutProps) => {

  const title = breadcrumbTitle ? ` ${breadcrumbTitle} | Zersys - Laravel Inertia Starter ` : 'Zersys - Laravel Inertia Starter';

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const {
    layoutMode,
    layoutType,
    layoutWidth,
    layoutSidebar,
    layoutDarkModeClass,
    layoutSidebarColor,
    layoutDataColor,
    layoutDirection,
  } = useSelector((state: RootState) => state.Layout)
  const dispatch = useDispatch<AppDispatch>();


  const handleThemeSidebarSize = () => {
    // Toggle between SIDEBAR_SIZE.DEFAULT and SIDEBAR_SIZE.SMALL
    const newSize = layoutSidebar === SIDEBAR_SIZE.DEFAULT ? SIDEBAR_SIZE.SMALL : SIDEBAR_SIZE.DEFAULT;
    setNewThemeData('dx-sidebar-size', newSize)
    changeHTMLAttribute('data-sidebar', newSize);
    dispatch(changeSidebarSize(newSize));
  }

  const toggleSidebar = () => {
    if (window.innerWidth <= 1024) {
      isSidebarOpen ? setIsSidebarOpen(false) : setIsSidebarOpen(true);
    } else {
      handleThemeSidebarSize();
    }
  };


  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const [serachSidebar, setSearchSidebar] = useState<MegaMenu[]>(menu);
  const [serachValue, setSearchValue] = useState<string>('');

  // handle search menu
  const handleSearchClient = (value: string) => {
    setSearchValue(value);

    if (value.trim() !== '') {
      const filteredMenu: MegaMenu[] = menu.filter((megaItem: MegaMenu) => {
        // Filter the first level: MegaMenu
        const isMegaMenuMatch = megaItem.title.toLowerCase().includes(value.toLowerCase()) ||
          megaItem.lang.toLowerCase().includes(value.toLowerCase());

        // Filter the second level: MainMenu (children of MegaMenu)
        const filteredMainMenu = megaItem.children?.filter((mainItem: MainMenu) => {
          const isMainMenuMatch = mainItem.title.toLowerCase().includes(value.toLowerCase()) ||
            mainItem.lang.toLowerCase().includes(value.toLowerCase());

          // Filter the third level: SubMenu (children of MainMenu)
          const filteredSubMenu = mainItem.children?.filter((subItem: SubMenu) => {
            return subItem.title.toLowerCase().includes(value.toLowerCase()) ||
              subItem.lang.toLowerCase().includes(value.toLowerCase());
          });

          // If SubMenu matches or MainMenu matches, return the filtered item
          return isMainMenuMatch || (filteredSubMenu && filteredSubMenu.length > 0);
        });

        // Return MegaMenu item if it matches or has any matching MainMenu children
        return isMegaMenuMatch || (filteredMainMenu && filteredMainMenu.length > 0);
      });

      setSearchSidebar(filteredMenu);
    } else {
      setSearchSidebar(menu);
    }
  };
  useEffect(() => {
    document.documentElement.classList.add('scroll-smooth', 'group')
    document.documentElement.setAttribute('data-mode', layoutMode)
    document.documentElement.setAttribute('data-colors', layoutDataColor)
    document.documentElement.setAttribute('lang', 'en')
    document.documentElement.setAttribute('data-layout', layoutType)
    document.documentElement.setAttribute('data-content-width', layoutWidth)
    document.documentElement.setAttribute('data-sidebar', layoutSidebar)
    document.documentElement.setAttribute('data-sidebar-colors',layoutType === LAYOUT_TYPES.HORIZONTAL? 'light': layoutSidebarColor)
    document.documentElement.setAttribute('data-nav-type', layoutDarkModeClass)
    document.documentElement.setAttribute('dir', layoutDirection)
}, [layoutMode, layoutType, layoutWidth, layoutSidebar, layoutSidebarColor, layoutDarkModeClass, layoutDirection,])

  return (
    <React.Fragment>
      {/* Toast Notifications */}
      <FlashMessages />

      {/* Main topbar */}
      {/* <Head> */}
      <title>{title}</title>
      {/* </Head> */}

      <Topbar
        searchMenu={(value: string) => handleSearchClient(value)}
        searchText={serachValue}
        toggleSidebar={toggleSidebar}
      />

      {/* sidebar */}

      <Sidebar serachSidebar={serachSidebar} isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />


      <div className="relative min-h-screen group-data-[layout=boxed]:bg-white bg-gray-50 dark:bg-gray-900 group-data-[layout=boxed]:rounded-md">
        <div className="page-wrapper pt-[calc(theme('spacing.topbar')_*_1.2)] px-10"
        >
          {children}
        </div>
        <Footer />
      </div>
    </React.Fragment>
  )
}

export default Layout
