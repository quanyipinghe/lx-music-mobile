import { useEffect, useRef, useState } from 'react'
import { Animated, StyleSheet, Text, View } from 'react-native'

// iOS 没有 ToastAndroid,用 JS 实现一个。只依赖 react-native,供 utils/tools 的 toast() 调用而不产生循环引用
// 每个 RNN 页面根节点各挂一个宿主,被盖住的页面也会弹,但看得见的只有最上层那个
type Listener = (message: string, duration: number, position: Position) => void
type Position = 'top' | 'center' | 'bottom'
const listeners = new Set<Listener>()

export const showIOSToast = (message: string, duration: number, position: Position) => {
  for (const l of listeners) l(message, duration, position)
}

export default () => {
  const [info, setInfo] = useState<{ message: string, position: Position } | null>(null)
  const opacity = useRef(new Animated.Value(0)).current
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    const listener: Listener = (message, duration, position) => {
      clearTimeout(timeoutRef.current)
      setInfo({ message, position })
      Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }).start()
      timeoutRef.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(({ finished }) => {
          if (finished) setInfo(null)
        })
      }, duration)
    }
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
      clearTimeout(timeoutRef.current)
    }
  }, [opacity])

  if (!info) return null
  return (
    // 外层占满一行负责定位,气泡在里面居中;直接对绝对定位的气泡 alignSelf 居中会算错宽度把文字截掉
    <Animated.View pointerEvents="none" style={[styles.container, positionStyles[info.position], { opacity }]}>
      <View style={styles.bubble}>
        <Text style={styles.text}>{info.message}</Text>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  text: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
})
// 底部要避开迷你播放器和底部导航
const positionStyles = StyleSheet.create({
  top: { top: 100 },
  center: { top: '45%' },
  bottom: { bottom: 180 },
})
