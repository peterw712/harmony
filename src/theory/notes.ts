import type { Letter, Note } from './types'

export const LETTERS: Letter[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
export const NATURAL_PC: Record<Letter, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
}

const accidentalToText = (accidental: number): string => {
  if (accidental === 0) return ''
  if (accidental > 0) return '#'.repeat(accidental)
  return 'b'.repeat(Math.abs(accidental))
}

export const formatNoteName = (note: Note): string =>
  `${note.letter}${accidentalToText(note.accidental)}`

export const makeNote = (letter: Letter, accidental: number): Note => {
  const basePc = NATURAL_PC[letter]
  const pc = ((basePc + accidental) % 12 + 12) % 12
  return {
    letter,
    accidental,
    pc,
    name: `${letter}${accidentalToText(accidental)}`,
  }
}

export const parseNoteName = (raw: string): Note | null => {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const match = trimmed.match(/^([A-Ga-g])([#bx]{1,2}|bb|##)?$/)
  if (!match) return null
  const letter = match[1].toUpperCase() as Letter
  const accidentalText = match[2] ?? ''
  let accidental = 0
  if (accidentalText === 'b') accidental = -1
  else if (accidentalText === 'bb') accidental = -2
  else if (accidentalText === '#') accidental = 1
  else if (accidentalText === '##') accidental = 2
  else if (accidentalText === 'x') accidental = 2
  else if (accidentalText === 'bx') accidental = 1
  return makeNote(letter, accidental)
}

export const shiftNoteBySemitones = (note: Note, semitones: number): Note => {
  const pc = ((note.pc + semitones) % 12 + 12) % 12
  const basePc = NATURAL_PC[note.letter]
  let diff = ((pc - basePc) % 12 + 12) % 12
  if (diff > 6) diff -= 12
  return makeNote(note.letter, diff)
}

export const transposeByInterval = (
  note: Note,
  letterSteps: number,
  semitones: number,
): Note => {
  const startIndex = LETTERS.indexOf(note.letter)
  const letter = LETTERS[(startIndex + letterSteps) % LETTERS.length]
  const targetPc = ((note.pc + semitones) % 12 + 12) % 12
  const basePc = NATURAL_PC[letter]
  let diff = ((targetPc - basePc) % 12 + 12) % 12
  if (diff > 6) diff -= 12
  return makeNote(letter, diff)
}

export const parseNoteList = (raw: string): Note[] =>
  raw
    .split(/[, ]+/)
    .map((chunk) => parseNoteName(chunk))
    .filter((note): note is Note => Boolean(note))
