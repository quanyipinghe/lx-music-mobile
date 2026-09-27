export const MAX_USER_API_COUNT = 20

export interface UserApiBackupItem {
  id: string
  script: string
  allowShowUpdateAlert: boolean
}

export const mergeUserApiBackup = (current: UserApiBackupItem[], backup: UserApiBackupItem[]) => {
  const merged = current.map(item => ({ ...item }))
  const indexes = new Map(merged.map((item, index) => [item.id, index]))

  for (const item of backup) {
    const index = indexes.get(item.id)
    if (index == null) {
      indexes.set(item.id, merged.length)
      merged.push({ ...item })
    } else {
      merged[index] = { ...item }
    }
  }
  if (merged.length > MAX_USER_API_COUNT) throw new Error('USER_API_LIMIT')
  return merged
}
