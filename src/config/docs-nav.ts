export interface DocNavItem {
  slug: string;
  label: string;
  blurb: string;
}

export interface DocNavSection {
  title: string;
  items: DocNavItem[];
}

export const docsNav: DocNavSection[] = [
  {
    title: 'Getting Started',
    items: [
      { slug: 'getting-started', label: 'Getting Started', blurb: 'Install grimoire and apply your first skill.' },
      { slug: 'architecture', label: 'Architecture', blurb: 'How skills, plugins, and meta skills fit together.' },
    ],
  },
  {
    title: 'Concepts',
    items: [
      { slug: 'bpdd', label: 'Best Practice Driven Development', blurb: 'Declare a standard once, enforce it automatically.' },
      { slug: 'grimoire-skills', label: 'Meta Skills', blurb: 'The 29 skills that run the framework itself.' },
      { slug: 'profiles', label: 'Practice Profiles', blurb: 'Named, shareable bundles of skills.' },
      { slug: 'tags', label: 'Tag Vocabulary', blurb: 'How skills are tagged for routing and discovery.' },
      { slug: 'domain-safety', label: 'Domain Safety Guide', blurb: 'Boundaries for what a skill should and shouldn’t do.' },
    ],
  },
  {
    title: 'Guides',
    items: [
      { slug: 'authoring-skills', label: 'Authoring Skills', blurb: 'Write a new SKILL.md from scratch to PR.' },
      { slug: 'testing', label: 'Testing Skills', blurb: 'How skills are validated before merge.' },
      { slug: 'agents', label: 'Agent Integration Guide', blurb: 'Install and use grimoire in every supported agent.' },
      { slug: 'agent-interactive-ui', label: 'Agent Interactive UI', blurb: 'Reference for interactive UI elements in skills.' },
      { slug: 'maintaining', label: 'Maintaining grimoire', blurb: 'Deprecation, releases, and library upkeep.' },
    ],
  },
  {
    title: 'Reference',
    items: [
      { slug: 'cli-reference', label: 'CLI Reference', blurb: 'Every grimoire command, one line each.' },
      { slug: 'config', label: 'Config', blurb: 'grimoire.toml keys and override hierarchy.' },
      { slug: 'glossary', label: 'Glossary', blurb: 'Terms used throughout the grimoire docs.' },
    ],
  },
  {
    title: 'Resources',
    items: [
      { slug: 'examples', label: 'Skill Examples', blurb: 'Real skill invocations end to end.' },
      { slug: 'faq', label: 'FAQ', blurb: 'Common questions about using and contributing.' },
    ],
  },
];

export function flattenDocsNav(): (DocNavItem & { section: string })[] {
  return docsNav.flatMap((section) =>
    section.items.map((item) => ({ ...item, section: section.title }))
  );
}

export function getDocMeta(slug: string) {
  return flattenDocsNav().find((d) => d.slug === slug);
}

export function getPrevNext(slug: string) {
  const flat = flattenDocsNav();
  const i = flat.findIndex((d) => d.slug === slug);
  return {
    prev: i > 0 ? flat[i - 1] : null,
    next: i >= 0 && i < flat.length - 1 ? flat[i + 1] : null,
  };
}
