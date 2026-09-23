import { memo, useCallback, useMemo, useRef } from 'react'
import { View, TouchableOpacity } from 'react-native'

import SubTitle from '../../components/SubTitle'
import Text from '@/components/common/Text'
import { Icon } from '@/components/common/Icon'
import { createStyle } from '@/utils/tools'
import { setApiSource } from '@/core/apiSource'
import { useI18n } from '@/lang'
import apiSourceInfo from '@/utils/musicSdk/api-source-info'
import { useSettingValue } from '@/store/setting/hook'
import { useStatus, useUserApiList } from '@/store/userApi'
import UserApiEditModal, { type UserApiEditModalType } from './UserApiEditModal'
import { useTheme } from '@/store/theme/hook'
import { isUserApiSupported } from '@/utils/nativeModules/userApi'

const apiSourceList = apiSourceInfo.map(api => ({
  id: api.id,
  name: api.name,
  disabled: api.disabled,
}))

export default memo(() => {
  const t = useI18n()
  const theme = useTheme()
  const activeApiSourceId = useSettingValue('common.apiSource')
  const userApiListRaw = useUserApiList()
  const apiStatus = useStatus()

  const list = useMemo(() => apiSourceList.map(s => ({
    // @ts-expect-error
    name: t(`setting_basic_source_${s.id}`) || s.name,
    id: s.id,
  })), [t])

  const setApiSourceId = useCallback((id: string) => {
    setApiSource(id)
  }, [])

  const userApiList = useMemo(() => {
    if (!isUserApiSupported) return []
    const getApiStatusText = () => {
      if (apiStatus.status) return t('setting_basic_source_status_success')
      if (apiStatus.message == 'initing') return t('setting_basic_source_status_initing')
      return t('setting_basic_source_status_failed')
    }
    return userApiListRaw.map(api => {
      const isSelected = api.id === activeApiSourceId
      const statusType: 'success' | 'initing' | 'failed' = apiStatus.status
        ? 'success'
        : apiStatus.message == 'initing'
          ? 'initing'
          : 'failed'
      return {
        id: api.id,
        name: api.name,
        desc: [/^\d/.test(api.version) ? `v${api.version}` : api.version].filter(Boolean).join(', '),
        statusText: isSelected ? getApiStatusText() : '',
        statusType: isSelected ? statusType : null,
      }
    })
  }, [userApiListRaw, apiStatus, activeApiSourceId, t])

  const modalRef = useRef<UserApiEditModalType>(null)
  const handleShow = () => {
    modalRef.current?.show()
  }

  const renderStatusDot = (statusType: 'success' | 'initing' | 'failed') => {
    let dotColor = '#10b981'
    if (statusType === 'initing') dotColor = '#f59e0b'
    else if (statusType === 'failed') dotColor = '#ef4444'

    return <View style={[styles.statusDot, { backgroundColor: dotColor }]} />
  }

  return (
    <SubTitle
      title={t('setting_basic_source')}
      action={
        isUserApiSupported ? (
          <TouchableOpacity
            style={[
              styles.manageBtn,
              {
                backgroundColor: theme['c-button-background'],
              },
            ]}
            activeOpacity={0.7}
            onPress={handleShow}
          >
            <Text size={12} color={theme['c-primary-font']} style={styles.manageBtnText}>
              {t('setting_basic_source_user_api_btn')}
            </Text>
            <Icon name="chevron-right" size={10} color={theme['c-primary-font']} style={styles.manageBtnIcon} />
          </TouchableOpacity>
        ) : null
      }
    >
      <View style={styles.chipsContainer}>
        {list.map(item => {
          const isActive = activeApiSourceId === item.id
          return (
            <TouchableOpacity
              key={item.id}
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
              onPress={() => setApiSourceId(item.id)}
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

        {userApiList.map(item => {
          const isActive = activeApiSourceId === item.id
          return (
            <TouchableOpacity
              key={item.id}
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
              onPress={() => setApiSourceId(item.id)}
            >
              {item.statusType ? renderStatusDot(item.statusType) : null}
              <Text
                size={13}
                color={isActive ? theme['c-primary-font'] : theme['c-font']}
                style={isActive ? styles.activeText : undefined}
              >
                {item.name}
              </Text>
              {item.desc ? (
                <Text
                  size={11}
                  color={isActive ? theme['c-primary-font'] : theme['c-500']}
                  style={styles.versionBadge}
                >
                  {item.desc}
                </Text>
              ) : null}
              {item.statusText ? (
                <Text
                  size={11}
                  color={item.statusType === 'failed' ? '#ef4444' : isActive ? theme['c-primary-font'] : theme['c-500']}
                  style={styles.statusBadge}
                >
                  {`[${item.statusText}]`}
                </Text>
              ) : null}
            </TouchableOpacity>
          )
        })}
      </View>
      {isUserApiSupported ? <UserApiEditModal ref={modalRef} /> : null}
    </SubTitle>
  )
})

const styles = createStyle({
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  activeText: {
    fontWeight: '600',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  versionBadge: {
    marginLeft: 5,
    opacity: 0.8,
  },
  statusBadge: {
    marginLeft: 4,
    fontWeight: '500',
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  manageBtnText: {
    fontWeight: '500',
  },
  manageBtnIcon: {
    marginLeft: 3,
  },
})
