import { useState, useEffect } from 'react';
import { dashboardAPI, attendanceAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import DashboardStats from '../components/DashboardStats';
import AttendanceMetrics from '../components/AttendanceMetrics';
import { Calendar, UserCheck, TrendingUp, Activity, Clock, ChevronRight } from 'lucide-react';

function Dashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      console.log('Loading dashboard for user role:', user?.role);
      
      // For teachers, load their sessions
      if (user?.role === 'CLASS_TEACHER' || user?.role === 'SUBJECT_TEACHER') {
        // For now, load all sessions - in production, filter by teacher
        const response = await attendanceAPI.getSessions();
        console.log('Sessions response:', response.data);
        setSessions(response.data.data || []);
        setStats({
          teacherView: true,
          sessions: response.data.data || []
        });
        setLoading(false);
        return;
      }
      
      // Load appropriate dashboard based on user role
      let response;
      if (user?.role === 'PRINCIPAL') {
        response = await dashboardAPI.getPrincipalDashboard();
      } else if (user?.role === 'SCHOOL_ADMIN') {
        response = await dashboardAPI.getSchoolAdminDashboard();
      } else {
        throw new Error('Unknown user role');
      }
      
      console.log('Dashboard response:', response.data);
      setStats(response.data.data);
    } catch (err: any) {
      console.error('Dashboard load error:', err);
      console.error('Error response:', err.response);
      setError(`Failed to load dashboard: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionSelect = async (sessionId: string) => {
    try {
      setSelectedSession(sessionId);
      const response = await dashboardAPI.getTeacherDashboard(sessionId);
      setStats({
        ...response.data.data,
        teacherView: false,
        selectedSession: sessionId
      });
    } catch (err: any) {
      console.error('Failed to load session dashboard:', err);
      setError('Failed to load session data');
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
              <p className="text-red-600 mb-4">{error}</p>
              <p className="text-sm text-gray-600 mb-4">User Role: {user?.role}</p>
              <button
                onClick={loadDashboard}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show message for teachers who need to select a session
  if (stats && stats.teacherView && !selectedSession) {
    return (
      <Layout>
        <div className="space-y-8">
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.firstName}!</h2>
                <p className="text-blue-100">Here's what's happening with your classes today</p>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3">
                  <p className="text-sm font-medium">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Session Selection */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Calendar className="w-7 h-7 text-blue-600" />
              Select a Session
            </h3>
            
            {sessions.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Sessions Available</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  There are no attendance sessions scheduled yet. Create your first session to get started with AI-powered attendance tracking.
                </p>
                <button
                  onClick={() => window.location.href = '/sessions'}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  <Calendar className="w-5 h-5" />
                  Create Session
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => handleSessionSelect(session.id)}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {session.className || 'Class'}
                        </h4>
                        <p className="text-sm text-gray-600">{session.subject || 'Subject'}</p>
                      </div>
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                    <ChevronRight className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <Clock className="w-4 h-4" />
                        {session.period || 'Period'}
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <Calendar className="w-4 h-4" />
                        {new Date(session.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">My Classes</h3>
              <p className="text-sm text-gray-600 mb-4">View your assigned classes and sessions</p>
              <button className="text-blue-600 text-sm font-semibold hover:underline">View Classes →</button>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Attendance Review</h3>
              <p className="text-sm text-gray-600 mb-4">Review AI-generated attendance</p>
              <button className="text-green-600 text-sm font-semibold hover:underline">Review Now →</button>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Reports</h3>
              <p className="text-sm text-gray-600 mb-4">View attendance reports and analytics</p>
              <button className="text-purple-600 text-sm font-semibold hover:underline">View Reports →</button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show teacher dashboard with selected session
  if (stats && stats.teacherView && selectedSession) {
    return (
      <Layout>
        <div className="p-8">
          <div className="mb-8">
            <button
              onClick={() => setSelectedSession(null)}
              className="text-blue-600 hover:underline mb-4 inline-block"
            >
              ← Back to Sessions
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Dashboard</h2>
            <p className="text-gray-600">Attendance for selected session</p>
          </div>

          <DashboardStats stats={stats?.stats || stats} />
          <AttendanceMetrics stats={stats?.stats || stats} />
        </div>
      </Layout>
    );
  }

  // Admin/Principal Dashboard
  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {user?.role === 'PRINCIPAL' ? 'Principal Dashboard' : 'School Admin Dashboard'}
          </h1>
          <p className="text-gray-600">
            Welcome back, {user?.firstName} {user?.lastName}
          </p>
        </div>

        <DashboardStats stats={stats?.stats || stats} />
        <AttendanceMetrics stats={stats?.stats || stats} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-sm text-gray-700">System operational</p>
                <span className="text-xs text-gray-500 ml-auto">Just now</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm text-gray-700">Database synced</p>
                <span className="text-xs text-gray-500 ml-auto">5 min ago</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <p className="text-sm text-gray-700">AI model updated</p>
                <span className="text-xs text-gray-500 ml-auto">1 hour ago</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left">
                <Calendar className="w-6 h-6 text-blue-600 mb-2" />
                <p className="font-medium text-sm">Create Session</p>
              </button>
              <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left">
                <UserCheck className="w-6 h-6 text-green-600 mb-2" />
                <p className="font-medium text-sm">Add Student</p>
              </button>
              <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left">
                <Activity className="w-6 h-6 text-purple-600 mb-2" />
                <p className="font-medium text-sm">View Reports</p>
              </button>
              <button className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-left">
                <TrendingUp className="w-6 h-6 text-orange-600 mb-2" />
                <p className="font-medium text-sm">Analytics</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
