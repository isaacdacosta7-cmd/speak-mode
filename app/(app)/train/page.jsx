const steps = [
  ['01', 'Hear It', 'Listen to the phrase in a natural conversation.'],
  ['02', 'Copy It', 'Repeat it until the rhythm feels comfortable.'],
  ['03', 'Build It', 'Change key words and make the structure yours.'],
  ['04', 'Answer It', 'Respond quickly to short prompts.'],
  ['05', 'Use It', 'Complete a real-life mini situation.'],
  ['06', 'Speak It', 'Finish with a short open conversation.'],
];

export default function TrainPage() {
  return (
    <div className="page-stack">
      <header className="page-header"><span className="eyebrow">TRAIN</span><h1>The Speak Loop</h1><p>One structure. Multiple contexts. Repetition until it becomes automatic.</p></header>
      <div className="loop-grid">
        {steps.map(([number, title, text]) => <article className="loop-card" key={title}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}
      </div>
    </div>
  );
}
