import { memo } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { useTheme } from '@/store/theme/hook'
import Text from '@/components/common/Text'

export interface ChipItem<T extends string | number> {
  id: T
  name: string
}

export interface ChipsProps<T extends string | number> {
  list: ReadonlyArray<ChipItem<T>> | Array<ChipItem<T>>
  activeId: T
  onChange: (id: T) => void
  disabled?: boolean
}

/**
 * 现代胶囊分段选项组（Spotify / QQ 音乐风格）
 */
function Chips<T extends string | number>({
  list,
  activeId,
  onChange,
  disabled = false,
}: ChipsProps<T>) {
  const theme = useTheme()

  return (
    <View style={styles.list}>
      {list.map(item => {
        const isActive = activeId === item.id
        return (
          <TouchableOpacity
            key={String(item.id)}
            style={[
              styles.chip,
              {
                backgroundColor: isActive
                  ? theme['c-primary-background-active']
                  : theme['c-button-background'],
                borderColor: isActive
                  ? theme['c-primary']
                  : 'transparent',
              },
            ]}
            activeOpacity={0.7}
            disabled={disabled || isActive}
            onPress={() => onChange(item.id)}
            accessibilityRole="radio"
            accessibilityState={{ selected: isActive, disabled }}
          >
            <Text
              size={13}
              color={isActive ? theme['c-primary-font'] : theme['c-font']}
              style={isActive ? styles.activeText : undefined}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  activeText: {
    fontWeight: '600',
  },
})


export default memo(Chips) as typeof Chips
