import { useCallback, useRef, forwardRef, useImperativeHandle, useState } from 'react'
import { StyleSheet, View, TextInput, TouchableOpacity, type NativeSyntheticEvent, type TextInputSubmitEditingEventData } from 'react-native'
import { useI18n } from '@/lang'
import { useTheme } from '@/store/theme/hook'
import { Icon } from '@/components/common/Icon'

export interface SearchInputProps {
  onChangeText: (text: string) => void
  onSubmit: (text: string) => void
  onBlur: () => void
  onTouchStart: () => void
}

export interface SearchInputType {
  setText: (text: string) => void
  focus: () => void
  blur: () => void
}

export default forwardRef<SearchInputType, SearchInputProps>(({ onChangeText, onSubmit, onBlur, onTouchStart }, ref) => {
  const [text, setText] = useState('')
  const inputRef = useRef<TextInput>(null)
  const t = useI18n()
  const theme = useTheme()

  useImperativeHandle(ref, () => ({
    setText(value) {
      setText(value)
    },
    focus() {
      inputRef.current?.focus()
    },
    blur() {
      inputRef.current?.blur()
    },
  }))

  const handleChangeText = (value: string) => {
    setText(value)
    onChangeText(value.trim())
  }

  const handleClearText = useCallback(() => {
    setText('')
    onChangeText('')
    onSubmit('')
  }, [onChangeText, onSubmit])

  const handleSubmit = useCallback(({ nativeEvent: { text: submitText } }: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
    onSubmit(submitText)
  }, [onSubmit])

  return (
    <View style={[styles.inputBox, { backgroundColor: theme['c-button-background'] }]}>
      <Icon name="search-2" size={15} color={theme['c-font-label']} style={styles.searchIcon} />
      <TextInput
        ref={inputRef}
        placeholder={t('search_input_placeholder')}
        placeholderTextColor={theme['c-font-label']}
        value={text}
        onChangeText={handleChangeText}
        style={[styles.input, { color: theme['c-font'] }]}
        onBlur={onBlur}
        onSubmitEditing={handleSubmit}
        onTouchStart={onTouchStart}
        returnKeyType="search"
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect={false}
      />
      {text.length > 0 ? (
        <TouchableOpacity
          style={styles.clearBtn}
          onPress={handleClearText}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="清空"
        >
          <Icon name="close" size={12} color={theme['c-font-label']} />
        </TouchableOpacity>
      ) : null}
    </View>
  )
})

const styles = StyleSheet.create({
  inputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    borderRadius: 18,
    paddingLeft: 12,
    paddingRight: 8,
    overflow: 'hidden',
  },
  searchIcon: {
    marginRight: 4,
  },
  input: {
    flex: 1,
    height: 36,
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 4,
    fontSize: 14,
    backgroundColor: 'transparent',
  },
  clearBtn: {
    height: 36,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
})


