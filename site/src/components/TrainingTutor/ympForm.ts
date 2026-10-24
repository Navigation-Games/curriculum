/**
 * The Orienteering USA Youth Mapping Program (YMP) application, a Google Form.
 * Used to build a pre-filled link from the answers the Unit 0 tutor helps a
 * teacher draft. The teacher opens the link, checks every answer, and submits
 * the form themselves.
 *
 * The tutor writes the answers as "Label: answer" lines in a ```ymp block,
 * using exactly the labels below (they're listed in content/training/unit-0.md).
 * Each label maps to the form's hidden field ID ("entry" number).
 *
 * If OUSA changes the form, refresh the IDs: open the form, view the page
 * source, and find each question's entry number, or ask Claude to re-read the
 * form. A field whose ID no longer matches is just left blank in the form.
 */

export const YMP_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSciJF8ZFi8hqO7OetK17u4A_Te6uxw6Gv6ExeVFRe6Zm-a_Sg/viewform';

interface YmpField {
  label: string;
  entry: string;
  /** For multiple-choice questions, the exact choices the form accepts */
  choices?: string[];
}

export const YMP_FIELDS: YmpField[] = [
  {label: 'Reviewed the YMP page and Costs', entry: '543679090', choices: ['Yes', 'No']},
  {label: 'Full name', entry: '257853881'},
  {label: 'School or organization', entry: '1384394542'},
  {label: 'Nonprofit status', entry: '1794730234'},
  {label: 'State', entry: '563926355'},
  {label: 'Address of organization', entry: '1989425911'},
  {label: 'School or organization website', entry: '1857921559'},
  {label: 'Contact person name and title', entry: '1352382842'},
  {label: 'Contact person phone', entry: '1727036840'},
  {label: 'Contact person email', entry: '1021327835'},
  {label: 'Eyes on the Ground name', entry: '1272872708'},
  {label: 'Eyes on the Ground email', entry: '702841414'},
  {label: 'Address of area to be mapped', entry: '439676617'},
  {label: 'Description of area to be mapped', entry: '1544273369'},
  {label: 'Apply for an OUSA grant', entry: '1629075901', choices: ['Yes', 'No', 'Maybe']},
  {label: 'How you found out about YMP', entry: '1471404460'},
  {label: 'How you plan to use the map', entry: '47147816'},
  {label: 'Local orienteering club', entry: '1427146248'},
  {label: 'Club contact person', entry: '1226984774'},
  {label: 'How the club will collaborate', entry: '325860837'},
  {label: 'Contact for others wishing to use the area', entry: '1745704907'},
];

/** Read "Label: answer" lines (an answer can continue onto following lines). */
export function parseYmpAnswers(block: string): Map<YmpField, string> {
  const answers = new Map<YmpField, string>();
  let current: YmpField | null = null;
  for (const line of block.split('\n')) {
    const field = YMP_FIELDS.find(f => line.toLowerCase().startsWith(f.label.toLowerCase() + ':'));
    if (field) {
      current = field;
      answers.set(field, line.slice(field.label.length + 1).trim());
    } else if (current && line.trim()) {
      answers.set(current, `${answers.get(current)}\n${line.trim()}`.trim());
    }
  }
  return answers;
}

/** A link to the YMP form with the teacher's answers filled in. */
export function ympPrefillUrl(block: string): string {
  const params = new URLSearchParams({usp: 'pp_url'});
  for (const [field, answer] of parseYmpAnswers(block)) {
    if (!answer) continue;
    if (field.choices) {
      const choice = field.choices.find(c => c.toLowerCase() === answer.toLowerCase());
      if (choice) params.append(`entry.${field.entry}`, choice);
    } else {
      params.append(`entry.${field.entry}`, answer);
    }
  }
  return `${YMP_FORM_URL}?${params.toString()}`;
}
