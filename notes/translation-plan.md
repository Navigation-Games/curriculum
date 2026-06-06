# Translating the Curriculum into Other Languages

Future consideration. No specific language targeted yet.

## What Docusaurus gives us for free

Docusaurus has built-in i18n support. You configure locales in `docusaurus.config.ts`, and it expects translated files in a parallel directory structure (`i18n/es/docusaurus-plugin-content-docs/current/` mirrors `docs/`). It handles locale switching, URL prefixes (`/es/activities/core/animal-o/`), and the UI chrome (sidebar labels, buttons). The framework is solid.

## The actual translation work

This is the big part. We'd need to translate:

- ~20 activity pages
- ~18 lesson plans
- Glossary, equipment pages, about pages
- UI strings (nav labels, component text)

That's maybe 50-60 pages of content. An AI translation pass could produce a rough draft quickly, but orienteering vocabulary is specialized. "Checkpoint," "clue sheet," "control description," "thumb the map" all need someone who knows both the language and the sport to verify the translations. Different countries may already have established orienteering terminology.

## Ongoing maintenance

This is the real cost. Every time we edit an English activity or lesson, the translated versions need updating. Docusaurus doesn't track which translations are stale. We'd need a process for this, or the translations drift. Some projects use a "translation freshness" system that flags pages where the English source has changed since the last translation.

## Realistic path

1. Pick one high-demand language (Spanish?)
2. AI-generate a first draft of all pages
3. Have a bilingual orienteering person review and correct
4. Set up the Docusaurus i18n structure
5. Accept that translations will lag behind English updates

The initial setup is maybe a few days of dev work. The review pass is the bottleneck, since it needs someone who knows both the language and the sport.

## AI Lesson Plan Advisor

The advisor can respond in whatever language the teacher writes in, with no extra work. Just add one line to the system prompt. The curriculum knowledge stays in English; Claude translates recommendations on the fly. Links would still point to English pages until the content itself is translated.
