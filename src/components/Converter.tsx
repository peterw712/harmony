import { useState } from 'react'
import { convertRomanToSymbol, convertSymbolToRoman } from '../theory'
import type { Mode } from '../theory/types'

type Props = {
  tonic: string
  mode: Mode
  keyLabel: string
}

export default function Converter({ tonic, mode, keyLabel }: Props) {
  const [romanInput, setRomanInput] = useState('V7')
  const [symbolInput, setSymbolInput] = useState('G7')
  const [romanResult, setRomanResult] = useState<string | null>(null)
  const [symbolResult, setSymbolResult] = useState<string | null>(null)
  const [details, setDetails] = useState<string[]>([])

  const runRomanToSymbol = () => {
    const result = convertRomanToSymbol(tonic, mode, romanInput)
    if (!result) {
      setSymbolResult('Invalid Roman numeral.')
      setDetails([])
      return
    }
    setSymbolResult(`${result.symbol}`)
    setDetails([
      `Key: ${keyLabel}`,
      `Chord tones: ${result.chordTones.join(', ')}`,
      `Inversion: ${result.inversion}`,
      `Vocabulary: ${result.vocabularyTag}`,
    ])
  }

  const runSymbolToRoman = () => {
    const result = convertSymbolToRoman(tonic, mode, symbolInput)
    if (!result) {
      setRomanResult('Invalid chord symbol.')
      setDetails([])
      return
    }
    setRomanResult(`${result.roman}`)
    setDetails([
      `Key: ${keyLabel}`,
      `Chord tones: ${result.chordTones.join(', ')}`,
      `Inversion: ${result.inversion}`,
      `Vocabulary: ${result.vocabularyTag}`,
    ])
  }

  return (
    <section className="card">
      <h2>Converter</h2>
      <p>Enter either a Roman numeral or a chord symbol to convert in {keyLabel}.</p>

      <div className="field">
        <label>
          Roman numeral
          <input
            type="text"
            value={romanInput}
            onChange={(event) => setRomanInput(event.target.value)}
            placeholder="e.g., bVII, V7, Ger+6"
          />
        </label>
        <button type="button" onClick={runRomanToSymbol}>
          Convert → Chord symbol
        </button>
        {symbolResult && <div className="result">Result: {symbolResult}</div>}
      </div>

      <div className="field">
        <label>
          Chord symbol
          <input
            type="text"
            value={symbolInput}
            onChange={(event) => setSymbolInput(event.target.value)}
            placeholder="e.g., G7, Bbmaj7, Dm7"
          />
        </label>
        <button type="button" onClick={runSymbolToRoman}>
          Convert → Roman numeral
        </button>
        {romanResult && <div className="result">Result: {romanResult}</div>}
      </div>

      {details.length > 0 && (
        <div className="details">
          {details.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
      )}
    </section>
  )
}
