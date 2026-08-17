/**
 * Swizzled (ejected) from @docusaurus/theme-classic.
 * Changes from the original:
 * - Sidebar starts expanded on index/hub pages (where visitors choose where to
 *   go) and collapsed on content pages (where they're reading). This is only
 *   the default for a visitor who has never manually toggled the sidebar.
 * - Once a visitor manually expands or collapses the sidebar, that choice is
 *   stored in localStorage (site-wide, one key) and wins on every page,
 *   overriding the path-based default, until they manually toggle it again.
 * - For Editors pages (/editors/) show a sign-in gate unless the visitor is
 *   signed in with a navigationgames.org Google account. Soft gate only: the
 *   static content is still deployed; this just keeps it out of teachers' way.
 * The companion file DocRoot/Layout/Sidebar/index.js syncs its inner animation
 * state when hiddenSidebarContainer changes reactively (used both for the
 * path-based default on first paint and for the localStorage read after mount).
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

// localStorage key for the visitor's manually-set sidebar preference.
// Stores 'true' (hidden/collapsed) or 'false' (visible/expanded).
const SIDEBAR_STORAGE_KEY = 'ng-sidebar-hidden';

// Hub/index pages where teachers are choosing where to go — sidebar starts
// open here by default, for visitors with no stored preference yet.
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

  // Initial render (and SSR) uses the path-based default so there's no
  // hydration mismatch; the stored preference, if any, is applied client-side
  // right after mount.
  const [hiddenSidebarContainer, setHiddenSidebarContainerState] = useState(!isIndexPage);

  useEffect(() => {
    const stored = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored !== null) {
      setHiddenSidebarContainerState(stored === 'true');
    }
    // Read the stored preference once, on mount, not on every navigation —
    // that's what makes a manual toggle stick across pages.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setHiddenSidebarContainer = useCallback((valueOrFn) => {
    setHiddenSidebarContainerState((prev) => {
      const next = typeof valueOrFn === 'function' ? valueOrFn(prev) : valueOrFn;
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      return next;
    });
  }, []);

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
