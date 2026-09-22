import { TouchableOpacity, View } from 'react-native'
import { Icon } from '@/components/common/Icon'
import { useTheme } from '@/store/theme/hook'
// import { useIsPlay } from '@/store/player/hook'
import { playNext, playPrev, togglePlay } from '@/core/player/player'
import { useIsPlay } from '@/store/player/hook'
import { createStyle } from '@/utils/tools'
import { useWindowSize } from '@/utils/hooks'
import { BTN_WIDTH } from './MoreBtn/Btn'
import { useMemo } from 'react'
import { markTimeoutExitInteraction } from '@/core/player/timeoutExit'

const PrevBtn = ({ size }: { size: number }) => {
  const theme = useTheme()
  const handlePlayPrev = () => {
    markTimeoutExitInteraction()
    void playPrev()
  }
  const btnSize = size * 0.85
  return (
    <TouchableOpacity style={{ ...styles.cotrolBtn, width: btnSize, height: btnSize }} activeOpacity={0.5} onPress={handlePlayPrev}>
      <Icon name='prevMusic' color={theme['c-button-font']} rawSize={btnSize * 0.55} />
    </TouchableOpacity>
  )
}
const NextBtn = ({ size }: { size: number }) => {
  const theme = useTheme()
  const handlePlayNext = () => {
    markTimeoutExitInteraction()
    void playNext()
  }
  const btnSize = size * 0.85
  return (
    <TouchableOpacity style={{ ...styles.cotrolBtn, width: btnSize, height: btnSize }} activeOpacity={0.5} onPress={handlePlayNext}>
      <Icon name='nextMusic' color={theme['c-button-font']} rawSize={btnSize * 0.55} />
    </TouchableOpacity>
  )
}

const TogglePlayBtn = ({ size }: { size: number }) => {
  const theme = useTheme()
  const isPlay = useIsPlay()
  const btnSize = Math.max(size, 64)
  return (
    <TouchableOpacity
      style={[
        styles.playBtn,
        {
          width: btnSize,
          height: btnSize,
          borderRadius: btnSize / 2,
          backgroundColor: theme['c-button-background'] ?? 'rgba(0,0,0,0.06)',
        },
      ]}
      activeOpacity={0.7}
      onPress={() => {
        markTimeoutExitInteraction()
        togglePlay()
      }}
    >
      <Icon name={isPlay ? 'pause' : 'play'} color={theme['c-button-font']} rawSize={btnSize * 0.46} />
    </TouchableOpacity>
  )
}

const MAX_SIZE = BTN_WIDTH * 1.6
const MIN_SIZE = BTN_WIDTH * 1.2

export default () => {
  const winSize = useWindowSize()
  const maxHeight = Math.max(winSize.height * 0.11, MIN_SIZE)
  const containerStyle = useMemo(() => {
    return {
      ...styles.conatiner,
      maxHeight,
    }
  }, [maxHeight])
  const size = Math.min(Math.max(winSize.width * 0.33 * global.lx.fontSize * 0.4, MIN_SIZE), MAX_SIZE, maxHeight)

  return (
    <View style={containerStyle}>
      <PrevBtn size={size} />
      <TogglePlayBtn size={size}/>
      <NextBtn size={size} />
    </View>
  )
}


const styles = createStyle({
  conatiner: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    flexGrow: 1,
    flexShrink: 1,
    paddingHorizontal: '6%',
    paddingVertical: 18,
  },
  cotrolBtn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
})
