import { action, state } from '@/store/userApi'
import { addUserApi, getUserApiScript, overwriteUserApis, parseUserApiScript, removeUserApi as removeUserApiFromStore, setUserApiAllowShowUpdateAlert as setUserApiAllowShowUpdateAlertFromStore } from '@/utils/data'
import { destroy, loadScript } from '@/utils/nativeModules/userApi'
import { log as writeLog } from '@/utils/log'
import { MAX_USER_API_COUNT, mergeUserApiBackup, type UserApiBackupItem } from '@/utils/userApiBackup'
import settingState from '@/store/setting/state'


export const setUserApi = async(apiId: string) => {
  global.lx.qualityList = {}
  setUserApiStatus(false, 'initing')

  const target = state.list.find(api => api.id === apiId)
  if (!target) throw new Error('api not found')
  const script = await getUserApiScript(target.id)
  loadScript({ ...target, script })
}

export const destroyUserApi = () => {
  destroy()
}


export const setUserApiStatus: typeof action['setStatus'] = (status, message) => {
  action.setStatus(status, message)
}

export const setUserApiList: typeof action['setUserApiList'] = (list) => {
  action.setUserApiList(list)
}

export const importUserApi = async(script: string) => {
  const info = await addUserApi(script)
  action.addUserApi(info)
}

function assertUserApiBackupItem(item: unknown): asserts item is UserApiBackupItem {
  if (typeof item != 'object' || item == null) throw new Error(global.i18n.t('user_api_backup_invalid'))
  const data = item as Partial<UserApiBackupItem>
  if (typeof data.id != 'string' || !/^user_api_[\w-]+$/.test(data.id)) throw new Error(global.i18n.t('user_api_backup_invalid_id'))
  if (typeof data.script != 'string' || data.script.length > 9_000_000 || typeof data.allowShowUpdateAlert != 'boolean') {
    throw new Error(global.i18n.t('user_api_backup_invalid'))
  }
  parseUserApiScript(data.script)
}

export const validateUserApiBackup = (data: unknown): LX.ConfigFile.UserApiBackup => {
  if (typeof data != 'object' || data == null || (data as { type?: unknown }).type != 'userApi_v1' || !Array.isArray((data as { data?: unknown }).data)) {
    throw new Error(global.i18n.t('user_api_backup_invalid_type'))
  }
  const backup = data as LX.ConfigFile.UserApiBackup
  const ids = new Set<string>()
  for (const item of backup.data) {
    assertUserApiBackupItem(item)
    if (ids.has(item.id)) throw new Error(global.i18n.t('user_api_backup_duplicate_id'))
    ids.add(item.id)
  }
  if (new Set([...state.list.map(item => item.id), ...ids]).size > MAX_USER_API_COUNT) throw new Error(global.i18n.t('user_api_max_tip'))
  return backup
}

export const getUserApiBackup = async(): Promise<LX.ConfigFile.UserApiBackup> => ({
  type: 'userApi_v1',
  data: await Promise.all(state.list.map(async({ id, allowShowUpdateAlert }) => ({
    id,
    allowShowUpdateAlert,
    script: await getUserApiScript(id),
  }))),
})

export const restoreUserApiBackup = async(data: unknown) => {
  const backup = validateUserApiBackup(data)
  const current = (await getUserApiBackup()).data
  let merged: UserApiBackupItem[]
  try {
    merged = mergeUserApiBackup(current, backup.data)
  } catch (err) {
    if ((err as Error).message == 'USER_API_LIMIT') throw new Error(global.i18n.t('user_api_max_tip'))
    throw err
  }
  const list = await overwriteUserApis(merged)
  action.setUserApiList(list)
  const activeId = settingState.setting['common.apiSource']
  if (backup.data.some(item => item.id == activeId)) await setUserApi(activeId)
}

export const removeUserApi = async(ids: string[]) => {
  const list = await removeUserApiFromStore(ids)
  action.setUserApiList(list)
}

export const setUserApiAllowShowUpdateAlert = async(id: string, enable: boolean) => {
  await setUserApiAllowShowUpdateAlertFromStore(id, enable)
  action.setUserApiAllowShowUpdateAlert(id, enable)
}

export const log = {
  r_info(...params: any[]) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    writeLog.info(...params)
  },
  r_warn(...params: any[]) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    writeLog.warn(...params)
  },
  r_error(...params: any[]) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    writeLog.error(...params)
  },
  log(...params: any[]) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    if (global.lx.isEnableUserApiLog) writeLog.info(...params)
  },
  info(...params: any[]) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    if (global.lx.isEnableUserApiLog) writeLog.info(...params)
  },
  warn(...params: any[]) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    if (global.lx.isEnableUserApiLog) writeLog.warn(...params)
  },
  error(...params: any[]) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    if (global.lx.isEnableUserApiLog) writeLog.error(...params)
  },
}
