import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads')

export async function saveFile(id: string, buffer: Buffer, filename: string): Promise<string> {
  const ext = filename.includes('.') ? filename.split('.').pop() : ''
  const stored = ext ? `${id}.${ext}` : id
  await writeFile(join(UPLOAD_DIR, stored), buffer)
  return `/uploads/${stored}`
}

export async function deleteFile(url: string): Promise<void> {
  const filename = url.replace('/uploads/', '')
  await unlink(join(UPLOAD_DIR, filename)).catch(() => {})
}
