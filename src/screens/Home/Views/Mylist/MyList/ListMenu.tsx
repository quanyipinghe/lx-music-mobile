import { useRef, useImperativeHandle, forwardRef, useState } from 'react'
import { Platform, ScrollView, TouchableOpacity, View } from 'react-native'
import { useI18n } from '@/lang'
import Menu, { type Menus, type MenuType, type Position } from '@/components/common/Menu'
import Popup, { type PopupType } from '@/components/common/Popup'
import Text from '@/components/common/Text'
import { Icon } from '@/components/common/Icon'
import { useTheme } from '@/store/theme/hook'
import { createStyle } from '@/utils/tools'
import { LIST_IDS } from '@/config/constant'
import musicSdk from '@/utils/musicSdk'
import { scaleSizeW } from '@/utils/pixelRatio'
import listState from '@/store/list/state'

export interface SelectInfo {
  listInfo: LX.List.MyListInfo
  // selectedList: LX.Music.MusicInfo[]
  index: number
  // listId: string
  // single: boolean
}
const initSelectInfo = {}

const menuItemWidth = scaleSizeW(150)
// 主题里没有表示危险操作的颜色,用 iOS 系统红
const DANGER_COLOR = '#f25757'
// 图标字体里可选的不多,挑语义最接近的;颜色固定,不随主题变
const SHEET_ICONS: Record<string, [string, string]> = {
  new: ['add_folder', '#f0616d'],
  rename: ['eraser', '#7c6cf0'],
  sort: ['list-order', '#3d8bf2'],
  duplicateMusic: ['list-loop', '#3fb950'],
  local_file: ['sd-card', '#f59e2c'],
  sync: ['available_updates', '#e8663d'],
  import: ['download-2', '#1fb2a6'],
  export: ['share', '#a25ee8'],
}


export interface ListMenuProps {
  onNew: (position: number) => void
  onRename: (listInfo: LX.List.UserListInfo) => void
  onSort: (listInfo: LX.List.MyListInfo) => void
  onDuplicateMusic: (listInfo: LX.List.MyListInfo) => void
  onImport: (listInfo: LX.List.MyListInfo, index: number) => void
  onExport: (listInfo: LX.List.MyListInfo, index: number) => void
  onSync: (listInfo: LX.List.UserListInfo) => void
  onSelectLocalFile: (listInfo: LX.List.MyListInfo, index: number) => void
  onRemove: (listInfo: LX.List.UserListInfo) => void
}
export interface ListMenuType {
  show: (selectInfo: SelectInfo, position: Position) => void
}

export type {
  Position,
}

const isIOS = Platform.OS == 'ios'

