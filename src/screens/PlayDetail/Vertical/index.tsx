import { memo, useState, useRef, useMemo, useEffect } from 'react'
import { View, AppState, Animated, PanResponder, Dimensions } from 'react-native'

import Header from './components/Header'
// import Aside from './components/Aside'
// import Main from './components/Main'
import Player from './Player'
import PagerView, { type PagerViewOnPageSelectedEvent } from 'react-native-pager-view'
import Pic from './Pic'
import Lyric from './Lyric'
import { screenkeepAwake, screenUnkeepAwake } from '@/utils/nativeModules/utils'
import commonState, { type InitState as CommonState } from '@/store/common/state'
import { createStyle } from '@/utils/tools'
import { useTheme } from '@/store/theme/hook'
import { pop } from '@/navigation'

const LyricPage = ({ activeIndex }: { activeIndex: number }) => {
  const initedRef = useRef(false)
  const lyric = useMemo(() => <Lyric />, [])
  switch (activeIndex) {
    // case 3:
    case 1:
      if (!initedRef.current) initedRef.current = true
      return lyric
    default:
      return initedRef.current ? lyric : null
  }
  // return activeIndex == 0 || activeIndex == 1 ? setting : null
}

// global.iskeep = false
export default memo(({ componentId }: { componentId: string }) => {
  const theme = useTheme()
  const [pageIndex, setPageIndex] = useState(0)
  const showLyricRef = useRef(false)
  const pageIndexRef = useRef(0)
  const isDismissingRef = useRef(false)
  const panY = useRef(new Animated.Value(0)).current

  const onPageSelected = ({ nativeEvent }: PagerViewOnPageSelectedEvent) => {
    setPageIndex(nativeEvent.position)
    pageIndexRef.current = nativeEvent.position
    showLyricRef.current = nativeEvent.position == 1
    if (showLyricRef.current) {
      screenkeepAwake()
    } else {
      screenUnkeepAwake()
    }
  }

  // 手势下滑退出
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        if (isDismissingRef.current) return false
        // 判定垂直向下滑动，且垂直位移明显大于横向位移
        const isVerticalDown = gestureState.dy > 12 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx) * 1.5
        if (!isVerticalDown) return false

        // 封面页 (pageIndex == 0) 全区域可下滑关闭
        if (pageIndexRef.current === 0) return true

        // 歌词页 (pageIndex == 1) 仅顶部 Header 或底部控制区域可下滑关闭，避免与歌词滚动冲突
        const winHeight = Dimensions.get('window').height
        const touchY = evt.nativeEvent.pageY ?? evt.nativeEvent.locationY
        return touchY < 120 || touchY > winHeight - 180
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy)
        } else {
          panY.setValue(0)
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (isDismissingRef.current) return
        const winHeight = Dimensions.get('window').height
        // 下拉距离超过 120dp 或有明显的向下甩手势时触发关闭
        if (gestureState.dy > 120 || (gestureState.dy > 40 && gestureState.vy > 0.5)) {
          isDismissingRef.current = true
          Animated.timing(panY, {
            toValue: winHeight,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            void pop(commonState.componentIds.playDetail ?? componentId)
          })
        } else {
          Animated.spring(panY, {
            toValue: 0,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          }).start()
        }
      },
      onPanResponderTerminate: () => {
        if (isDismissingRef.current) return
        Animated.spring(panY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }).start()
      },
    }),
  ).current

  useEffect(() => {
    let appstateListener = AppState.addEventListener('change', (state) => {
      switch (state) {
        case 'active':
          if (showLyricRef.current && !commonState.componentIds.comment) screenkeepAwake()
          break
        case 'background':
          screenUnkeepAwake()
          break
      }
    })

    const handleComponentIdsChange = (ids: CommonState['componentIds']) => {
      if (ids.comment) screenUnkeepAwake()
      else if (AppState.currentState == 'active') screenkeepAwake()
    }

    global.state_event.on('componentIdsUpdated', handleComponentIdsChange)

    return () => {
      global.state_event.off('componentIdsUpdated', handleComponentIdsChange)
      appstateListener.remove()
      screenUnkeepAwake()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Animated.View
      style={[
        styles.root,
        {
          backgroundColor: theme['c-content-background'],
          transform: [{ translateY: panY }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <Header />
      <View style={styles.container}>
        <PagerView
          onPageSelected={onPageSelected}
          style={styles.pagerView}
        >
          <View collapsable={false}>
            <Pic componentId={componentId} />
          </View>
          <View collapsable={false}>
            <LyricPage activeIndex={pageIndex} />
          </View>
        </PagerView>
        <Player />
      </View>
    </Animated.View>
  )
})

const styles = createStyle({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  pagerView: {
    flex: 1,
  },
})
