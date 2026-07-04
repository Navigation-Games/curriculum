/**
 * Toggles the `ng-manager` class on <html> when the visitor is signed in
 * with a navigationgames.org Google account. CSS in custom.css uses it to
 * unhide the "For Editors" navbar link. Client modules only run in the
 * browser, so no SSR guards are needed beyond the import-time check.
 */
import {getUser, isManager, onAuthChange} from '@site/src/lib/googleAuth';

if (typeof window !== 'undefined') {
  const update = () => {
    document.documentElement.classList.toggle('ng-manager', isManager(getUser()));
  };
  update();
  onAuthChange(update);
}
