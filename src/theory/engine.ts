import type {
  Chord,
  ConversionResult,
  HarmonizationResult,
  Inversion,
  Key,
  Mode,
  ParsedChordSymbol,
  RomanNumeral,
  SeventhQuality,
} from './types'
import { buildChordTones, applyInversion } from './chords'
import { buildKey, degreeToScaleNote, keyName } from './keys'
import { formatNoteName, makeNote, parseNoteList, parseNoteName } from './notes'
import { formatRomanNumeral, parseRomanNumeral } from './roman'
import { formatChordSymbol, parseChordSymbol } from './symbols'
import { LETTERS } from './notes'

const qualityFromSeventh = (
  quality: RomanNumeral['quality'],
  seventh: SeventhQuality,
): SeventhQuality => {
  if (quality === 'diminished' && seventh === 'dominant7') return 'halfDim7'
  return seventh
}

const inversionFromBass = (notes: { name: string; pc?: number }[], bassName?: string): Inversion => {
  if (!bassName) return 'root'
  let bassIndex = notes.findIndex((note) => note.name === bassName)
  if (bassIndex === -1) {
    const parsed = parseNoteName(bassName)
    if (parsed) {
      bassIndex = notes.findIndex((note) => note.pc === parsed.pc)
    }
  }
  if (bassIndex === 1) return 'first'
  if (bassIndex === 2) return 'second'
  if (bassIndex === 3) return 'third'
  return 'root'
}

const applySecondaryKey = (key: Key, roman: RomanNumeral): Key => {
  if (!roman.secondary) return key
  const target = degreeToScaleNote(key, roman.secondary.degree, roman.secondary.accidental)
  return buildKey(target.name, 'major')
}

const buildAugmentedSixthChord = (
  key: Key,
  type: 'It+6' | 'Fr+6' | 'Ger+6',
  vocabularyTag: string,
): Chord => {
  const flatSixAccidental = key.mode === 'minor' ? 0 : -1
  const flatSix = degreeToScaleNote(key, 6, flatSixAccidental)
  const tonic = degreeToScaleNote(key, 1, 0)
  const sharpFour = degreeToScaleNote(key, 4, 1)
  const extra =
    type === 'Fr+6'
      ? degreeToScaleNote(key, 2, 0)
      : type === 'Ger+6'
        ? degreeToScaleNote(key, 3, key.mode === 'minor' ? 0 : -1)
        : null
  const notes = extra ? [flatSix, tonic, extra, sharpFour] : [flatSix, tonic, sharpFour]
  const symbol = `${formatNoteName(flatSix)}+6(${type.replace('+6', '')})`
  return {
    root: flatSix,
    quality: 'major',
    seventh: 'none',
    notes,
    bass: flatSix,
    inversion: 'root',
    roman: type,
    symbol,
    vocabularyTag,
  }
}

export const buildChordFromRoman = (
  key: Key,
  roman: RomanNumeral,
  vocabularyTag: string,
  symbolOverride?: string,
): Chord => {
  const targetKey = applySecondaryKey(key, roman)
  let root = degreeToScaleNote(targetKey, roman.degree, roman.accidental)
  if (
    targetKey.mode === 'minor' &&
    roman.degree === 7 &&
    roman.accidental === 0 &&
    roman.quality === 'diminished' &&
    !roman.secondary
  ) {
    root = makeNote(root.letter, root.accidental + 1)
  }
  const adjustedSeventh = qualityFromSeventh(roman.quality, roman.seventh)
  const chordNotes = buildChordTones(root, roman.quality, adjustedSeventh)
  const bass = applyInversion(chordNotes, roman.inversion)
  const symbol = symbolOverride ?? formatChordSymbol(root, roman.quality, adjustedSeventh, roman.inversion === 'root' ? undefined : bass)
  return {
    root,
    quality: roman.quality,
    seventh: adjustedSeventh,
    notes: chordNotes,
    bass,
    inversion: roman.inversion,
    roman: formatRomanNumeral(roman),
    symbol,
    vocabularyTag,
  }
}

const chordToResult = (key: Key, chord: Chord): ConversionResult => ({
  keyName: keyName(key),
  roman: chord.roman,
  symbol: chord.symbol,
  chordTones: chord.notes.map((note) => note.name),
  inversion: chord.inversion,
  vocabularyTag: chord.vocabularyTag,
})

const pitchClassSet = (notes: { pc: number }[]) =>
  new Set(notes.map((note) => note.pc))

const matchesPitchClasses = (a: Set<number>, b: Set<number>) => {
  if (a.size !== b.size) return false
  for (const value of a) {
    if (!b.has(value)) return false
  }
  return true
}

