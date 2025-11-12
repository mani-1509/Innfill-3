import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service | Innfill',
  description: 'Terms of Service for Innfill - Read our terms and conditions for using the platform.',
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all">
          <article className="prose prose-invert prose-blue max-w-none">
            <h1 className="text-4xl font-bold mb-2 text-white">Terms of Service</h1>
            <p className="text-gray-300 mb-8">
              <strong>Last Updated:</strong> November 11, 2025<br />
              <strong>Effective Date:</strong> November 11, 2025
            </p>

            <div className="bg-blue-500/10 border border-blue-500/20 p-4 mb-8 rounded-lg">
              <h2 className="text-xl font-semibold mt-0 mb-2 text-blue-300">Company Information</h2>
              <p className="mb-0 text-gray-200">
                <strong className="text-white">Innfill</strong><br />
                Address: 9-80/3/A Street No-4 Boddupal Udaya nagar colony, Hyderabad, Telangana 500092, India<br />
                Email: <a href="mailto:support@innfill.in" className="text-blue-400 hover:text-blue-300">support@innfill.in</a><br />
                Website: <a href="https://innfill.in" className="text-blue-400 hover:text-blue-300">https://innfill.in</a>
              </p>
            </div>

            <h2 className="text-2xl font-bold mb-4 text-white">1. Acceptance of Terms</h2>
            <p className="text-gray-200 mb-4">
              Welcome to Innfill! These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you and Innfill (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) governing your use of the Innfill platform.
            </p>
            <p className="text-gray-200 mb-4 font-semibold text-blue-300">
              By accessing or using Innfill, you agree to be bound by these Terms. If you do not agree to these Terms, you must not use our platform.
            </p>
            <p className="text-gray-200 mb-4">These Terms apply to all users, including:</p>
            <ul className="text-gray-200 mb-6">
              <li><strong className="text-white">Freelancers</strong> who offer services</li>
              <li><strong className="text-white">Clients</strong> who purchase services</li>
              <li><strong className="text-white">Administrators</strong> who manage the platform</li>
              <li><strong className="text-white">Visitors</strong> who browse the platform</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 text-white">2. Eligibility</h2>
            
            <h3 className="text-xl font-semibold mb-3 text-blue-300">2.1 Age Requirement</h3>
            <ul className="text-gray-200 mb-4">
              <li>You must be at least <strong className="text-white">18 years of age</strong> to use Innfill</li>
              <li>By using our platform, you represent and warrant that you are 18 or older</li>
              <li>We reserve the right to request proof of age at any time</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-blue-300">2.2 Legal Capacity</h3>
            <ul className="text-gray-200 mb-6">
              <li>You must have the legal capacity to enter into binding contracts</li>
              <li>If registering on behalf of a company, you must have authority to bind that entity</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 text-white">3. Account Registration</h2>
            
            <h3 className="text-xl font-semibold mb-3 text-blue-300">3.1 Account Creation</h3>
            <ul className="text-gray-200 mb-4">
              <li>You must provide accurate, complete, and current information during registration</li>
              <li>You must choose a unique username and email address</li>
              <li>You are responsible for maintaining the confidentiality of your password</li>
              <li>You must notify us immediately of any unauthorized use of your account</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-blue-300">3.2 Account Responsibilities</h3>
            <ul className="text-gray-200 mb-6">
              <li>You are solely responsible for all activities under your account</li>
              <li>You must not share your account credentials with others</li>
              <li>You must not create multiple accounts to circumvent platform rules</li>
              <li>You must not impersonate others or provide false information</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 text-white">4. Platform Rules and Conduct</h2>
            
            <h3 className="text-xl font-semibold mb-3 text-blue-300">4.1 Prohibited Activities</h3>
            <p className="text-gray-200 mb-4">You agree NOT to:</p>
            
            <p className="text-gray-200 mb-2"><strong className="text-white">Fraudulent Activities:</strong></p>
            <ul className="text-gray-200 mb-4">
              <li>Engage in any fraudulent, deceptive, or misleading practices</li>
              <li>Create fake reviews or ratings</li>
              <li>Manipulate prices or bidding processes</li>
              <li>Use stolen payment methods or identities</li>
            </ul>

            <p className="text-gray-200 mb-2"><strong className="text-white">Abusive Behavior:</strong></p>
            <ul className="text-gray-200 mb-4">
              <li>Harass, threaten, or abuse other users</li>
              <li>Use offensive, discriminatory, or hate speech</li>
              <li>Spam or send unsolicited messages</li>
              <li>Engage in any form of bullying or intimidation</li>
            </ul>

            <p className="text-gray-200 mb-2"><strong className="text-white">Platform Misuse:</strong></p>
            <ul className="text-gray-200 mb-6">
              <li>Circumvent platform fees or payment systems</li>
              <li>Conduct transactions outside the platform after initial contact</li>
              <li>Scrape, copy, or duplicate platform content without permission</li>
              <li>Use automated tools or bots to access the platform</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 text-white">5. Services and Transactions</h2>
            
            <h3 className="text-xl font-semibold mb-3 text-blue-300">5.1 Service Offerings</h3>
            <p className="text-gray-200 mb-2"><strong className="text-white">Freelancers:</strong></p>
            <ul className="text-gray-200 mb-4">
              <li>Must accurately describe services offered</li>
              <li>Must deliver services as described and agreed upon</li>
              <li>Must meet agreed-upon deadlines</li>
              <li>Must maintain professional communication with clients</li>
            </ul>

            <p className="text-gray-200 mb-2"><strong className="text-white">Clients:</strong></p>
            <ul className="text-gray-200 mb-4">
              <li>Must clearly communicate service requirements</li>
              <li>Must provide necessary information and materials for service delivery</li>
              <li>Must review and approve work in a timely manner</li>
              <li>Must treat freelancers with respect and professionalism</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-blue-300">5.2 Order Process</h3>
            <ol className="text-gray-200 mb-6">
              <li><strong className="text-white">Service Discovery:</strong> Clients browse and select services</li>
              <li><strong className="text-white">Order Creation:</strong> Clients place orders with specific requirements</li>
              <li><strong className="text-white">Order Acceptance:</strong> Freelancers accept and review requirements</li>
              <li><strong className="text-white">Payment Processing:</strong> Payment is captured at order placement</li>
              <li><strong className="text-white">Service Delivery:</strong> Freelancers deliver completed work</li>
              <li><strong className="text-white">Order Completion:</strong> Clients review and mark order as complete</li>
              <li><strong className="text-white">Payment Release:</strong> Payment is transferred to freelancer after completion</li>
            </ol>

            <h2 className="text-2xl font-bold mb-4 text-white">6. Payments and Fees</h2>
            
            <h3 className="text-xl font-semibold mb-3 text-blue-300">6.1 Payment Processing</h3>
            <p className="text-gray-200 mb-2"><strong className="text-white">Payment Gateway:</strong></p>
            <ul className="text-gray-200 mb-4">
              <li>We use <strong className="text-white">Razorpay</strong> as our third-party payment processor</li>
              <li>All payments are processed in <strong className="text-white">Indian Rupees (INR)</strong></li>
              <li>Accepted payment methods: Credit/Debit cards, UPI, Net Banking, Wallets</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-blue-300">6.2 Platform Fees</h3>
            <p className="text-gray-200 mb-2"><strong className="text-white">Commission Structure:</strong></p>
            <ul className="text-gray-200 mb-4">
              <li>Innfill charges a <strong className="text-white">14% commission</strong> on all completed transactions</li>
              <li>Commission is calculated on the service price (before GST)</li>
              <li>Commission is deducted before payment release to freelancer</li>
            </ul>

            <p className="text-gray-200 mb-2"><strong className="text-white">GST (Goods and Services Tax):</strong></p>
            <ul className="text-gray-200 mb-4">
              <li><strong className="text-white">18% GST</strong> is applied on the 14% commission</li>
              <li>Effective GST on transaction: 2.52% (18% of 14%)</li>
              <li>GST is paid to the Government of India as per tax regulations</li>
            </ul>

            <div className="bg-gray-800/50 p-4 rounded-lg my-4 border border-gray-700">
              <p className="font-semibold mb-2 text-white">Example Calculation:</p>
              <pre className="text-sm bg-black/50 p-3 rounded border border-gray-600 text-gray-200">
{`Service Price:           ₹10,000.00
Platform Commission:     ₹1,400.00 (14%)
GST on Commission:       ₹252.00 (18% of ₹1,400)
Client Pays:             ₹10,252.00
Freelancer Receives:     ₹8,600.00 (₹10,000 - ₹1,400)
Platform Receives:       ₹1,400.00
Government Receives:     ₹252.00`}
              </pre>
            </div>

            <h3 className="text-xl font-semibold mb-3 text-blue-300">6.3 Payment Schedule</h3>
            <p className="text-gray-200 mb-2"><strong className="text-white">For Freelancers:</strong></p>
            <ul className="text-gray-200 mb-6">
              <li>Payments are transferred after order marked as complete</li>
              <li>Payment processing time: 1-3 business days</li>
              <li>Funds transferred directly to registered bank account</li>
              <li>Minimum withdrawal amount: ₹100.00</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 text-white">7. Refund and Cancellation Policy</h2>
            
            <h3 className="text-xl font-semibold mb-3 text-blue-300">7.1 Cancellation Rights</h3>
            <p className="text-gray-200 mb-2"><strong className="text-white">Before Work Begins:</strong></p>
            <ul className="text-gray-200 mb-4">
              <li>Clients can cancel orders before freelancer starts work</li>
              <li>Full refund minus processing fees (see Section 7.3)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-blue-300">7.2 Refund Eligibility</h3>
            <p className="text-gray-200 mb-2"><strong className="text-white">Eligible for Refund:</strong></p>
            <ul className="text-gray-200 mb-4">
              <li>Service not delivered as described</li>
              <li>Freelancer fails to deliver within agreed timeline</li>
              <li>Freelancer becomes unresponsive after order acceptance</li>
              <li>Mutual agreement to cancel order</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-blue-300">7.3 Refund Calculation</h3>
            <p className="text-gray-200 mb-4">When a refund is issued, the following deductions apply:</p>
            <ul className="text-gray-200 mb-4">
              <li><strong className="text-white">Processing Fee:</strong> 4% of service price</li>
              <li><strong className="text-white">GST:</strong> Non-refundable</li>
            </ul>

            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 my-4 rounded-lg">
              <p className="font-semibold mb-2 text-yellow-300">Refund Formula:</p>
              <p className="mb-2 text-gray-200"><code className="text-yellow-200">Refund Amount = Service Price - 4% Processing Fee</code></p>
              <pre className="text-sm bg-black/50 p-3 rounded border border-gray-600 mt-2 text-gray-200">
{`Client Paid:              ₹10,252.00
Service Price:            ₹10,000.00
GST (non-refundable):     ₹252.00
Processing Fee (4%):      ₹400.00
Refund to Client:         ₹9,600.00
Client Loss:              ₹652.00 (4% + GST)`}
              </pre>
            </div>

            <p className="text-gray-200 mb-2"><strong className="text-white">Refund Timeline:</strong></p>
            <ul className="text-gray-200 mb-6">
              <li>Refunds initiated immediately upon approval</li>
              <li>Processing time: 5-7 business days</li>
              <li>Refunds credited to original payment method</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 text-white">8. Intellectual Property</h2>
            
            <h3 className="text-xl font-semibold mb-3 text-blue-300">8.1 Platform Content</h3>
            <ul className="text-gray-200 mb-4">
              <li>The Innfill platform, including design, code, logos, and trademarks, is owned by Innfill</li>
              <li>You may not copy, reproduce, or create derivative works of the platform</li>
              <li>&quot;Innfill&quot; name and logo are protected trademarks</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-blue-300">8.2 User Content</h3>
            <ul className="text-gray-200 mb-4">
              <li>You retain ownership of content you upload (profile, portfolio, messages)</li>
              <li>By uploading content, you grant Innfill a license to display and use it on the platform</li>
              <li>You represent that your content does not infringe on third-party rights</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-blue-300">8.3 Work Product</h3>
            <ul className="text-gray-200 mb-6">
              <li>Default: Client receives full ownership of work product upon payment completion</li>
              <li>Custom agreements may specify different terms (must be documented)</li>
              <li>Freelancers may retain portfolio rights unless agreed otherwise</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 text-white">9. Warranties and Disclaimers</h2>
            
            <h3 className="text-xl font-semibold mb-3 text-blue-300">9.1 Platform Disclaimers</h3>
            <p className="text-gray-200 mb-2 font-semibold">&quot;AS IS&quot; BASIS:</p>
            <ul className="text-gray-200 mb-6">
              <li>Platform is provided &quot;as is&quot; and &quot;as available&quot;</li>
              <li>We make no warranties, express or implied</li>
              <li>We do not guarantee uninterrupted or error-free operation</li>
              <li>We are not responsible for the quality of services provided by freelancers</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 text-white">10. Limitation of Liability</h2>
            
            <h3 className="text-xl font-semibold mb-3 text-blue-300">10.1 Damages Cap</h3>
            <p className="text-gray-200 mb-2"><strong className="text-white">Maximum Liability:</strong></p>
            <p className="text-gray-200 mb-4">
              Our total liability for any claims shall not exceed the <strong className="text-white">greater of</strong>:
            </p>
            <ul className="text-gray-200 mb-4">
              <li>₹10,000 (ten thousand rupees), OR</li>
              <li>Total fees paid by you to Innfill in the 6 months preceding the claim</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-blue-300">10.2 Excluded Damages</h3>
            <p className="text-gray-200 mb-4">We are NOT liable for:</p>
            <ul className="text-gray-200 mb-6">
              <li>Indirect, incidental, special, consequential, or punitive damages</li>
              <li>Lost profits, revenue, or business opportunities</li>
              <li>Loss of data or content</li>
              <li>Disputes between users</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 text-white">11. Dispute Resolution</h2>
            
            <h3 className="text-xl font-semibold mb-3 text-blue-300">11.1 Informal Resolution</h3>
            <ul className="text-gray-200 mb-4">
              <li>Contact support@innfill.in to describe the issue</li>
              <li>We will attempt to resolve the matter informally</li>
              <li>Good faith negotiation period: 30 days</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-blue-300">11.2 Arbitration</h3>
            <p className="text-gray-200 mb-4">If informal resolution fails:</p>
            <ul className="text-gray-200 mb-4">
              <li>Disputes shall be resolved through arbitration</li>
              <li>Arbitration conducted in <strong className="text-white">Hyderabad, Telangana, India</strong></li>
              <li>Governed by the <strong className="text-white">Arbitration and Conciliation Act, 1996</strong></li>
              <li>One arbitrator mutually agreed upon or appointed by court</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-blue-300">11.3 Governing Law</h3>
            <ul className="text-gray-200 mb-6">
              <li>These Terms are governed by the laws of <strong className="text-white">India</strong></li>
              <li>Jurisdiction: Courts in <strong className="text-white">Hyderabad, Telangana</strong></li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 text-white">12. Changes to Terms</h2>
            <p className="text-gray-200 mb-4">We reserve the right to modify these Terms at any time. We will notify you by:</p>
            <ul className="text-gray-200 mb-4">
              <li>Updating the &quot;Last Updated&quot; date</li>
              <li>Prominent notice on the platform</li>
              <li>Email notification for significant changes</li>
            </ul>
            <p className="text-gray-200 mb-6">Continued use after changes constitutes acceptance.</p>

            <h2 className="text-2xl font-bold mb-4 text-white">13. Contact Information</h2>
            <div className="bg-gray-800/50 p-4 rounded-lg my-4 border border-gray-700">
              <p className="mb-2 text-gray-200"><strong className="text-white">Email:</strong> <a href="mailto:support@innfill.in" className="text-blue-400 hover:text-blue-300">support@innfill.in</a></p>
              <p className="mb-2 text-gray-200">
                <strong className="text-white">Address:</strong> Innfill, 9-80/3/A Street No-4 Boddupal Udaya nagar colony, Hyderabad, Telangana 500092, India
              </p>
              <p className="mb-0 text-gray-200"><strong className="text-white">Website:</strong> <a href="https://innfill.in" className="text-blue-400 hover:text-blue-300">https://innfill.in</a></p>
            </div>

            <h2 className="text-2xl font-bold mb-4 text-white">14. Acknowledgment</h2>
            <p className="text-gray-200 mb-4"><strong className="text-white">By using Innfill, you acknowledge that:</strong></p>
            <ul className="text-gray-200 mb-6">
              <li>You have read and understood these Terms of Service</li>
              <li>You have read and understood our Privacy Policy</li>
              <li>You have read and understood our Refund Policy</li>
              <li>You agree to be bound by all policies and terms</li>
              <li>You are at least 18 years of age</li>
              <li>You have the legal capacity to enter into this agreement</li>
            </ul>

            <div className="border-t border-gray-700 pt-8 mt-12 text-sm text-gray-300">
              <p className="mb-2">
                <strong className="text-white">Acceptance:</strong> By clicking &quot;I Agree&quot; during registration or by using our platform, you agree to these Terms of Service.
              </p>
              <p className="italic mb-4">
                These Terms of Service are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Hyderabad, Telangana.
              </p>
              <p className="text-center font-semibold text-white">
                © 2025 Innfill. All rights reserved.
              </p>
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}