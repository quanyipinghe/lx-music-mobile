import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { ScrollView, TouchableOpacity } from 'react-native'
import songlistState, { type SortInfo, type Source } from '@/store/songlist/state'
import { useI18n } from '@/lang'
import { useTheme } from '@/store/theme/hook'
import Text from '@/components/common/Text'
import { createStyle } from '@/utils/tools'
import { BorderWidths } from '@/theme'

export interface SortTabProps {
  onSortChange: (id: string) => void
}

export interface SortTabType {
  setSource: (source: Source, activeTab: SortInfo['id']) => void
}


export default forwardRef<SortTabType, SortTabProps>(({ onSortChange }, ref) => {
  const [sortList, setSortList] = useState<SortInfo[]>([])
  const [activeId, setActiveId] = useState<SortInfo['id']>('')
  const t = useI18n()
  const theme = useTheme()
  const scrollViewRef = useRef<ScrollView>(null)

  useImperativeHandle(ref, () => ({
    setSource(source, activeTab) {
      scrollViewRef.current?.scrollTo({ x: 0 })
      setSortList(songlistState.sortList[source]!)
      setActiveId(activeTab)
    },
  }))

  const sorts = useMemo(() => {
    return sortList.map(s => ({ label: t(`songlist_${s.tid}`), id: s.id }))
  }, [sortList, t])

  const handleSortChange = (id: string) => {
    onSortChange(id)
    setActiveId(id)
  }

  return (
    <ScrollView ref={scrollViewRef} contentContainerStyle={styles.content} style={styles.container} keyboardShouldPersistTaps={'always'} horizontal showsHorizontalScrollIndicator={false}>
      {
        sorts.map(s => {
          const active = activeId == s.id
          return (
            <TouchableOpacity
              style={[
                styles.button,
                active && { backgroundColor: theme['c-primary-background-active'] },
              ]}
              onPress={() => { handleSortChange(s.id) }}
              key={s.id}
            >
              <Text
                style={[
                  styles.buttonText,
                  active && styles.buttonTextActive,
                ]}
                color={active ? theme['c-primary'] : theme['c-font-label']}
                size={13}
              >
                {s.label}
              </Text>
            </TouchableOpacity>
          )
        })
      }
    </ScrollView>
  )
})


const styles = createStyle({
  container: {
    flexGrow: 1,
    flexShrink: 1,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  button: {
    minWidth: 48,
    height: 28,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    marginRight: 4,
  },
  buttonText: {
    textAlign: 'center',
  },
  buttonTextActive: {
    fontWeight: '600',
  },
})
