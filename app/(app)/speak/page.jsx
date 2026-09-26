export default function SpeakPage() {
  return (
    <div className="page-stack">
      <header className="page-header"><span className="eyebrow">SPEAK LAB</span><h1>Your conversation room.</h1><p>AI role plays, quick responses and open conversation will live here.</p></header>
      <section className="voice-stage">
        <div className="voice-rings"><div className="voice-core">🎙</div></div>
        <span className="tiny-label">COMING NEXT</span>
        <h2>“Hi! Tell me a little about yourself.”</h2>
        <p>The first interactive conversation will be connected after authentication and speech services are configured.</p>
        <button className="button button-primary" disabled>Start conversation</button>
      </section>
    </div>
  );
}
