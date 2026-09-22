import { forwardRef, memo, useEffect, useImperativeHandle, useState } from 'react'
import { Platform, View } from 'react-native'
import { BorderWidths } from '@/theme'
import ButtonBar from './ActionBar'
import { useNavigationComponentDidAppear } from '@/navigation'
import { NAV_SHEAR_NATIVE_IDS } from '@/config/constant'
import { scaleSizeW } from '@/utils/pixelRatio'
import { useTheme } from '@/store/theme/hook'
import Text, { AnimatedText } from '@/components/common/Text'
import { createStyle } from '@/utils/tools'
import Image from '@/components/common/Image'
import Badge from '@/components/common/Badge'
import { useListInfo } from './state'
import { useAnimateOnecNumber } from '@/utils/hooks/useAnimateNumber'

const IMAGE_WIDTH = scaleSizeW(92)

const CountText = memo(({ count }: { count: string }) => {
  const [animFade] = useAnimateOnecNumber(0, 1, 250, false)
  const [animTranslateY] = useAnimateOnecNumber(10, 0, 250, false)
  return (
    <AnimatedText style={{
      ...styles.playCount,
      opacity: animFade,
      transform: [
        { translateY: animTranslateY },
      ],
    }} numberOfLines={1}>{count}</AnimatedText>
  )
}, (prevProps, nextProps) => {
  return true
})

const Pic = ({ componentId, playCount, imgUrl }: {
  componentId: string
  playCount: string
  imgUrl?: string
}) => {
  const [pic, setPic] = useState(imgUrl)
  const [animated, setAnimated] = useState(false)
  const info = useListInfo()
  useEffect(() => {
    if (animated) setPic(imgUrl)
  }, [imgUrl, animated])

  useNavigationComponentDidAppear(componentId, () => {
    setAnimated(true)
  })

  return (
    <View style={{ ...styles.listItemImg, width: IMAGE_WIDTH, height: IMAGE_WIDTH }}>
      <Image nativeID={`${NAV_SHEAR_NATIVE_IDS.songlistDetail_pic}_to_${info.id}`} url={pic} style={{ flex: 1, borderRadius: 12 }} />
      {
        playCount && animated ? <CountText count={playCount} /> : null
      }
    </View>
  )
}

export interface HeaderProps {
  componentId: string
}

export interface HeaderType {
  setInfo: (info: DetailInfo) => void
}
export interface DetailInfo {
  name: string
  desc: string
  playCount: string
  imgUrl?: string
}

export default forwardRef<HeaderType, HeaderProps>(({ componentId }: { componentId: string }, ref) => {
  const theme = useTheme()
  const info = useListInfo()
  const [detailInfo, setDetailInfo] = useState<DetailInfo>({ name: '', desc: '', playCount: '', imgUrl: info.img })

  useImperativeHandle(ref, () => ({
    setInfo(info) {
      setDetailInfo(info)
    },
  }), [])

  return (
    <View style={{ ...styles.container, borderBottomColor: theme['c-border-background'] }}>
      <View style={styles.headerInfo}>
        <Pic componentId={componentId} playCount={detailInfo.playCount} imgUrl={detailInfo.imgUrl} />
        <View style={styles.infoContent} nativeID={NAV_SHEAR_NATIVE_IDS.songlistDetail_title}>
          <Text size={16} numberOfLines={2} style={styles.title}>{detailInfo.name || info.name}</Text>
          {info.source ? (
            <View style={styles.tagRow}>
              <Badge type="tertiary">{info.source.toUpperCase()}</Badge>
            </View>
          ) : null}
          <View style={{ flexGrow: 0, flexShrink: 1 }}>
            <Text size={12} color={theme['c-font-label']} numberOfLines={3} style={styles.desc}>{detailInfo.desc || info.desc}</Text>
          </View>
        </View>
      </View>
      <ButtonBar />
    </View>
  )
})

const styles = createStyle({
  container: {
    flexDirection: 'column',
    flexWrap: 'nowrap',
    borderBottomWidth: BorderWidths.normal,
    paddingTop: 8,
  },
  headerInfo: {
    flexDirection: 'row',
    flexGrow: 0,
    flexShrink: 0,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 4,
  },
  infoContent: {
    flexDirection: 'column',
    flexGrow: 1,
    flexShrink: 1,
    paddingLeft: 12,
    justifyContent: 'center',
  },
  title: {
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 4,
  },
  tagRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  desc: {
    lineHeight: 17,
  },
  listItemImg: {
    borderRadius: 12,
    flexGrow: 0,
    flexShrink: 0,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  playCount: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: '#fff',
    borderRadius: 6,
    overflow: 'hidden',
    fontWeight: '500',
  },
})