export default forwardRef<ListMenuType, ListMenuProps>(({
  onNew,
  onRename,
  onSort,
  onDuplicateMusic,
  onImport,
  onExport,
  onSync,
  onSelectLocalFile,
  onRemove,
}, ref) => {
  const t = useI18n()
  const theme = useTheme()
  const menuRef = useRef<MenuType>(null)
  const popupRef = useRef<PopupType>(null)
  const [title, setTitle] = useState('')
  const selectInfoRef = useRef<SelectInfo>(initSelectInfo as SelectInfo)
  const [menus, setMenus] = useState<Menus>([])
  const [visible, setVisible] = useState(false)

  useImperativeHandle(ref, () => ({
    show(selectInfo, position) {
      selectInfoRef.current = selectInfo
      handleSetMenu(selectInfo.listInfo)
      setTitle(selectInfo.listInfo.name)
      const open = () => {
        if (isIOS) popupRef.current?.setVisible(true)
        else menuRef.current?.show(position)
      }
      if (visible) open()
      else {
        setVisible(true)
        requestAnimationFrame(open)
      }
    },
  }))

  const handleSetMenu = (listInfo: LX.List.MyListInfo) => {
    let rename = false
    let sync = false
    let remove = false
    let local_file = !listState.fetchingListStatus[listInfo.id]
    let userList: LX.List.UserListInfo
    switch (listInfo.id) {
      case LIST_IDS.DEFAULT:
      case LIST_IDS.LOVE:
        break
      default:
        userList = listInfo as LX.List.UserListInfo
        rename = true
        remove = true
        sync = !!(userList.source && musicSdk[userList.source]?.songList)
        break
    }

    setMenus([
      { action: 'new', label: t('list_create') },
      { action: 'rename', disabled: !rename, label: t('list_rename') },
      { action: 'sort', label: t('list_sort') },
      { action: 'duplicateMusic', label: t('lists__duplicate') },
      { action: 'local_file', disabled: !local_file, label: t('list_select_local_file') },
      { action: 'sync', disabled: !sync || !local_file, label: t('list_sync') },
      { action: 'import', label: t('list_import') },
      { action: 'export', label: t('list_export') },
      // { action: 'changePosition', label: t('change_position') },
      { action: 'remove', disabled: !remove, label: t('list_remove') },
    ])
  }

  const handleMenuPress = ({ action }: typeof menus[number]) => {
    const selectInfo = selectInfoRef.current
    switch (action) {
      case 'new':
        onNew(Math.max(selectInfo.index - 1, 0))
        break
      case 'rename':
        onRename(selectInfo.listInfo as LX.List.UserListInfo)
        break
      case 'sort':
        onSort(selectInfo.listInfo)
        break
      case 'duplicateMusic':
        onDuplicateMusic(selectInfo.listInfo)
        break
      case 'import':
        onImport(selectInfo.listInfo, selectInfo.index)
        break
      case 'export':
        onExport(selectInfo.listInfo, selectInfo.index)
        break
      case 'sync':
        onSync(selectInfo.listInfo as LX.List.UserListInfo)
        break
        // case 'changePosition':

        //   break
      case 'local_file':
        onSelectLocalFile(selectInfo.listInfo, selectInfo.index)
        break
      case 'remove':
        onRemove(selectInfo.listInfo as LX.List.UserListInfo)
        break

      default:
        break
    }
  }

  if (isIOS) {
    // 底部面板里不可用的项直接隐藏,移除单独做成底部按钮
    const items = menus.filter(m => !m.disabled && m.action != 'remove')
    const removeMenu = menus.find(m => m.action == 'remove' && !m.disabled)
    const handleSheetPress = (menu: typeof menus[number]) => {
      popupRef.current?.setVisible(false)
      handleMenuPress(menu)
    }
    return (
      visible
        ? (
            <Popup ref={popupRef} title={title}>
              <View style={styles.sheet} onStartShouldSetResponder={() => true}>
                <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                  {items.map(menu => {
                    const [icon, color] = SHEET_ICONS[menu.action] ?? ['menu', theme['c-primary']]
                    return (
                      <TouchableOpacity
                        key={menu.action}
                        activeOpacity={0.6}
                        onPress={() => { handleSheetPress(menu) }}
                        accessibilityRole="button"
                        accessibilityLabel={menu.label}
                        style={[styles.item, { backgroundColor: theme['c-button-background'] }]}
                      >
                        <View style={[styles.iconWrap, { backgroundColor: color + '26' }]}>
                          <Icon name={icon} size={16} color={color} />
                        </View>
                        <Text size={15} style={styles.label} numberOfLines={1}>{menu.label}</Text>
                        <Icon name="chevron-right" size={11} color={theme['c-font-label']} />
                      </TouchableOpacity>
                    )
                  })}
                </ScrollView>
                {removeMenu ? (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => { handleSheetPress(removeMenu) }}
                    accessibilityRole="button"
                    accessibilityLabel={removeMenu.label}
                    style={[styles.removeBtn, { backgroundColor: DANGER_COLOR }]}
                  >
                    <Text size={16} color="#fff" style={styles.removeText}>{removeMenu.label}</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </Popup>
          )
        : null
    )
  }

  return (
    visible
      ? <Menu
          ref={menuRef}
          menus={menus}
          onPress={handleMenuPress}
          width={menuItemWidth}
        />
      : null
  )
})

const styles = createStyle({
  sheet: {
    flexShrink: 1,
    paddingTop: 4,
    paddingBottom: 30,
  },
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  item: {
    height: 54,
    marginBottom: 8,
    paddingLeft: 12,
    paddingRight: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    marginLeft: 14,
  },
  removeBtn: {
    height: 50,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    fontWeight: '600',
  },
})
