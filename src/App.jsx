import { FinanceProvider } from './context/FinanceContext'
import Dashboard from './components/Dashboard'

function App() {
  return (
    <FinanceProvider>
      <div className="min-h-screen bg-gray-50">
        <Dashboard />
      </div>
    </FinanceProvider>
  )
}

export default App