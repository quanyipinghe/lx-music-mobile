import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import Modal, { type PlayListModalType as ModalType, type PlayListModalProps as ModalProps } from './PlayListModal'

export interface PlayListModalProps {
  onHide?: ModalProps['onHide']
}

export interface PlayListModalType {
  show: () => void
  hide: () => void
}

export default forwardRef<PlayListModalType, PlayListModalProps>(({ onHide }, ref) => {
  const modalRef = useRef<ModalType>(null)
  const [visible, setVisible] = useState(false)

  useImperativeHandle(ref, () => ({
    show() {
      if (visible) {
        modalRef.current?.show()
      } else {
        setVisible(true)
        requestAnimationFrame(() => {
          modalRef.current?.show()
        })
      }
    },
    hide() {
      modalRef.current?.hide()
    },
  }))

  const handleHide = () => {
    setVisible(false)
    onHide?.()
  }

  return (
    visible ? <Modal ref={modalRef} onHide={handleHide} /> : null
  )
})
