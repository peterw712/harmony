import { describe, expect, it } from 'vitest'
import { convertRomanToSymbol, convertSymbolToRoman, harmonizeNotes } from './engine'

describe('Roman numeral conversion (AP style)', () => {
  it('handles diminished triads without forcing sevenths', () => {
    const result = convertRomanToSymbol('C', 'major', 'viio')
    expect(result?.symbol).toBe('Bdim')
    expect(result?.roman).toBe('viio')
    expect(result?.chordTones).toEqual(['B', 'D', 'F'])
  })

  it('handles half-diminished sevenths', () => {
    const result = convertRomanToSymbol('C', 'major', 'viiø7')
    expect(result?.symbol).toBe('Bm7b5')
    expect(result?.roman).toBe('viiø7')
    expect(result?.chordTones).toEqual(['B', 'D', 'F', 'A'])
  })

  it('uses raised leading tone for viio7 in minor', () => {
    const result = convertRomanToSymbol('C', 'minor', 'viio7')
    expect(result?.symbol).toBe('Bdim7')
    expect(result?.roman).toBe('viio7')
    expect(result?.chordTones).toEqual(['B', 'D', 'F', 'Ab'])
  })

  it('formats seventh inversions with figures', () => {
    const result = convertRomanToSymbol('C', 'major', 'V6/5')
    expect(result?.symbol).toBe('G7/B')
    expect(result?.roman).toBe('V6/5')
  })
})

describe('Chord symbol conversion', () => {
  it('detects triad inversion from slash chord', () => {
    const result = convertSymbolToRoman('C', 'major', 'C/E')
    expect(result?.roman).toBe('I6')
  })

  it('detects seventh inversion from slash chord', () => {
    const result = convertSymbolToRoman('C', 'major', 'G7/D')
    expect(result?.roman).toBe('V4/3')
  })

  it('handles half-diminished seventh inversions', () => {
    const result = convertSymbolToRoman('C', 'major', 'Bm7b5/D')
    expect(result?.roman).toBe('viiø6/5')
  })
})

describe('Vocabulary harmonizer', () => {
  it('returns Neapolitan in minor only', () => {
    const minor = harmonizeNotes('A', 'minor', 'Bb D F')
    const major = harmonizeNotes('A', 'major', 'Bb D F')
    expect(minor.some((chord) => chord.roman.startsWith('bII'))).toBe(true)
    expect(major.some((chord) => chord.roman.startsWith('bII'))).toBe(false)
  })

  it('supports augmented sixth sets in minor', () => {
    const results = harmonizeNotes('A', 'minor', 'F A D#')
    expect(results.some((chord) => chord.roman === 'It+6')).toBe(true)
  })
})
