import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Users, Briefcase, CreditCard, MessageSquare, Star, Shield, Zap, TrendingUp } from 'lucide-react'

export const metadata: Metadata = {
  title: 'How It Works | Innfill',
  description: 'Learn how Innfill connects freelancers and clients. Complete guide to all features and workflows.',
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 text-white">How Innfill Works</h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Your complete guide to understanding Innfill&apos;s features, workflows, and how we connect talented freelancers with amazing clients.
          </p>
        </div>

        {/* User Types */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">Who Uses Innfill?</h2>
            <p className="text-gray-200">Two types of users power our platform</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Freelancers */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl shadow-lg p-8 border-2 border-white/10 hover:border-blue-300/50 transition-all">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <Briefcase className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Freelancers</h3>
              <p className="text-gray-200 mb-6">
                Skilled professionals offering services across various domains. Build your profile, showcase your portfolio, and earn money doing what you love.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-200">Create services and set your own rates</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-200">Receive payments securely via bank transfer</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-200">Build your reputation through reviews</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-200">Manage multiple projects seamlessly</span>
                </li>
              </ul>
            </div>

            {/* Clients */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl shadow-lg p-8 border-2 border-white/10 hover:border-purple-300/50 transition-all">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Clients</h3>
              <p className="text-gray-200 mb-6">
                Businesses and individuals looking to hire talented freelancers. Find the perfect match for your project and get professional results.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-200">Browse and discover talented freelancers</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-200">Secure payment through escrow system</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-200">Clear refund policy with 4% processing fee</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-200">Review and rate your experience</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Complete Workflow */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">Complete Order Workflow</h2>
            <p className="text-gray-200">From discovery to completion - here&apos;s how it all works</p>
          </div>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl shadow-lg p-8 border-l-4 border-blue-500">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 text-white">Registration & Profile Setup</h3>
                  <div className="space-y-4 text-gray-200">
                    <p><strong className="text-white">Freelancer:</strong> Create account → Choose &quot;Offer Services&quot; → Complete profile with skills, bio, and portfolio → Add bank details (Account number, IFSC, PAN) → Set hourly rate → Create your first service with pricing</p>
                    <p><strong className="text-white">Client:</strong> Create account → Choose &quot;Hire Talent&quot; → Complete profile with company info (optional) → Add payment method → Ready to browse services</p>
                    <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg mt-4">
                      <p className="text-sm"><strong>📌 Key Point:</strong> Both users must accept Terms of Service and Privacy Policy during registration. Email verification required.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl shadow-lg p-8 border-l-4 border-purple-500">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 text-white">Service Discovery & Browsing</h3>
                  <div className="space-y-4 text-gray-200">
                    <p><strong className="text-white">Client Actions:</strong></p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Browse services on homepage or dashboard</li>
                      <li>Filter by category, price range, or skills</li>
                      <li>View freelancer profiles with portfolio</li>
                      <li>Check reviews and ratings from previous clients</li>
                      <li>See service details (delivery time, revisions, price)</li>
                    </ul>
                    <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-lg mt-4">
                      <p className="text-sm"><strong>💡 Tip:</strong> Look for freelancers with high ratings and detailed portfolios. Read reviews to understand their work quality.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl shadow-lg p-8 border-l-4 border-green-500">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 text-white">Order Placement & Payment</h3>
                  <div className="space-y-4 text-gray-200">
                    <p><strong className="text-white">Process:</strong></p>
                    <ol className="list-decimal list-inside space-y-2 ml-4">
                      <li>Client clicks &quot;Order Now&quot; on service page</li>
                      <li>Provide detailed requirements and attachments</li>
                      <li>Review order summary with pricing breakdown:
                        <ul className="list-disc list-inside ml-6 mt-2">
                          <li>Service Price: ₹10,000</li>
                          <li>Platform Fee (14%): ₹1,400</li>
                          <li>GST on Fee (18%): ₹252</li>
                          <li><strong>Total to Pay: ₹10,252</strong></li>
                        </ul>
                      </li>
                      <li>Complete payment via Razorpay (Cards, UPI, Net Banking, Wallets)</li>
                      <li>Funds held in escrow (not released to freelancer yet)</li>
                      <li>Order created with &quot;pending&quot; status</li>
                    </ol>
                    <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg mt-4">
                      <p className="text-sm"><strong>🔒 Security:</strong> Your payment is held securely until work is completed. Freelancer receives payment only after you approve the delivery.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl shadow-lg p-8 border-l-4 border-yellow-500">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 text-white">Order Acceptance & Communication</h3>
                  <div className="space-y-4 text-gray-200">
                    <p><strong className="text-white">Freelancer Actions:</strong></p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Receive notification of new order</li>
                      <li>Review requirements carefully</li>
                      <li>Accept order if requirements are clear</li>
                      <li>If unclear, use chat to clarify with client</li>
                      <li>Order status changes to &quot;in_progress&quot;</li>
                      <li>Start working on deliverables</li>
                    </ul>
                    <p className="mt-4"><strong className="text-white">Communication:</strong></p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Real-time chat available between freelancer and client</li>
                      <li>Share files, images, and updates</li>
                      <li>Discuss project details and modifications</li>
                      <li>Both parties can track conversation history</li>
                    </ul>
                    <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg mt-4">
                      <p className="text-sm"><strong>⚠️ Important:</strong> Freelancers should accept orders only if they can deliver as per requirements. Declining too many orders may affect your account standing.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl shadow-lg p-8 border-l-4 border-red-500">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                  5
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 text-white">Work Delivery & Review</h3>
                  <div className="space-y-4 text-gray-200">
                    <p><strong className="text-white">Freelancer Delivers:</strong></p>
                    <ol className="list-decimal list-inside space-y-2 ml-4">
                      <li>Complete work according to requirements</li>
                      <li>Upload deliverables (files, links, documents)</li>
                      <li>Add delivery message explaining the work</li>
                      <li>Submit delivery - client gets notified</li>
                      <li>Order status changes to &quot;delivered&quot;</li>
                    </ol>
                    <p className="mt-4"><strong className="text-white">Client Reviews:</strong></p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Download and review all deliverables</li>
                      <li>Check if work meets requirements</li>
                      <li>3 options available:
                        <ul className="list-disc list-inside ml-6 mt-2">
                          <li><strong>Accept:</strong> Mark order as complete</li>
                          <li><strong>Request Revision:</strong> Ask for changes (if revisions included)</li>
                          <li><strong>Dispute:</strong> Raise issue if work is unsatisfactory</li>
                        </ul>
                      </li>
                    </ul>
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg mt-4">
                      <p className="text-sm"><strong>⏰ Auto-Accept:</strong> If client doesn&apos;t respond within 7 days, order is automatically marked as complete to protect freelancer.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 6 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl shadow-lg p-8 border-l-4 border-indigo-500">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                  6
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 text-white">Order Completion & Payment Release</h3>
                  <div className="space-y-4 text-gray-200">
                    <p><strong className="text-white">When Client Accepts:</strong></p>
                    <ol className="list-decimal list-inside space-y-2 ml-4">
                      <li>Order status changes to &quot;completed&quot;</li>
                      <li>Payment released from escrow</li>
                      <li>Platform deducts 14% commission (₹1,400 from ₹10,000)</li>
                      <li>Freelancer receives ₹8,600 in account</li>
                      <li>Payment transferred within 1-3 business days</li>
                      <li>Both parties can leave reviews and ratings</li>
                    </ol>
                    <p className="mt-4"><strong className="text-white">Payment Breakdown:</strong></p>
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <pre className="text-sm">
{`Service Price:           ₹10,000.00
Platform Commission:     -₹1,400.00 (14%)
Freelancer Receives:     ₹8,600.00

Client Total Paid:       ₹10,252.00
(Includes ₹252 GST on platform fee)`}
                      </pre>
                    </div>
                    <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-lg mt-4">
                      <p className="text-sm"><strong>💰 Earnings:</strong> Freelancers receive 86% of service price. GST is on platform commission only, not on your earnings.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 7 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl shadow-lg p-8 border-l-4 border-pink-500">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                  7
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 text-white">Reviews & Ratings</h3>
                  <div className="space-y-4 text-gray-200">
                    <p><strong className="text-white">Why Reviews Matter:</strong></p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Build trust and credibility</li>
                      <li>Help future clients make decisions</li>
                      <li>Improve freelancer visibility</li>
                      <li>Provide feedback for improvement</li>
                    </ul>
                    <p className="mt-4"><strong className="text-white">Review Process:</strong></p>
                    <ol className="list-decimal list-inside space-y-2 ml-4">
                      <li>Both parties can review after completion</li>
                      <li>Rate 1-5 stars on multiple criteria</li>
                      <li>Write detailed feedback</li>
                      <li>Reviews are public and permanent</li>
                      <li>Affects profile rating and ranking</li>
                    </ol>
                    <div className="bg-pink-500/10 border border-pink-500/20 p-4 rounded-lg mt-4">
                      <p className="text-sm"><strong>⭐ Best Practice:</strong> Be honest and constructive. Good reviews help the community. Bad experiences should be reported to support.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cancellation & Refund Flow */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">Cancellation & Refund Process</h2>
            <p className="text-gray-200">What happens when an order needs to be cancelled</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl shadow-lg p-8 border-2 border-orange-500/20">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-3 text-white">📋 Cancellation Scenarios</h3>
                <div className="space-y-4">
                  <div className="bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10">
                    <p className="font-semibold text-white mb-2">Before Work Starts:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-200 ml-4">
                      <li>Client can cancel freely</li>
                      <li>Full refund minus 4% processing fee</li>
                      <li>GST (₹252) non-refundable</li>
                      <li>Processed within 24 hours</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10">
                    <p className="font-semibold text-white mb-2">After Work Starts:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-200 ml-4">
                      <li>Both parties must agree to cancel</li>
                      <li>Freelancer may be compensated for work done</li>
                      <li>Partial refund possible</li>
                      <li>Requires mutual negotiation</li>
                    </ul>
                  </div>

                  <div className="bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10">
                    <p className="font-semibold text-white mb-2">Freelancer Cancels:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-200 ml-4">
                      <li>Should provide valid reason</li>
                      <li>Client receives full refund (minus 4% + GST)</li>
                      <li>May affect freelancer&apos;s standing</li>
                      <li>Repeated cancellations lead to penalties</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3 text-white">💰 Refund Calculation</h3>
                <div className="bg-white/5 backdrop-blur-sm p-6 rounded-lg border border-white/10">
                  <p className="font-semibold text-white mb-3">Formula: Refund = Service Price - 4% Processing Fee</p>
                  <div className="bg-gray-800 p-4 rounded">
                    <pre className="text-sm text-gray-200">
{`Client Paid:              ₹10,252.00
Service Price:            ₹10,000.00
Processing Fee (4%):      -₹400.00
GST (non-refundable):     -₹252.00
─────────────────────────────────
Refund to Client:         ₹9,600.00
Client Loss:              ₹652.00`}
                    </pre>
                  </div>
                  <p className="text-sm text-gray-200 mt-4">
                    <strong className="text-white">Why 4% processing fee?</strong> Payment gateway charges are non-refundable. This covers transaction costs, GST, and administrative processing.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3 text-white">⏱️ Refund Timeline</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-200 ml-4">
                  <li>Cancellation request submitted</li>
                  <li>Reviewed within 24 hours</li>
                  <li>Refund approved and initiated</li>
                  <li>Razorpay processes refund (5-7 business days)</li>
                  <li>Money credited to original payment method</li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">Platform Features Explained</h2>
            <p className="text-gray-200">All the tools and features at your disposal</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Chat System */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border border-white/10">
              <MessageSquare className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-white">Real-Time Chat</h3>
              <ul className="space-y-2 text-gray-200 text-sm">
                <li>• Instant messaging between users</li>
                <li>• File sharing and attachments</li>
                <li>• Order-specific chat rooms</li>
                <li>• Conversation history saved</li>
                <li>• Read receipts and typing indicators</li>
              </ul>
            </div>

            {/* Secure Payments */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border border-white/10">
              <Shield className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-white">Secure Payments</h3>
              <ul className="space-y-2 text-gray-200 text-sm">
                <li>• Razorpay payment gateway</li>
                <li>• Escrow system protects both parties</li>
                <li>• Multiple payment methods</li>
                <li>• Automatic GST calculation</li>
                <li>• Transaction receipts & invoices</li>
              </ul>
            </div>

            {/* Portfolio */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border border-white/10">
              <Briefcase className="w-12 h-12 text-purple-500 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-white">Portfolio Showcase</h3>
              <ul className="space-y-2 text-gray-200 text-sm">
                <li>• Upload work samples</li>
                <li>• Add project descriptions</li>
                <li>• Showcase skills and expertise</li>
                <li>• Public profile page</li>
                <li>• Share profile link anywhere</li>
              </ul>
            </div>

            {/* Reviews */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border border-white/10">
              <Star className="w-12 h-12 text-yellow-500 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-white">Reviews & Ratings</h3>
              <ul className="space-y-2 text-gray-200 text-sm">
                <li>• 5-star rating system</li>
                <li>• Written feedback</li>
                <li>• Public review display</li>
                <li>• Average rating calculation</li>
                <li>• Builds trust and credibility</li>
              </ul>
            </div>

            {/* Order Management */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border border-white/10">
              <Zap className="w-12 h-12 text-orange-500 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-white">Order Management</h3>
              <ul className="space-y-2 text-gray-200 text-sm">
                <li>• Track all orders in one place</li>
                <li>• Status updates and notifications</li>
                <li>• Delivery tracking</li>
                <li>• Revision management</li>
                <li>• Download order history</li>
              </ul>
            </div>

            {/* Analytics */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border border-white/10">
              <TrendingUp className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-white">Dashboard Analytics</h3>
              <ul className="space-y-2 text-gray-200 text-sm">
                <li>• Earnings overview (freelancers)</li>
                <li>• Spending summary (clients)</li>
                <li>• Order statistics</li>
                <li>• Profile views tracking</li>
                <li>• Performance metrics</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Payment & Fee Structure */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">Payment & Fee Structure</h2>
            <p className="text-gray-200">Transparent pricing with no hidden costs</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* For Freelancers */}
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-2xl shadow-lg p-8 border-2 border-blue-500/20">
              <h3 className="text-2xl font-bold mb-6 text-white">For Freelancers 💼</h3>
              <div className="space-y-4">
                <div className="bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10">
                  <p className="font-semibold text-white mb-2">Commission Rate</p>
                  <p className="text-3xl font-bold text-blue-400">14%</p>
                  <p className="text-sm text-gray-200 mt-2">Deducted from each completed order</p>
                </div>
                
                <div className="bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10">
                  <p className="font-semibold text-white mb-2">Example Earnings</p>
                  <div className="text-sm text-gray-200 space-y-1">
                    <p>Service Price: ₹10,000</p>
                    <p>Commission (14%): -₹1,400</p>
                    <p className="text-lg font-bold text-green-400 pt-2">You Receive: ₹8,600</p>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10">
                  <p className="font-semibold text-white mb-2">Payout Details</p>
                  <ul className="text-sm text-gray-200 space-y-1">
                    <li>• Direct bank transfer</li>
                    <li>• 1-3 business days</li>
                    <li>• Minimum withdrawal: ₹100</li>
                    <li>• No withdrawal fees</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* For Clients */}
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-2xl shadow-lg p-8 border-2 border-purple-500/20">
              <h3 className="text-2xl font-bold mb-6 text-white">For Clients 🎯</h3>
              <div className="space-y-4">
                <div className="bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10">
                  <p className="font-semibold text-white mb-2">What You Pay</p>
                  <div className="text-sm text-gray-200 space-y-1">
                    <p>Service Price: ₹10,000</p>
                    <p>Platform Fee (14%): ₹1,400</p>
                    <p>GST on Fee (18%): ₹252</p>
                    <p className="text-lg font-bold text-purple-400 pt-2">Total: ₹10,252</p>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10">
                  <p className="font-semibold text-white mb-2">Payment Protection</p>
                  <ul className="text-sm text-gray-200 space-y-1">
                    <li>• Escrow security</li>
                    <li>• Pay only after delivery</li>
                    <li>• Refund available (4% fee)</li>
                    <li>• Multiple payment methods</li>
                  </ul>
                </div>

                <div className="bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10">
                  <p className="font-semibold text-white mb-2">Accepted Methods</p>
                  <ul className="text-sm text-gray-200 space-y-1">
                    <li>• Credit/Debit Cards</li>
                    <li>• UPI</li>
                    <li>• Net Banking</li>
                    <li>• Wallets (Paytm, PhonePe, etc.)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Admin Features */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">Platform Administration</h2>
            <p className="text-gray-200">How we maintain quality and resolve issues</p>
          </div>

          <div className="bg-gradient-to-br from-gray-500/10 to-gray-600/10 rounded-2xl shadow-lg p-8 border-2 border-gray-500/20">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4 text-white">Admin Capabilities</h3>
                <ul className="space-y-3 text-gray-200">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Monitor all platform activities</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Review reported users and content</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Resolve disputes between parties</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Manage refund requests</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Suspend or ban violating accounts</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Platform analytics and reporting</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4 text-white">Dispute Resolution</h3>
                <ol className="list-decimal list-inside space-y-3 text-gray-200">
                  <li>User reports issue via support</li>
                  <li>Admin reviews both sides</li>
                  <li>Evidence collection (chat, files, etc.)</li>
                  <li>Fair decision within 7 days</li>
                  <li>Appropriate action taken</li>
                  <li>Both parties notified</li>
                </ol>
                <div className="bg-white/5 backdrop-blur-sm p-4 rounded-lg mt-4 border border-white/10">
                  <p className="text-sm text-gray-200">
                    <strong className="text-white">Support Email:</strong> support@innfill.in
                    <br />
                    Response time: Within 24-48 hours
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">Best Practices for Success</h2>
            <p className="text-gray-200">Tips to get the most out of Innfill</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* For Freelancers */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl shadow-lg p-8 border-2 border-blue-500/20">
              <h3 className="text-2xl font-bold mb-6 text-white">Freelancer Tips 💡</h3>
              <ul className="space-y-4 text-gray-200">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-500/30">
                    <span className="text-blue-400 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <strong className="text-white">Complete Your Profile:</strong> Add photo, bio, skills, portfolio. Complete profiles get 3x more orders.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-500/30">
                    <span className="text-blue-400 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <strong className="text-white">Price Competitively:</strong> Research similar services. Start with lower prices to build reviews.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-500/30">
                    <span className="text-blue-400 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <strong className="text-white">Respond Quickly:</strong> Fast responses lead to more orders. Answer messages within 24 hours.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-500/30">
                    <span className="text-blue-400 font-bold text-sm">4</span>
                  </div>
                  <div>
                    <strong className="text-white">Deliver on Time:</strong> Meeting deadlines builds trust. Communicate early if delays occur.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-500/30">
                    <span className="text-blue-400 font-bold text-sm">5</span>
                  </div>
                  <div>
                    <strong className="text-white">Over-Deliver:</strong> Exceed expectations to get 5-star reviews. Happy clients return.
                  </div>
                </li>
              </ul>
            </div>

            {/* For Clients */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl shadow-lg p-8 border-2 border-purple-500/20">
              <h3 className="text-2xl font-bold mb-6 text-white">Client Tips 💡</h3>
              <ul className="space-y-4 text-gray-200">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border border-purple-500/30">
                    <span className="text-purple-400 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <strong className="text-white">Clear Requirements:</strong> Provide detailed instructions, examples, and files upfront.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border border-purple-500/30">
                    <span className="text-purple-400 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <strong className="text-white">Check Reviews:</strong> Read previous client feedback. Look for consistent quality.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border border-purple-500/30">
                    <span className="text-purple-400 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <strong className="text-white">Communicate:</strong> Stay engaged. Quick responses help freelancers deliver better work.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border border-purple-500/30">
                    <span className="text-purple-400 font-bold text-sm">4</span>
                  </div>
                  <div>
                    <strong className="text-white">Review Promptly:</strong> Check deliverables quickly. Don&apos;t let orders auto-complete.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border border-purple-500/30">
                    <span className="text-purple-400 font-bold text-sm">5</span>
                  </div>
                  <div>
                    <strong className="text-white">Leave Reviews:</strong> Help others by sharing your experience. Builds community trust.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">Frequently Asked Questions</h2>
            <p className="text-gray-200">Quick answers to common questions</p>
          </div>

          <div className="space-y-4">
            <details className="bg-white/5 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border border-white/10">
              <summary className="font-semibold text-white cursor-pointer text-lg">
                How long does it take to get paid?
              </summary>
              <p className="text-gray-200 mt-4">
                Freelancers receive payment 1-3 business days after order completion. Once the client approves your delivery, funds are automatically transferred to your registered bank account.
              </p>
            </details>

            <details className="bg-white/5 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border border-white/10">
              <summary className="font-semibold text-white cursor-pointer text-lg">
                Can I cancel an order after payment?
              </summary>
              <p className="text-gray-200 mt-4">
                Yes. Before work starts, you can cancel for a full refund minus 4% processing fee and GST. After work begins, both parties must agree to cancellation terms.
              </p>
            </details>

            <details className="bg-white/5 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border border-white/10">
              <summary className="font-semibold text-white cursor-pointer text-lg">
                What if I&apos;m not satisfied with the delivery?
              </summary>
              <p className="text-gray-200 mt-4">
                You can request revisions if included in the service. If the work doesn&apos;t meet requirements, you can raise a dispute. Our support team will review and mediate fairly.
              </p>
            </details>

            <details className="bg-white/5 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border border-white/10">
              <summary className="font-semibold text-white cursor-pointer text-lg">
                Is my payment information secure?
              </summary>
              <p className="text-gray-200 mt-4">
                Absolutely. We use Razorpay, a certified payment gateway. We never store your card details. All transactions are encrypted and PCI-DSS compliant.
              </p>
            </details>

            <details className="bg-white/5 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border border-white/10">
              <summary className="font-semibold text-white cursor-pointer text-lg">
                How does the escrow system work?
              </summary>
              <p className="text-gray-200 mt-4">
                When you pay, funds are held securely (not released to freelancer). Money is only released after you approve the delivery. This protects both parties.
              </p>
            </details>

            <details className="bg-white/5 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border border-white/10">
              <summary className="font-semibold text-white cursor-pointer text-lg">
                Can I offer services as a company?
              </summary>
              <p className="text-gray-200 mt-4">
                Yes! You can register as a freelancer and add your company details. Provide GST number if applicable for invoicing purposes.
              </p>
            </details>

            <details className="bg-white/5 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border border-white/10">
              <summary className="font-semibold text-white cursor-pointer text-lg">
                What happens if a freelancer doesn&apos;t deliver?
              </summary>
              <p className="text-gray-200 mt-4">
                If a freelancer fails to deliver within the agreed timeline, you can raise a dispute. Our team will investigate and issue a full refund if appropriate.
              </p>
            </details>

            <details className="bg-white/5 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border border-white/10">
              <summary className="font-semibold text-white cursor-pointer text-lg">
                How do I increase my visibility as a freelancer?
              </summary>
              <p className="text-gray-200 mt-4">
                Complete your profile, add portfolio items, maintain high ratings, respond quickly to messages, and deliver quality work consistently. Good reviews naturally improve visibility.
              </p>
            </details>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-3xl shadow-2xl p-12 border border-white/10">
            <h2 className="text-4xl font-bold mb-4 text-white">Ready to Get Started?</h2>
            <p className="text-xl mb-8 text-gray-200">
              Join thousands of freelancers and clients already using Innfill
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register">
                <button className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg hover:shadow-xl">
                  Sign Up Now →
                </button>
              </Link>
              <Link href="mailto:support@innfill.in">
                <button className="bg-transparent border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-xl text-lg font-semibold transition-all">
                  Contact Support
                </button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
