import { DemoSection } from '@/components/console/demo-section'
import { Hero } from '@/components/site/hero'
import { ScrollThemeProvider } from '@/components/site/scroll-theme'
import { SiteFooter } from '@/components/site/site-footer'
import { TopBar } from '@/components/site/top-bar'

export default function Page() {
  return (
    <ScrollThemeProvider>
      <TopBar />
      <main>
        <Hero />
        <DemoSection />
      </main>
      <SiteFooter />
    </ScrollThemeProvider>
  )
}
