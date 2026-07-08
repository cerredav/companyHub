import { describe, it, expect } from 'vitest'
import { isPdf, isPptx, isPreviewable } from '../src/lib/fileTypes.js'

describe('isPdf', () => {
  it('detects application/pdf mime type', () => {
    expect(isPdf({ mimeType: 'application/pdf', name: 'x.bin' })).toBe(true)
  })

  it('detects .pdf extension when mime is missing', () => {
    expect(isPdf({ mimeType: '', name: 'Contract.PDF' })).toBe(true)
  })

  it('rejects non-pdf files', () => {
    expect(isPdf({ mimeType: 'text/plain', name: 'note.txt' })).toBe(false)
  })
})

describe('isPptx', () => {
  it('detects pptx mime type', () => {
    expect(isPptx({
      mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      name: 'deck.bin',
    })).toBe(true)
  })

  it('detects .pptx extension', () => {
    expect(isPptx({ mimeType: '', name: 'Pitch.PPTX' })).toBe(true)
  })

  it('rejects non-pptx files', () => {
    expect(isPptx({ mimeType: 'application/pdf', name: 'a.pdf' })).toBe(false)
  })
})

describe('isPreviewable', () => {
  it('includes pdf and pptx', () => {
    expect(isPreviewable({ mimeType: 'application/pdf', name: 'a.pdf' })).toBe(true)
    expect(isPreviewable({ mimeType: '', name: 'a.pptx' })).toBe(true)
    expect(isPreviewable({ mimeType: 'text/plain', name: 'a.txt' })).toBe(false)
  })
})
