import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | Innfill',
  description: 'Privacy Policy for Innfill - Learn how we collect, use, and protect your personal information.',
}

export default function PrivacyPolicyPage() {
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
          <article className="prose prose-invert prose-blue max-w-none text-gray-100">
            <h1 className="text-4xl font-bold mb-2 text-white">Privacy Policy</h1>
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

            <h2 className="text-2xl font-bold mb-4 text-white">1. Introduction</h2>
            <p className="text-gray-200 mb-4">
              Welcome to Innfill (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </p>
            <p className="text-gray-200 mb-4">
              This policy applies to all users of Innfill, including freelancers, clients, and administrators.
            </p>
            <p className="font-semibold text-blue-300 mb-6">
              By using Innfill, you agree to the collection and use of information in accordance with this Privacy Policy.
            </p>

          <h2 className="text-2xl font-bold mb-4 text-white">2. Jurisdiction and Compliance</h2>
          <p className="text-gray-200 mb-4">
            Innfill operates primarily in <strong className="text-white">India</strong> and is subject to Indian laws, including:
          </p>
          <ul className="text-gray-200 mb-4">
            <li><strong className="text-white">Digital Personal Data Protection Act (DPDP Act), 2023</strong></li>
            <li><strong className="text-white">Information Technology Act, 2000</strong></li>
            <li><strong className="text-white">Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</strong></li>
          </ul>
          <p className="text-gray-200 mb-6">
            This Privacy Policy is designed to comply with these Indian data protection regulations.
          </p>

          <h2 className="text-2xl font-bold mb-4 text-white">3. Information We Collect</h2>
          
          <h3 className="text-xl font-semibold mb-3 text-blue-300">3.1 Personal Information</h3>
          <p className="text-gray-200 mb-4">We collect the following personal information when you register and use our platform:</p>
          
          <p className="text-gray-200 mb-2"><strong className="text-white">For All Users:</strong></p>
          <ul className="text-gray-200 mb-4">
            <li>Full name</li>
            <li>Email address</li>
            <li>Username</li>
            <li>Password (encrypted and hashed)</li>
            <li>Profile photo (optional)</li>
            <li>Bio/description (optional)</li>
            <li>Location information</li>
            <li>Account creation date and activity logs</li>
          </ul>

          <p className="text-gray-200 mb-2"><strong className="text-white">For Freelancers:</strong></p>
          <ul className="text-gray-200 mb-4">
            <li>Skills and expertise</li>
            <li>Hourly rate and service pricing</li>
            <li>Portfolio items and work samples</li>
            <li>Bank account details for payments:
              <ul className="text-gray-200 ml-6">
                <li>Bank account number</li>
                <li>IFSC code</li>
                <li>Account holder name</li>
                <li>PAN number (for tax compliance)</li>
              </ul>
            </li>
            <li>Service offerings and descriptions</li>
            <li>Reviews and ratings received</li>
            <li>Earnings and transaction history</li>
          </ul>

          <p className="text-gray-200 mb-2"><strong className="text-white">For Clients:</strong></p>
          <ul className="text-gray-200 mb-6">
            <li>Company name (if applicable)</li>
            <li>Payment transaction history</li>
            <li>Order details and service requests</li>
            <li>Reviews and ratings given</li>
            <li>GST number (if applicable)</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 text-blue-300">3.2 Automatically Collected Information</h3>
          <p className="text-gray-200 mb-4">We automatically collect certain information when you use our platform:</p>
          <ul className="text-gray-200 mb-4">
            <li>Device information (browser type, operating system)</li>
            <li>Usage data (pages visited, features used, time spent)</li>
            <li>Session information</li>
          </ul>
          <p className="text-gray-200 mb-4 font-semibold">
            Note: We do NOT currently collect IP addresses or use tracking cookies/analytics tools.
          </p>

          <h3 className="text-xl font-semibold mb-3 text-blue-300">3.3 Communication Data</h3>
          <ul className="text-gray-200 mb-6">
            <li>Messages exchanged through our chat system</li>
            <li>Email communications with support</li>
            <li>Order-related communications</li>
            <li>Dispute resolution correspondence</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 text-blue-300">3.4 Payment Information</h3>
          <p className="text-gray-200 mb-4">
            We use <strong className="text-white">Razorpay</strong> as our third-party payment processor. We do NOT store:
          </p>
          <ul className="text-gray-200 mb-4">
            <li>Credit/debit card numbers</li>
            <li>CVV codes</li>
            <li>Card expiration dates</li>
          </ul>
          <p className="text-gray-200 mb-4">We only store:</p>
          <ul className="text-gray-200 mb-6">
            <li>Razorpay payment IDs</li>
            <li>Razorpay order IDs</li>
            <li>Transaction amounts and dates</li>
            <li>Payment status</li>
            <li>Refund information</li>
          </ul>

          <h2 className="text-2xl font-bold mb-4 text-white">4. How We Use Your Information</h2>
          
          <h3 className="text-xl font-semibold mb-3 text-blue-300">4.1 Platform Functionality</h3>
          <ul className="text-gray-200 mb-4">
            <li>Creating and managing user accounts</li>
            <li>Facilitating service transactions between freelancers and clients</li>
            <li>Processing payments and refunds</li>
            <li>Enabling communication through our chat system</li>
            <li>Managing orders and service delivery</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 text-blue-300">4.2 Platform Improvement</h3>
          <ul className="text-gray-200 mb-4">
            <li>Analyzing usage patterns to improve user experience</li>
            <li>Developing new features and services</li>
            <li>Debugging and fixing technical issues</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 text-blue-300">4.3 Security and Fraud Prevention</h3>
          <ul className="text-gray-200 mb-4">
            <li>Verifying user identity</li>
            <li>Detecting and preventing fraudulent activities</li>
            <li>Securing financial transactions</li>
            <li>Protecting against unauthorized access</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 text-blue-300">4.4 Legal Compliance</h3>
          <ul className="text-gray-200 mb-4">
            <li>Complying with tax regulations (GST, income tax)</li>
            <li>Responding to legal requests and court orders</li>
            <li>Enforcing our Terms of Service</li>
            <li>Resolving disputes and conflicts</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 text-blue-300">4.5 Communication</h3>
          <ul className="text-gray-200 mb-6">
            <li>Sending transactional emails (order confirmations, payment receipts)</li>
            <li>Providing customer support</li>
            <li>Notifying users of platform updates (with consent)</li>
            <li>Sending important security alerts</li>
          </ul>

          <h2 className="text-2xl font-bold mb-4 text-white">5. How We Share Your Information</h2>
          
          <h3 className="text-xl font-semibold mb-3 text-blue-300">5.1 With Other Users</h3>
          <p className="text-gray-200 mb-2"><strong className="text-white">Publicly Visible Information:</strong></p>
          <ul className="text-gray-200 mb-4">
            <li>Username, profile photo, bio</li>
            <li>Freelancer skills, rates, and portfolio</li>
            <li>Reviews and ratings</li>
            <li>Service offerings</li>
          </ul>

          <p className="text-gray-200 mb-2"><strong className="text-white">Shared After Transaction:</strong></p>
          <ul className="text-gray-200 mb-6">
            <li>Contact information shared between freelancer and client for service delivery</li>
            <li>Order details and requirements</li>
            <li>Chat messages</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 text-blue-300">5.2 With Third-Party Service Providers</h3>
          <p className="text-gray-200 mb-2"><strong className="text-white">Payment Processing:</strong></p>
          <ul className="text-gray-200 mb-4">
            <li><strong className="text-white">Razorpay</strong> - For payment processing, refunds, and transfers</li>
            <li>Information shared: Transaction amounts, user IDs, bank details for payouts</li>
          </ul>

          <p className="text-gray-200 mb-2"><strong className="text-white">Infrastructure and Hosting:</strong></p>
          <ul className="text-gray-200 mb-4">
            <li><strong className="text-white">Supabase</strong> - Database, authentication, and file storage</li>
            <li>Information shared: All user data, encrypted passwords, file uploads</li>
            <li><strong className="text-white">Vercel</strong> - Application hosting and deployment</li>
            <li>Information shared: Usage logs, performance data</li>
          </ul>

          <p className="text-gray-200 mb-6 font-semibold">
            Note: All third-party providers are contractually obligated to maintain data security and confidentiality.
          </p>

          <h3 className="text-xl font-semibold mb-3 text-blue-300">5.3 Legal Requirements</h3>
          <p className="text-gray-200 mb-4">We may disclose your information when required by law:</p>
          <ul className="text-gray-200 mb-6">
            <li>In response to court orders, subpoenas, or legal processes</li>
            <li>To comply with tax and regulatory obligations</li>
            <li>To protect our rights, property, or safety</li>
            <li>To investigate fraud or security incidents</li>
            <li>To enforce our Terms of Service</li>
          </ul>

          <h2 className="text-2xl font-bold mb-4 text-white">6. Data Storage and Security</h2>
          
          <h3 className="text-xl font-semibold mb-3 text-blue-300">6.1 Where We Store Your Data</h3>
          <p className="text-gray-200 mb-4">Your data is stored on:</p>
          <ul className="text-gray-200 mb-6">
            <li><strong className="text-white">Supabase</strong> (PostgreSQL database) - Cloud infrastructure</li>
            <li><strong className="text-white">Vercel</strong> (Next.js application) - Cloud hosting</li>
            <li>Geographic location: Data centers may be located outside India</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 text-blue-300">6.2 Data Retention</h3>
          <p className="text-gray-200 mb-2">
            <strong className="text-white">Current Policy:</strong> Data is retained indefinitely for platform functionality.
          </p>
          <p className="text-gray-200 mb-6">
            <strong className="text-white">Note:</strong> We do NOT currently offer account deletion functionality. Once implemented, data will be handled according to user deletion requests subject to legal retention requirements.
          </p>

          <h3 className="text-xl font-semibold mb-3 text-blue-300">6.3 Security Measures</h3>
          <p className="text-gray-200 mb-2"><strong className="text-white">Technical Safeguards:</strong></p>
          <ul className="text-gray-200 mb-4">
            <li>HTTPS encryption for all data transmission</li>
            <li>Password hashing using Supabase authentication</li>
            <li>Row-Level Security (RLS) policies on database</li>
            <li>Payment signature verification (Razorpay)</li>
            <li>Secure environment variable management</li>
            <li>Regular security updates and patches</li>
          </ul>

          <p className="text-gray-200 mb-2"><strong className="text-white">Operational Safeguards:</strong></p>
          <ul className="text-gray-200 mb-6">
            <li>Access controls and authentication requirements</li>
            <li>Secure payment processing through certified gateway</li>
            <li>Regular monitoring for suspicious activities</li>
            <li>Incident response procedures</li>
          </ul>

          <h2 className="text-2xl font-bold mb-4 text-white">7. Your Rights</h2>
          <p className="text-gray-200 mb-4">Under the Digital Personal Data Protection Act, 2023, you have the following rights:</p>
          
          <h3 className="text-xl font-semibold mb-3 text-blue-300">7.1 Right to Access</h3>
          <ul className="text-gray-200 mb-4">
            <li>You can view your profile information at any time</li>
            <li>Request a copy of your personal data by contacting support@innfill.in</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 text-blue-300">7.2 Right to Correction</h3>
          <ul className="text-gray-200 mb-4">
            <li>Update your profile information through account settings</li>
            <li>Contact us to correct inaccuracies in your data</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 text-blue-300">7.3 Right to Data Portability</h3>
          <ul className="text-gray-200 mb-4">
            <li>Request your data in a machine-readable format</li>
            <li>Contact support@innfill.in for data export requests</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 text-blue-300">7.4 Right to Erasure</h3>
          <p className="text-gray-200 mb-6">
            <strong className="text-white">Currently Not Available:</strong> Account deletion functionality is not yet implemented. Once available, you can request complete account deletion. Note: Some data may be retained for legal/tax compliance purposes.
          </p>

          <h3 className="text-xl font-semibold mb-3 text-blue-300">7.5 Right to Grievance Redressal</h3>
          <ul className="text-gray-200 mb-6">
            <li>Contact our Grievance Officer at support@innfill.in</li>
            <li>We will respond to grievances within 30 days</li>
          </ul>

          <h2 className="text-2xl font-bold mb-4 text-white">8. Cookies and Tracking</h2>
          <p className="text-gray-200 mb-4 font-semibold">
            Current Status: We do NOT currently use cookies or tracking technologies.
          </p>
          <p className="text-gray-200 mb-4">
            <strong className="text-white">Future Implementation:</strong> If we implement analytics tools (such as Google Analytics) or use cookies in the future:
          </p>
          <ul className="text-gray-200 mb-6">
            <li>We will update this Privacy Policy</li>
            <li>Users will be notified of the changes</li>
            <li>Cookie consent mechanism will be implemented as required by law</li>
          </ul>

          <h2 className="text-2xl font-bold mb-4 text-white">9. Children&apos;s Privacy</h2>
          <p className="text-gray-200 mb-6">
            Innfill is not intended for users under the age of 18. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us at support@innfill.in, and we will delete such information.
          </p>

          <h2 className="text-2xl font-bold mb-4 text-white">10. Changes to This Privacy Policy</h2>
          <p className="text-gray-200 mb-4">We may update this Privacy Policy from time to time to reflect:</p>
          <ul className="text-gray-200 mb-4">
            <li>Changes in our practices</li>
            <li>Legal or regulatory requirements</li>
            <li>New features or services</li>
          </ul>
          <p className="text-gray-200 mb-2"><strong className="text-white">Notification of Changes:</strong></p>
          <ul className="text-gray-200 mb-6">
            <li>Updated &quot;Last Updated&quot; date at the top of this policy</li>
            <li>Email notification for significant changes (if user has opted in)</li>
            <li>Prominent notice on the platform</li>
          </ul>

          <h2 className="text-2xl font-bold mb-4 text-white">11. Contact Us</h2>
          <p className="text-gray-200 mb-4">For any questions, concerns, or requests regarding this Privacy Policy or your personal information:</p>
          <div className="bg-gray-800/50 p-4 rounded-lg my-4 border border-gray-700">
            <p className="mb-2 text-gray-200"><strong className="text-white">Email:</strong> <a href="mailto:support@innfill.in" className="text-blue-400 hover:text-blue-300">support@innfill.in</a></p>
            <p className="mb-0 text-gray-200">
              <strong className="text-white">Address:</strong> Innfill, 9-80/3/A Street No-4 Boddupal Udaya nagar colony, Hyderabad, Telangana 500092, India
            </p>
          </div>
          <p className="text-gray-200 mb-6">We will respond to your inquiry within 7 business days.</p>

          <h2 className="text-2xl font-bold mb-4 text-white">12. Consent</h2>
          <p className="text-gray-200 mb-4">By using Innfill, you consent to:</p>
          <ul className="text-gray-200 mb-6">
            <li>The collection and use of your information as described in this Privacy Policy</li>
            <li>The transfer of data to third-party service providers</li>
            <li>The storage of data on cloud infrastructure</li>
            <li>Communications from us regarding your account and transactions</li>
          </ul>

          <div className="border-t border-gray-700 pt-8 mt-12 text-sm text-gray-300">
            <p className="mb-2">
              <strong className="text-white">Acceptance:</strong> By clicking &quot;I Agree&quot; during registration or by using our platform, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy.
            </p>
            <p className="italic">
              This Privacy Policy is governed by the laws of India. Any disputes arising from this policy shall be subject to the exclusive jurisdiction of courts in Hyderabad, Telangana.
            </p>
          </div>
        </article>
      </div>
    </div>
  </div>
  )
}
