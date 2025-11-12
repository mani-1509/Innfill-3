import { Navbar } from '@/components/navigation/navbar'
import Footer from '@/components/navigation/footer'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <main className="bg-black min-h-screen">
        <Navbar />
        {children}
        <Footer />
      </main>
    </>
  )
}
