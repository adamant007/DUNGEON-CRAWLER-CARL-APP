import { useState } from 'react';
import './clean-app-shell.css';

type CleanSection = 'Character' | 'Combat' | 'Inventory' | 'GM Tools' | 'Library' | 'Campaign' | 'Settings';

const sections: CleanSection[] = ['Character', 'Combat', 'Inventory', 'GM Tools', 'Library', 'Campaign', 'Settings'];

function EmptySection({ section }: { section: Exclude<CleanSection, 'Character'> }) {
  return (
    <section className="clean-shell-panel" aria-labelledby={`clean-${section.replace(/\s+/g, '-').toLowerCase()}`}>
      <div className="clean-shell-kicker">CLEAN REBUILD</div>
      <h2 id={`clean-${section.replace(/\s+/g, '-').toLowerCase()}`}>{section}</h2>
      <p>This section is intentionally empty until we migrate and verify its real functionality.</p>
      <div className="clean-shell-empty">Nothing legacy is mounted here.</div>
    </section>
  );
}

function CleanCharacter() {
  return (
    <section className="clean-shell-panel" aria-labelledby="clean-character-heading">
      <div className="clean-shell-kicker">FIRST MODULE</div>
      <h2 id="clean-character-heading">Character</h2>
      <p>This is the new Character workspace. We will move approved TEST CHAR. pieces into this module one at a time.</p>
      <div className="clean-shell-empty">Ready for crawler selector + portrait.</div>
    </section>
  );
}

export default function CleanAppShell() {
  const [section, setSection] = useState<CleanSection>('Character');

  return (
    <div className="clean-app-shell" data-testid="clean-app-shell">
      <header className="clean-shell-header">
        <div>
          <div className="clean-shell-kicker">GINGER DRAGON STUDIOS</div>
          <h1>Crawler Companion</h1>
        </div>
        <span className="clean-shell-badge">NEW SHELL</span>
      </header>

      <nav className="clean-shell-nav" aria-label="Clean app navigation">
        {sections.map((item) => (
          <button
            key={item}
            type="button"
            className={section === item ? 'active' : ''}
            aria-current={section === item ? 'page' : undefined}
            onClick={() => setSection(item)}
          >
            {item}
          </button>
        ))}
      </nav>

      <main className="clean-shell-main">
        {section === 'Character' ? <CleanCharacter /> : <EmptySection section={section} />}
      </main>
    </div>
  );
}
