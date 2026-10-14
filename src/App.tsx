import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AdminPage from './pages/AdminPage'
import ScrollToHash from './components/ScrollToHash'
import SiteFooter from './components/SiteFooter'
import SiteHeader from './components/SiteHeader'
import SeoMetadata from './components/SeoMetadata'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import { usePortfolio } from './data/usePortfolio'
import { useI18n } from './i18n/useI18n'

function PortfolioApplication() {
  const { loading, error, retryLoad } = usePortfolio()
  const { t } = useI18n()

  if (loading) {
    return <main className="container-shell py-24" role="status">{t.admin.loading}</main>
  }

  if (error) {
    return (
      <main className="container-shell py-24" role="alert">
        <p>{t.admin.loadError}</p>
        <button className="button button-primary mt-5" type="button" onClick={retryLoad}>{t.admin.retry}</button>
      </main>
    )
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      <ScrollToHash />
      <SeoMetadata />
      <SiteHeader />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects/:slug" element={<ProjectDetailPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <SiteFooter />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <PortfolioApplication />
    </BrowserRouter>
  )
}

export default App
