import { View } from 'react-native'
import Image from '@/components/common/Image'
import Text from '@/components/common/Text'
import { useTheme } from '@/store/theme/hook'

// 有歌曲封面就用封面,没有就用主题色块 + 列表名首字
export default ({ pic, name, size, radius = 0 }: { pic: string | null, name: string, size: number, radius?: number }) => {
  const theme = useTheme()
  if (pic) return <Image url={pic} style={{ width: size, height: size, borderRadius: radius }} />
  return (
    <View style={{ width: size, height: size, borderRadius: radius, backgroundColor: theme['c-primary-background'], justifyContent: 'center', alignItems: 'center' }}>
      <Text size={size * 0.36} color={theme['c-primary']} style={{ fontWeight: '700' }}>{name.slice(0, 1)}</Text>
    </View>
  )
}
