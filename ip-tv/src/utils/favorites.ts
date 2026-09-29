import { LocalStorage } from '@raycast/api'

const KEY = 'iptv.favorites'

export async function loadFavorites(): Promise<string[]> {
  const raw = await LocalStorage.getItem<string>(KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function toggleFavorite(id: string): Promise<string[]> {
  const current = await loadFavorites()
  const next = current.includes(id) ? current.filter((f) => f !== id) : [...current, id]
  await LocalStorage.setItem(KEY, JSON.stringify(next))
  return next
}
