import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

const ALL_CLASSES = [
  'page-lesson-plan',
  'page-activity',
  'page-school-overview',
  'page-camp-overview',
];

function applyPageType() {
  const path = window.location.pathname;
  document.body.classList.remove(...ALL_CLASSES);

  if (path.includes('/activities/')) {
    document.body.classList.add('page-activity');
  } else if (path.includes('/lessons/')) {
    const isIndividualLesson = /\/lessons\/school\/grade-[^/]+\/[^/]+/.test(path);
    if (isIndividualLesson) {
      document.body.classList.add('page-lesson-plan');
    } else if (path.includes('/lessons/camp')) {
      document.body.classList.add('page-camp-overview');
    } else {
      document.body.classList.add('page-school-overview');
    }
  }
}

if (ExecutionEnvironment.canUseDOM) {
  applyPageType();
  const observer = new MutationObserver(applyPageType);
  observer.observe(document.querySelector('title') || document.head, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}
