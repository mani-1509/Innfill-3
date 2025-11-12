'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "UI/UX Designer",
      content: "Innfill helped me land 3 projects in my first month. The matching algorithm is spot-on!",
      avatar: "SC"
    },
    {
      name: "Marcus Rodriguez",
      role: "Full-Stack Developer",
      content: "Finally, a platform that understands freelancers. No more endless bidding wars.",
      avatar: "MR"
    },
    {
      name: "Priya Patel",
      role: "Content Writer",
      content: "The escrow system gives me peace of mind. I get paid on time, every time.",
      avatar: "PP"
    },
    {
      name: "David Kim",
      role: "Marketing Consultant",
      content: "Best freelancing experience I've had. Clean interface, great clients, fair rates.",
      avatar: "DK"
    },
    {
      name: "Alex Thompson",
      role: "Graphic Designer",
      content: "The client matching is incredible. I only work with serious clients now.",
      avatar: "AT"
    },
    {
      name: "Lisa Wang",
      role: "Video Editor",
      content: "Payment protection and fast payouts make this platform trustworthy.",
      avatar: "LW"
    },
    {
      name: "James Mitchell",
      role: "Web Developer",
      content: "Finally found a platform that values quality over quantity. Great clients!",
      avatar: "JM"
    },
    {
      name: "Maria Garcia",
      role: "Social Media Manager",
      content: "The dashboard is intuitive and the project flow is seamless.",
      avatar: "MG"
    },
    {
      name: "Robert Lee",
      role: "SEO Specialist",
      content: "Consistent work and fair rates. This is how freelancing should be.",
      avatar: "RL"
    },
    {
      name: "Emma Johnson",
      role: "Copywriter",
      content: "The proposal templates save me hours. Highly recommend!",
      avatar: "EJ"
    }
  ]

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    },
    hover: {
      y: -8,
      transition: {
        duration: 0.3
      }
    }
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Video Background */}
      <div className="fixed top-0 left-0 w-full h-full z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover object-center block opacity-40"
          style={{ filter: 'brightness(1) contrast(1) grayscale(1)' }}
        >
          <source src="https://framerusercontent.com/assets/1g8IkhtJmlWcC4zEYWKUmeGWzI.mp4" type="video/mp4" />
        </video>
        {/* Radial gradient overlay */}
        <div 
          className="absolute top-0 left-0 w-full h-full z-1"
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0) 0%, rgba(8, 9, 10, 0.855) 100%)'
          }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-10">{/* Navigation */}
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 mx-2.5 mt-2.5 bg-black/50 backdrop-blur-md border border-white/20 rounded-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href="/">
              <div className="text-xl sm:text-2xl font-bold">
                <span className="text-white">INN</span>
                <span className="text-blue-500">FILL</span>
              </div>
              </Link>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center gap-8">
                <Link href="/how-it-works" className="text-gray-300 hover:text-white transition font-medium">
                  How It Works
                </Link>
                <Link href="mailto:support@innfill.in" className="text-gray-300 hover:text-white transition font-medium">
                  Contact
                </Link>
              </div>

              {/* Desktop Actions */}
              <div className="hidden md:flex items-center gap-4">
                <Link href="/login">
                  <button className="px-6 py-2 bg-white/5 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-all">
                    Sign In
                  </button>
                </Link>
                <Link href="/register">
                  <button className="px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-all font-semibold">
                    Start Now
                  </button>
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-all"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu Dropdown - Full Screen Overlay */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Menu Panel */}
            <div className="fixed top-20 left-0 right-0 mx-4 z-50 md:hidden">
              <div className="bg-black/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-6 space-y-4">
                  {/* Navigation Links */}
                  <Link 
                    href="/how-it-works" 
                    className="block text-lg text-gray-300 hover:text-white hover:bg-white/5 px-4 py-3 rounded-lg transition-all"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    How It Works
                  </Link>
                  <Link 
                    href="#capabilities" 
                    className="block text-lg text-gray-300 hover:text-white hover:bg-white/5 px-4 py-3 rounded-lg transition-all"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Features
                  </Link>
                  <Link 
                    href="#cta" 
                    className="block text-lg text-gray-300 hover:text-white hover:bg-white/5 px-4 py-3 rounded-lg transition-all"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Contact
                  </Link>
                  
                  {/* Divider */}
                  <div className="border-t border-white/10 my-4" />
                  
                  {/* Auth Buttons */}
                  <div className="space-y-3 pt-2">
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <button className="w-full px-6 py-3 bg-white/5 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-all font-medium">
                        Sign In
                      </button>
                    </Link>
                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                      <button className="bg-white text-black rounded-lg hover:bg-gray-200 transition-all font-semibold w-full px-6 py-3 mt-3 shadow-lg shadow-blue-500/20">
                        Start Now →
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 md:py-32">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div 
              className="inline-block mb-6 px-4 py-2 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-sm font-semibold"
              variants={itemVariants}
            >
              ⭐ NEW GEN FREELANCING PLATFORM
            </motion.div>
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
              variants={itemVariants}
            >
              How Freelancers grow faster with Innfill
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto"
              variants={itemVariants}
            >
              The platform that connects you with the right clients, simplifies work, and helps you get paid on time.
            </motion.p>

            {/* Waitlist Card */}
            <motion.div 
              className="max-w-xl mx-auto"
              variants={itemVariants}
            >
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-blue-500/30 transition-all">
                <Link href="/register">
                  <button className="w-full mb-6 bg-white hover:bg-black hover:text-white text-black py-4 px-6 rounded-lg text-base font-semibold transition-all flex items-center justify-center gap-2 border border-transparent hover:border-white/20">
                    <svg
                      className="w-5 h-5"
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
                    START NOW — NO CARD NEEDED
                  </button>
                </Link>

                <div className="text-center">
                  <div className="text-5xl font-bold text-blue-400 mb-2">112</div>
                  <div className="text-sm text-gray-400 uppercase tracking-wider">
                    FREELANCERS ALREADY SIGNED UP
                  </div>
                </div>

                <p className="text-gray-400 text-sm mt-6 text-center">
                  Get matched with real projects and clients.
                </p>
              </div>
            </motion.div>

          </motion.div>
        </section>

        <section id="how-it-works" className="container mx-auto px-6 md:px-12 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We made freelancing simple. Just follow these 4 steps and start earning.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left — Illustration / Image */}
            <div className="flex justify-center">
              <img
                src="https://res.cloudinary.com/dg0u5ptwr/image/upload/v1762971933/screencapture-innfill-in-profile-user1-2025-11-12-23_38_21_z3texh.png"
                alt="How Innfill works illustration"
                className="rounded-2xl border border-white/10 shadow-lg max-w-full md:max-w-md"
              />
            </div>

            {/* Right — Steps */}
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="bg-blue-500/20 text-blue-400 font-bold w-10 h-10 rounded-full flex items-center justify-center">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Create Your Profile</h3>
                  <p className="text-gray-400 text-sm">
                    Sign up, showcase your skills, and set up your portfolio. It takes less than 5 minutes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-500/20 text-blue-400 font-bold w-10 h-10 rounded-full flex items-center justify-center">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Get Matched with Projects</h3>
                  <p className="text-gray-400 text-sm">
                    We instantly connect you with clients looking for your exact skills.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-500/20 text-blue-400 font-bold w-10 h-10 rounded-full flex items-center justify-center">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Deliver & Collaborate</h3>
                  <p className="text-gray-400 text-sm">
                    Use built-in tools to chat, share files, and manage timelines easily.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-500/20 text-blue-400 font-bold w-10 h-10 rounded-full flex items-center justify-center">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Get Paid Securely</h3>
                  <p className="text-gray-400 text-sm">
                    Once your client approves the project, funds are released instantly to your account.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Capabilities Section */}
        <section id="capabilities" className="container mx-auto px-4 py-5">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-4">What Makes Innfill Different</h2>
            <p className="text-gray-400">Built to simplify freelancing — not overcomplicate it.</p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >

            {/* Smart Project Discovery */}
            <motion.div 
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-all"
              variants={cardVariants}
              whileHover="hover"
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
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
                <h3 className="text-white font-semibold text-lg mb-3">Smart Project Discovery</h3>
                <p className="text-gray-400 text-sm">
                  Find freelance gigs that match your skills and goals — no endless scrolling.
                </p>
              </div>
            </motion.div>

            {/* Effortless Matching */}
            <motion.div 
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-all"
              variants={cardVariants}
              whileHover="hover"
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
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
                <h3 className="text-white font-semibold text-lg mb-3">Effortless Matching</h3>
                <p className="text-gray-400 text-sm">
                  Get paired with the right clients and services that fit your vibe perfectly.
                </p>
              </div>
            </motion.div>

            {/* Seamless Collaboration */}
            <motion.div 
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-all"
              variants={cardVariants}
              whileHover="hover"
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
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
                <h3 className="text-white font-semibold text-lg mb-3">Seamless Collaboration</h3>
                <p className="text-gray-400 text-sm">
                  Chat, share files, and manage work smoothly — all in one place.
                </p>
              </div>
            </motion.div>

            {/* Performance Insights */}
            <motion.div 
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-all"
              variants={cardVariants}
              whileHover="hover"
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
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
                <h3 className="text-white font-semibold text-lg mb-3">Performance Insights</h3>
                <p className="text-gray-400 text-sm">
                  Track orders, earnings, and client feedback to grow smarter.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Testimonials Section */}
        {/* <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">What Our Freelancers Say</h2>
            <p className="text-gray-400">Real experiences from real professionals</p>
          </div>

          <div className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
            
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>
            
            <div className="flex animate-scroll">
              {testimonials.map((testimonial, index) => (
                <div key={`first-${index}`} className="flex-shrink-0 w-80 mx-4 p-4">
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 h-full">
                    <blockquote className="text-white font-medium mb-4 leading-relaxed">
                      "{testimonial.content}"
                    </blockquote>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm">{testimonial.name}</div>
                        <div className="text-gray-400 text-xs">{testimonial.role}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {testimonials.map((testimonial, index) => (
                <div key={`second-${index}`} className="flex-shrink-0 w-80 mx-4 p-4">
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 h-full">
                    <blockquote className="text-white font-medium mb-4 leading-relaxed">
                      "{testimonial.content}"
                    </blockquote>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm">{testimonial.name}</div>
                        <div className="text-gray-400 text-xs">{testimonial.role}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section> */}

        {/* FAQ Section */}
        <section className="mb-20 container mx-auto px-20 py-10">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4 text-white">Frequently Asked Questions</h2>
            <p className="text-gray-200">Quick answers to common questions</p>
          </motion.div>

          <motion.div 
            className="space-y-4 text-center max-w-4xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.details 
              className="bg-white/5 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border border-white/10"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <summary className="font-semibold text-white cursor-pointer text-lg">
                How long does it take to get paid?
              </summary>
              <motion.div 
                className="text-gray-200 mt-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                Freelancers receive payment 1-3 business days after order completion. Once the client approves your delivery, funds are automatically transferred to your registered bank account.
              </motion.div>
            </motion.details>

            <motion.details 
              className="bg-white/5 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border border-white/10"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <summary className="font-semibold text-white cursor-pointer text-lg">
                What if I&apos;m not satisfied with the delivery?
              </summary>
              <motion.div 
                className="text-gray-200 mt-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                You can request revisions if included in the service. If the work doesn&apos;t meet requirements, you can raise a dispute. Our support team will review and mediate fairly.
              </motion.div>
            </motion.details>

            <motion.details 
              className="bg-white/5 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border border-white/10"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <summary className="font-semibold text-white cursor-pointer text-lg">
                How does the escrow system work?
              </summary>
              <motion.div 
                className="text-gray-200 mt-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                When you pay, funds are held securely (not released to freelancer). Money is only released after you approve the delivery. This protects both parties.
              </motion.div>
            </motion.details>

            <motion.details 
              className="bg-white/5 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border border-white/10"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <summary className="font-semibold text-white cursor-pointer text-lg">
                What happens if a freelancer doesn&apos;t deliver?
              </summary>
              <motion.div 
                className="text-gray-200 mt-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                If a freelancer fails to deliver within the agreed timeline, you can raise a dispute. Our team will investigate and issue a full refund if appropriate.
              </motion.div>
            </motion.details>
          </motion.div>
        </section>

        {/* CTA Section */}
        <section id="cta" className="container mx-auto px-4 py-20">
          <motion.div 
            className="max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2 
              className="text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Ready to Join?
            </motion.h2>
            <motion.p 
              className="text-gray-400 mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Set up a service and get discovered by clients today
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Link href="/register">
                <motion.button 
                  className="bg-white text-black hover:bg-gray-200 px-8 py-4 rounded-lg text-lg font-semibold transition-all hover:shadow-lg hover:shadow-white/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  Start Now
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-800 py-8 md:py-12">
          <div className="container mx-auto px-4">
            {/* Main Footer Content */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-4 mb-8">
              {/* Logo and Tagline */}
              <div className="text-center md:text-left">
                <Link href="/">
                  <div className="text-xl md:text-2xl font-bold mb-2">
                    <span className="text-white">INN</span>
                    <span className="text-blue-500">FILL</span>
                  </div>
                </Link>
                <p className="text-sm text-gray-400">Revolutionizing freelancing with AI</p>
              </div>

              {/* Navigation Links */}
              <div className="flex flex-wrap gap-4 md:gap-6 text-sm justify-center md:justify-end w-full md:w-auto">
                <Link href="/how-it-works" className="text-gray-400 hover:text-white transition whitespace-nowrap">
                  How It Works
                </Link>
                <Link href="mailto:support@innfill.in" className="text-gray-400 hover:text-white transition whitespace-nowrap">
                  Contact
                </Link>
                <Link href="/terms-of-service" className="text-gray-400 hover:text-white transition whitespace-nowrap">
                  Terms of Service
                </Link>
                <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition whitespace-nowrap">
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
                    Email: <a href="mailto:support@innfill.in" className="text-blue-400 hover:text-blue-300 transition-colors">support@innfill.in</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
