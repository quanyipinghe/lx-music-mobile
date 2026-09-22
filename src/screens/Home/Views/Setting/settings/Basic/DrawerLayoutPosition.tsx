import { memo, useMemo } from 'react'

import SubTitle from '../../components/SubTitle'
import Chips from '../../components/Chips'
import { useSettingValue } from '@/store/setting/hook'
import { useI18n } from '@/lang'
import { updateSetting } from '@/core/common'

const LIST = [
  {
    position: 'left' as const,
    name: 'setting_basic_drawer_layout_position_left' as const,
  },
  {
    position: 'right' as const,
    name: 'setting_basic_drawer_layout_position_right' as const,
  },
]

export default memo(() => {
  const t = useI18n()
  const drawerLayoutPosition = useSettingValue('common.drawerLayoutPosition')

  const list = useMemo(() => {
    return LIST.map((item) => ({ id: item.position, name: t(item.name) }))
  }, [t])

  return (
    <SubTitle title={t('setting_basic_drawer_layout_position')}>
      <Chips
        list={list}
        activeId={drawerLayoutPosition}
        onChange={(id) => { updateSetting({ 'common.drawerLayoutPosition': id }) }}
      />
    </SubTitle>
  )
})
