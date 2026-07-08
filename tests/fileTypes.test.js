import { describe, it, expect } from 'vitest'
import { isPdf, isPptx, isImage, isVideo, isPreviewable } from '../src/lib/fileTypes.js'

describe('fileTypes', () => {
  it('detects PDF by mime and extension', () => {
    expect(isPdf({ mimeType: 'application/pdf', name: 'x.bin' })).toBe(true)
    expect(isPdf({ mimeType: 'text/plain', name: 'doc.pdf' })).toBe(true)
    expect(isPdf({ mimeType: 'text/plain', name: 'doc.txt' })).toBe(false)
  })

  it('detects PPTX by mime and extension', () => {
    expect(isPptx({
      mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      name: 'deck.bin',
    })).toBe(true)
    expect(isPptx({ mimeType: 'text/plain', name: 'deck.pptx' })).toBe(true)
    expect(isPptx({ mimeType: 'text/plain', name: 'deck.pdf' })).toBe(false)
  })

  it('detects images by mime and extension', () => {
    expect(isImage({ mimeType: 'image/png', name: 'a.bin' })).toBe(true)
    expect(isImage({ mimeType: 'application/octet-stream', name: 'photo.jpeg' })).toBe(true)
    expect(isImage({ mimeType: 'application/octet-stream', name: 'doc.pdf' })).toBe(false)
  })

  it('detects videos by mime and extension', () => {
    expect(isVideo({ mimeType: 'video/mp4', name: 'a.bin' })).toBe(true)
    expect(isVideo({ mimeType: 'application/octet-stream', name: 'clip.webm' })).toBe(true)
    expect(isVideo({ mimeType: 'application/octet-stream', name: 'doc.pdf' })).toBe(false)
  })

  it('marks previewable types', () => {
    expect(isPreviewable({ mimeType: 'application/pdf', name: 'a.pdf' })).toBe(true)
    expect(isPreviewable({ mimeType: 'image/jpeg', name: 'a.jpg' })).toBe(true)
    expect(isPreviewable({ mimeType: 'video/mp4', name: 'a.mp4' })).toBe(true)
    expect(isPreviewable({ mimeType: 'text/plain', name: 'readme.txt' })).toBe(false)
  })
})
