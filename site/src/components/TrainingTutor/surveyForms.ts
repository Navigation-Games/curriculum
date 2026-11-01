/**
 * The two Kickstart Orienteering surveys, Google Forms, with a pre-filled link
 * built from what the course already knows. The teacher opens the link, checks
 * every answer, fills in what is left, and submits the form themselves.
 *
 * Each survey belongs to one unit: the Activity Planning Survey to Unit 5 and
 * the Post Activity Reflection Survey to Unit 8. The tutor writes the answers
 * it has gathered as "Label: answer" lines in a ```survey block, using the
 * labels below (they're listed in content/training/unit-5.md and unit-8.md).
 * The teacher's name, applicant ID and email come from their CourseAccess row
 * and sign-in, not from the tutor.
 *
 * If a form changes, refresh the IDs: open the form's /viewform page, view the
 * source, and find each question's entry number in FB_PUBLIC_LOAD_DATA_, or ask
 * Claude to re-read the form. A field whose ID no longer matches is just left
 * blank in the form.
 */

interface SurveyField {
  label: string;
  entry: string;
  /** For multiple-choice questions, the exact choices the form accepts */
  choices?: string[];
}

interface SurveyForm {
  title: string;
  url: string;
  name?: string; // entry for the teacher's name
  applicantId?: string; // entry for the applicant ID
  email?: string; // entry for the teacher's email, if it is an ordinary question
  /** The form collects email addresses in its settings; pre-fills with the emailAddress parameter */
  collectsEmail?: boolean;
  fields: SurveyField[];
}

export const SURVEY_FORMS: Record<string, SurveyForm> = {
  'unit-5': {
    title: 'Activity Planning Survey',
    url: 'https://docs.google.com/forms/d/1kuSQg357kRUN_3ictPFVSiPHZ3Ch-stwvwUH8nIpzz0/viewform',
    name: '286764683',
    applicantId: '995902675',
    collectsEmail: true,
    fields: [
      {label: 'Phone number', entry: '275840294'},
      {label: 'School or organization', entry: '1275017866'},
      {label: 'Mailing address', entry: '689680638'},
      {label: 'Number of sessions', entry: '1605956639'},
      {label: 'Session length', entry: '1247581633'},
      {label: 'Participants per session', entry: '360523260'},
      {label: 'Ages or grades', entry: '770261478'},
      {label: 'Activities', entry: '2118373680'},
      {label: 'Dates', entry: '1776770162'},
      {label: 'Location', entry: '1783820775'},
      {label: 'Permit needed', entry: '1690590439', choices: ['Yes', 'No', "I don't know"]},
      {label: 'Orienteering map needed', entry: '414366712', choices: ['Yes', 'No', 'Maybe']},
      {label: 'Orienteering map exists', entry: '1237488668', choices: ['Yes', 'No']},
      {label: 'Access to the map', entry: '705055475', choices: ['Yes', 'No']},
      {label: 'Applied to YMP', entry: '581063256', choices: ['Yes', 'Not yet', "Don't need a map"]},
      {label: 'Staff to participant ratio', entry: '1951076725'},
      {label: 'Help all students take part', entry: '1341188256'},
      {label: 'Questions', entry: '567363883'},
    ],
  },
  'unit-8': {
    title: 'Post Activity Reflection Survey',
    url: 'https://docs.google.com/forms/d/1-7TvyMV4_IM2_MGs_sxMSXYCaUtO22NMSxq-nChXP9g/viewform',
    name: '528287124',
    applicantId: '1792333156',
    email: '817330084',
    fields: [
      {label: 'Organization', entry: '303883526'},
      {label: 'Dates taught', entry: '2061958278'},
      {label: 'Where', entry: '935100542'},
      {label: 'Participants', entry: '497201836'},
      {label: 'Age groups', entry: '325861754'},
      {label: 'Activities taught', entry: '193583508'},
    ],
  },
};

/** The teacher's details from the course: CourseAccess row and sign-in */
export interface SurveyPerson {
  name?: string;
  applicant_id?: string;
  email?: string;
}

/** Read "Label: answer" lines (an answer can continue onto following lines). */
export function parseSurveyAnswers(form: SurveyForm, block: string): Map<SurveyField, string> {
  const answers = new Map<SurveyField, string>();
  let current: SurveyField | null = null;
  for (const line of block.split('\n')) {
    const field = form.fields.find(f => line.toLowerCase().startsWith(f.label.toLowerCase() + ':'));
    if (field) {
      current = field;
      answers.set(field, line.slice(field.label.length + 1).trim());
    } else if (current && line.trim()) {
      answers.set(current, `${answers.get(current)}\n${line.trim()}`.trim());
    }
  }
  return answers;
}

/** The survey for a unit, or null if the unit has none. */
export function surveyFor(unit: string): SurveyForm | null {
  return SURVEY_FORMS[unit] || null;
}

/** A link to the unit's survey with the tutor's answers and the teacher's details filled in. */
export function surveyPrefillUrl(unit: string, block: string, person: SurveyPerson): string | null {
  const form = surveyFor(unit);
  if (!form) return null;
  const params = new URLSearchParams({usp: 'pp_url'});
  if (form.name && person.name) params.append(`entry.${form.name}`, person.name);
  if (form.applicantId && person.applicant_id) params.append(`entry.${form.applicantId}`, person.applicant_id);
  if (person.email) {
    if (form.email) params.append(`entry.${form.email}`, person.email);
    else if (form.collectsEmail) params.append('emailAddress', person.email);
  }
  for (const [field, answer] of parseSurveyAnswers(form, block)) {
    if (!answer) continue;
    if (field.choices) {
      const choice = field.choices.find(c => c.toLowerCase() === answer.toLowerCase());
      if (choice) params.append(`entry.${field.entry}`, choice);
    } else {
      params.append(`entry.${field.entry}`, answer);
    }
  }
  return `${form.url}?${params.toString()}`;
}
