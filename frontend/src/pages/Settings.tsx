import Layout from '../components/Layout';
import { Settings as SettingsIcon, User, Bell, Shield, Database, Lock, Palette, Globe } from 'lucide-react';

function Settings() {
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account and system settings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Profile Settings</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Update your personal information</p>
            <button className="text-blue-600 text-sm font-semibold hover:underline">Edit Profile →</button>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Configure notification preferences</p>
            <button className="text-green-600 text-sm font-semibold hover:underline">Manage Notifications →</button>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Security</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Password and authentication settings</p>
            <button className="text-purple-600 text-sm font-semibold hover:underline">Security Settings →</button>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Data Management</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Export or manage your data</p>
            <button className="text-orange-600 text-sm font-semibold hover:underline">Data Settings →</button>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Privacy</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Privacy and data protection settings</p>
            <button className="text-indigo-600 text-sm font-semibold hover:underline">Privacy Settings →</button>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Appearance</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Customize the look and feel</p>
            <button className="text-pink-600 text-sm font-semibold hover:underline">Appearance Settings →</button>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Language & Region</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Language and regional preferences</p>
            <button className="text-teal-600 text-sm font-semibold hover:underline">Language Settings →</button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Settings;
