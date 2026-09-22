import { memo, useMemo } from 'react'

import SubTitle from '../../components/SubTitle'
import Chips from '../../components/Chips'
import { useSettingValue } from '@/store/setting/hook'
import { useI18n } from '@/lang'
import { updateSetting } from '@/core/common'

export default memo(() => {
  const t = useI18n()
  const addMusicLocationType = useSettingValue('list.addMusicLocationType')

  const list = useMemo(() => {
    return [
      { id: 'top' as const, name: t('setting_list_add_music_location_type_top') },
      { id: 'bottom' as const, name: t('setting_list_add_music_location_type_bottom') },
    ]
  }, [t])

  return (
    <SubTitle title={t('setting_list_add_music_location_type')}>
      <Chips
        list={list}
        activeId={addMusicLocationType}
        onChange={(id) => { updateSetting({ 'list.addMusicLocationType': id as LX.AddMusicLocationType }) }}
      />
    </SubTitle>
  )
})
