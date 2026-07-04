/**
 * Swizzled (ejected) from @docusaurus/theme-classic.
 * Changes from the original:
 * - Sidebar starts expanded on index/hub pages (where visitors choose where to
 *   go) and collapsed on content pages (where they're reading).
 * - Manual toggles are respected for the current page; navigating to a new
 *   page resets the sidebar to the path-based default.
 * - For Editors pages (/editors/) show a sign-in gate unless the visitor is
 *   signed in with a navigationgames.org Google account. Soft gate only: the
 *   static content is still deployed; this just keeps it out of teachers' way.
 * The companion file DocRoot/Layout/Sidebar/index.js syncs its inner animation
 * state when hiddenSidebarContainer changes reactively.
 */
import React, {useState, useCallback, useEffect} from 'react';
import {useLocation} from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useDocsSidebar} from '@docusaurus/plugin-content-docs/client';
import BackToTopButton from '@theme/BackToTopButton';
import DocRootLayoutSidebar from '@theme/DocRoot/Layout/Sidebar';
import DocRootLayoutMain from '@theme/DocRoot/Layout/Main';
import EditorsGate from '@site/src/components/EditorsGate';
import {useGoogleUser, isManager} from '@site/src/lib/googleAuth';
import styles from './styles.module.css';

// Hub/index pages where teachers are choosing where to go — sidebar starts open.
const INDEX_PATHS = new Set([
  '/lessons/',
  '/lessons/school/',
  '/lessons/school/grade-k-2/',
  '/lessons/school/grade-3-5/',
  '/lessons/school/grade-6-plus/',
  '/lessons/school/various/',
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
  const baseUrl = useBaseUrl('/');

  // pathname includes the site baseUrl (e.g. /curriculum/lessons/), but
  // INDEX_PATHS is written without it. Strip the base and normalize the
  // trailing slash before matching.
  let relPath = pathname.startsWith(baseUrl)
    ? '/' + pathname.slice(baseUrl.length)
    : pathname;
  if (!relPath.endsWith('/')) relPath += '/';
  const isIndexPage = INDEX_PATHS.has(relPath);

  // For Editors soft gate. useGoogleUser is null on the first render (and
  // during the static build), so gated pages render the sign-in prompt and
  // hydrate cleanly; signed-in staff see the content one tick later.
  const user = useGoogleUser();
  const gated = relPath.startsWith('/editors/') && !isManager(user);

  // null = use path-based default; true/false = user manually toggled this page
  const [userOverride, setUserOverride] = useState(null);

  // Clear the manual override on every navigation so the path default takes effect
  useEffect(() => {
    setUserOverride(null);
  }, [pathname]);

  const hiddenSidebarContainer =
    userOverride !== null ? userOverride : !isIndexPage;

  const setHiddenSidebarContainer = useCallback(
    (valueOrFn) => {
      setUserOverride((prev) => {
        const current = prev !== null ? prev : !isIndexPage;
        return typeof valueOrFn === 'function' ? valueOrFn(current) : valueOrFn;
      });
    },
    [isIndexPage],
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
          {gated ? <EditorsGate /> : children}
        </DocRootLayoutMain>
      </div>
    </div>
  );
}
