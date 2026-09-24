import { useRef } from 'react'
import PlayListModal, { type PlayListModalType } from '@/components/player/PlayListModal'
import Btn from './Btn'

/**
 * 竖屏全屏播放页 - 播放列表按钮
 */
export default () => {
  const playListModalRef = useRef<PlayListModalType>(null)

  const handleShowPlayList = () => {
    playListModalRef.current?.show()
  }

  return (
    <>
      <Btn icon="menu" label={global.i18n.t('play_list_btn_label')} onPress={handleShowPlayList} />
      <PlayListModal ref={playListModalRef} />
    </>
  )
}
