import { useEffect, useRef } from 'react'
import { View } from 'react-native'

import MusicList, { type MusicListType } from './MusicList'
import PageContent from '@/components/PageContent'
import StatusBar from '@/components/common/StatusBar'
import { setComponentId } from '@/core/common'
import { COMPONENT_IDS } from '@/config/constant'
import { type ListInfoItem } from '@/store/songlist/state'
import PlayerBar from '@/components/player/PlayerBar'
import FloatBackBtn from '@/components/FloatBackBtn'
import { ListInfoContext } from './state'
import { createStyle } from '@/utils/tools'

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
    <PageContent fullScreen>
      <StatusBar />
      <View style={styles.content}>
        <ListInfoContext.Provider value={info}>
          <MusicList ref={musicListRef} componentId={componentId} />
        </ListInfoContext.Provider>
        <FloatBackBtn componentId={componentId} />
      </View>
      <PlayerBar />
    </PageContent>
  )
}

const styles = createStyle({
  content: {
    flex: 1,
  },
})
