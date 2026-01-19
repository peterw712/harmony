import guide from '../content/roman-numeral-guide.md?raw'

export default function Guide() {
  return (
    <section className="card guide-card">
      <h2>Roman Numeral Guide</h2>
      <pre className="guide-text">{guide}</pre>
    </section>
  )
}
