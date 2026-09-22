import { memo, useMemo } from 'react'

import SubTitle from '../../components/SubTitle'
import Chips from '../../components/Chips'
import { useSettingValue } from '@/store/setting/hook'
import { updateSetting } from '@/core/common'
import { useI18n } from '@/lang'
import { TRY_QUALITYS_LIST } from '@/core/music/utils'

export default memo(() => {
  const t = useI18n()
  const playQuality = useSettingValue('player.playQuality')

  const list = useMemo(() => {
    const qualities = [...TRY_QUALITYS_LIST, '128k'].reverse() as LX.Quality[]
    return qualities.map(q => ({ id: q, name: q }))
  }, [])

  return (
    <SubTitle title={t('setting_play_play_quality')}>
      <Chips
        list={list}
        activeId={playQuality}
        onChange={(id) => { updateSetting({ 'player.playQuality': id }) }}
      />
    </SubTitle>
  )
})



// export default memo(() => {
//   const t = useI18n()
//   const isPlayHighQuality = useSettingValue('player.isPlayHighQuality')
//   const setPlayHighQuality = (isPlayHighQuality: boolean) => {
//     updateSetting({ 'player.isPlayHighQuality': isPlayHighQuality })
//   }

//   return (
//     <View style={styles.content}>
//       <CheckBoxItem check={isPlayHighQuality} onChange={setPlayHighQuality} label={t('setting_play_quality')} />
//     </View>
//   )
// })


// const styles = createStyle({
//   content: {
//     marginTop: 5,
//   },
// })

