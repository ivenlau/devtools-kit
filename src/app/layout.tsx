import type { Metadata } from 'next'
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { I18nProvider } from '@/components/I18nProvider'
import { Header } from '@/components/Header'
import { ToolWorkspace } from '@/components/workspace/ToolWorkspace'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'DevToolsKit - 开发工具箱',
  description: '20+实用工具，无需安装，打开浏览器即用。JSON格式化、Base64编解码、正则表达式测试、时间戳转换等',
  // Favicon: src/app/icon.svg + src/app/favicon.ico (App Router conventions,
  // auto-injected — no explicit icons config needed here)
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetBrainsMono.variable} ${spaceGrotesk.variable} font-sans app-shell`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('theme')==='light')document.documentElement.classList.add('light');if(localStorage.getItem('lang')==='en')document.documentElement.lang='en'}catch(e){}",
          }}
        />
          <I18nProvider>
            <ThemeProvider>
              <Header />
              {children}
              {/* keeps opened tools alive across route changes; tool routes
                  themselves render only a bootstrap shell */}
              <ToolWorkspace />
            </ThemeProvider>
          </I18nProvider>
      </body>
    </html>
  )
}
