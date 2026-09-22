import { useState } from 'react'
import { View, TouchableOpacity } from 'react-native'
import { useTheme } from '@/store/theme/hook'
import Text from '@/components/common/Text'
import { useSettingValue } from '@/store/setting/hook'
import Slider, { type SliderProps } from '@/components/common/Slider'
import { updateSetting } from '@/core/common'
import { useI18n } from '@/lang'
import styles from './style'
import { setPlaybackRate, updateMetaData } from '@/plugins/player'
import { setPlaybackRate as setLyricPlaybackRate } from '@/core/lyric'
import playerState from '@/store/player/state'
import settingState from '@/store/setting/state'
import { markTimeoutExitInteraction } from '@/core/player/timeoutExit'

const MIN_VALUE = 60
const MAX_VALUE = 200

export default () => {
  const theme = useTheme()
  const playbackRate = Math.trunc(useSettingValue('player.playbackRate') * 100)
  const [sliderSize, setSliderSize] = useState(playbackRate)
  const [isSliding, setSliding] = useState(false)
  const t = useI18n()

  const handleSlidingStart: SliderProps['onSlidingStart'] = value => {
    setSliding(true)
  }
  const handleValueChange: SliderProps['onValueChange'] = value => {
    value = Math.trunc(value)
    setSliderSize(value)
    markTimeoutExitInteraction()
    void setPlaybackRate(parseFloat((value / 100).toFixed(2)))
  }
  const handleSlidingComplete: SliderProps['onSlidingComplete'] = value => {
    setSliding(false)
    value = Math.trunc(value)
    const rate = value / 100
    void setLyricPlaybackRate(rate)
    void updateMetaData(playerState.musicInfo, playerState.isPlay, playerState.lastLyric, true) // 更新通知栏的播放速率
    if (playbackRate == value) return
    updateSetting({ 'player.playbackRate': rate })
  }
  const handleReset = () => {
    if (settingState.setting['player.playbackRate'] == 1) return
    markTimeoutExitInteraction()
    setSliderSize(100)
    void setPlaybackRate(1).then(() => {
      void updateMetaData(playerState.musicInfo, playerState.isPlay, playerState.lastLyric, true) // 更新通知栏的播放速率
      void setLyricPlaybackRate(1)
    })
    updateSetting({ 'player.playbackRate': 1 })
  }

  const isCustomRate = playbackRate !== 100

  return (
    <View style={styles.settingRow}>
      <View style={styles.headerWithAction}>
        <Text style={styles.cardTitle}>{t('play_detail_setting_playback_rate')}</Text>
        {isCustomRate ? (
          <TouchableOpacity
            style={[styles.miniActionBtn, { backgroundColor: theme['c-primary-background-active'] }]}
            activeOpacity={0.7}
            onPress={handleReset}
          >
            <Text style={[styles.miniActionBtnText, { color: theme['c-primary-font-active'] }]}>
              {t('play_detail_setting_playback_rate_reset')}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={styles.sliderRow}>
        <View style={styles.sliderWrap}>
          <Slider
            minimumValue={MIN_VALUE}
            maximumValue={MAX_VALUE}
            onSlidingComplete={handleSlidingComplete}
            onValueChange={handleValueChange}
            onSlidingStart={handleSlidingStart}
            step={1}
            value={playbackRate}
          />
        </View>
        <View style={[styles.badge, { backgroundColor: theme['c-button-background'] }]}>
          <Text style={[styles.badgeText, { color: theme['c-primary-font-active'] }]}>
            {`${((isSliding ? sliderSize : playbackRate) / 100).toFixed(2)}x`}
          </Text>
        </View>
      </View>
    </View>
  )
}

