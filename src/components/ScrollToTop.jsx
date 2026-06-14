import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// ページ遷移時に自動でスクロールをトップに戻すコンポーネント
export default function ScrollToTop() {
  // 現在のパス名を取得
  const { pathname } = useLocation()

  // パス名が変わるたびにスクロールをトップに戻す
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])
  return null
}
