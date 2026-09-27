import ChoosePath, { type ChoosePathType } from '@/components/common/ChoosePath'
import { LXM_FILE_EXT_RXP } from '@/config/constant'
import { Platform } from 'react-native'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { handleExportUserApiBackup, handleImportUserApiBackup } from './actions'

type Action = 'import' | 'export'

export interface UserApiImportExportType {
  import: () => void
  export: () => void
}

export default forwardRef<UserApiImportExportType, {}>((props, ref) => {
  const [visible, setVisible] = useState(false)
  const choosePathRef = useRef<ChoosePathType>(null)
  const actionRef = useRef<Action>('import')
  const pendingActionRef = useRef<Action | null>(null)

  const show = (action: Action) => {
    choosePathRef.current?.show({
      title: global.i18n.t(action == 'import' ? 'setting_backup_user_api_import_desc' : 'setting_backup_user_api_export_desc'),
      dirOnly: action == 'export',
      filter: LXM_FILE_EXT_RXP,
    })
  }

  useEffect(() => {
    if (!visible || !pendingActionRef.current || !choosePathRef.current) return
    const action = pendingActionRef.current
    pendingActionRef.current = null
    show(action)
  }, [visible])

  const start = (action: Action) => {
    actionRef.current = action
    if (action == 'export' && Platform.OS == 'ios') {
      handleExportUserApiBackup()
      return
    }
    if (visible) show(action)
    else {
      pendingActionRef.current = action
      setVisible(true)
    }
  }

  useImperativeHandle(ref, () => ({
    import: () => { start('import') },
    export: () => { start('export') },
  }))

  const onConfirmPath = (path: string) => {
    if (actionRef.current == 'import') handleImportUserApiBackup(path)
    else handleExportUserApiBackup(path)
  }

  return visible ? <ChoosePath ref={choosePathRef} onConfirm={onConfirmPath} /> : null
})
