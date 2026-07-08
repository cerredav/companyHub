export function isPdf(record) {
  if (!record) return false
  if (record.mimeType === 'application/pdf') return true
  return /\.pdf$/i.test(record.name || '')
}

const PPTX_MIME = new Set([
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint.presentation.macroenabled.12',
])

export function isPptx(record) {
  if (!record) return false
  if (PPTX_MIME.has(record.mimeType)) return true
  return /\.pptx$/i.test(record.name || '')
}

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|bmp|svg|avif|heic)$/i
const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogv|avi|mkv)$/i

export function isImage(record) {
  if (!record) return false
  if (record.mimeType?.startsWith('image/')) return true
  return IMAGE_EXT.test(record.name || '')
}

export function isVideo(record) {
  if (!record) return false
  if (record.mimeType?.startsWith('video/')) return true
  return VIDEO_EXT.test(record.name || '')
}

/** Files that open in an in-browser viewer (PDF, PPTX, image, or video). */
export function isPreviewable(record) {
  return isPdf(record) || isPptx(record) || isImage(record) || isVideo(record)
}
