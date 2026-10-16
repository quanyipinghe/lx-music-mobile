import { memo, useEffect, useRef } from 'react'
import { FlatList, TouchableOpacity, View } from 'react-native'
import { Icon } from '@/components/common/Icon'
import Text from '@/components/common/Text'
import Loading from '@/components/common/Loading'
import { useTheme } from '@/store/theme/hook'
import { useListFetching, useMyList } from '@/store/list/hook'
import { setActiveList } from '@/core/list'
import { navigations } from '@/navigation'
import commonState from '@/store/common/state'
import playerState from '@/store/player/state'
import { useWindowSize } from '@/utils/hooks'
import { createStyle } from '@/utils/tools'
import { type Position } from './ListMenu'
import ListCover from '../ListCover'
import { useListMeta } from '../useListMeta'

type ShowMenu = (info: { listInfo: LX.List.MyListInfo, index: number }, position: Position) => void

const NUM_COLUMNS = 3
const PADDING = 16
const GAP = 12
const ADD_ITEM_ID = '__add__'

const openList = (id: string) => {
  setActiveList(id)
  navigations.pushMylistDetailScreen(commonState.componentIds.home!)
}

const Card = memo(({ item, index, size, onShowMenu }: {
  item: LX.List.MyListInfo
  index: number
  size: number
  onShowMenu: ShowMenu
}) => {
  const theme = useTheme()
  const ref = useRef<View>(null)
  const fetching = useListFetching(item.id)
  const { count, pic } = useListMeta(item.id)

  const showMenu = () => {
    ref.current?.measure((fx, fy, width, height, px, py) => {
      onShowMenu({ listInfo: item, index }, { x: Math.ceil(px), y: Math.ceil(py), w: Math.ceil(width), h: Math.ceil(height) })
    })
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => { openList(item.id) }}
      onLongPress={showMenu}
      accessibilityRole="button"
      accessibilityLabel={item.name}
      style={{ width: size, marginBottom: 16 }}
    >
      <View ref={ref} collapsable={false} style={{ ...styles.cover, backgroundColor: theme['c-content-background'] }}>
        <ListCover pic={pic} name={item.name} size={size} radius={10} />
        <View style={styles.countBadge}>
          {fetching ? <Loading color="#fff" style={styles.loading} /> : null}
          <Text size={11} color="#fff" style={styles.countText}>{global.i18n.t('list_music_count', { count })}</Text>
        </View>
      </View>
      <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
    </TouchableOpacity>
  )
})

const AddCard = ({ size, onPress }: { size: number, onPress: () => void }) => {
  const theme = useTheme()
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} accessibilityRole="button" accessibilityLabel={global.i18n.t('list_create')} style={{ width: size }}>
      <View style={{ ...styles.addCover, width: size, height: size, borderColor: theme['c-border-background'] }}>
        {/* 图标字体里没有加号,用旋转 45° 的 close 代替 */}
        <Icon name="close" size={22} color={theme['c-font-label']} style={styles.plusIcon} />
      </View>
      <Text style={styles.name} color={theme['c-font-label']} numberOfLines={1}>{global.i18n.t('list_create')}</Text>
    </TouchableOpacity>
  )
}

// iOS「我的列表」首页:卡片网格,点卡片进入列表详情页,长按打开列表菜单
export default ({ onShowMenu, onCreate }: {
  onShowMenu: ShowMenu
  onCreate: (position: number) => void
}) => {
  const allList = useMyList()
  const size = Math.floor((useWindowSize().width - PADDING * 2 - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS)

  // 长按播放栏「定位到正在播放」:首页不再直接显示歌曲,改为打开对应列表的详情页
  useEffect(() => {
    const handleJump = () => {
      if (commonState.componentIds.mylistDetail) return
      const listId = playerState.playMusicInfo.listId
      // 临时列表/下载列表不在 allList 里,没有卡片可开
      if (!listId || !allList.some(l => l.id == listId)) return
      global.lx.jumpMyListPosition = true
      openList(listId)
    }
    global.app_event.on('jumpListPosition', handleJump)
    return () => { global.app_event.off('jumpListPosition', handleJump) }
  }, [allList])

  const data = [...allList, { id: ADD_ITEM_ID } as LX.List.MyListInfo]

  return (
    <FlatList
      data={data}
      numColumns={NUM_COLUMNS}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.content}
      columnWrapperStyle={styles.row}
      renderItem={({ item, index }) => item.id == ADD_ITEM_ID
        // 前两个是默认列表和我的收藏,新列表追加到自建列表末尾
        ? <AddCard size={size} onPress={() => { onCreate(Math.max(allList.length - 2, 0)) }} />
        : <Card item={item} index={index} size={size} onShowMenu={onShowMenu} />
      }
    />
  )
}

const styles = createStyle({
  content: {
    paddingHorizontal: PADDING,
    paddingTop: 4,
    paddingBottom: 16,
  },
  row: {
    columnGap: GAP,
  },
  cover: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  countBadge: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  countText: {
    fontWeight: '600',
  },
  loading: {
    marginRight: 4,
  },
  name: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '500',
    marginTop: 6,
  },
  addCover: {
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIcon: {
    transform: [{ rotate: '45deg' }],
  },
})
