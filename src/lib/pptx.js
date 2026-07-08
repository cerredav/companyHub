/** Render slide 0 of a PPTX blob to a PNG data URL for thumbnails. */
export async function renderPptxThumbnail(blob, { maxWidth = 96 } = {}) {
  const { PptxRenderer } = await import('pptx-browser')
  const renderer = new PptxRenderer()
  try {
    await renderer.load(blob)
    if (!renderer.slideCount) throw new Error('Empty presentation')
    const canvas = document.createElement('canvas')
    await renderer.renderSlide(0, canvas, maxWidth)
    return canvas.toDataURL('image/png')
  } finally {
    renderer.destroy()
  }
}

export async function loadPptxRenderer(blob) {
  const { PptxRenderer } = await import('pptx-browser')
  const renderer = new PptxRenderer()
  await renderer.load(blob)
  return renderer
}
