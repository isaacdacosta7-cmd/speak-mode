const phrases = ['What about you?', 'Let me think.', 'I understand.', 'Can you repeat that?', 'It depends.'];

export default function PhrasesPage() {
  return <div className="page-stack"><header className="page-header"><span className="eyebrow">POWER PHRASES</span><h1>Make useful English automatic.</h1><p>Every phrase returns until you can understand it and use it naturally.</p></header><div className="phrase-list">{phrases.map((phrase, i)=><article key={phrase} className="phrase-row"><span className="phrase-play">▶</span><div><strong>{phrase}</strong><small>{i < 2 ? 'Ready to review' : 'Learning'}</small></div><span className="phrase-score">{i < 2 ? '82%' : '46%'}</span></article>)}</div></div>;
}
