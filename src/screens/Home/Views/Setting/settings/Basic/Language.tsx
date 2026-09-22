import { memo, useMemo } from 'react'

import SubTitle from '../../components/SubTitle'
import Chips from '../../components/Chips'
import type { I18n } from '@/lang'
import { useI18n, langList } from '@/lang'
import { setLanguage } from '@/core/common'
import { useSettingValue } from '@/store/setting/hook'

export default memo(() => {
  const t = useI18n()
  const activeLangId = useSettingValue('common.langId')

  const list = useMemo(() => {
    return langList.map(({ locale, name }) => ({ id: locale, name }))
  }, [])

  return (
    <SubTitle title={t('setting_basic_lang')}>
      <Chips
        list={list}
        activeId={activeLangId}
        onChange={(id) => { setLanguage(id as I18n['locale']) }}
      />
    </SubTitle>
  )
})
