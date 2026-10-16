import { useEffect } from 'react'
import PageContent from '@/components/PageContent'
import StatusBar from '@/components/common/StatusBar'
import PlayerBar from '@/components/player/PlayerBar'
import { setComponentId } from '@/core/common'
import { COMPONENT_IDS } from '@/config/constant'
import MusicList from '@/screens/Home/Views/Mylist/MusicList'

// iOS「我的列表」点卡片进入的列表详情页,展示的是当前激活的列表
export default ({ componentId }: { componentId: string }) => {
  useEffect(() => {
    setComponentId(COMPONENT_IDS.mylistDetail, componentId)
  }, [componentId])

  return (
    <PageContent fullScreen>
      <StatusBar />
      <MusicList componentId={componentId} />
      <PlayerBar />
    </PageContent>
  )
}
