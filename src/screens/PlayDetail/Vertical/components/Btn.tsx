import { TouchableOpacity, type StyleProp, type ViewStyle, type TextStyle } from 'react-native'
import { Icon } from '@/components/common/Icon'
import { createStyle } from '@/utils/tools'
import { useTheme } from '@/store/theme/hook'

export default ({ icon, label, size = 18, color, active = false, style, iconStyle, onPress }: {
  icon: any
  label: string
  size?: number
  color?: string
  active?: boolean
  style?: StyleProp<ViewStyle>
  iconStyle?: StyleProp<TextStyle>
  onPress: () => void
}) => {
  const theme = useTheme()
  const iconColor = color ?? (active ? theme['c-primary-font-active'] : theme['c-button-font'])
  const bgColor = active ? (theme['c-primary-background-active'] ?? 'rgba(0,0,0,0.08)') : (theme['c-button-background'] ?? 'rgba(0,0,0,0.04)')

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.65}
      hitSlop={HIT_SLOP}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      style={[styles.button, { backgroundColor: bgColor }, style]}
    >
      <Icon name={icon} color={iconColor} size={size} style={iconStyle} />
    </TouchableOpacity>
  )
}

// 视觉保持 34pt,点击区域扩到 iOS 建议的 44pt
const HIT_SLOP = { top: 5, bottom: 5, left: 5, right: 5 }

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
