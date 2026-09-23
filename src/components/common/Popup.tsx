import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import { Animated, PanResponder, Platform, StyleSheet, TouchableOpacity, View } from 'react-native'

import Modal, { type ModalType } from './Modal'
import { Icon } from '@/components/common/Icon'
import { useKeyboard } from '@/utils/hooks'
import { createStyle } from '@/utils/tools'
import { useTheme } from '@/store/theme/hook'
import Text from './Text'
import { useStatusbarHeight } from '@/store/common/hook'

const styles = createStyle({
  centeredView: {
    flex: 1,
  },
  modalView: {
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    flexGrow: 0,
    flexShrink: 1,
  },
  dragHeader: {
    width: '100%',
  },
  handleBarContainer: {
    width: '100%',
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flex: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  title: {
    flex: 1,
    fontWeight: '600',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export interface PopupProps {
  onHide?: () => void
  keyHide?: boolean
  bgHide?: boolean
  closeBtn?: boolean
  position?: 'top' | 'left' | 'right' | 'bottom'
  title?: string
  children: React.ReactNode
}

export interface PopupType {
  setVisible: (visible: boolean) => void
}

export default forwardRef<PopupType, PopupProps>(({
  onHide = () => {},
  keyHide = true,
  bgHide = true,
  closeBtn = true,
  position = 'bottom',
  title = '',
  children,
}: PopupProps, ref) => {
  const theme = useTheme()
  const { keyboardShown, keyboardHeight } = useKeyboard()
  const statusBarHeight = useStatusbarHeight()

  const modalRef = useRef<ModalType>(null)
  const translateY = useRef(new Animated.Value(0)).current

  const handleHide = useCallback(() => {
    global.lx.hasModalOpen = false
    onHide()
  }, [onHide])

  useEffect(() => {
    return () => {
      global.lx.hasModalOpen = false
    }
  }, [])

  useImperativeHandle(ref, () => ({
    setVisible(visible: boolean) {
      global.lx.hasModalOpen = visible
      modalRef.current?.setVisible(visible)
      if (!visible) {
        translateY.setValue(0)
      }
    },
  }))

  // 底部弹窗顶部下拉手势关闭
  const dragPanResponder = useMemo(() => {
    if (position !== 'bottom') return null
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // 向下滑动且垂直位移明显大于横向位移
        return gestureState.dy > 5 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx)
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy)
        } else {
          translateY.setValue(gestureState.dy * 0.2) // 向上滑动阻尼
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        // 下拉距离超过 50dp 或具有明显的快速下滑手势时触发关闭
        if (gestureState.dy > 50 || (gestureState.dy > 15 && gestureState.vy > 0.4)) {
          Animated.timing(translateY, {
            toValue: 500,
            duration: 180,
            useNativeDriver: true,
          }).start(() => {
            modalRef.current?.setVisible(false)
            global.lx.hasModalOpen = false
            translateY.setValue(0)
          })
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            tension: 70,
            friction: 9,
            useNativeDriver: true,
          }).start()
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateY, {
          toValue: 0,
          tension: 70,
          friction: 9,
          useNativeDriver: true,
        }).start()
      },
    })
  }, [position, translateY])

  const closeBtnComponent = useMemo(() => closeBtn
    ? <TouchableOpacity style={[styles.closeBtn, { backgroundColor: theme['c-button-background'] }]} onPress={() => modalRef.current?.setVisible(false)} accessibilityRole="button" accessibilityLabel="关闭">
        <Icon name="close" style={{ color: theme['c-font-label'] }} size={14} />
      </TouchableOpacity>
    : null, [closeBtn, theme])

  const [centeredViewStyle, modalViewStyle] = useMemo(() => {
    switch (position) {
      case 'top':
        return [
          {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            top: 0,
            justifyContent: 'flex-start',
          },
          {
            width: '100%',
            maxHeight: '78%',
            minHeight: '20%',
          },
        ] as const
      case 'left':
        return [
          {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            top: 0,
            flexDirection: 'row',
            justifyContent: 'flex-start',
          },
          {
            minWidth: '45%',
            maxWidth: '78%',
            height: '100%',
            paddingTop: statusBarHeight,
          },
        ] as const
      case 'right':
        return [
          {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            top: 0,
            flexDirection: 'row',
            justifyContent: 'flex-end',
          },
          {
            minWidth: '45%',
            maxWidth: '78%',
            height: '100%',
            paddingTop: statusBarHeight,
          },
        ] as const
      case 'bottom':
      default:
        return [
          {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            top: 0,
            justifyContent: 'flex-end',
          },
          {
            width: '100%',
            maxHeight: '82%',
            minHeight: '20%',
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
          },
        ] as const
    }
  }, [position, statusBarHeight])

  return (
    <Modal onHide={handleHide} keyHide={keyHide} bgHide={bgHide} bgColor="rgba(50,50,50,.35)" ref={modalRef}>
      <View style={{ ...styles.centeredView, ...centeredViewStyle, paddingBottom: keyboardShown ? keyboardHeight : 0 }}>
        <Animated.View
          style={[
            styles.modalView,
            modalViewStyle,
            {
              backgroundColor: theme['c-content-background'],
              transform: [{ translateY }],
            },
          ]}
          onStartShouldSetResponder={() => true}
        >
          {dragPanResponder ? (
            <View {...dragPanResponder.panHandlers} style={styles.dragHeader}>
              <View style={styles.handleBarContainer}>
                <View style={[styles.handleBar, { backgroundColor: theme['c-border-background'] ?? 'rgba(150, 150, 150, 0.3)' }]} />
              </View>
              <View style={styles.header}>
                <Text size={15} style={styles.title} numberOfLines={1}>{title}</Text>
                {closeBtnComponent}
              </View>
            </View>
          ) : (
            <>
              {position === 'bottom' ? (
                <View style={styles.handleBarContainer}>
                  <View style={[styles.handleBar, { backgroundColor: theme['c-border-background'] ?? 'rgba(150, 150, 150, 0.3)' }]} />
                </View>
              ) : null}
              <View style={styles.header}>
                <Text size={15} style={styles.title} numberOfLines={1}>{title}</Text>
                {closeBtnComponent}
              </View>
            </>
          )}
          {children}
        </Animated.View>
      </View>
    </Modal>
  )
})
