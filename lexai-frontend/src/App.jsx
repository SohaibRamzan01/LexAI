import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing    from './pages/Landing'
import Auth       from './pages/Auth'
import Dashboard  from './pages/Dashboard'
import Chat       from './pages/Chat'
import Research   from './pages/Research'
import CourtGuide from './pages/CourtGuide'
import FeesMonitor from './pages/FeesMonitor'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                    element={<Landing />}     />
        <Route path="/auth"                element={<Auth />}        />
        <Route path="/dashboard"           element={<Dashboard />}   />
        <Route path="/case/:id/chat"       element={<Chat />}        />
        <Route path="/case/:id/research"   element={<Research />}    />
        <Route path="/case/:id/guide"      element={<CourtGuide />}  />
        <Route path="/case/:id/fees"       element={<FeesMonitor />} />
      </Routes>
    </BrowserRouter>
  )
}