import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Video Background */}
      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-40"
        >
          <source src="https://framerusercontent.com/assets/1g8IkhtJmlWcC4zEYWKUmeGWzI.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 mx-2.5 mt-2.5 bg-black/50 backdrop-blur-md border border-white/20 rounded-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="text-xl sm:text-2xl font-bold">
                <span className="text-white">INN</span>
                <span className="text-blue-500">FILL</span>
              </div>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center gap-8">
                <Link href="#capabilities" className="text-gray-300 hover:text-white transition font-medium">
                  How It Works
                </Link>
                <Link href="#cta" className="text-gray-300 hover:text-white transition font-medium">
                  Contact
                </Link>
              </div>

              {/* Desktop Actions */}
              <div className="hidden md:flex items-center gap-4">
                <Link href="/login">
                  <Button 
                    variant="ghost" 
                    className="bg-gradient-to-b from-gray-900 to-white/10 text-white hover:bg-white/20 border border-white/30 shadow-inner"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-gradient-to-b from-white to-white/90 text-black hover:from-gray-100 hover:to-white shadow-inner">
                    Start Now
                  </Button>
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button className="md:hidden text-white p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 bg-blue-500/20 text-blue-300 border-blue-500/30">
              ⭐ NEW GEN AI FREELANCING PLATFORM
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Freelancing<br />Automated
            </h1>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Fast, reliable freelancing that finds opportunities and connects you at scale.
            </p>

            {/* Waitlist Card */}
            <div className="max-w-xl mx-auto">
              <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-xl hover:border-blue-500/30 transition-all">
                <CardContent className="p-8">
                  <Link href="/register">
                    <Button className="w-full mb-6 bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-semibold">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      JOIN THE WAITING LIST
                    </Button>
                  </Link>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-blue-400 mb-2">112</div>
                    <div className="text-sm text-gray-400 uppercase tracking-wider">USERS SIGNED UP</div>
                  </div>
                  <p className="text-gray-400 text-sm mt-6 text-center">
                    Be part of the growing community of freelancers and clients
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Capabilities Section */}
        <section id="capabilities" className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Capabilities</h2>
            <p className="text-gray-400">Powered by advanced AI</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Smart Opportunity Discovery */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-xl hover:bg-gray-900/70 transition">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <CardTitle className="text-white">Smart Opportunity Discovery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm text-center">
                  AI finds perfect projects based on your skills and goals
                </p>
              </CardContent>
            </Card>

            {/* Personalized Matching */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-xl hover:bg-gray-900/70 transition">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <CardTitle className="text-white">Personalized Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm text-center">
                  Craft compelling proposals that convert using AI insights
                </p>
              </CardContent>
            </Card>

            {/* Auto-Negotiation */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-xl hover:bg-gray-900/70 transition">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <CardTitle className="text-white">Auto-Negotiation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm text-center">
                  Handle responses and negotiate deals automatically
                </p>
              </CardContent>
            </Card>

            {/* Performance Analytics */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-xl hover:bg-gray-900/70 transition">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <CardTitle className="text-white">Performance Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm text-center">
                  Track success rates and optimize your freelancing
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section id="cta" className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Automate?</h2>
            <p className="text-gray-400 mb-8">
              Join thousands of freelancers already waiting for early access
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-white text-black hover:bg-gray-200 px-8 py-6 text-lg">
                Start Now
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-800 py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <div className="text-xl font-bold mb-2">INNFILL</div>
                <p className="text-sm text-gray-400">Revolutionizing freelancing with AI</p>
              </div>
              <div className="flex gap-8 text-sm">
                <Link href="/how-it-works" className="text-gray-400 hover:text-white transition">
                  How It Works
                </Link>
                <Link href="/contact" className="text-gray-400 hover:text-white transition">
                  Contact
                </Link>
                <Link href="/terms" className="text-gray-400 hover:text-white transition">
                  Terms of Service
                </Link>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition">
                  Privacy Policy
                </Link>
              </div>
            </div>
            <div className="text-center text-gray-500 text-sm mt-8">
              INNFILL © 2025
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
