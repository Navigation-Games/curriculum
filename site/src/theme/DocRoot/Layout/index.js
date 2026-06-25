/**
 * Swizzled (ejected) from @docusaurus/theme-classic.
 * Changes from the original:
 * - Sidebar starts expanded on index/hub pages (where visitors choose where to
 *   go) and collapsed on content pages (where they're reading).
 * - Manual toggles are respected for the current page; navigating to a new
 *   page resets the sidebar to the path-based default.
 * The companion file DocRoot/Layout/Sidebar/index.js syncs its inner animation
 * state when hiddenSidebarContainer changes reactively.
 */
import React, {useState, useCallback, useEffect} from 'react';
import {useLocation} from '@docusaurus/router';
import {useDocsSidebar} from '@docusaurus/plugin-content-docs/client';
import BackToTopButton from '@theme/BackToTopButton';
import DocRootLayoutSidebar from '@theme/DocRoot/Layout/Sidebar';
import DocRootLayoutMain from '@theme/DocRoot/Layout/Main';
import styles from './styles.module.css';

// Hub/index pages where teachers are choosing where to go — sidebar starts open.
const INDEX_PATHS = new Set([
  '/lessons/',
  '/lessons/school/',
  '/lessons/school/grade-k-2/',
  '/lessons/school/grade-3-5/',
  '/lessons/school/grade-6-plus/',
  '/lessons/camp/',
  '/lessons/camp/intro/',
  '/lessons/camp/full/',
  '/reference/',
  '/reference/equipment/',
  '/reference/frameworks/',
  '/activities/core/',
  '/about/',
  '/editors/',
]);

export default function DocRootLayout({children}) {
  const sidebar = useDocsSidebar();
  const {pathname} = useLocation();

  // null = use path-based default; true/false = user manually toggled this page
  const [userOverride, setUserOverride] = useState(null);

  // Clear the manual override on every navigation so the path default takes effect
  useEffect(() => {
    setUserOverride(null);
  }, [pathname]);

  const hiddenSidebarContainer =
    userOverride !== null ? userOverride : !INDEX_PATHS.has(pathname);

  const setHiddenSidebarContainer = useCallback(
    (valueOrFn) => {
      setUserOverride((prev) => {
        const current = prev !== null ? prev : !INDEX_PATHS.has(pathname);
        return typeof valueOrFn === 'function' ? valueOrFn(current) : valueOrFn;
      });
    },
    [pathname],
  );

  return (
    <div className={styles.docsWrapper}>
      <BackToTopButton />
      <div className={styles.docRoot}>
        {sidebar && (
          <DocRootLayoutSidebar
            sidebar={sidebar.items}
            hiddenSidebarContainer={hiddenSidebarContainer}
            setHiddenSidebarContainer={setHiddenSidebarContainer}
          />
        )}
        <DocRootLayoutMain hiddenSidebarContainer={hiddenSidebarContainer}>
          {children}
        </DocRootLayoutMain>
      </div>
    </div>
  );
}
