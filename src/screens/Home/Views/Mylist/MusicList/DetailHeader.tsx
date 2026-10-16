import { memo } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { useTheme } from '@/store/theme/hook'
import { useActiveListId, useMyList } from '@/store/list/hook'
import Text from '@/components/common/Text'
import { Icon } from '@/components/common/Icon'
import { useWindowSize } from '@/utils/hooks'
import { createStyle } from '@/utils/tools'
import { Fade, useFadeColor } from '@/screens/SonglistDetail/Header'
import ListCover from '../ListCover'
import { handlePlayAll } from './ActiveList'
import { useListMeta } from '../useListMeta'

// iOS 列表详情页的头部:大封面渐隐 + 列表名/歌曲数 + 播放全部/搜索
export default memo(({ onShowSearchBar }: { onShowSearchBar: () => void }) => {
  const theme = useTheme()
  const listId = useActiveListId()
  const name = useMyList().find(l => l.id == listId)?.name ?? ''
  const { count, pic } = useListMeta(listId)
  const heroSize = useWindowSize().width
  const fadeColor = useFadeColor()

  return (
    <View>
      <View style={{ width: heroSize, height: heroSize }}>
        <ListCover pic={pic} name={name} size={heroSize} />
        <Fade color={fadeColor} height={heroSize * 0.5} />
        <View style={styles.heroInfo}>
          <Text size={22} numberOfLines={2} style={styles.title}>{name}</Text>
          <Text size={14} color={theme['c-font-label']}>{global.i18n.t('list_music_count', { count })}</Text>
        </View>
      </View>
      <View style={styles.btns}>
        <TouchableOpacity style={[styles.btn, { backgroundColor: theme['c-button-background'] }]} onPress={handlePlayAll} activeOpacity={0.7}>
          <Icon name="play" size={15} color={theme['c-font']} style={styles.btnIcon} />
          <Text style={styles.btnText}>{global.i18n.t('play_all')}</Text>
        </TouchableOpacity>
        <View style={styles.space} />
        <TouchableOpacity style={[styles.btn, { backgroundColor: theme['c-button-background'] }]} onPress={onShowSearchBar} activeOpacity={0.7}>
          <Icon name="search-2" size={15} color={theme['c-font']} style={styles.btnIcon} />
          <Text style={styles.btnText}>{global.i18n.t('nav_search')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
})

const styles = createStyle({
  heroInfo: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 6,
  },
  title: {
    fontWeight: '700',
    lineHeight: 30,
    marginBottom: 6,
  },
  btns: {
    flexDirection: 'row',
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
})
