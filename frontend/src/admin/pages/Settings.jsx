// src/admin/pages/Settings.jsx
import { useState } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  Bell,
  Shield,
  Globe,
  Palette,
  Database,
  Mail,
  User,
  Lock,
  Eye,
  EyeOff,
  Download,
  Upload,
  Check,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    // General
    siteName: 'BagHaven',
    siteUrl: 'https://baghaven.com',
    adminEmail: 'admin@baghaven.com',
    timezone: 'Asia/Kolkata',
    
    // Security
    twoFactorAuth: false,
    loginAttempts: 5,
    sessionTimeout: 30,
    
    // Notifications
    emailNotifications: true,
    orderAlerts: true,
    userAlerts: true,
    weeklyReports: true,
    
    // Appearance
    theme: 'light',
    sidebarCollapsed: false,
    compactMode: false,
    
    // Backup
    autoBackup: true,
    backupFrequency: 'daily',
    backupRetention: 30
  });

  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const tabs = [
    { id: 'general', label: 'General', icon: <Globe size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette size={18} /> },
    { id: 'backup', label: 'Backup', icon: <Database size={18} /> }
  ];

  const handleSave = () => {
    // Save settings to localStorage or API
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    toast.success('Settings saved successfully!');
  };

  const handleReset = () => {
    const defaultSettings = {
      siteName: 'BagHaven',
      siteUrl: 'https://baghaven.com',
      adminEmail: 'admin@baghaven.com',
      timezone: 'Asia/Kolkata',
      twoFactorAuth: false,
      loginAttempts: 5,
      sessionTimeout: 30,
      emailNotifications: true,
      orderAlerts: true,
      userAlerts: true,
      weeklyReports: true,
      theme: 'light',
      sidebarCollapsed: false,
      compactMode: false,
      autoBackup: true,
      backupFrequency: 'daily',
      backupRetention: 30
    };
    setSettings(defaultSettings);
    toast.success('Settings reset to defaults');
  };

  const handlePasswordChange = () => {
    if (password.new !== password.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    if (password.new.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    // Here you would call API to change password
    toast.success('Password changed successfully!');
    setPassword({ current: '', new: '', confirm: '' });
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `baghaven-settings-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success('Settings exported successfully!');
  };

  const importSettings = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target.result);
        setSettings(prev => ({ ...prev, ...importedSettings }));
        toast.success('Settings imported successfully!');
      } catch (error) {
        toast.error('Invalid settings file');
      }
    };
    reader.readAsText(file);
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Site Name
          </label>
          <input
            type="text"
            value={settings.siteName}
            onChange={(e) => setSettings({...settings, siteName: e.target.value})}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 group-hover:border-gray-300"
          />
        </div>
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Site URL
          </label>
          <input
            type="url"
            value={settings.siteUrl}
            onChange={(e) => setSettings({...settings, siteUrl: e.target.value})}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 group-hover:border-gray-300"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Admin Email
          </label>
          <input
            type="email"
            value={settings.adminEmail}
            onChange={(e) => setSettings({...settings, adminEmail: e.target.value})}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 group-hover:border-gray-300"
          />
        </div>
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={settings.timezone}
            onChange={(e) => setSettings({...settings, timezone: e.target.value})}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 group-hover:border-gray-300 bg-white"
          >
            <option value="Asia/Kolkata">India (IST)</option>
            <option value="America/New_York">New York (EST)</option>
            <option value="Europe/London">London (GMT)</option>
            <option value="Asia/Tokyo">Tokyo (JST)</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <Lock size={20} />
          Change Password
        </h3>
        <div className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password.current}
                onChange={(e) => setPassword({...password, current: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl pr-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={password.new}
                onChange={(e) => setPassword({...password, new: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={password.confirm}
                onChange={(e) => setPassword({...password, confirm: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>
          
          <button
            onClick={handlePasswordChange}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200"
          >
            Change Password
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-5 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl hover:border-gray-300 transition-all duration-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-600">Add an extra layer of security</p>
            </div>
          </div>
          <button
            onClick={() => setSettings({...settings, twoFactorAuth: !settings.twoFactorAuth})}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ${
              settings.twoFactorAuth ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/30' : 'bg-gray-300'
            }`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 shadow-md ${
              settings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Max Login Attempts
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={settings.loginAttempts}
              onChange={(e) => setSettings({...settings, loginAttempts: parseInt(e.target.value)})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 group-hover:border-gray-300"
            />
          </div>
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              min="5"
              max="120"
              value={settings.sessionTimeout}
              onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 group-hover:border-gray-300"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-4">
      {[
        { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive email alerts', icon: <Mail size={20} /> },
        { key: 'orderAlerts', label: 'Order Alerts', desc: 'Notify on new orders', icon: <Bell size={20} /> },
        { key: 'userAlerts', label: 'User Alerts', desc: 'Notify on new registrations', icon: <User size={20} /> },
        { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Send weekly summary', icon: <Database size={20} /> }
      ].map((item) => (
        <div key={item.key} className="flex items-center justify-between p-5 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl hover:border-gray-300 transition-all duration-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
              settings[item.key] 
                ? 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-blue-500/20' 
                : 'bg-gray-200'
            }`}>
              <div className={settings[item.key] ? 'text-white' : 'text-gray-500'}>
                {item.icon}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{item.label}</h4>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          </div>
          <button
            onClick={() => setSettings({...settings, [item.key]: !settings[item.key]})}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ${
              settings[item.key] ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/30' : 'bg-gray-300'
            }`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 shadow-md ${
              settings[item.key] ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
      ))}
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-4">
          Theme Preference
        </label>
        <div className="grid grid-cols-3 gap-4">
          {['light', 'dark', 'auto'].map((theme) => (
            <button
              key={theme}
              onClick={() => setSettings({...settings, theme})}
              className={`p-6 border-2 rounded-2xl text-center transition-all duration-200 ${
                settings.theme === theme
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg shadow-blue-500/20'
                  : 'border-gray-300 hover:border-gray-400 bg-white hover:shadow-md'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl mx-auto mb-3 shadow-md ${
                theme === 'light' ? 'bg-gradient-to-br from-gray-100 to-gray-200' :
                theme === 'dark' ? 'bg-gradient-to-br from-gray-700 to-gray-900' :
                'bg-gradient-to-r from-gray-100 via-gray-400 to-gray-900'
              }`} />
              <span className="text-sm font-semibold capitalize text-gray-900">{theme}</span>
              {settings.theme === theme && (
                <div className="mt-2 flex justify-center">
                  <Check size={18} className="text-blue-600" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {[
          { key: 'sidebarCollapsed', label: 'Collapse Sidebar', desc: 'Auto-collapse sidebar on small screens', icon: <Palette size={20} /> },
          { key: 'compactMode', label: 'Compact Mode', desc: 'Use compact spacing for lists and tables', icon: <SettingsIcon size={20} /> }
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between p-5 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl hover:border-gray-300 transition-all duration-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                settings[item.key] 
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-purple-500/20' 
                  : 'bg-gray-200'
              }`}>
                <div className={settings[item.key] ? 'text-white' : 'text-gray-500'}>
                  {item.icon}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{item.label}</h4>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            </div>
            <button
              onClick={() => setSettings({...settings, [item.key]: !settings[item.key]})}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ${
                settings[item.key] ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 shadow-md ${
                settings[item.key] ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBackupSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-5 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl hover:border-gray-300 transition-all duration-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
            settings.autoBackup 
              ? 'bg-gradient-to-br from-green-500 to-emerald-500 shadow-green-500/20' 
              : 'bg-gray-200'
          }`}>
            <Database size={20} className={settings.autoBackup ? 'text-white' : 'text-gray-500'} />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Auto Backup</h4>
            <p className="text-sm text-gray-600">Automatically backup settings and data</p>
          </div>
        </div>
        <button
          onClick={() => setSettings({...settings, autoBackup: !settings.autoBackup})}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ${
            settings.autoBackup ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/30' : 'bg-gray-300'
          }`}
        >
          <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 shadow-md ${
            settings.autoBackup ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      </div>

      {settings.autoBackup && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Backup Frequency
            </label>
            <select
              value={settings.backupFrequency}
              onChange={(e) => setSettings({...settings, backupFrequency: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 group-hover:border-gray-300 bg-white"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Retention Days
            </label>
            <input
              type="number"
              min="1"
              max="365"
              value={settings.backupRetention}
              onChange={(e) => setSettings({...settings, backupRetention: parseInt(e.target.value)})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 group-hover:border-gray-300"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        <button
          onClick={exportSettings}
          className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-300 rounded-2xl hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200 group"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-200">
            <Download size={20} className="text-white" />
          </div>
          <span className="font-semibold text-gray-900">Export Settings</span>
        </button>
        
        <label className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-300 rounded-2xl hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-200 cursor-pointer group">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-200">
            <Upload size={20} className="text-white" />
          </div>
          <span className="font-semibold text-gray-900">Import Settings</span>
          <input
            type="file"
            accept=".json"
            onChange={importSettings}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20">
              <SettingsIcon className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-1">Customize your admin panel experience</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="px-5 py-2.5 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-white hover:border-gray-400 font-medium transition-all duration-200 hover:shadow-md"
            >
              Reset to Defaults
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200"
            >
              <Save size={18} />
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-6">
          <div className="flex space-x-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-medium text-sm rounded-xl transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {activeTab === 'general' && renderGeneralSettings()}
          {activeTab === 'security' && renderSecuritySettings()}
          {activeTab === 'notifications' && renderNotificationSettings()}
          {activeTab === 'appearance' && renderAppearanceSettings()}
          {activeTab === 'backup' && renderBackupSettings()}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md border border-gray-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-gray-600 text-sm font-medium">Auto-save enabled • Last saved: Just now</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;