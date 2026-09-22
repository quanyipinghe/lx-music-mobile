import { memo, useMemo } from 'react'

import SubTitle from '../../components/SubTitle'
import Chips from '../../components/Chips'
import { useSettingValue } from '@/store/setting/hook'
import { useI18n } from '@/lang'
import { updateSetting } from '@/core/common'

type SourceNameType = LX.AppSetting['common.sourceNameType']

export default memo(() => {
  const t = useI18n()
  const sourceNameType = useSettingValue('common.sourceNameType')

  const list = useMemo(() => {
    return [
      {
        id: 'real' as const,
        name: t('setting_basic_sourcename_real'),
      },
      {
        id: 'alias' as const,
        name: t('setting_basic_sourcename_alias'),
      },
    ]
  }, [t])

  return (
    <SubTitle title={t('setting_basic_sourcename')}>
      <Chips
        list={list}
        activeId={sourceNameType}
        onChange={(id) => { updateSetting({ 'common.sourceNameType': id as SourceNameType }) }}
      />
    </SubTitle>
  )
})
