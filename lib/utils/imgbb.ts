/**
 * ImgBB Image Upload Utility
 * Free image hosting - Simple and easy to use
 * Get your free API key from: https://api.imgbb.com/
 */

export const uploadImageToImgBB = async (file: File): Promise<string | null> => {
  try {
    // ImgBB API key - Get free key from https://api.imgbb.com/
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY

    if (!apiKey) {
      console.error('❌ ImgBB API key is missing!')
      console.error('Get your free API key from: https://api.imgbb.com/')
      console.error('Then add it to .env.local as: NEXT_PUBLIC_IMGBB_API_KEY=your_key_here')
      throw new Error('ImgBB API key is required. Get a free key from https://api.imgbb.com/')
    }

    // Convert file to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Remove data:image/...;base64, prefix
        const base64String = result.split(',')[1]
        resolve(base64String)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

    const formData = new FormData()
    formData.append('key', apiKey)
    formData.append('image', base64)

    console.log('📤 Uploading image to ImgBB:', {
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(2)} KB`,
    })

    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      let errorData: any = {}
      try {
        errorData = await response.json()
      } catch {
        errorData = { message: 'Could not parse error response' }
      }

      console.error('❌ ImgBB Upload Failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      })

      if (response.status === 400) {
        const errorMsg = errorData.error?.message || 'Invalid request'
        if (errorMsg.includes('key') || errorMsg.includes('API')) {
          throw new Error('Invalid ImgBB API key. Get a free key from https://api.imgbb.com/')
        }
        throw new Error(`ImgBB 400: ${errorMsg}`)
      }

      throw new Error(`Upload failed: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`)
    }

    const data = await response.json()
    
    if (!data.data || !data.data.url) {
      throw new Error('No image URL returned from ImgBB')
    }

    console.log('✅ Image uploaded successfully:', data.data.url.substring(0, 50) + '...')
    return data.data.url
  } catch (error) {
    console.error('Error uploading image to ImgBB:', error)
    if (error instanceof Error) {
      throw error
    }
    return null
  }
}

export const uploadMultipleImages = async (files: File[]): Promise<string[]> => {
  const uploadPromises = files.map(file => uploadImageToImgBB(file))
  const results = await Promise.all(uploadPromises)
  return results.filter((url): url is string => url !== null)
}
