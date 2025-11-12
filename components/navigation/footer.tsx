import Link from 'next/link'

export default function Footer() {
  return (
        <footer className="bg-black/5 border-t border-gray-800 py-8 md:py-12 relative z-10">
          <div className="container mx-auto px-4">
            {/* Main Footer Content */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-4 mb-8">
              {/* Logo and Tagline */}
              <div className="text-center md:text-left">
                <Link href="/" className="cursor-pointer">
                  <div className="text-xl md:text-2xl font-bold mb-2">
                    <span className="text-white">INN</span>
                    <span className="text-blue-500">FILL</span>
                  </div>
                </Link>
                <p className="text-sm text-gray-400">Revolutionizing freelancing with AI</p>
              </div>

              {/* Navigation Links */}
              <div className="flex flex-wrap gap-4 md:gap-6 text-sm justify-center md:justify-end w-full md:w-auto">
                <Link href="/how-it-works" className="text-gray-400 hover:text-white transition whitespace-nowrap cursor-pointer">
                  How It Works
                </Link>
                <Link href="mailto:support@innfill.in" className="text-gray-400 hover:text-white transition whitespace-nowrap cursor-pointer">
                  Contact
                </Link>
                <Link href="/terms-of-service" className="text-gray-400 hover:text-white transition whitespace-nowrap cursor-pointer">
                  Terms of Service
                </Link>
                <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition whitespace-nowrap cursor-pointer">
                  Privacy Policy
                </Link>
              </div>
            </div>

            {/* Contact Information */}
            <div className="border-t border-gray-800 pt-6 md:pt-8">
              <div className="text-center space-y-3">
                <div className="text-gray-500 text-xs md:text-sm">
                  <p className="font-semibold text-gray-400 mb-2">Innfill © 2025. All rights reserved.</p>
                </div>

                {/* Address */}
                <div className="text-gray-500 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed">
                  <p>9-80/3/A Street No-4 Boddupal Udaya nagar colony,</p>
                  <p>Hyderabad, Telangana 500092, India</p>
                </div>

                {/* Email */}
                <div className="text-gray-500 text-xs md:text-sm">
                  <p>
                    Email: <a href="mailto:support@innfill.in" className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer">support@innfill.in</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </footer>   
  )
}