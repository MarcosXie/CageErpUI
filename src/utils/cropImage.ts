export interface PixelCrop {
  x: number
  y: number
  width: number
  height: number
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (event) => reject(event))
    image.crossOrigin = 'anonymous'
    image.src = src
  })
}

/** Recorta a imagem no retângulo informado (em pixels) e retorna um File JPEG pronto para upload. */
export async function getCroppedImageFile(imageSrc: string, crop: PixelCrop, fileName: string): Promise<File> {
  const image = await loadImage(imageSrc)
  const canvas = document.createElement('canvas')
  canvas.width = crop.width
  canvas.height = crop.height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Não foi possível processar a imagem.')
  }

  ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height)

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9))
  if (!blob) {
    throw new Error('Não foi possível gerar a imagem recortada.')
  }

  return new File([blob], fileName, { type: 'image/jpeg' })
}
