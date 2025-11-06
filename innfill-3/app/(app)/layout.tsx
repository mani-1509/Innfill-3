import { Navbar } from '@/components/navigation/navbar'

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
      </main>
    </>
  )
}
