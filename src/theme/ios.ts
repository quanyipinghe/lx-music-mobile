import { StyleSheet } from 'react-native'

export const IOS_UI = {
  space: 12,
  radius: 14,
  controlSize: 44,
  navHeight: 62,
  playerHeight: 64,
} as const

export const iosShadow = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
  },
}).card
