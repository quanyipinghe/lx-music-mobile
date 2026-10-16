import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import ButtonBar from './ActionBar'
import { useNavigationComponentDidAppear } from '@/navigation'
import { NAV_SHEAR_NATIVE_IDS } from '@/config/constant'
import { useTheme } from '@/store/theme/hook'
import { useBgPic } from '@/store/common/hook'
import Text from '@/components/common/Text'
import { createStyle } from '@/utils/tools'
import Image from '@/components/common/Image'
import { Icon } from '@/components/common/Icon'
import { useListInfo } from './state'
import { useWindowSize } from '@/utils/hooks'

// ponytail: 没有渐变库,用叠加透明度递增的色带模拟底部渐隐;要更平滑再引入 react-native-linear-gradient
const FADE_STEPS = 16

const Pic = ({ componentId, imgUrl, size }: {
  componentId: string
  imgUrl?: string
  size: number
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

  return <Image nativeID={`${NAV_SHEAR_NATIVE_IDS.songlistDetail_pic}_to_${info.id}`} url={pic} style={{ width: size, height: size }} />
}

export const Fade = ({ color, height }: { color: string, height: number }) => {
  const stepHeight = Math.ceil(height / FADE_STEPS)
  return (
    <View pointerEvents="none" style={{ ...styles.fade, height }}>
      {
        Array.from({ length: FADE_STEPS }, (_, i) => (
          <View key={i} style={{ height: stepHeight, backgroundColor: color, opacity: ((i + 1) / FADE_STEPS) ** 1.6 }} />
        ))
      }
    </View>
  )
}

// 渐隐色要和页面底色一致:自定义背景图时页面是 content-background 蒙层,否则是 main-background
export const useFadeColor = () => {
  const theme = useTheme()
  const bgPic = useBgPic()
  return bgPic ? theme['c-content-background'] : theme['c-main-background']
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
  const windowSize = useWindowSize()
  const [detailInfo, setDetailInfo] = useState<DetailInfo>({ name: '', desc: '', playCount: '', imgUrl: info.img })
  const [descExpanded, setDescExpanded] = useState(false)

  useImperativeHandle(ref, () => ({
    setInfo(info) {
      setDetailInfo(info)
    },
  }), [])

  const heroSize = windowSize.width
  const fadeColor = useFadeColor()
  const desc = detailInfo.desc || info.desc
  const playCount = detailInfo.playCount || info.play_count

  return (
    <View>
      <View style={{ width: heroSize, height: heroSize }}>
        <Pic componentId={componentId} imgUrl={detailInfo.imgUrl} size={heroSize} />
        <Fade color={fadeColor} height={heroSize * 0.5} />
        <View style={styles.heroInfo} nativeID={NAV_SHEAR_NATIVE_IDS.songlistDetail_title}>
          <Text size={22} numberOfLines={2} style={styles.title}>{detailInfo.name || info.name}</Text>
          <View style={styles.metaRow}>
            {info.author ? <Text size={14} numberOfLines={1} style={styles.author}>{info.author}</Text> : null}
            {
              playCount
                ? (
                    <View style={styles.playCount}>
                      <Icon name="play-outline" size={12} color={theme['c-font']} />
                      <Text size={14} style={styles.playCountText}>{playCount}</Text>
                    </View>
                  )
                : null
            }
            <Text size={11} color={theme['c-font-label']} style={styles.source}>{info.source.toUpperCase()}</Text>
          </View>
        </View>
      </View>
      {
        desc
          ? (
              <TouchableOpacity style={styles.descRow} activeOpacity={0.7} onPress={() => { setDescExpanded(v => !v) }}>
                <Text size={13} color={theme['c-font-label']} numberOfLines={descExpanded ? undefined : 1} style={styles.desc}>{desc}</Text>
                {descExpanded ? null : <Icon name="chevron-right" size={11} color={theme['c-font-label']} />}
              </TouchableOpacity>
            )
          : null
      }
      <ButtonBar />
    </View>
  )
})

const styles = createStyle({
  fade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroInfo: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 6,
  },
  title: {
    fontWeight: '700',
    lineHeight: 30,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  author: {
    flexShrink: 1,
    marginRight: 14,
  },
  playCount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 14,
  },
  playCountText: {
    marginLeft: 4,
  },
  source: {
    fontWeight: '600',
  },
  descRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 4,
  },
  desc: {
    flex: 1,
    lineHeight: 19,
    marginRight: 6,
  },
})
