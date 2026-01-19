import type { ParsedChordSymbol, SeventhQuality } from './types'
import { formatNoteName, parseNoteName } from './notes'

const parseQuality = (suffix: string) => {
  const lower = suffix.toLowerCase()
  if (lower.includes('dim') || suffix.includes('o')) return 'diminished'
  if (lower.includes('aug') || suffix.includes('+')) return 'augmented'
  if (lower.startsWith('m') && !lower.startsWith('maj')) return 'minor'
  return 'major'
}

const parseSeventh = (suffix: string): SeventhQuality => {
  const lower = suffix.toLowerCase()
  if (suffix.includes('ø') || lower.includes('m7b5')) return 'halfDim7'
  if (lower.includes('dim7') || suffix.includes('o7')) return 'dim7'
  if (lower.includes('maj7') || suffix.includes('M7')) return 'major7'
  if (lower.includes('m7')) return 'minor7'
  if (lower.includes('7')) return 'dominant7'
  return 'none'
}

export const parseChordSymbol = (raw: string): ParsedChordSymbol | null => {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const [symbolRaw, bassRaw] = trimmed.split('/')
  const match = symbolRaw.match(/^([A-Ga-g])([#bx]{1,2}|bb|##)?(.*)$/)
  if (!match) return null
  const root = parseNoteName(`${match[1]}${match[2] ?? ''}`)
  if (!root) return null
  const suffix = match[3] ?? ''
  const quality = parseQuality(suffix)
  const seventh = parseSeventh(suffix)
  const bass = bassRaw ? parseNoteName(bassRaw) : undefined
  return {
    root,
    quality,
    seventh,
    inversion: 'root',
    bass: bass ?? undefined,
  }
}

const formatQuality = (quality: ParsedChordSymbol['quality'], seventh: SeventhQuality) => {
  if (seventh === 'halfDim7') return 'm7b5'
  if (seventh === 'dim7') return 'dim7'
  if (seventh === 'major7') return quality === 'major' ? 'maj7' : 'mMaj7'
  if (seventh === 'minor7') return 'm7'
  if (seventh === 'dominant7') return '7'

  if (quality === 'minor') return 'm'
  if (quality === 'diminished') return 'dim'
  if (quality === 'augmented') return 'aug'
  return ''
}

export const formatChordSymbol = (
  root: ParsedChordSymbol['root'],
  quality: ParsedChordSymbol['quality'],
  seventh: SeventhQuality,
  bass?: ParsedChordSymbol['bass'],
): string => {
  const base = `${formatNoteName(root)}${formatQuality(quality, seventh)}`
  if (bass) return `${base}/${formatNoteName(bass)}`
  return base
}
