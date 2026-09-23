import { memo, useMemo } from 'react'
import { View } from 'react-native'
import { useKeyboard } from '@/utils/hooks'
import Pic from './components/Pic'
import Title from './components/Title'
import PlayInfo from './components/PlayInfo'
import ControlBtn from './components/ControlBtn'
import { useTheme } from '@/store/theme/hook'
import { useSettingValue } from '@/store/setting/hook'
import { useProgress } from '@/store/player/hook'
import { IOS_UI } from '@/theme/ios'
import { createStyle } from '@/utils/tools'

const BottomProgressLine = () => {
  const theme = useTheme()
  const { progress, maxPlayTime } = useProgress(true)
  const percentage = maxPlayTime > 0 ? Math.min(100, Math.max(0, (progress / maxPlayTime) * 100)) : 0

  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressBar, { width: `${percentage}%`, backgroundColor: theme['c-primary'] }]} />
    </View>
  )
}

export default memo(({ isHome = false }: { isHome?: boolean }) => {
  const { keyboardShown } = useKeyboard()
  const theme = useTheme()
  const autoHidePlayBar = useSettingValue('common.autoHidePlayBar')
  const player = useMemo(() => (
    <View style={[styles.container, { backgroundColor: theme['c-content-background'] }]} accessibilityLabel="迷你播放器">
      <Pic isHome={isHome} />
      <View style={styles.center}>
        <Title isHome={isHome} />
        <PlayInfo isHome={isHome} />
      </View>
      <View style={styles.controls}><ControlBtn /></View>
      <BottomProgressLine />
    </View>
  ), [isHome, theme])

  return autoHidePlayBar && keyboardShown ? null : player
})

const styles = createStyle({
  container: {
    height: IOS_UI.playerHeight,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  center: { flex: 1, minWidth: 0, paddingLeft: 10 },
  controls: { flexDirection: 'row', alignItems: 'center' },
  progressTrack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  progressBar: {
    height: '100%',
  },
})
