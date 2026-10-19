import Layout from '../components/Layout';
import { BarChart3, Download, FileText, Users, Calendar, TrendingUp } from 'lucide-react';

function Reports() {
  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
            <p className="text-gray-600">View attendance reports and export data</p>
          </div>
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
            <Download className="w-5 h-5" />
            Export Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Attendance Report</h3>
            <p className="text-sm text-gray-600 mb-4">Daily attendance summaries</p>
            <button className="text-blue-600 text-sm font-semibold hover:underline">View Report →</button>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Student Report</h3>
            <p className="text-sm text-gray-600 mb-4">Individual student attendance</p>
            <button className="text-green-600 text-sm font-semibold hover:underline">View Report →</button>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Class Report</h3>
            <p className="text-sm text-gray-600 mb-4">Class-wise attendance trends</p>
            <button className="text-purple-600 text-sm font-semibold hover:underline">View Report →</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-16 shadow-lg border border-gray-100 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">No Report Data Available</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Start taking attendance to generate reports and analytics.
          </p>
        </div>
      </div>
    </Layout>
  );
}

export default Reports;
