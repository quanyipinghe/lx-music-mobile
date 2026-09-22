import { memo, useCallback } from 'react'
import { StyleSheet, TouchableOpacity, View, Switch, Platform } from 'react-native'

import type { CheckBoxProps } from '@/components/common/CheckBox'
import { createStyle, tipDialog } from '@/utils/tools'
import { useTheme } from '@/store/theme/hook'
import Text from '@/components/common/Text'
import { Icon } from '@/components/common/Icon'

/**
 * 现代化设置开关行组件（参考 QQ 音乐与 Spotify 风格：右对齐 Switch，整行可点）
 */
export default memo(({
  check,
  label,
  children,
  onChange,
  disabled = false,
  need = false,
  helpTitle,
  helpDesc,
}: CheckBoxProps) => {
  const theme = useTheme()

  const handleToggle = useCallback(() => {
    if (disabled || (need && check)) return
    onChange?.(!check)
  }, [disabled, need, check, onChange])

  const handleShowHelp = useCallback(() => {
    void tipDialog({
      title: helpTitle ?? '',
      message: helpDesc,
      btnText: global.i18n?.t?.('understand') ?? '确定',
    })
  }, [helpTitle, helpDesc])

  return (
    <TouchableOpacity
      style={[
        styles.row,
        { borderBottomColor: theme['c-border-background'] },
      ]}
      activeOpacity={disabled ? 1 : 0.6}
      onPress={handleToggle}
      accessibilityRole="switch"
      accessibilityState={{ checked: check, disabled }}
    >
      <View style={styles.labelContainer}>
        {label ? (
          <Text
            style={styles.labelText}
            size={15}
            color={disabled ? theme['c-500'] : theme['c-font']}
          >
            {label}
          </Text>
        ) : (
          children
        )}
        {(helpTitle ?? helpDesc) ? (
          <TouchableOpacity
            style={styles.helpBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={handleShowHelp}
          >
            <Icon size={16} name="help" color={theme['c-font-label']} />
          </TouchableOpacity>
        ) : null}
      </View>

      <Switch
        value={check}
        disabled={disabled || (need && check)}
        onValueChange={handleToggle}
        trackColor={{
          false: theme['c-button-background'],
          true: theme['c-primary'],
        }}
        thumbColor={Platform.OS === 'android' ? (check ? '#ffffff' : theme['c-600']) : undefined}
        ios_backgroundColor={theme['c-button-background']}
      />
    </TouchableOpacity>
  )
})

const styles = createStyle({
  row: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  labelContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
  },
  labelText: {
    flexShrink: 1,
    lineHeight: 20,
  },
  helpBtn: {
    marginLeft: 8,
    padding: 2,
  },
})
