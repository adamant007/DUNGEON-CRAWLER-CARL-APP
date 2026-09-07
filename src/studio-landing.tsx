import './studio-landing.css';

type Props={onLaunch:()=>void};

export default function StudioLanding({onLaunch}:Props){
  return <main className="studio-home" data-testid="studio-landing">
    <section className="studio-home-hero" aria-label="Ginger Dragon Studios">
      <img className="studio-dragon" src="/brand/ginger-dragon-studios-hero.webp" alt="Ginger Dragon Studios"/>
    </section>

    <section className="studio-apps" aria-label="Studio apps">
      <button className="crawler-card" type="button" onClick={onLaunch} aria-label="Open Crawler Companion">
        <img className="crawler-rook" src="/brand/crawler-companion-rook.webp" alt="Crawler Companion rook"/>
        <span className="crawler-card-copy">
          <strong>Crawler Companion</strong>
          <small>Open app</small>
        </span>
      </button>
    </section>

    <footer>© 2026 Ginger Dragon Studios</footer>
  </main>;
}
