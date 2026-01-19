import type { RomanNumeral, RomanNumeralTarget, SeventhQuality } from './types'

const ROMAN_DEGREES: Record<string, number> = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
  VI: 6,
  VII: 7,
}

const parseAccidentals = (text: string): number => {
  let accidental = 0
  for (const char of text) {
    if (char === 'b') accidental -= 1
    if (char === '#') accidental += 1
  }
  return accidental
}

const parseDegree = (roman: string): number | null => {
  const upper = roman.toUpperCase()
  return ROMAN_DEGREES[upper] ?? null
}

const parseSecondary = (raw: string): RomanNumeralTarget | undefined => {
  const match = raw.match(/^([b#]*)([ivIV]+)$/)
  if (!match) return undefined
  const accidental = parseAccidentals(match[1])
  const degree = parseDegree(match[2])
  if (!degree) return undefined
  return { degree, accidental }
}

const parseSeventhQuality = (suffix: string): SeventhQuality => {
  if (!suffix.includes('7')) return 'none'
  if (suffix.includes('ø')) return 'halfDim7'
  if (suffix.includes('o') || suffix.includes('°')) return 'dim7'
  if (suffix.includes('M7')) return 'major7'
  if (suffix.toLowerCase().includes('m7')) return 'minor7'
  return 'dominant7'
}

const parseInversion = (figure: string, isSeventh: boolean) => {
  const normalized = figure.replace('/', '')
  if (!normalized) return 'root'
  if (!isSeventh) {
    if (normalized === '6') return 'first'
    if (normalized === '64') return 'second'
    return 'root'
  }
  if (normalized === '65') return 'first'
  if (normalized === '43') return 'second'
  if (normalized === '42') return 'third'
  return 'root'
}

export const formatInversionFigure = (
  inversion: RomanNumeral['inversion'],
  isSeventh: boolean,
): string => {
  if (!isSeventh) {
    if (inversion === 'first') return '6'
    if (inversion === 'second') return '6/4'
    return ''
  }
  if (inversion === 'first') return '6/5'
  if (inversion === 'second') return '4/3'
  if (inversion === 'third') return '4/2'
  return ''
}

export const parseRomanNumeral = (raw: string): RomanNumeral | null => {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const secondaryMatch = trimmed.match(/\/([b#]*[ivIV]+)$/)
  const secondaryRaw = secondaryMatch ? secondaryMatch[1] : undefined
  const primary = secondaryMatch ? trimmed.slice(0, secondaryMatch.index) : trimmed
  const match = primary.match(/^([b#]*)([ivIV]+)(.*)$/)
  if (!match) return null
  const accidental = parseAccidentals(match[1])
  const romanBody = match[2]
  const suffix = match[3]
  const degree = parseDegree(romanBody)
  if (!degree) return null
  const isUpper = romanBody === romanBody.toUpperCase()
  const isLower = romanBody === romanBody.toLowerCase()

  let quality: RomanNumeral['quality'] = isUpper ? 'major' : 'minor'
  if (suffix.includes('+')) quality = 'augmented'
  if (suffix.includes('o') || suffix.includes('°') || suffix.includes('ø')) {
    quality = 'diminished'
  }

  const figureSeventh = /6\/5|4\/3|4\/2/.test(suffix)
  let seventh = parseSeventhQuality(suffix)
  if (seventh === 'none' && figureSeventh) {
    if (quality === 'minor') seventh = 'minor7'
    else if (quality === 'diminished') seventh = 'halfDim7'
    else seventh = 'dominant7'
  }
  const isSeventh = seventh !== 'none' || figureSeventh

  const inversion = parseInversion(suffix, isSeventh)
  const secondary = secondaryRaw ? parseSecondary(secondaryRaw) : undefined
  if (secondaryRaw && !secondary) return null

  if (isLower && quality === 'major') quality = 'minor'

  return {
    degree,
    accidental,
    quality,
    seventh,
    inversion,
    secondary,
  }
}

const formatSeventhSuffix = (seventh: SeventhQuality): string => {
  if (seventh === 'major7') return 'M7'
  if (seventh === 'halfDim7') return 'ø7'
  if (seventh === 'dim7') return 'o7'
  if (seventh === 'minor7') return '7'
  if (seventh === 'dominant7') return '7'
  return ''
}

const applySeventhFigure = (
  seventhSuffix: string,
  inversion: RomanNumeral['inversion'],
): string => {
  const figure = formatInversionFigure(inversion, true)
  if (!figure) return seventhSuffix
  if (seventhSuffix.endsWith('7')) {
    return `${seventhSuffix.slice(0, -1)}${figure}`
  }
  return `${seventhSuffix}${figure}`
}

export const formatRomanNumeral = (roman: RomanNumeral): string => {
  const accidental = roman.accidental > 0 ? '#'.repeat(roman.accidental) : 'b'.repeat(Math.abs(roman.accidental))
  const base = Object.entries(ROMAN_DEGREES).find(([, deg]) => deg === roman.degree)?.[0] ?? 'I'
  const numeral =
    roman.quality === 'minor' || roman.quality === 'diminished'
      ? base.toLowerCase()
      : base
  const qualitySuffix =
    roman.quality === 'augmented'
      ? '+'
      : roman.quality === 'diminished' && roman.seventh === 'none'
        ? 'o'
        : ''
  const isSeventh = roman.seventh !== 'none'
  const seventhSuffix = formatSeventhSuffix(roman.seventh)
  const inversion = isSeventh
    ? applySeventhFigure(seventhSuffix, roman.inversion)
    : formatInversionFigure(roman.inversion, false)
  const secondary = roman.secondary
    ? `/${formatRomanNumeral({
        degree: roman.secondary.degree,
        accidental: roman.secondary.accidental,
        quality: 'major',
        seventh: 'none',
        inversion: 'root',
      })}`
    : ''
  return `${accidental}${numeral}${qualitySuffix}${inversion}${secondary}`
}
