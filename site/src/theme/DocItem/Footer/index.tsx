import React from 'react';
import Footer from '@theme-original/DocItem/Footer';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import PageFeedback from '@site/src/components/PageFeedback';

/**
 * Wraps the default doc footer ("Edit this page", tags, last updated) and
 * adds the page feedback widget below it. The original footer returns null
 * on pages with no tags or edit URL, so the feedback widget is rendered as
 * a sibling, not inside it, to appear on every docs page.
 */
export default function FooterWrapper(props: Record<string, never>): React.ReactElement {
  const {metadata} = useDoc();
  return (
    <>
      <Footer {...props} />
      <PageFeedback page={metadata.permalink} title={metadata.title} />
    </>
  );
}
