import { useMemo, useRef } from 'react'
import { Animated, PanResponder } from 'react-native'
import { playNext, playPrev } from '@/core/player/player'
import { markTimeoutExitInteraction } from '@/core/player/timeoutExit'

// 超过这个距离松手才切歌,否则回弹
const SWITCH_DISTANCE = 60

// 迷你播放器左右滑动切歌:左滑下一首,右滑上一首。返回的 translateX 给歌名区域做跟手反馈
export default () => {
  const translateX = useRef(new Animated.Value(0)).current
  const panResponder = useMemo(() => {
    const reset = () => { Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start() }
    return PanResponder.create({
      // 只接管明显的横向滑动,点击和竖向滑动照旧交给子元素/外层
      onMoveShouldSetPanResponder: (_, { dx, dy }) => Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.5,
      // 不让外层的横向翻页抢走手势
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_, { dx }) => { translateX.setValue(dx * 0.5) },
      onPanResponderRelease: (_, { dx }) => {
        reset()
        if (Math.abs(dx) < SWITCH_DISTANCE) return
        markTimeoutExitInteraction()
        void (dx < 0 ? playNext() : playPrev())
      },
      onPanResponderTerminate: reset,
    })
  }, [translateX])

  return { panHandlers: panResponder.panHandlers, translateX }
}
