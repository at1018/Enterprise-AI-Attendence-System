import { CheckCircle, AlertTriangle, Clock, XCircle } from 'lucide-react';

interface AttendanceMetricsProps {
  stats: any;
}

const AttendanceMetrics: React.FC<AttendanceMetricsProps> = ({ stats }) => {
  const metrics = [
    {
      label: 'AI Verified',
      value: stats?.aiVerifiedPresent || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      label: 'Needs Review',
      value: stats?.needsReview || 0,
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
    },
    {
      label: 'Exceptions',
      value: stats?.attendanceException || 0,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    {
      label: 'Insufficient Evidence',
      value: stats?.insufficientEvidence || 0,
      icon: Clock,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className={`${metric.bgColor} ${metric.borderColor} border rounded-lg p-4`}
        >
          <div className="flex items-center gap-3">
            <metric.icon className={`w-5 h-5 ${metric.color}`} />
            <div>
              <p className="text-sm text-gray-600">{metric.label}</p>
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AttendanceMetrics;
