import { Markdown } from '@storybook/addon-docs/blocks';
import { componentReadmeForStorybook } from './component-readme';

export function ComponentGroupRules({ title, docsId, readmes }: {
  title: string;
  docsId: string;
  readmes: Record<string, string>;
}) {
  return (
    <div className="tkw-icon-doc">
      <h1>{title}</h1>
      <nav aria-label="部品の利用ルール">
        <ul>
          {Object.keys(readmes).map(name => (
            <li key={name}><a href={`#${name.toLowerCase()}`} target="_self">{name}</a></li>
          ))}
        </ul>
      </nav>
      {Object.entries(readmes).map(([name, readme]) => {
        const id = name.toLowerCase();
        const body = readme.replace(/^# [^\n]*\n+/, '').replace(/^## /gm, '### ');
        return (
          <section key={name} aria-labelledby={id}>
            <h2 id={id} tabIndex={-1}>{name}</h2>
            <Markdown options={{ slugify: heading => `${id}-${heading}` }}>
              {componentReadmeForStorybook(body, docsId)}
            </Markdown>
          </section>
        );
      })}
    </div>
  );
}
