/** Poster frame at ~0.5s for attachment thumbnails. */
export function renderVideoThumbnail(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true

    const cleanup = () => {
      URL.revokeObjectURL(url)
      video.removeAttribute('src')
      video.load()
    }

    const fail = (err) => {
      cleanup()
      reject(err instanceof Error ? err : new Error('Video thumbnail failed'))
    }

    video.addEventListener('error', () => fail(new Error('Video decode failed')), { once: true })

    video.addEventListener('loadedmetadata', () => {
      const seekTo = Math.min(0.5, Math.max(0, (video.duration || 1) * 0.1))
      video.currentTime = seekTo
    }, { once: true })

    video.addEventListener('seeked', () => {
      try {
        const w = video.videoWidth
        const h = video.videoHeight
        if (!w || !h) {
          fail(new Error('No video dimensions'))
          return
        }
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        canvas.getContext('2d').drawImage(video, 0, 0, w, h)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
        cleanup()
        resolve(dataUrl)
      } catch (err) {
        fail(err)
      }
    }, { once: true })

    video.src = url
  })
}
