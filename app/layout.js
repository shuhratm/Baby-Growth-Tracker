import './globals.css'

export const metadata = {
  title: 'Baby Growth Monitor',
  description: 'Track your baby\'s growth with predictions',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
