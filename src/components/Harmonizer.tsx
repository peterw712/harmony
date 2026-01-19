import { useMemo, useState } from 'react'
import { harmonizeNotes } from '../theory'
import type { Mode } from '../theory/types'

type Props = {
  tonic: string
  mode: Mode
  keyLabel: string
}

export default function Harmonizer({ tonic, mode, keyLabel }: Props) {
  const [notesInput, setNotesInput] = useState('C E G')
  const [bassInput, setBassInput] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const results = useMemo(() => {
    if (!submitted) return []
    return harmonizeNotes(tonic, mode, notesInput, bassInput || undefined)
  }, [submitted, tonic, mode, notesInput, bassInput])

  return (
    <section className="card">
      <h2>Harmonizer</h2>
      <p>
        Provide a set of notes and the calculator will list all matching chords in {keyLabel} from the
        vocabulary.
      </p>

      <div className="field">
        <label>
          Notes (space or comma separated)
          <input
            type="text"
            value={notesInput}
            onChange={(event) => setNotesInput(event.target.value)}
            placeholder="e.g., C E G A"
          />
        </label>
      </div>

      <div className="field">
        <label>
          Bass note (optional)
          <input
            type="text"
            value={bassInput}
            onChange={(event) => setBassInput(event.target.value)}
            placeholder="e.g., E"
          />
        </label>
      </div>

      <button type="button" onClick={() => setSubmitted(true)}>
        Find harmonizations
      </button>

      {submitted && results.length === 0 && (
        <div className="result">No matches found for those notes in {keyLabel}.</div>
      )}

      {results.length > 0 && (
        <div className="results-list">
          {results.map((result) => (
            <div key={`${result.roman}-${result.symbol}`} className="result-card">
              <div className="result-title">
                {result.roman} → {result.symbol}
              </div>
              <div className="result-meta">
                Chord tones: {result.chordTones.join(', ')}
              </div>
              <div className="result-meta">Inversion: {result.inversion}</div>
              <div className="result-meta">Vocabulary: {result.vocabularyTag}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
