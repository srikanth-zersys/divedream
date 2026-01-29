import 'flatpickr/dist/flatpickr.css';
import 'simplebar-react/dist/simplebar.min.css';
import "../scss/fonts/fonts.scss";
import "../scss/icons.scss";
import "../scss/plugins.scss";
import "../scss/tailwind.scss";

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store, { AppDispatch } from '../js/slices/reducer';
import { LAYOUT_LANGUAGES, } from './components/Constants/layout';
import { initialState } from './slices/layout/reducer';
import { getPreviousThemeData } from './slices/layout/utils';
import { changeDarkModeClass, changeDataColor, changeDirection, changeLayout, changeLayoutContentWidth, changeLayoutLanguage, changeLayoutMode, changeModernNavigation, changeSidebarColor, changeSidebarSize } from './slices/thunk';
import { I18nProvider } from './i18n';

const appName = process.env.APP_NAME;


const ThemeInitializer = () => {
    useEffect(() => {
        const dispatch = store.dispatch as AppDispatch;
        dispatch(changeLayoutMode(getPreviousThemeData('dx-layout-mode') ?? initialState.layoutMode))
        dispatch(
            changeLayoutContentWidth(
                getPreviousThemeData('dx-layout-content-width') ?? initialState.layoutWidth,
            ),
        )
        dispatch(changeSidebarSize(getPreviousThemeData('dx-sidebar-size') ?? initialState.layoutSidebar))
        dispatch(changeDirection(getPreviousThemeData('dx-layout-direction') ?? initialState.layoutDirection))
        dispatch(changeLayout(getPreviousThemeData('dx-layout-type') ?? initialState.layoutType))
        dispatch(changeSidebarColor(getPreviousThemeData('dx-sidebar-colors') ?? initialState.layoutSidebarColor))
        dispatch(
            changeLayoutLanguage(
                getPreviousThemeData('dx-layout-language') ?? LAYOUT_LANGUAGES.ENGLISH,
            ),
        )
        dispatch(changeDataColor(getPreviousThemeData('dx-theme-color') ?? initialState.layoutDataColor))
        dispatch(changeDarkModeClass(getPreviousThemeData('dx-theme-dark-class') ?? initialState.layoutDarkModeClass))
        dispatch(
            changeModernNavigation(
                getPreviousThemeData('dx-theme-nav-type') ?? initialState.layoutNavigation,
            ),
        )
        const htmlElement = document.documentElement;
        htmlElement.classList.add('scroll-smooth', 'group');
        return () => {
            htmlElement.classList.remove('scroll-smooth', 'group');
        };
    }, []);

    return null; // This component doesn't render anything
};

createInertiaApp({
    title: (title) => `${title} | ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.tsx`, import.meta.glob('./Pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <Provider store={store}>
                <I18nProvider>
                    <ThemeInitializer />
                    <App {...props} />
                </I18nProvider>
            </Provider>
        );
    },
});


