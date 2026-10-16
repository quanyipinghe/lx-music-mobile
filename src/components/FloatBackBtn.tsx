import { TouchableOpacity } from 'react-native'
import { pop } from '@/navigation'
import { useStatusbarHeight } from '@/store/common/hook'
import { Icon } from '@/components/common/Icon'
import { createStyle } from '@/utils/tools'

// 浮在大封面左上角的返回按钮,半透明底色保证在图片和列表上都看得清
export default ({ componentId }: { componentId: string }) => {
  const statusBarHeight = useStatusbarHeight()

  return (
    <TouchableOpacity
      onPress={() => { void pop(componentId) }}
      style={{ ...styles.btn, top: statusBarHeight + 8 }}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel={global.i18n.t('back')}
    >
      <Icon name="chevron-left" size={18} color="#fff" />
    </TouchableOpacity>
  )
}

const styles = createStyle({
  btn: {
    position: 'absolute',
    left: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
})
