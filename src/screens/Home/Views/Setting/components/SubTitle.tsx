import { memo } from 'react'
import { StyleSheet, View } from 'react-native'
import { createStyle } from '@/utils/tools'
import { useTheme } from '@/store/theme/hook'
import Text from '@/components/common/Text'

/**
 * 现代化次级选项组容器（如音质、语言、缓存等设置模块）
 */
export default memo(({ title, action, children }: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode | React.ReactNode[]
}) => {
  const theme = useTheme()

  return (
    <View style={[styles.container, { borderBottomColor: theme['c-border-background'] }]}>
      <View style={styles.header}>
        <Text style={styles.title} size={15} color={theme['c-font']}>
          {title}
        </Text>
        {action}
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontWeight: '500',
  },
  content: {
    paddingTop: 2,
  },
})
