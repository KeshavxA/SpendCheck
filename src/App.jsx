import { FinanceProvider } from './context/FinanceContext'
import Dashboard from './components/Dashboard'
import { ThemeProvider } from './context/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <FinanceProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
          <Dashboard />
        </div>
      </FinanceProvider>
    </ThemeProvider>
  )
}

export default App