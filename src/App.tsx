import { useEffect, useState } from 'react'
import { Exam } from './screens/Exam'
import { Home } from './screens/Home'
import { Result } from './screens/Result'
import { Review } from './screens/Review'
import { useExamStore } from './store'

function TimeGuard() {
  const endsAt = useExamStore((s) => s.session?.endsAt)
  const view = useExamStore((s) => s.session?.view)

  useEffect(() => {
    if (!endsAt || view === 'result') return
    const tick = () => {
      if (Date.now() >= endsAt) useExamStore.getState().submit()
    }
    tick()
    const id = window.setInterval(tick, 500)
    return () => window.clearInterval(id)
  }, [endsAt, view])

  return null
}

export default function App() {
  const session = useExamStore((s) => s.session)
  const [lobby, setLobby] = useState(true)

  if (lobby || !session) {
    return <Home onEnter={() => setLobby(false)} />
  }

  return (
    <>
      <TimeGuard />
      {session.view === 'exam' && <Exam />}
      {session.view === 'review' && <Review />}
      {session.view === 'result' && <Result onHome={() => setLobby(true)} />}
    </>
  )
}
