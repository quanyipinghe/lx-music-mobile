import { memo, useMemo } from 'react'

import SubTitle from '../../components/SubTitle'
import Chips from '../../components/Chips'
import { useSettingValue } from '@/store/setting/hook'
import { useI18n } from '@/lang'
import { setDesktopLyricTextPosition } from '@/core/desktopLyric'
import { updateSetting } from '@/core/common'

type X_TYPE = LX.AppSetting['desktopLyric.textPosition.x']

const X_LIST = [
  'left',
  'center',
  'right',
] as const

export default memo(() => {
  const t = useI18n()
  const textPositionX = useSettingValue('desktopLyric.textPosition.x')

  const list = useMemo(() => {
    return X_LIST.map(id => ({ id, name: t(`setting_lyric_desktop_text_x_${id}`) }))
  }, [t])

  const setPosition = (id: X_TYPE) => {
    void setDesktopLyricTextPosition(id, null).then(() => {
      updateSetting({ 'desktopLyric.textPosition.x': id })
    })
  }

  return (
    <SubTitle title={t('setting_lyric_desktop_text_x')}>
      <Chips
        list={list}
        activeId={textPositionX}
        onChange={(id) => { setPosition(id as X_TYPE) }}
      />
    </SubTitle>
  )
})
