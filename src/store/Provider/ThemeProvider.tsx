import { memo, useEffect, useState } from 'react'
import { Platform } from 'react-native'
import ToastHost from '@/components/common/ToastHost'

import themeState, { ThemeContext } from '../theme/state'


export default memo(({ children }: {
  children: React.ReactNode
}) => {
  const [theme, setTheme] = useState(themeState.theme)

  useEffect(() => {
    const handleUpdateTheme = (theme: LX.ActiveTheme) => {
      requestAnimationFrame(() => {
        setTheme(theme)
      })
    }
    global.state_event.on('themeUpdated', handleUpdateTheme)
    return () => {
      global.state_event.off('themeUpdated', handleUpdateTheme)
    }
  }, [])

  return (
    <ThemeContext.Provider value={theme}>
      {children}
      {Platform.OS == 'ios' ? <ToastHost /> : null}
    </ThemeContext.Provider>
  )
})
