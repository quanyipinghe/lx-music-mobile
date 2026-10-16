import { useEffect, useRef, useState } from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { Icon } from '@/components/common/Icon'
import { useIsPlay, usePlayMusicInfo } from '@/store/player/hook'
import { useTheme } from '@/store/theme/hook'
import { collectMusic, playNext, playPrev, togglePlay, uncollectMusic } from '@/core/player/player'
import { getListMusics } from '@/core/list'
import { LIST_IDS } from '@/config/constant'
import { createStyle, toast } from '@/utils/tools'
import { useHorizontalMode } from '@/utils/hooks'
import { markTimeoutExitInteraction } from '@/core/player/timeoutExit'
import PlayListModal, { type PlayListModalType } from '@/components/player/PlayListModal'

const BTN_SIZE = 24
const LOVED_COLOR = '#f2475a'
const handlePlayPrev = () => {
  markTimeoutExitInteraction()
  void playPrev()
}
const handlePlayNext = () => {
  markTimeoutExitInteraction()
  void playNext()
}

const PlayPrevBtn = () => {
  const theme = useTheme()

  return (
    <TouchableOpacity style={styles.cotrolBtn} activeOpacity={0.5} onPress={handlePlayPrev} accessibilityRole="button" accessibilityLabel={global.i18n.t('play_prev')}>
      <Icon name='prevMusic' color={theme['c-button-font']} size={BTN_SIZE} />
    </TouchableOpacity>
  )
}

const PlayNextBtn = () => {
  const theme = useTheme()

  return (
    <TouchableOpacity style={styles.cotrolBtn} activeOpacity={0.5} onPress={handlePlayNext} accessibilityRole="button" accessibilityLabel={global.i18n.t('play_next')}>
      <Icon name='nextMusic' color={theme['c-button-font']} size={BTN_SIZE} />
    </TouchableOpacity>
  )
}

const TogglePlayBtn = () => {
  const isPlay = useIsPlay()
  const theme = useTheme()

  return (
    <TouchableOpacity style={styles.cotrolBtn} activeOpacity={0.5} accessibilityRole="button" accessibilityLabel={global.i18n.t(isPlay ? 'pause' : 'play')} accessibilityState={{ selected: isPlay }} onPress={() => {
      markTimeoutExitInteraction()
      togglePlay()
    }}>
      <Icon name={isPlay ? 'pause' : 'play'} color={theme['c-button-font']} size={BTN_SIZE} />
    </TouchableOpacity>
  )
}

// 当前歌曲是否在「我的收藏」里;下载列表的歌要取 metadata 里的原始歌曲,和 collectMusic 保持一致
const useIsLoved = () => {
  const { musicInfo } = usePlayMusicInfo()
  const id = musicInfo ? ('progress' in musicInfo ? musicInfo.metadata.musicInfo.id : musicInfo.id) : null
  const [loved, setLoved] = useState(false)
  useEffect(() => {
    if (!id) {
      setLoved(false)
      return
    }
    const update = () => { void getListMusics(LIST_IDS.LOVE).then(list => { setLoved(list.some(m => m.id == id)) }) }
    const handleChange = (ids: string[]) => { if (ids.includes(LIST_IDS.LOVE)) update() }
    update()
    global.app_event.on('myListMusicUpdate', handleChange)
    return () => { global.app_event.off('myListMusicUpdate', handleChange) }
  }, [id])
  return { loved, hasMusic: !!id }
}

const LoveBtn = () => {
  const theme = useTheme()
  const { loved, hasMusic } = useIsLoved()
  if (!hasMusic) return null

  const handlePress = () => {
    if (loved) {
      uncollectMusic()
      toast(global.i18n.t('collect_music_removed'))
    } else {
      collectMusic()
      toast(global.i18n.t('collect_music_added'))
    }
  }

  return (
    <TouchableOpacity
      style={styles.cotrolBtn}
      activeOpacity={0.5}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={global.i18n.t(loved ? 'collected' : 'collect')}
      accessibilityState={{ selected: loved }}
    >
      {
        // 图标字体只有空心心形,实心用系统字体的 ♥,加 U+FE0E 强制文字样式,避免 iOS 显示成彩色 emoji
        loved
          ? <Text style={styles.lovedIcon}>{'\u2665\uFE0E'}</Text>
          : <Icon name="love" color={theme['c-font-label']} size={20} />
      }
    </TouchableOpacity>
  )
}

const PlayListBtn = () => {
  const theme = useTheme()
  const playListModalRef = useRef<PlayListModalType>(null)

  const handleShowPlayList = () => {
    markTimeoutExitInteraction()
    playListModalRef.current?.show()
  }

  return (
    <>
      <TouchableOpacity
        style={styles.cotrolBtn}
        activeOpacity={0.5}
        onPress={handleShowPlayList}
        accessibilityRole="button"
        accessibilityLabel={global.i18n.t('play_list_btn_label')}
      >
        <Icon name="menu" color={theme['c-button-font']} size={20} />
      </TouchableOpacity>
      <PlayListModal ref={playListModalRef} />
    </>
  )
}

export default () => {
  const isHorizontalMode = useHorizontalMode()
  return (
    <>
      {/* <TouchableOpacity activeOpacity={0.5} onPress={toggleNextPlayMode}>
        <Text style={{ ...styles.cotrolBtn }}>
          <Icon name={playModeIcon} style={{ color: theme.secondary10 }} size={18} />
        </Text>
      </TouchableOpacity>
    */}
      {/* {btnPrev} */}
      {/* 竖屏下靠左右滑动播放栏切歌,只在横屏保留上一首/下一首按钮 */}
      <LoveBtn />
      { isHorizontalMode ? <PlayPrevBtn /> : null }
      <TogglePlayBtn />
      { isHorizontalMode ? <PlayNextBtn /> : null }
      <PlayListBtn />
    </>
  )
}


const styles = createStyle({
  cotrolBtn: {
    width: 46,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',

    // backgroundColor: '#ccc',
  },
  lovedIcon: {
    color: LOVED_COLOR,
    fontSize: 25,
    lineHeight: 28,
  },
})
