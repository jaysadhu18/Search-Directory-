import { useEffect } from 'react'
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import './Toast.css'

function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(onDismiss, 3500)
    return () => clearTimeout(timer)
  }, [toast, onDismiss])

  if (!toast) return null

  return (
    <div className={`toast ${toast.type}`}>
      {toast.type === 'success' ? <FaCheckCircle /> : <FaTimesCircle />}
      {toast.text}
    </div>
  )
}

export default Toast
