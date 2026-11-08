// Wraps Docusaurus's "Edit this page" link so only signed-in NG staff
// (navigationgames.org Google accounts) see it. The link target comes from
// editUrl in docusaurus.config.ts, which sends generated pages to their
// source files in content/.
import React from 'react';
import EditThisPage from '@theme-original/EditThisPage';
import type EditThisPageType from '@theme/EditThisPage';
import type {WrapperProps} from '@docusaurus/types';
import {useGoogleUser, isManager} from '@site/src/lib/googleAuth';

type Props = WrapperProps<typeof EditThisPageType>;

export default function EditThisPageWrapper(props: Props): React.ReactElement | null {
  const user = useGoogleUser();
  if (!isManager(user)) return null;
  return <EditThisPage {...props} />;
}
