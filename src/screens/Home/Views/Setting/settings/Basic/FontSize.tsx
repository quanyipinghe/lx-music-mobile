import { memo, useMemo } from 'react'

import { StyleSheet, View } from 'react-native'

import SubTitle from '../../components/SubTitle'
import Chips from '../../components/Chips'
import { useI18n } from '@/lang'
import { setFontSize } from '@/core/common'
import { useFontSize } from '@/store/common/hook'
import Text from '@/components/common/Text'
import { getTextSize } from '@/utils/pixelRatio'
import { useTheme } from '@/store/theme/hook'

const LIST = [
  {
    size: 0.8,
    name: 'setting_basic_font_size_80',
  },
  {
    size: 0.9,
    name: 'setting_basic_font_size_90',
  },
  {
    size: 1,
    name: 'setting_basic_font_size_100',
  },
  {
    size: 1.1,
    name: 'setting_basic_font_size_110',
  },
  {
    size: 1.2,
    name: 'setting_basic_font_size_120',
  },
  {
    size: 1.3,
    name: 'setting_basic_font_size_130',
  },
] as const

const SizeText = () => {
  const size = getTextSize(14) * useFontSize()
  const t = useI18n()
  const theme = useTheme()

  return <Text style={{ fontSize: size }} color={theme['c-primary']}>{t('setting_basic_font_size_preview')}</Text>
}

export default memo(() => {
  const t = useI18n()
  const currentSize = useFontSize()

  const list = useMemo(() => {
    return LIST.map((item) => ({ id: item.size, name: t(item.name) }))
  }, [t])

  return (
    <SubTitle title={t('setting_basic_font_size')}>
      <View style={styles.preview}>
        <SizeText />
      </View>
      <Chips
        list={list}
        activeId={currentSize}
        onChange={(size) => { setFontSize(Number(size)) }}
      />
    </SubTitle>
  )
})

const styles = StyleSheet.create({
  preview: {
    justifyContent: 'center',
    paddingBottom: 10,
    height: 45,
  },
})
