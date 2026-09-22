import { memo } from 'react'
import { View, Platform, TouchableOpacity } from 'react-native'
import { createStyle } from '@/utils/tools'
import { type ListInfoItem } from '@/store/songlist/state'
import Text from '@/components/common/Text'
import { scaleSizeW } from '@/utils/pixelRatio'
import { NAV_SHEAR_NATIVE_IDS } from '@/config/constant'
import { useTheme } from '@/store/theme/hook'
import Image from '@/components/common/Image'

const gap = scaleSizeW(15)
export default memo(({ item, index, width, showSource, onPress }: {
  item: ListInfoItem
  index: number
  showSource: boolean
  width: number
  onPress: (item: ListInfoItem, index: number) => void
}) => {
  const theme = useTheme()
  const itemWidth = width - gap
  const handlePress = () => {
    onPress(item, index)
  }
  return (
    item.source
      ? (
          <View style={{ ...styles.listItem, width: itemWidth }}>
            <View style={{ ...styles.listItemImg, backgroundColor: theme['c-content-background'] }}>
              <TouchableOpacity activeOpacity={0.7} onPress={handlePress}>
                <Image url={item.img} nativeID={`${NAV_SHEAR_NATIVE_IDS.songlistDetail_pic}_from_${item.id}`} style={{ width: itemWidth, height: itemWidth, borderRadius: 10 }} />
                { showSource ? <Text style={styles.sourceLabel} size={10} color="#fff">{item.source}</Text> : null }
              </TouchableOpacity>
            </View>
            <TouchableOpacity activeOpacity={0.7} onPress={handlePress}>
              <Text style={styles.listItemTitle} numberOfLines={2}>{item.name}</Text>
            </TouchableOpacity>
          </View>
        )
      : <View style={{ ...styles.listItem, width: itemWidth }} />
  )
})

const styles = createStyle({
  listItem: {
    margin: 10,
  },
  listItemImg: {
    borderRadius: 10,
    marginBottom: 4,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.12,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sourceLabel: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    position: 'absolute',
    top: 6,
    right: 6,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    fontWeight: '600',
  },
  listItemTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 4,
  },
})
