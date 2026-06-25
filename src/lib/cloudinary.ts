export async function uploadToCloudinary(
  file: File,
  folder: string = 'asmaa-brand'
): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', 'asmaa_brand_unsigned') // create this in Cloudinary dashboard
  formData.append('folder', folder)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
    { method: 'POST', body: formData }
  )

  if (!res.ok) throw new Error('Cloudinary upload failed')
  const data = await res.json()
  return data.secure_url
}

export async function uploadMultiple(files: File[], folder?: string): Promise<string[]> {
  return Promise.all(files.map((f) => uploadToCloudinary(f, folder)))
}
