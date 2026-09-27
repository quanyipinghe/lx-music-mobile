import { memo, useRef } from 'react'
import { StyleSheet, View } from 'react-native'
import { useI18n } from '@/lang'
import SubTitle from '../../components/SubTitle'
import Button from '../../components/Button'
import ScriptImportExport, { type ScriptImportExportType } from '../Basic/UserApiEditModal/ScriptImportExport'
import ScriptImportOnline, { type ScriptImportOnlineType } from '../Basic/UserApiEditModal/ScriptImportOnline'
import UserApiImportExport, { type UserApiImportExportType } from './UserApiImportExport'

export default memo(() => {
  const t = useI18n()
  const scriptImportExportRef = useRef<ScriptImportExportType>(null)
  const scriptImportOnlineRef = useRef<ScriptImportOnlineType>(null)
  const userApiImportExportRef = useRef<UserApiImportExportType>(null)

  return (
    <>
      <SubTitle title={t('setting_backup_user_api')}>
        <View style={styles.list}>
          <Button onPress={() => scriptImportOnlineRef.current?.show()}>{t('user_api_btn_import_online')}</Button>
          <Button onPress={() => scriptImportExportRef.current?.import()}>{t('user_api_btn_import_local')}</Button>
          <Button onPress={() => userApiImportExportRef.current?.import()}>{t('setting_backup_user_api_import')}</Button>
          <Button onPress={() => userApiImportExportRef.current?.export()}>{t('setting_backup_user_api_export')}</Button>
        </View>
      </SubTitle>
      <ScriptImportExport ref={scriptImportExportRef} />
      <ScriptImportOnline ref={scriptImportOnlineRef} />
      <UserApiImportExport ref={userApiImportExportRef} />
    </>
  )
})

const styles = StyleSheet.create({
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
})
