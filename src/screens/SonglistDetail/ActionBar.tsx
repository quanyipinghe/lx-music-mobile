import { memo } from 'react'
import { View, TouchableOpacity } from 'react-native'

import { createStyle } from '@/utils/tools'
import { useTheme } from '@/store/theme/hook'
import Text from '@/components/common/Text'
import { Icon } from '@/components/common/Icon'
import { handleCollect, handlePlay } from './listAction'
import songlistState from '@/store/songlist/state'
import { useI18n } from '@/lang'
import { useListInfo } from './state'
import { useMyList } from '@/store/list/hook'

export default memo(() => {
  const theme = useTheme()
  const t = useI18n()
  const info = useListInfo()
  const myList = useMyList()

  const isCollected = myList.some(l => l.source == info.source && l.sourceListId == info.id)

  const handlePlayAll = () => {
    if (!songlistState.listDetailInfo.info.name) return
    void handlePlay(info.id, info.source, songlistState.listDetailInfo.list)
  }

  const handleCollection = () => {
    if (!songlistState.listDetailInfo.info.name) return
    void handleCollect(info.id, info.source, songlistState.listDetailInfo.info.name || info.name)
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: isCollected ? theme['c-primary-background-active'] : theme['c-button-background'] }]}
        onPress={handleCollection}
        activeOpacity={0.7}
      >
        {
          // 图标字体只有空心心形,实心用系统字体的 ♥,加 U+FE0E 避免 iOS 显示成彩色 emoji
          isCollected
            ? <Text style={[styles.btnIcon, styles.lovedIcon]} color={theme['c-primary']}>{'\u2665\uFE0E'}</Text>
            : <Icon name="love" size={16} color={theme['c-font']} style={styles.btnIcon} />
        }
        <Text style={styles.btnText} color={isCollected ? theme['c-primary'] : theme['c-font']}>
          {isCollected ? t('collected') : t('collect_songlist')}
        </Text>
      </TouchableOpacity>
      <View style={styles.space} />
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: theme['c-button-background'] }]}
        onPress={handlePlayAll}
        activeOpacity={0.7}
      >
        <Icon name="play" size={15} color={theme['c-font']} style={styles.btnIcon} />
        <Text style={styles.btnText} color={theme['c-font']}>{t('play_all')}</Text>
      </TouchableOpacity>
    </View>
  )
})

const styles = createStyle({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 22,
  },
  space: {
    width: 12,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  btnIcon: {
    marginRight: 8,
  },
  lovedIcon: {
    fontSize: 19,
    lineHeight: 22,
  },
})
