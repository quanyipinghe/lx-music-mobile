import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { Platform, TouchableOpacity } from 'react-native'

import { Icon } from '@/components/common/Icon'
import { BorderWidths } from '@/theme'
import { useTheme } from '@/store/theme/hook'
import { useActiveListId, useListFetching } from '@/store/list/hook'
import listState from '@/store/list/state'
import { createStyle } from '@/utils/tools'
import { getListPrevSelectId } from '@/utils/data'
import { getListMusics, setActiveList } from '@/core/list'
import Text from '@/components/common/Text'
import { LIST_IDS } from '@/config/constant'
import Loading from '@/components/common/Loading'
import { useSettingValue } from '@/store/setting/hook'

export interface ActiveListProps {
  onShowSearchBar: () => void
  onScrollToTop: () => void
}
export interface ActiveListType {
  setVisibleBar: (visible: boolean) => void
}

// iOS 顶部已有列表标签,这里只显示当前列表的歌曲数
const useListMusicCount = (listId: string) => {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const update = () => { void getListMusics(listId).then(list => { setCount(list.length) }) }
    const handleChange = (ids: string[]) => { if (ids.includes(listId)) update() }
    update()
    global.app_event.on('myListMusicUpdate', handleChange)
    return () => { global.app_event.off('myListMusicUpdate', handleChange) }
  }, [listId])
  return count
}

const IOSActiveList = forwardRef<ActiveListType, ActiveListProps>(({ onShowSearchBar, onScrollToTop }, ref) => {
  const theme = useTheme()
  const currentListId = useActiveListId()
  const count = useListMusicCount(currentListId)
  const [visibleBar, setVisibleBar] = useState(true)

  useImperativeHandle(ref, () => ({
    setVisibleBar(visible) {
      setVisibleBar(visible)
    },
  }))

  useEffect(() => {
    void getListPrevSelectId().then((id) => {
      setActiveList(id)
    })
  }, [])

  return (
    <TouchableOpacity activeOpacity={1} onLongPress={onScrollToTop} style={{ ...styles.currentList, ...styles.iosBar, opacity: visibleBar ? 1 : 0, borderBottomColor: theme['c-border-background'] }}>
      <Text style={styles.currentListText} size={13} numberOfLines={1} color={theme['c-font-label']}>{global.i18n.t('list_music_count', { count })}</Text>
      <TouchableOpacity style={styles.currentListBtns} onPress={onShowSearchBar} accessibilityRole="button" accessibilityLabel={global.i18n.t('nav_search')}>
        <Icon color={theme['c-button-font']} name="search-2" />
      </TouchableOpacity>
    </TouchableOpacity>
  )
})

const DrawerActiveList = forwardRef<ActiveListType, ActiveListProps>(({ onShowSearchBar, onScrollToTop }, ref) => {
  const theme = useTheme()
  const currentListId = useActiveListId()
  const fetching = useListFetching(currentListId)
  const langId = useSettingValue('common.langId')
  const currentListName = useMemo(() => {
    switch (currentListId) {
      case LIST_IDS.TEMP:
        return global.i18n.t('list_name_temp')
      case LIST_IDS.DEFAULT:
        return global.i18n.t('list_name_default')
      case LIST_IDS.LOVE:
        return global.i18n.t('list_name_love')
      default:
        return listState.allList.find(l => l.id === currentListId)?.name ?? ''
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentListId, langId])
  const [visibleBar, setVisibleBar] = useState(true)

  useImperativeHandle(ref, () => ({
    setVisibleBar(visible) {
      setVisibleBar(visible)
    },
  }))

  const showList = () => {
    global.app_event.changeLoveListVisible(true)
  }

  useEffect(() => {
    void getListPrevSelectId().then((id) => {
      setActiveList(id)
    })
  }, [])

  return (
    <TouchableOpacity onPress={showList} onLongPress={onScrollToTop} style={{ ...styles.currentList, opacity: visibleBar ? 1 : 0, borderBottomColor: theme['c-border-background'] }}>
      <Icon style={styles.currentListIcon} color={theme['c-button-font']} name="chevron-right" size={12} />
      { fetching ? <Loading color={theme['c-button-font']} style={styles.loading} /> : null }
      <Text style={styles.currentListText} numberOfLines={1} color={theme['c-button-font']}>{currentListName}</Text>
      <TouchableOpacity style={styles.currentListBtns} onPress={onShowSearchBar}>
        <Icon color={theme['c-button-font']} name="search-2" />
      </TouchableOpacity>
    </TouchableOpacity>
  )
})


export default Platform.OS == 'ios' ? IOSActiveList : DrawerActiveList

const styles = createStyle({
  currentList: {
    flexDirection: 'row',
    paddingRight: 2,
    height: 36,
    alignItems: 'center',
    borderBottomWidth: BorderWidths.normal,
    // backgroundColor: 'rgba(0,0,0,0.2)',
  },
  currentListIcon: {
    paddingLeft: 15,
    paddingRight: 10,
    // paddingTop: 10,
    // paddingBottom: 0,
  },
  currentListText: {
    flex: 1,
    // minWidth: 70,
    // paddingLeft: 10,
    paddingRight: 10,
    // paddingTop: 10,
    // paddingBottom: 10,
  },
  iosBar: {
    paddingLeft: 16,
  },
  loading: {
    marginRight: 5,
  },
  currentListBtns: {
    width: 46,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    // backgroundColor: 'rgba(0,0,0,0.2)',
  },
})
