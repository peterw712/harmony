import type { ChordQuality, Inversion, Note, SeventhQuality } from './types'
import { transposeByInterval } from './notes'

type QualitySpec = {
  triadSemitones: [number, number, number]
  seventhSemitone?: number
}

const QUALITY_MAP: Record<ChordQuality, QualitySpec> = {
  major: { triadSemitones: [0, 4, 7] },
  minor: { triadSemitones: [0, 3, 7] },
  diminished: { triadSemitones: [0, 3, 6] },
  augmented: { triadSemitones: [0, 4, 8] },
}

const SEVENTH_MAP: Record<SeventhQuality, number | null> = {
  none: null,
  dominant7: 10,
  major7: 11,
  minor7: 10,
  halfDim7: 10,
  dim7: 9,
}

export const buildChordTones = (
  root: Note,
  quality: ChordQuality,
  seventh: SeventhQuality,
): Note[] => {
  const triad = QUALITY_MAP[quality].triadSemitones.map((semitones, index) =>
    transposeByInterval(root, index * 2, semitones),
  )
  const seventhSemitone = SEVENTH_MAP[seventh]
  if (seventhSemitone === null) return triad
  const seventhNote = transposeByInterval(root, 6, seventhSemitone)
  return [...triad, seventhNote]
}

export const applyInversion = (notes: Note[], inversion: Inversion): Note => {
  if (inversion === 'root') return notes[0]
  if (inversion === 'first') return notes[1]
  if (inversion === 'second') return notes[2]
  return notes[3]
}
