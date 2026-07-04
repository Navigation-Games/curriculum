import React, {useEffect, useRef} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {renderSignInButton} from '@site/src/lib/googleAuth';

interface Props {
  size?: 'small' | 'medium' | 'large';
}

/**
 * A Google sign-in button wired to the shared auth store (googleAuth.ts).
 * On success every useGoogleUser() hook on the page updates.
 */
export default function GoogleSignInButton({size = 'medium'}: Props): React.ReactElement {
  const {siteConfig} = useDocusaurusContext();
  const clientId = (siteConfig.customFields?.reviewOauthClientId as string) || '';
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      renderSignInButton(ref.current, clientId, {size});
    }
  }, [clientId, size]);

  return <div ref={ref} />;
}
