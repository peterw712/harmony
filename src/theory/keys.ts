import type { Key, Mode, Note, ScaleType } from './types'
import { LETTERS, makeNote, parseNoteName, transposeByInterval } from './notes'

const MAJOR_INTERVALS = [0, 2, 4, 5, 7, 9, 11]
const NAT_MINOR_INTERVALS = [0, 2, 3, 5, 7, 8, 10]
const HAR_MINOR_INTERVALS = [0, 2, 3, 5, 7, 8, 11]
const MEL_MINOR_INTERVALS = [0, 2, 3, 5, 7, 9, 11]

const SHARP_KEYS = new Set(['G', 'D', 'A', 'E', 'B', 'F#', 'C#'])
const SHARP_MINOR_KEYS = new Set(['E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#'])

const getPreferSharps = (tonicName: string, mode: Mode): boolean => {
  if (tonicName.includes('#')) return true
  if (tonicName.includes('b')) return false
  if (mode === 'major') return SHARP_KEYS.has(tonicName)
  return SHARP_MINOR_KEYS.has(tonicName)
}

const intervalsForScale = (scaleType: ScaleType): number[] => {
  if (scaleType === 'major') return MAJOR_INTERVALS
  if (scaleType === 'harmonicMinor') return HAR_MINOR_INTERVALS
  if (scaleType === 'melodicMinor') return MEL_MINOR_INTERVALS
  return NAT_MINOR_INTERVALS
}

export const buildScale = (tonic: Note, scaleType: ScaleType): Note[] => {
  const intervals = intervalsForScale(scaleType)
  return intervals.map((interval, degreeIndex) =>
    transposeByInterval(tonic, degreeIndex, interval),
  )
}

export const buildKey = (tonicName: string, mode: Mode): Key => {
  const tonic = parseNoteName(tonicName)
  if (!tonic) {
    throw new Error(`Invalid tonic: ${tonicName}`)
  }
  const scaleType: ScaleType = mode === 'major' ? 'major' : 'naturalMinor'
  const scale = buildScale(tonic, scaleType)
  const normalizedTonic = makeNote(tonic.letter, tonic.accidental)
  const normalizedName = normalizedTonic.name
  return {
    tonic: normalizedTonic,
    mode,
    preferSharps: getPreferSharps(normalizedName, mode),
    scale,
  }
}

export const degreeToScaleNote = (
  key: Key,
  degree: number,
  accidental: number,
): Note => {
  const base = key.scale[degree - 1]
  return makeNote(base.letter, base.accidental + accidental)
}

export const keyName = (key: Key): string => `${key.tonic.name} ${key.mode}`
