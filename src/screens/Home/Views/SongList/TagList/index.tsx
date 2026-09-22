import { useEffect, useRef, useState } from 'react'

import { type Source } from '@/store/songlist/state'
import List, { type ListProps, type ListType } from './List'
import { getSongListSetting } from '@/utils/data'

export default ({ alwaysVisible = false }: { alwaysVisible?: boolean }) => {
  const [visible, setVisible] = useState(alwaysVisible)
  const listRef = useRef<ListType>(null)
  // const [info, setInfo] = useState({ souce: 'kw', activeId: '' })


  useEffect(() => {
    let isInited = false
    const handleShow = (source: Source, id: string) => {
      if (isInited) {
        listRef.current?.loadTag(source, id)
      } else {
        requestAnimationFrame(() => {
          setVisible(true)
          requestAnimationFrame(() => {
            listRef.current?.loadTag(source, id)
          })
        })
        isInited = true
      }
    }
    global.app_event.on('showSonglistTagList', handleShow)
    if (alwaysVisible) {
      isInited = true
      void getSongListSetting().then(({ source, tagId }) => { listRef.current?.loadTag(source, tagId) })
    }

    return () => {
      global.app_event.off('showSonglistTagList', handleShow)
    }
  }, [alwaysVisible])

  const handleTagChange: ListProps['onTagChange'] = (name, id) => {
    global.app_event.hideSonglistTagList()
    requestAnimationFrame(() => {
      global.app_event.songlistTagInfoChange(name, id)
    })
  }

  return (
    visible
      ? <List ref={listRef} onTagChange={handleTagChange} />
      : null
  )
}
