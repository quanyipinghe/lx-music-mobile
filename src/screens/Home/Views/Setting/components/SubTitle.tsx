import { memo } from 'react'
import { StyleSheet, View } from 'react-native'
import { createStyle } from '@/utils/tools'
import { useTheme } from '@/store/theme/hook'
import Text from '@/components/common/Text'

/**
 * 现代化次级选项组容器（如音质、语言、缓存等设置模块）
 */
export default memo(({ title, children }: {
  title: string
  children: React.ReactNode | React.ReactNode[]
}) => {
  const theme = useTheme()

  return (
    <View style={[styles.container, { borderBottomColor: theme['c-border-background'] }]}>
      <Text style={styles.title} size={15} color={theme['c-font']}>
        {title}
      </Text>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  )
})

const styles = createStyle({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    marginBottom: 10,
    fontWeight: '500',
  },
  content: {
    paddingTop: 2,
  },
})
