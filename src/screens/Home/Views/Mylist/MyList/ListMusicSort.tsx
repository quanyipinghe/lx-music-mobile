import { useRef, useImperativeHandle, forwardRef, useState } from 'react'
import { InteractionManager, TouchableOpacity, View } from 'react-native'
import Popup, { type PopupType } from '@/components/common/Popup'
import Text from '@/components/common/Text'
import { createStyle } from '@/utils/tools'
import { useI18n } from '@/lang'
import { useTheme } from '@/store/theme/hook'
import { getListMusics, setFetchingListStatus, updateListMusicPosition } from '@/core/list'
import { sortListMusicInfo } from './utils'
import settingStyles from '@/screens/PlayDetail/components/SettingPopup/settings/style'

const fieldNames = ['name', 'singer', 'album', 'time', 'source'] as const
const fieldTypes = ['up', 'down', 'random'] as const
type FieldName = typeof fieldNames[number]
type FieldType = typeof fieldTypes[number]

export interface ListMusicSortType {
  show: (listInfo: LX.List.MyListInfo) => void
}

export default forwardRef<ListMusicSortType, {}>((props, ref) => {
  const popupRef = useRef<PopupType>(null)
  const t = useI18n()
  const theme = useTheme()
  const [visible, setVisible] = useState(false)
  const [listInfo, setListInfo] = useState<LX.List.MyListInfo | null>(null)
  const [name, setName] = useState<FieldName>()
  const [type, setType] = useState<FieldType>('up')

  useImperativeHandle(ref, () => ({
    show(info) {
      setListInfo(info)
      setName(undefined)
      setType('up')
      if (visible) popupRef.current?.setVisible(true)
      else {
        setVisible(true)
        requestAnimationFrame(() => {
          popupRef.current?.setVisible(true)
        })
      }
    },
  }))

  const isRandom = type == 'random'
  const canSort = isRandom || !!name

  const handleSort = async() => {
    if (!listInfo || !canSort) return
    popupRef.current?.setVisible(false)
    const id = listInfo.id
    let list = [...(await getListMusics(id))]
    setFetchingListStatus(id, true)
    requestAnimationFrame(() => {
      void InteractionManager.runAfterInteractions(() => {
        list = sortListMusicInfo(list, type, name!, global.i18n.locale)
        void updateListMusicPosition(id, 0, list.map(m => m.id))
        setFetchingListStatus(id, false)
      })
    })
  }

  const cardBg = theme['c-button-background']
  const activeBg = theme['c-primary-background-active']

  return (
    visible
      ? (
          <Popup ref={popupRef} title={t('list_sort')}>
            <View style={styles.content} onStartShouldSetResponder={() => true}>
              <Text style={styles.listName} size={13} color={theme['c-font-label']} numberOfLines={1}>{listInfo?.name}</Text>

              <View style={[settingStyles.card, { backgroundColor: cardBg }]}>
                <Text style={settingStyles.cardTitle}>{t('list_sort_modal_by_type')}</Text>
                <View style={[settingStyles.segmentedContainer, { backgroundColor: cardBg }]} accessibilityRole="radiogroup">
                  {fieldTypes.map(id => {
                    const isActive = type == id
                    return (
                      <TouchableOpacity
                        key={id}
                        activeOpacity={0.7}
                        onPress={() => { setType(id) }}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: isActive }}
                        style={[settingStyles.segmentedItem, isActive && [settingStyles.segmentedItemActive, { backgroundColor: activeBg }]]}
                      >
                        <Text style={[settingStyles.segmentedItemText, isActive && { color: theme['c-primary-font-active'], fontWeight: '600' }]}>
                          {t(`list_sort_modal_by_${id}`)}
                        </Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              </View>

              {/* 随机乱序不需要字段,直接收起而不是置灰 */}
              {isRandom ? null : (
                <View style={[settingStyles.card, { backgroundColor: cardBg }]}>
                  <Text style={settingStyles.cardTitle}>{t('list_sort_modal_by_field')}</Text>
                  <View style={styles.chips} accessibilityRole="radiogroup">
                    {fieldNames.map(id => {
                      const isActive = name == id
                      return (
                        <TouchableOpacity
                          key={id}
                          activeOpacity={0.7}
                          onPress={() => { setName(id) }}
                          accessibilityRole="radio"
                          accessibilityState={{ selected: isActive }}
                          style={[styles.chip, { backgroundColor: isActive ? activeBg : theme['c-content-background'] }]}
                        >
                          <Text size={14} color={isActive ? theme['c-primary-font-active'] : theme['c-font']} style={isActive ? styles.chipTextActive : undefined}>
                            {t(`list_sort_modal_by_${id}`)}
                          </Text>
                        </TouchableOpacity>
                      )
                    })}
                  </View>
                </View>
              )}

              <TouchableOpacity
                activeOpacity={0.8}
                disabled={!canSort}
                onPress={() => { void handleSort() }}
                accessibilityRole="button"
                accessibilityState={{ disabled: !canSort }}
                style={[styles.confirmBtn, { backgroundColor: theme['c-primary'], opacity: canSort ? 1 : 0.4 }]}
              >
                <Text size={16} color={theme['c-primary-light-1000']} style={styles.confirmText}>{t('list_sort')}</Text>
              </TouchableOpacity>
            </View>
          </Popup>
        )
      : null
  )
})


const styles = createStyle({
  content: {
    paddingBottom: 24,
  },
  listName: {
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
    marginRight: -8,
  },
  chip: {
    height: 34,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 17,
    justifyContent: 'center',
  },
  chipTextActive: {
    fontWeight: '600',
  },
  confirmBtn: {
    height: 48,
    marginHorizontal: 14,
    marginTop: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    fontWeight: '600',
  },
})
