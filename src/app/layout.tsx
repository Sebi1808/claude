import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'StoryCheck Democracy - Demokratisches Storytelling',
  description: 'Analysieren Sie Social Media Posts auf demokratisches und inklusives Storytelling. Basierend auf 14 wissenschaftlich fundierten Kriterien von Sebastian Zollner.',
  keywords: ['Storytelling', 'Demokratie', 'Social Media', 'Analyse', 'Inklusion', 'Diversität', 'NGO'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className="antialiased">{children}</body>
    </html>
  )
}
