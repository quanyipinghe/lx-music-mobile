import { TouchableOpacity, type StyleProp, type ViewStyle } from 'react-native'
import { Icon } from '@/components/common/Icon'
import { createStyle } from '@/utils/tools'
import { useTheme } from '@/store/theme/hook'

export default ({ icon, size = 18, color, active = false, style, onPress }: {
  icon: string
  size?: number
  color?: string
  active?: boolean
  style?: StyleProp<ViewStyle>
  onPress: () => void
}) => {
  const theme = useTheme()
  const iconColor = color ?? (active ? theme['c-primary-font-active'] : theme['c-button-font'])
  const bgColor = active ? (theme['c-primary-background-active'] ?? 'rgba(0,0,0,0.08)') : (theme['c-button-background'] ?? 'rgba(0,0,0,0.04)')

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.65}
      style={[styles.button, { backgroundColor: bgColor }, style]}
    >
      <Icon name={icon} color={iconColor} size={size} />
    </TouchableOpacity>
  )
}

const styles = createStyle({
  button: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 3,
  },
})
