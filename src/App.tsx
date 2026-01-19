import { useMemo, useState } from 'react'
import Converter from './components/Converter'
import Harmonizer from './components/Harmonizer'
import Guide from './components/Guide'
import type { Mode } from './theory/types'

const TONICS = [
  'C',
  'G',
  'D',
  'A',
  'E',
  'B',
  'F#',
  'C#',
  'F',
  'Bb',
  'Eb',
  'Ab',
  'Db',
  'Gb',
  'Cb',
]

export default function App() {
  const [tonic, setTonic] = useState('C')
  const [mode, setMode] = useState<Mode>('major')

  const keyLabel = useMemo(() => `${tonic} ${mode}`, [tonic, mode])

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <h1>Harmony Calculator</h1>
          <p>Convert Roman numerals ↔ chord symbols and find harmonizations.</p>
        </div>
        <div className="key-select">
          <label>
            Key tonic
            <select value={tonic} onChange={(event) => setTonic(event.target.value)}>
              {TONICS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label>
            Mode
            <select value={mode} onChange={(event) => setMode(event.target.value as Mode)}>
              <option value="major">Major</option>
              <option value="minor">Minor</option>
            </select>
          </label>
        </div>
      </header>

      <main className="grid">
        <Converter tonic={tonic} mode={mode} keyLabel={keyLabel} />
        <Harmonizer tonic={tonic} mode={mode} keyLabel={keyLabel} />
      </main>

      <section className="guide">
        <Guide />
      </section>
    </div>
  )
}
