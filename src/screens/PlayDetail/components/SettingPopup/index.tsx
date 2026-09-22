import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { ScrollView, View } from 'react-native'
import Popup, { type PopupType, type PopupProps } from '@/components/common/Popup'
import { useI18n } from '@/lang'
import { useTheme } from '@/store/theme/hook'

import SettingLyricProgress from './settings/SettingLyricProgress'
import SettingVolume from './settings/SettingVolume'
import SettingPlaybackRate from './settings/SettingPlaybackRate'
import SettingLrcFontSize from './settings/SettingLrcFontSize'
import SettingLrcAlign from './settings/SettingLrcAlign'
import styles from './settings/style'

export interface SettingPopupProps extends Omit<PopupProps, 'children'> {
  direction: 'vertical' | 'horizontal'
}

export interface SettingPopupType {
  show: () => void
}

export default forwardRef<SettingPopupType, SettingPopupProps>(({ direction, ...props }, ref) => {
  const [visible, setVisible] = useState(false)
  const popupRef = useRef<PopupType>(null)
  const t = useI18n()
  const theme = useTheme()

  useImperativeHandle(ref, () => ({
    show() {
      if (visible) popupRef.current?.setVisible(true)
      else {
        setVisible(true)
        requestAnimationFrame(() => {
          popupRef.current?.setVisible(true)
        })
      }
    },
  }))

  const cardBg = theme['c-button-background'] ?? 'rgba(0,0,0,0.03)'

  return (
    visible
      ? (
        <Popup ref={popupRef} title={t('play_detail_setting_title')} {...props}>
          <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
            <View onStartShouldSetResponder={() => true}>
              {/* 播放控制卡片 */}
              <View style={[styles.card, { backgroundColor: cardBg }]}>
                <SettingVolume />
                <SettingPlaybackRate />
              </View>

              {/* 歌词设置卡片 */}
              <View style={[styles.card, { backgroundColor: cardBg }]}>
                <SettingLyricProgress />
                <SettingLrcAlign />
                <SettingLrcFontSize direction={direction} />
              </View>
            </View>
          </ScrollView>
        </Popup>
        )
      : null
  )
})