export const generateVocabulary = (key: Key): Chord[] => {
  const vocabulary: Chord[] = []

  const addRoman = (raw: string, tag: string, symbolOverride?: string) => {
    const roman = parseRomanNumeral(raw)
    if (!roman) return
    vocabulary.push(buildChordFromRoman(key, roman, tag, symbolOverride))
  }

  const diatonicTriads =
    key.mode === 'major'
      ? ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'viio']
      : ['i', 'iio', 'III', 'iv', 'V', 'VI', 'viio']
  diatonicTriads.forEach((roman) => addRoman(roman, 'diatonic-triad'))

  const diatonicSevenths =
    key.mode === 'major'
      ? ['IM7', 'ii7', 'iii7', 'IVM7', 'V7', 'vi7', 'viiø7']
      : ['i7', 'iiø7', 'IIIM7', 'iv7', 'V7', 'VIM7', 'viio7']
  diatonicSevenths.forEach((roman) => addRoman(roman, 'diatonic-seventh'))

  const mixture =
    key.mode === 'major'
      ? ['iv', 'bIII', 'bVI', 'bVII', 'iio']
      : ['I', 'IV', 'V', 'bII', 'bVI', 'bVII']
  mixture.forEach((roman) => addRoman(roman, 'modal-mixture'))

  const secondaryTargets = [2, 3, 4, 5, 6]
  secondaryTargets.forEach((target) => {
    const romanTarget = `V/${formatRomanNumeral({
      degree: target,
      accidental: 0,
      quality: 'major',
      seventh: 'none',
      inversion: 'root',
    })}`
    addRoman(romanTarget, 'secondary-dominant')
    const viiTarget = `viio/${formatRomanNumeral({
      degree: target,
      accidental: 0,
      quality: 'major',
      seventh: 'none',
      inversion: 'root',
    })}`
    addRoman(viiTarget, 'secondary-leading-tone')
    addRoman(`${romanTarget}7`, 'secondary-dominant')
  })

  if (key.mode === 'minor') {
    addRoman('bII6', 'neapolitan')
  }

  vocabulary.push(buildAugmentedSixthChord(key, 'It+6', 'augmented-sixth'))
  vocabulary.push(buildAugmentedSixthChord(key, 'Fr+6', 'augmented-sixth'))
  vocabulary.push(buildAugmentedSixthChord(key, 'Ger+6', 'augmented-sixth'))

  return vocabulary
}

export const convertRomanToSymbol = (
  tonic: string,
  mode: Mode,
  romanRaw: string,
): ConversionResult | null => {
  const key = buildKey(tonic, mode)
  if (romanRaw.trim().startsWith('It+6')) {
    return chordToResult(key, buildAugmentedSixthChord(key, 'It+6', 'input'))
  }
  if (romanRaw.trim().startsWith('Fr+6')) {
    return chordToResult(key, buildAugmentedSixthChord(key, 'Fr+6', 'input'))
  }
  if (romanRaw.trim().startsWith('Ger+6')) {
    return chordToResult(key, buildAugmentedSixthChord(key, 'Ger+6', 'input'))
  }
  const roman = parseRomanNumeral(romanRaw)
  if (!roman) return null
  const chord = buildChordFromRoman(key, roman, 'input')
  return chordToResult(key, chord)
}

const romanFromChordSymbol = (
  key: Key,
  symbol: ParsedChordSymbol,
  chordNotes: { name: string; pc?: number }[],
): RomanNumeral => {
  const tonicIndex = LETTERS.indexOf(key.tonic.letter)
  const rootIndex = LETTERS.indexOf(symbol.root.letter)
  const degree = ((rootIndex - tonicIndex + 7) % 7) + 1
  const scaleNote = key.scale[degree - 1]
  const accidental = symbol.root.accidental - scaleNote.accidental
  const inversion = inversionFromBass(chordNotes, symbol.bass?.name)
  return {
    degree,
    accidental,
    quality: symbol.quality,
    seventh: symbol.seventh,
    inversion,
  }
}

export const convertSymbolToRoman = (
  tonic: string,
  mode: Mode,
  symbolRaw: string,
): ConversionResult | null => {
  const key = buildKey(tonic, mode)
  const symbol = parseChordSymbol(symbolRaw)
  if (!symbol) return null
  const chordNotes = buildChordTones(symbol.root, symbol.quality, symbol.seventh)
  const bass = symbol.bass ?? symbol.root
  const vocabulary = generateVocabulary(key)
  const symbolSet = pitchClassSet(chordNotes)
  const matched = vocabulary.find((candidate) => {
    if (candidate.root.letter !== symbol.root.letter) return false
    if (candidate.root.pc !== symbol.root.pc) return false
    const candidateSet = pitchClassSet(candidate.notes)
    return matchesPitchClasses(candidateSet, symbolSet)
  })

  const roman = matched
    ? parseRomanNumeral(matched.roman) ?? romanFromChordSymbol(key, symbol, chordNotes)
    : romanFromChordSymbol(key, symbol, chordNotes)
  const inversion = inversionFromBass(chordNotes, bass.name)
  const chord = buildChordFromRoman(
    key,
    { ...roman, inversion },
    matched?.vocabularyTag ?? 'input',
  )
  return chordToResult(key, chord)
}

export const harmonizeNotes = (
  tonic: string,
  mode: Mode,
  notesRaw: string,
  bassRaw?: string,
): HarmonizationResult[] => {
  const key = buildKey(tonic, mode)
  const notes = parseNoteList(notesRaw)
  if (!notes.length) return []
  const bass = bassRaw ? parseNoteName(bassRaw) : null
  const vocabulary = generateVocabulary(key)
  const targetSet = pitchClassSet(notes)
  const results = vocabulary.filter((chord) => {
    const chordSet = pitchClassSet(chord.notes)
    for (const pc of targetSet) {
      if (!chordSet.has(pc)) return false
    }
    if (bass && chord.bass.pc !== bass.pc) return false
    return true
  })
  return results.map((chord) => chordToResult(key, chord))
}
