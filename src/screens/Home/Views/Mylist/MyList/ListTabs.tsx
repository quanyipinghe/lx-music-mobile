import { memo, useEffect, useRef } from 'react'
import { ScrollView, TouchableOpacity, View } from 'react-native'
import { Icon } from '@/components/common/Icon'
import Text from '@/components/common/Text'
import Loading from '@/components/common/Loading'
import { useTheme } from '@/store/theme/hook'
import { useActiveListId, useListFetching, useMyList } from '@/store/list/hook'
import { setActiveList } from '@/core/list'
import { createStyle } from '@/utils/tools'
import { type Position } from './ListMenu'

type ShowMenu = (info: { listInfo: LX.List.MyListInfo, index: number }, position: Position) => void

const Tab = memo(({ item, index, active, onShowMenu, onLayoutX }: {
  item: LX.List.MyListInfo
  index: number
  active: boolean
  onShowMenu: ShowMenu
  onLayoutX: (id: string, x: number) => void
}) => {
  const theme = useTheme()
  const ref = useRef<View>(null)
  const fetching = useListFetching(item.id)

  const showMenu = () => {
    ref.current?.measure((fx, fy, width, height, px, py) => {
      onShowMenu({ listInfo: item, index }, { x: Math.ceil(px), y: Math.ceil(py), w: Math.ceil(width), h: Math.ceil(height) })
    })
  }
  // 再点一次当前标签打开菜单,长按任意标签也可以
  const handlePress = () => {
    if (active) showMenu()
    else setActiveList(item.id)
  }

  return (
    <View ref={ref} collapsable={false} onLayout={e => { onLayoutX(item.id, e.nativeEvent.layout.x) }}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handlePress}
        onLongPress={showMenu}
        accessibilityRole="tab"
        accessibilityLabel={item.name}
        accessibilityState={{ selected: active }}
        style={[styles.tab, { backgroundColor: active ? theme['c-primary'] : theme['c-button-background'] }]}
      >
        {fetching ? <Loading color={active ? theme['c-primary-light-1000'] : theme['c-font-label']} style={styles.loading} /> : null}
        <Text size={14} numberOfLines={1} color={active ? theme['c-primary-light-1000'] : theme['c-font']} style={active ? styles.tabTextActive : undefined}>
          {item.name}
        </Text>
        {active ? <Icon name="chevron-right" size={9} color={theme['c-primary-light-1000']} style={styles.menuHint} /> : null}
      </TouchableOpacity>
    </View>
  )
})

export default ({ onShowMenu, onCreate }: {
  onShowMenu: ShowMenu
  onCreate: (position: number) => void
}) => {
  const theme = useTheme()
  const allList = useMyList()
  const activeListId = useActiveListId()
  const scrollRef = useRef<ScrollView>(null)
  const tabX = useRef<Record<string, number>>({})

  const scrollToActive = (id: string) => {
    const x = tabX.current[id]
    if (x != null) scrollRef.current?.scrollTo({ x: Math.max(x - 16, 0), animated: true })
  }
  const handleLayoutX = (id: string, x: number) => {
    tabX.current[id] = x
    if (id == activeListId) scrollToActive(id)
  }
  useEffect(() => {
    scrollToActive(activeListId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeListId])

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
      accessibilityRole="tablist"
    >
      {allList.map((item, index) => (
        <Tab key={item.id} item={item} index={index} active={item.id == activeListId} onShowMenu={onShowMenu} onLayoutX={handleLayoutX} />
      ))}
      <TouchableOpacity
        activeOpacity={0.7}
        // 前两个是默认列表和我的收藏,新列表追加到自建列表末尾
        onPress={() => { onCreate(Math.max(allList.length - 2, 0)) }}
        accessibilityRole="button"
        accessibilityLabel={global.i18n.t('list_create')}
        style={[styles.tab, styles.addBtn, { borderColor: theme['c-border-background'] }]}
      >
        {/* 图标字体里没有加号,用旋转 45° 的 close 代替 */}
        <Icon name="close" size={11} color={theme['c-font-label']} style={styles.plusIcon} />
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = createStyle({
  container: {
    flexGrow: 0,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 2,
    paddingBottom: 10,
    alignItems: 'center',
  },
  tab: {
    height: 34,
    maxWidth: 180,
    paddingHorizontal: 14,
    marginRight: 8,
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabTextActive: {
    fontWeight: '600',
  },
  menuHint: {
    marginLeft: 5,
    transform: [{ rotate: '90deg' }],
  },
  loading: {
    marginRight: 5,
  },
  plusIcon: {
    transform: [{ rotate: '45deg' }],
  },
  addBtn: {
    width: 34,
    paddingHorizontal: 0,
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
})
