import { useMemo } from 'react'
import { View, TouchableOpacity } from 'react-native'
import Text from '@/components/common/Text'
import { useSettingValue } from '@/store/setting/hook'
import { updateSetting } from '@/core/common'
import { useI18n } from '@/lang'
import { useTheme } from '@/store/theme/hook'
import styles from './style'

type Align_Type = LX.AppSetting['playDetail.style.align']

const ALIGN_LIST = [
  'left',
  'center',
  'right',
] as const

export default () => {
  const t = useI18n()
  const theme = useTheme()
  const currentAlign = useSettingValue('playDetail.style.align')

  const list = useMemo(() => {
    return ALIGN_LIST.map(id => ({ id, name: t(`play_detail_setting_lrc_align_${id}`) }))
  }, [t])

  const setPosition = (id: Align_Type) => {
    updateSetting({ 'playDetail.style.align': id })
  }

  return (
    <View style={styles.settingRow}>
      <Text style={styles.cardTitle}>{t('play_detail_setting_lrc_align')}</Text>
      <View style={[styles.segmentedContainer, { backgroundColor: theme['c-button-background'] }]}>
        {list.map(({ id, name }) => {
          const isActive = currentAlign === id
          return (
            <TouchableOpacity
              key={id}
              activeOpacity={0.7}
              onPress={() => setPosition(id)}
              style={[
                styles.segmentedItem,
                isActive && [
                  styles.segmentedItemActive,
                  { backgroundColor: theme['c-primary-background-active'] ?? theme['c-primary'] },
                ],
              ]}
            >
              <Text
                style={[
                  styles.segmentedItemText,
                  isActive && { color: theme['c-primary-font-active'], fontWeight: '600' },
                ]}
              >
                {name}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}
