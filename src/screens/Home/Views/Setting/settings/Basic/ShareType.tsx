import { memo, useMemo } from 'react'

import SubTitle from '../../components/SubTitle'
import Chips from '../../components/Chips'
import { useSettingValue } from '@/store/setting/hook'
import { useI18n } from '@/lang'
import { updateSetting } from '@/core/common'

type ShareType = LX.AppSetting['common.shareType']

export default memo(() => {
  const t = useI18n()
  const shareType = useSettingValue('common.shareType')

  const list = useMemo(() => {
    return [
      {
        id: 'system' as const,
        name: t('setting_basic_share_type_system'),
      },
      {
        id: 'clipboard' as const,
        name: t('setting_basic_share_type_clipboard'),
      },
    ]
  }, [t])

  return (
    <SubTitle title={t('setting_basic_share_type')}>
      <Chips
        list={list}
        activeId={shareType}
        onChange={(id) => { updateSetting({ 'common.shareType': id as ShareType }) }}
      />
    </SubTitle>
  )
})
