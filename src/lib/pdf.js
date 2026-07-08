import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

let workerReady = false

async function getPdfjs() {
  // Dynamic import keeps Node/vitest from loading the canvas build for isPdf tests
  const pdfjs = await import('pdfjs-dist')
  if (!workerReady) {
    pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker
    workerReady = true
  }
  return pdfjs
}

/** Render page 1 of a PDF blob to a PNG data URL for thumbnails. */
export async function renderPdfThumbnail(blob, { maxWidth = 96 } = {}) {
  const { getDocument } = await getPdfjs()
  const data = await blob.arrayBuffer()
  const pdf = await getDocument({ data }).promise
  try {
    const page = await pdf.getPage(1)
    const unscaled = page.getViewport({ scale: 1 })
    const scale = maxWidth / unscaled.width
    const viewport = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    canvas.width = Math.ceil(viewport.width)
    canvas.height = Math.ceil(viewport.height)
    await page.render({
      canvasContext: canvas.getContext('2d'),
      viewport,
    }).promise
    return canvas.toDataURL('image/png')
  } finally {
    await pdf.destroy()
  }
}
