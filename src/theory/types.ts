export type Letter = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'
export type Mode = 'major' | 'minor'
export type ScaleType = 'major' | 'naturalMinor' | 'harmonicMinor' | 'melodicMinor'

export type Note = {
  letter: Letter
  accidental: number
  name: string
  pc: number
}

export type Key = {
  tonic: Note
  mode: Mode
  preferSharps: boolean
  scale: Note[]
}

export type ChordQuality = 'major' | 'minor' | 'diminished' | 'augmented'
export type SeventhQuality =
  | 'none'
  | 'dominant7'
  | 'major7'
  | 'minor7'
  | 'halfDim7'
  | 'dim7'

export type Inversion = 'root' | 'first' | 'second' | 'third'

export type Chord = {
  root: Note
  quality: ChordQuality
  seventh: SeventhQuality
  notes: Note[]
  bass: Note
  inversion: Inversion
  roman: string
  symbol: string
  vocabularyTag: string
}

export type RomanNumeralTarget = {
  degree: number
  accidental: number
}

export type RomanNumeral = {
  degree: number
  accidental: number
  quality: ChordQuality
  seventh: SeventhQuality
  inversion: Inversion
  secondary?: RomanNumeralTarget
}

export type ParsedChordSymbol = {
  root: Note
  quality: ChordQuality
  seventh: SeventhQuality
  inversion: Inversion
  bass?: Note
}

export type ConversionResult = {
  keyName: string
  roman: string
  symbol: string
  chordTones: string[]
  inversion: Inversion
  vocabularyTag: string
}

export type HarmonizationResult = ConversionResult
