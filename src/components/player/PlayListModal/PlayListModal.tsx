import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { FlatList, StyleSheet, TouchableOpacity, View, type ListRenderItemInfo } from 'react-native'
import Popup, { type PopupType } from '@/components/common/Popup'
import Text from '@/components/common/Text'
import { Icon } from '@/components/common/Icon'
import { useI18n } from '@/lang'
import { useTheme } from '@/store/theme/hook'
import { usePlayInfo, usePlayMusicInfo } from '@/store/player/hook'
import { useSettingValue } from '@/store/setting/hook'
import { LIST_IDS, MUSIC_TOGGLE_MODE, MUSIC_TOGGLE_MODE_LIST } from '@/config/constant'
import listState from '@/store/list/state'
import { getListMusics, overwriteListMusics, removeListMusics } from '@/core/list'
import { playList } from '@/core/player/player'
import { updateSetting } from '@/core/common'
import { toast } from '@/utils/tools'

export interface PlayListModalType {
  show: () => void
  hide: () => void
}

export interface PlayListModalProps {
  onHide?: () => void
}

const ITEM_HEIGHT = 48

export default forwardRef<PlayListModalType, PlayListModalProps>(({ onHide }, ref) => {
  const t = useI18n()
  const theme = useTheme()
  const popupRef = useRef<PopupType>(null)
  const flatListRef = useRef<FlatList>(null)

  const playMusicInfo = usePlayMusicInfo()
  const playInfo = usePlayInfo()
  const togglePlayMethod = useSettingValue('player.togglePlayMethod')

  const [list, setList] = useState<LX.Music.MusicInfo[]>([])
  const [currentListId, setCurrentListId] = useState<string>('')

  // 获取当前播放列表歌曲
  const loadMusics = useCallback(async(targetListId: string | null) => {
    if (!targetListId) {
      setList([])
      setCurrentListId('')
      return
    }
    const musics = await getListMusics(targetListId)
    setList([...musics])
    setCurrentListId(targetListId)
  }, [])

  // 滚动到当前正在播放的歌曲
  const scrollToCurrent = useCallback((indexToScroll?: number) => {
    const targetIndex = indexToScroll ?? playInfo.playIndex
    if (targetIndex >= 0 && list.length > targetIndex) {
      try {
        flatListRef.current?.scrollToIndex({
          index: targetIndex,
          viewPosition: 0.35,
          animated: true,
        })
      } catch {}
    }
  }, [playInfo.playIndex, list.length])

  // 显示/隐藏句柄
  useImperativeHandle(ref, () => ({
    show() {
      popupRef.current?.setVisible(true)
      void loadMusics(playMusicInfo.listId).then(() => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            scrollToCurrent()
          }, 200)
        })
      })
    },
    hide() {
      popupRef.current?.setVisible(false)
    },
  }))

  // 监听播放列表变更
  useEffect(() => {
    const handleListUpdate = (ids: string[]) => {
      if (currentListId && ids.includes(currentListId)) {
        void loadMusics(currentListId)
      }
    }
    global.app_event.on('myListMusicUpdate', handleListUpdate)
    return () => {
      global.app_event.off('myListMusicUpdate', handleListUpdate)
    }
  }, [currentListId, loadMusics])

  // 计算当前列表名称
  const listTitle = useMemo(() => {
    if (!playMusicInfo.listId) return t('play_list_modal_title')
    switch (playMusicInfo.listId) {
      case LIST_IDS.DEFAULT:
        return listState.defaultList.name
      case LIST_IDS.LOVE:
        return listState.loveList.name
      case LIST_IDS.TEMP:
        return listState.tempList.name
      default: {
        const found = listState.userList.find(l => l.id === playMusicInfo.listId)
        return found?.name ?? t('play_list_modal_title')
      }
    }
  }, [playMusicInfo.listId, t])

  // 切换播放模式
  const handleTogglePlayMode = useCallback(() => {
    let index = MUSIC_TOGGLE_MODE_LIST.indexOf(togglePlayMethod)
    if (++index >= MUSIC_TOGGLE_MODE_LIST.length) index = 0
    const mode = MUSIC_TOGGLE_MODE_LIST[index]
    updateSetting({ 'player.togglePlayMethod': mode })

    let modeName: 'play_list_loop' | 'play_list_random' | 'play_list_order' | 'play_single_loop' | 'play_single'
    switch (mode) {
      case MUSIC_TOGGLE_MODE.listLoop:
        modeName = 'play_list_loop'
        break
      case MUSIC_TOGGLE_MODE.random:
        modeName = 'play_list_random'
        break
      case MUSIC_TOGGLE_MODE.list:
        modeName = 'play_list_order'
        break
      case MUSIC_TOGGLE_MODE.singleLoop:
        modeName = 'play_single_loop'
        break
      default:
        modeName = 'play_single'
        break
    }
    toast(t(modeName))
  }, [togglePlayMethod, t])

  // 播放模式图标与文案
  const [playModeIcon, playModeText] = useMemo(() => {
    switch (togglePlayMethod) {
      case MUSIC_TOGGLE_MODE.listLoop:
        return ['list-loop', t('play_list_loop')] as const
      case MUSIC_TOGGLE_MODE.random:
        return ['list-random', t('play_list_random')] as const
      case MUSIC_TOGGLE_MODE.list:
        return ['list-order', t('play_list_order')] as const
      case MUSIC_TOGGLE_MODE.singleLoop:
        return ['single-loop', t('play_single_loop')] as const
      default:
        return ['single', t('play_single')] as const
    }
  }, [togglePlayMethod, t])

  // 点击切歌
  const handlePlayMusic = useCallback((index: number) => {
    if (!playMusicInfo.listId) return
    void playList(playMusicInfo.listId, index)
  }, [playMusicInfo.listId])

  // 移除列表中的某一首歌
  const handleRemoveMusic = useCallback(async(item: LX.Music.MusicInfo) => {
    if (!playMusicInfo.listId) return
    const listId = playMusicInfo.listId
    if (listId === LIST_IDS.TEMP) {
      const updatedList = list.filter(m => m.id !== item.id)
      await overwriteListMusics(LIST_IDS.TEMP, updatedList)
      setList(updatedList)
    } else {
      await removeListMusics(listId, [item.id])
      setList(prev => prev.filter(m => m.id !== item.id))
    }
  }, [list, playMusicInfo.listId])

  // 渲染歌曲行
  const renderItem = useCallback(({ item, index }: ListRenderItemInfo<LX.Music.MusicInfo>) => {
    const isActive = playInfo.playIndex === index && playMusicInfo.musicInfo?.id === item.id
    return (
      <View style={[styles.itemContainer, { borderBottomColor: theme['c-border-background'] ?? 'rgba(0,0,0,0.05)' }]}>
        <TouchableOpacity
          style={styles.itemMain}
          activeOpacity={0.6}
          onPress={() => handlePlayMusic(index)}
        >
          <View style={styles.itemIndex}>
            {isActive ? (
              <Icon name="play-outline" size={14} color={theme['c-primary']} />
            ) : (
              <Text size={12} color={theme['c-font-label']}>{index + 1}</Text>
            )}
          </View>
          <View style={styles.itemContent}>
            <Text
              numberOfLines={1}
              size={13}
              color={isActive ? theme['c-primary'] : theme['c-font']}
              style={isActive ? styles.activeText : undefined}
            >
              {item.name}
            </Text>
            <Text
              numberOfLines={1}
              size={11}
              color={isActive ? theme['c-primary-alpha-400'] : theme['c-font-label']}
              style={styles.itemSinger}
            >
              {item.singer}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.itemDeleteBtn}
          activeOpacity={0.5}
          onPress={() => void handleRemoveMusic(item)}
          accessibilityRole="button"
          accessibilityLabel={t('delete')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="close" size={12} color={theme['c-font-label']} />
        </TouchableOpacity>
      </View>
    )
  }, [handlePlayMusic, handleRemoveMusic, playInfo.playIndex, playMusicInfo.musicInfo?.id, t, theme])

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }), [])

  return (
    <Popup
      ref={popupRef}
      position="bottom"
      title={`${listTitle} (${list.length})`}
      onHide={onHide}
    >
      <View style={styles.container}>
        {/* 顶部快捷操作栏：播放模式与定位当前播放 */}
        <View style={[styles.toolbar, { borderBottomColor: theme['c-border-background'] ?? 'rgba(0,0,0,0.06)' }]}>
          <TouchableOpacity
            style={styles.modeBtn}
            activeOpacity={0.6}
            onPress={handleTogglePlayMode}
          >
            <Icon name={playModeIcon} size={15} color={theme['c-primary']} />
            <Text size={12} color={theme['c-font']} style={styles.modeText}>{playModeText}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.locateBtn}
            activeOpacity={0.6}
            onPress={() => scrollToCurrent()}
            accessibilityLabel={t('play_list_modal_locate_current')}
          >
            <Icon name="album" size={14} color={theme['c-font-label']} />
            <Text size={12} color={theme['c-font-label']} style={styles.locateText}>{t('play_list_modal_locate_current')}</Text>
          </TouchableOpacity>
        </View>

        {/* 歌曲列表 */}
        {list.length === 0 ? (
          <View style={styles.emptyView}>
            <Text size={13} color={theme['c-font-label']}>{t('play_list_modal_empty')}</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={list}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            getItemLayout={getItemLayout}
            initialNumToRender={15}
            maxToRenderPerBatch={10}
            windowSize={7}
            style={styles.list}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </Popup>
  )
})

const styles = StyleSheet.create({
  container: {
    maxHeight: 460,
    minHeight: 260,
    flexDirection: 'column',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  modeText: {
    marginLeft: 6,
    fontWeight: '500',
  },
  locateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  locateText: {
    marginLeft: 4,
  },
  list: {
    flexGrow: 1,
    flexShrink: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  itemContainer: {
    height: ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  itemIndex: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 6,
    paddingRight: 10,
  },
  activeText: {
    fontWeight: '600',
  },
  itemSinger: {
    marginLeft: 6,
    flexShrink: 1,
  },
  itemDeleteBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyView: {
    flex: 1,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
