import { useEffect, useMemo, useState } from 'react'
import { View, TouchableOpacity } from 'react-native'

import { createStyle } from '@/utils/tools'
import { type SearchType } from '@/store/search/state'
import { useI18n } from '@/lang'
import Text from '@/components/common/Text'
import { useTheme } from '@/store/theme/hook'
import { getSearchSetting } from '@/utils/data'

const SEARCH_TYPE_LIST = [
  'music',
  'songlist',
] as const

export default () => {
  const t = useI18n()
  const theme = useTheme()
  const [type, setType] = useState<SearchType>('music')

  useEffect(() => {
    void getSearchSetting().then(info => {
      setType(info.type)
    })
  }, [])

  const list = useMemo(() => {
    return SEARCH_TYPE_LIST.map(type => ({ label: t(`search_type_${type}`), id: type }))
  }, [t])

  const handleTypeChange = (type: SearchType) => {
    setType(type)
    global.app_event.searchTypeChanged(type)
  }

  return (
    <View style={[styles.container, { backgroundColor: theme['c-button-background'] }]}>
      {
        list.map(item => {
          const selected = type == item.id
          return (
            <TouchableOpacity
              style={[
                styles.button,
                selected && { backgroundColor: theme['c-primary-background-active'] },
              ]}
              onPress={() => { handleTypeChange(item.id) }}
              key={item.id}
            >
              <Text
                style={[
                  styles.buttonText,
                  selected && styles.buttonTextActive,
                ]}
                color={selected ? theme['c-primary'] : theme['c-font-label']}
                size={13}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )
        })
      }
    </View>
  )
}

const styles = createStyle({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 3,
    borderRadius: 18,
    flexGrow: 0,
    flexShrink: 0,
  },
  button: {
    minWidth: 54,
    height: 28,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  buttonText: {
    textAlign: 'center',
  },
  buttonTextActive: {
    fontWeight: '600',
  },
})

