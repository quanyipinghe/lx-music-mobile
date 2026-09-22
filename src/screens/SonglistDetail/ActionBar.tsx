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

  const listId = `${info.source}__${info.id}`
  const isCollected = myList.some(l => l.sourceListId == listId)

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
        style={[styles.playBtn, { backgroundColor: theme['c-primary-background-active'] }]}
        onPress={handlePlayAll}
        activeOpacity={0.7}
      >
        <Icon name="play" size={13} color={theme['c-primary']} style={styles.btnIcon} />
        <Text style={styles.playBtnText} color={theme['c-primary']}>
          {t('play_all')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.collectBtn,
          {
            backgroundColor: isCollected ? theme['c-primary-background-active'] : theme['c-button-background'],
            borderColor: isCollected ? theme['c-primary'] : 'transparent',
          },
        ]}
        onPress={handleCollection}
        activeOpacity={0.7}
      >
        <Icon
          name="love"
          size={14}
          color={isCollected ? theme['c-primary'] : theme['c-font']}
          style={styles.btnIcon}
        />
        <Text
          style={[styles.collectBtnText, isCollected && styles.collectBtnTextActive]}
          color={isCollected ? theme['c-primary'] : theme['c-font']}
        >
          {isCollected ? t('collected') : t('collect_songlist')}
        </Text>
      </TouchableOpacity>
    </View>
  )
})

const styles = createStyle({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    paddingHorizontal: 18,
    borderRadius: 18,
    marginRight: 10,
  },
  playBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  collectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    paddingHorizontal: 15,
    borderRadius: 18,
    borderWidth: 1,
  },
  collectBtnText: {
    fontSize: 13,
  },
  collectBtnTextActive: {
    fontWeight: '600',
  },
  btnIcon: {
    marginRight: 6,
  },
})


