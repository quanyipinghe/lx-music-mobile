import { Switch, TouchableOpacity, Platform } from 'react-native'
import Text from '@/components/common/Text'
import { useSettingValue } from '@/store/setting/hook'
import { updateSetting } from '@/core/common'
import { useI18n } from '@/lang'
import { useTheme } from '@/store/theme/hook'
import styles from './style'

export default () => {
  const t = useI18n()
  const theme = useTheme()
  const isShowLyricProgressSetting = useSettingValue('playDetail.isShowLyricProgressSetting')
  const setShowLyricProgressSetting = (show: boolean) => {
    updateSetting({ 'playDetail.isShowLyricProgressSetting': show })
  }

  return (
    <TouchableOpacity
      style={styles.switchRow}
      activeOpacity={0.7}
      onPress={() => setShowLyricProgressSetting(!isShowLyricProgressSetting)}
    >
      <Text style={styles.switchLabel}>{t('play_detail_setting_show_lyric_progress_setting')}</Text>
      <Switch
        value={isShowLyricProgressSetting}
        onValueChange={setShowLyricProgressSetting}
        trackColor={{
          false: theme['c-button-background'],
          true: theme['c-primary'],
        }}
        thumbColor={Platform.OS === 'android' ? (isShowLyricProgressSetting ? theme['c-theme'] : '#fff') : undefined}
      />
    </TouchableOpacity>
  )
}

