import { useEffect, useRef } from 'react'
import { View, TouchableOpacity } from 'react-native'

import MusicList, { type MusicListType } from './MusicList'
import PageContent from '@/components/PageContent'
import StatusBar from '@/components/common/StatusBar'
import { setComponentId } from '@/core/common'
import { COMPONENT_IDS, HEADER_HEIGHT as _HEADER_HEIGHT } from '@/config/constant'
import { type ListInfoItem } from '@/store/songlist/state'
import PlayerBar from '@/components/player/PlayerBar'
import { ListInfoContext } from './state'
import { pop } from '@/navigation'
import commonState from '@/store/common/state'
import { useStatusbarHeight } from '@/store/common/hook'
import { useTheme } from '@/store/theme/hook'
import { Icon } from '@/components/common/Icon'
import Text from '@/components/common/Text'
import { createStyle } from '@/utils/tools'
import { scaleSizeH } from '@/utils/pixelRatio'
import { BorderWidths } from '@/theme'

const NAV_HEIGHT = scaleSizeH(_HEADER_HEIGHT)

const TopNav = ({ name, componentId }: { name: string, componentId: string }) => {
  const statusBarHeight = useStatusbarHeight()
  const theme = useTheme()

  const back = () => {
    void pop(commonState.componentIds.songlistDetail ?? componentId)
  }

  return (
    <View style={{ ...styles.navContainer, height: NAV_HEIGHT + statusBarHeight, paddingTop: statusBarHeight, borderBottomColor: theme['c-border-background'] }}>
      <TouchableOpacity onPress={back} style={styles.navBackBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Icon name="chevron-left" size={20} color={theme['c-font']} />
      </TouchableOpacity>
      <Text numberOfLines={1} size={16} style={styles.navTitle} color={theme['c-font']}>
        {name}
      </Text>
      <View style={styles.navPlaceholder} />
    </View>
  )
}

export default ({ componentId, info }: { componentId: string, info: ListInfoItem }) => {
  const musicListRef = useRef<MusicListType>(null)
  const isUnmountedRef = useRef(false)

  useEffect(() => {
    setComponentId(COMPONENT_IDS.songlistDetail, componentId)

    isUnmountedRef.current = false

    musicListRef.current?.loadList(info.source, info.id)

    return () => {
      isUnmountedRef.current = true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <PageContent>
      <StatusBar />
      <TopNav name={info.name} componentId={componentId} />
      <ListInfoContext.Provider value={info}>
        <MusicList ref={musicListRef} componentId={componentId} />
      </ListInfoContext.Provider>
      <PlayerBar />
    </PageContent>
  )
}

const styles = createStyle({
  navContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: BorderWidths.normal,
    zIndex: 10,
  },
  navBackBtn: {
    width: NAV_HEIGHT,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
    paddingHorizontal: 8,
  },
  navPlaceholder: {
    width: NAV_HEIGHT,
    height: '100%',
  },
})

