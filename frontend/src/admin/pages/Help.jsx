// src/admin/pages/Help.jsx
import { 
  HelpCircle, 
  BookOpen, 
  MessageSquare, 
  Video, 
  Mail, 
  Phone,
  FileText,
  ChevronRight,
  Search,
  ExternalLink
} from 'lucide-react';

const Help = () => {
  const helpCategories = [
    {
      title: 'Getting Started',
      icon: <BookOpen className="text-blue-600" size={24} />,
      items: [
        'Admin Dashboard Overview',
        'User Management Guide',
        'Order Processing',
        'Product Management'
      ]
    },
    {
      title: 'Troubleshooting',
      icon: <HelpCircle className="text-amber-600" size={24} />,
      items: [
        'Common Issues & Solutions',
        'Error Code Reference',
        'Performance Optimization',
        'Backup & Recovery'
      ]
    },
    {
      title: 'Video Tutorials',
      icon: <Video className="text-purple-600" size={24} />,
      items: [
        'Dashboard Walkthrough',
        'Advanced Features',
        'API Integration',
        'Security Best Practices'
      ]
    }
  ];

  // const contactMethods = [
  //   {
  //     title: 'Email Support',
  //     icon: <Mail className="text-green-600" size={20} />,
  //     details: 'support@baghaven.com',
  //     response: 'Response within 24 hours'
  //   },
  //   {
  //     title: 'Phone Support',
  //     icon: <Phone className="text-blue-600" size={20} />,
  //     details: '+91 98765 43210',
  //     response: 'Mon-Fri, 9AM-6PM IST'
  //   },
  //   {
  //     title: 'Live Chat',
  //     icon: <MessageSquare className="text-purple-600" size={20} />,
  //     details: 'Available on dashboard',
  //     response: 'Real-time assistance'
  //   }
  // ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <HelpCircle className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
              <p className="text-gray-600">Find answers, guides, and contact support</p>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for help articles, guides, or FAQs..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Quick Help Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {helpCategories.map((category, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                {category.icon}
                <h3 className="text-xl font-bold text-gray-900">{category.title}</h3>
              </div>
              <ul className="space-y-2">
                {category.items.map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg group cursor-pointer">
                    <span className="text-gray-700 group-hover:text-blue-600">{item}</span>
                    <ChevronRight className="text-gray-400 group-hover:text-blue-600" size={16} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Support
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-lg p-6 md:p-8 text-white mb-8">
          <h2 className="text-2xl font-bold mb-6">Contact Support</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactMethods.map((method, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-5 border border-white/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    {method.icon}
                  </div>
                  <h3 className="font-bold text-lg">{method.title}</h3>
                </div>
                <p className="text-xl font-semibold mb-2">{method.details}</p>
                <p className="text-gray-300 text-sm">{method.response}</p>
              </div>
            ))}
          </div>
        </div> */}

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: 'How do I reset my admin password?',
                a: 'Go to Settings → Security → Change Password. You can also contact support for assistance.'
              },
              {
                q: 'How to export order data?',
                a: 'Navigate to Orders page, use the Export button to download data in CSV or Excel format.'
              },
              {
                q: 'Can I add multiple admin users?',
                a: 'Yes, super admins can create additional admin accounts with different permission levels.'
              },
              {
                q: 'How to view sales reports?',
                a: 'Dashboard provides real-time sales analytics. For detailed reports, go to Analytics → Reports.'
              }
            ].map((faq, index) => (
              <details key={index} className="group border-b border-gray-200 pb-4">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="font-medium text-gray-900 group-open:text-blue-600">
                    {faq.q}
                  </span>
                  <ChevronRight className="text-gray-400 group-open:rotate-90 transition-transform" size={20} />
                </summary>
                <p className="mt-3 text-gray-600 pl-2">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} BagHaven Admin Help Center</p>
          <p className="mt-1">Need immediate help? Contact our 24/7 support team</p>
        </div>
      </div>
    </div>
  );
};

export default Help;