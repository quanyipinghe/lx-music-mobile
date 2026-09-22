import { useEffect, useMemo, useRef } from 'react'
import { TouchableOpacity, View } from 'react-native'
import Search from './Views/Search'
import SongList from './Views/SongList'
import Leaderboard from './Views/Leaderboard'
import Mylist from './Views/Mylist'
import Setting from './Views/Setting'
import PlayerBar from '@/components/player/PlayerBar'
import StatusBar from '@/components/common/StatusBar'
import SearchTypeSelector from './Views/Search/SearchTypeSelector'
import Text from '@/components/common/Text'
import { Icon } from '@/components/common/Icon'
import { useI18n } from '@/lang'
import { useNavActiveId } from '@/store/common/hook'
import { useTheme } from '@/store/theme/hook'
import { setNavActiveId } from '@/core/common'
import { useWindowSize } from '@/utils/hooks'
import { IOS_UI, iosShadow } from '@/theme/ios'
import { createStyle } from '@/utils/tools'
import type { NAV_ID_Type } from '@/config/constant'

type TabId = 'search' | 'discover' | 'library' | 'settings'

const tabs: Array<{ id: TabId, navId: NAV_ID_Type, icon: string, label: 'nav_search' | 'nav_discover' | 'nav_love' | 'nav_setting' }> = [
  { id: 'search', navId: 'nav_search', icon: 'search-2', label: 'nav_search' },
  { id: 'discover', navId: 'nav_songlist', icon: 'album', label: 'nav_discover' },
  { id: 'library', navId: 'nav_love', icon: 'love', label: 'nav_love' },
  { id: 'settings', navId: 'nav_setting', icon: 'setting', label: 'nav_setting' },
]

const getTabId = (id: NAV_ID_Type): TabId => id == 'nav_songlist' || id == 'nav_top'
  ? 'discover'
  : id == 'nav_love'
    ? 'library'
    : id == 'nav_setting' ? 'settings' : 'search'

const Navigation = ({ vertical, discoveryId }: { vertical: boolean, discoveryId: 'nav_songlist' | 'nav_top' }) => {
  const activeId = useNavActiveId()
  const theme = useTheme()
  const t = useI18n()
  const activeTab = getTabId(activeId)

  return (
    <View style={vertical ? styles.sideNav : styles.bottomNav} accessibilityRole="tablist">
      {tabs.map(tab => {
        const selected = activeTab == tab.id
        return (
          <TouchableOpacity
            key={tab.id}
            style={[styles.navItem, vertical && styles.sideNavItem]}
            accessibilityRole="tab"
            accessibilityLabel={t(tab.label)}
            accessibilityState={{ selected }}
            onPress={() => { setNavActiveId(tab.id == 'discover' ? discoveryId : tab.navId) }}
          >
            <Icon name={tab.icon} size={vertical ? 22 : 20} color={selected ? theme['c-primary'] : theme['c-font-label']} />
            <Text size={vertical ? 14 : 11} numberOfLines={1} color={selected ? theme['c-primary'] : theme['c-font-label']} style={vertical ? styles.sideLabel : styles.navLabel}>{t(tab.label)}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const DiscoverySelector = () => {
  const id = useNavActiveId()
  const theme = useTheme()
  const t = useI18n()
  return (
    <View style={[styles.segment, { backgroundColor: theme['c-button-background'] }]} accessibilityRole="tablist">
      {(['nav_songlist', 'nav_top'] as const).map(navId => {
        const selected = id == navId
        return (
          <TouchableOpacity
            key={navId}
            style={[styles.segmentItem, selected && { backgroundColor: theme['c-primary-background-active'] }]}
            accessibilityRole="tab"
            accessibilityLabel={t(navId)}
            accessibilityState={{ selected }}
            onPress={() => { setNavActiveId(navId) }}
          >
            <Text size={14} color={selected ? theme['c-primary'] : theme['c-font-label']}>{t(navId)}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

export default () => {
  const activeId = useNavActiveId()
  const theme = useTheme()
  const t = useI18n()
  const { width, height } = useWindowSize()
  const wide = width >= 700 || width > height
  const discoveryId = useRef<'nav_songlist' | 'nav_top'>(activeId == 'nav_top' ? 'nav_top' : 'nav_songlist')

  useEffect(() => {
    if (activeId == 'nav_songlist' || activeId == 'nav_top') discoveryId.current = activeId
  }, [activeId])

  const page = useMemo(() => {
    switch (activeId) {
      case 'nav_songlist': return <SongList />
      case 'nav_top': return <Leaderboard />
      case 'nav_love': return <Mylist />
      case 'nav_setting': return <Setting />
      default: return <Search />
    }
  }, [activeId])

  const title = getTabId(activeId) == 'discover' ? t('nav_discover') : t(activeId)
  return (
    <>
      <StatusBar />
      <View style={styles.shell}>
        {wide ? <Navigation vertical discoveryId={discoveryId.current} /> : null}
        <View style={styles.main}>
          <View style={styles.header}>
            <Text size={24} style={styles.title} numberOfLines={1}>{title}</Text>
            {activeId == 'nav_search' ? <SearchTypeSelector /> : null}
            {activeId == 'nav_songlist' || activeId == 'nav_top' ? <DiscoverySelector /> : null}
          </View>
          <View style={styles.page}>{page}</View>
          <View style={[styles.player, iosShadow, { backgroundColor: theme['c-button-background'] }]}>
            <PlayerBar isHome />
          </View>
          {!wide ? <Navigation vertical={false} discoveryId={discoveryId.current} /> : null}
        </View>
      </View>
    </>
  )
}

const styles = createStyle({
  shell: { flex: 1, flexDirection: 'row' },
  main: { flex: 1, overflow: 'hidden' },
  header: { minHeight: 58, paddingHorizontal: IOS_UI.space + 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontWeight: '700', flexShrink: 1, marginRight: 12 },
  page: { flex: 1, overflow: 'hidden' },
  player: { marginHorizontal: IOS_UI.space, borderRadius: IOS_UI.radius, overflow: 'hidden' },
  bottomNav: { height: IOS_UI.navHeight, flexDirection: 'row', paddingHorizontal: 4 },
  sideNav: { width: 116, paddingTop: 18, paddingHorizontal: 8 },
  navItem: { flex: 1, minHeight: IOS_UI.controlSize, alignItems: 'center', justifyContent: 'center' },
  sideNavItem: { flex: 0, height: 64, borderRadius: IOS_UI.radius, flexDirection: 'row', justifyContent: 'flex-start', paddingHorizontal: 12 },
  navLabel: { marginTop: 3 },
  sideLabel: { marginLeft: 10 },
  segment: { flexDirection: 'row', padding: 3, borderRadius: 10 },
  segmentItem: { minWidth: 72, height: 34, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
})
