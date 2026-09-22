import { View } from 'react-native'

import { createStyle } from '@/utils/tools'
import { useTheme } from '@/store/theme/hook'
import Text from '@/components/common/Text'


interface Props {
  title: string
  children: React.ReactNode | React.ReactNode[]
}

/**
 * 设置模块分组组件（无卡片背景框，通透扁平化风格）
 */
export default ({ title, children }: Props) => {
  const theme = useTheme()

  return (
    <View style={styles.container}>
      <Text style={styles.title} color={theme['c-primary']} size={14}>
        {title}
      </Text>
      <View style={styles.body}>
        {children}
      </View>
    </View>
  )
}


const styles = createStyle({
  container: {
    marginBottom: 20,
  },
  title: {
    paddingHorizontal: 4,
    paddingVertical: 8,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  body: {
    // 列表项容器保持通透
  },
})
