import { Users, Calendar, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  iconBg: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, bgColor, iconBg }) => (
  <div className={`${bgColor} rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-4xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`${iconBg} ${color} p-4 rounded-2xl shadow-md`}>
        <Icon className="w-7 h-7" />
      </div>
    </div>
  </div>
);

const DashboardStats: React.FC<{ stats: any }> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Students"
        value={stats?.totalStudents || 0}
        icon={Users}
        color="text-blue-600"
        bgColor="bg-white"
        iconBg="bg-blue-100"
      />
      <StatCard
        title="Total Classes"
        value={stats?.totalClasses || 0}
        icon={Calendar}
        color="text-green-600"
        bgColor="bg-white"
        iconBg="bg-green-100"
      />
      <StatCard
        title="Attendance Rate"
        value={`${stats?.attendanceRate?.toFixed(1) || 0}%`}
        icon={TrendingUp}
        color="text-purple-600"
        bgColor="bg-white"
        iconBg="bg-purple-100"
      />
      <StatCard
        title="Total Sessions"
        value={stats?.totalSessions || 0}
        icon={Clock}
        color="text-orange-600"
        bgColor="bg-white"
        iconBg="bg-orange-100"
      />
    </div>
  );
};

export default DashboardStats;
