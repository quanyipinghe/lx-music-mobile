import { View } from 'react-native'

import Button from '@/components/common/Button'
import { type TagInfoItem } from '@/store/songlist/state'
import { useTheme } from '@/store/theme/hook'
import { createStyle } from '@/utils/tools'
import Text from '@/components/common/Text'

export interface TagGroupProps {
  name: string
  list: TagInfoItem[]
  onTagChange: (name: string, id: string) => void
  activeId: string
}

export default ({ name, list, onTagChange, activeId }: TagGroupProps) => {
  const theme = useTheme()
  return (
    <View style={styles.group}>
      {
        name
          ? <Text style={styles.tagTypeTitle} color={theme['c-font-label']} size={13}>{name}</Text>
          : null
      }
      <View style={styles.tagTypeList}>
        {list.map(item => {
          const active = activeId == item.id
          return (
            <Button
              key={item.id}
              style={[
                styles.tagButton,
                {
                  backgroundColor: active ? theme['c-primary-background-active'] : theme['c-button-background'],
                  borderColor: active ? theme['c-primary'] : 'transparent',
                },
              ]}
              onPress={() => { onTagChange(item.name, item.id) }}
            >
              <Text
                style={[styles.tagButtonText, active && styles.tagButtonTextActive]}
                color={active ? theme['c-primary'] : theme['c-font']}
              >
                {item.name}
              </Text>
            </Button>
          )
        })}
      </View>
    </View>
  )
}

const styles = createStyle({
  group: {
    marginBottom: 8,
  },
  tagTypeTitle: {
    marginTop: 12,
    marginBottom: 8,
    fontWeight: '600',
  },
  tagTypeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagButton: {
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagButtonText: {
    fontSize: 13,
  },
  tagButtonTextActive: {
    fontWeight: '600',
  },
})
