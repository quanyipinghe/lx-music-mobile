import { useEffect, useState } from 'react'
import { getListMusics } from '@/core/list'

// 列表没有自己的封面,取第一首带封面的歌;歌曲增删时跟着刷新
// ponytail: 网格里每张卡片都会把整个列表读进内存,列表特别多/特别大时再改成缓存封面
export const useListMeta = (listId: string) => {
  const [meta, setMeta] = useState<{ count: number, pic: string | null }>({ count: 0, pic: null })
  useEffect(() => {
    const update = () => {
      void getListMusics(listId).then(list => {
        setMeta({ count: list.length, pic: list.find(m => m.meta.picUrl)?.meta.picUrl ?? null })
      })
    }
    const handleChange = (ids: string[]) => { if (ids.includes(listId)) update() }
    update()
    global.app_event.on('myListMusicUpdate', handleChange)
    return () => { global.app_event.off('myListMusicUpdate', handleChange) }
  }, [listId])
  return meta
}
