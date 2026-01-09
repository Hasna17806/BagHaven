import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import AdminSidebar from "./components/AdminSidebar";
import AdminNavbar from "./components/AdminNavbar";
import { useSocket } from "../context/SocketContext";
import toast from "react-hot-toast";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { socket, isConnected } = useSocket();
  const [adminUpdates, setAdminUpdates] = useState([]);

  useEffect(() => {
    if (socket && isConnected) {
      socket.emit('join-admin-room');
      console.log('👑 Admin joined socket room');
    }
  }, [socket, isConnected]);

  // Listen for admin updates
  useEffect(() => {
    if (!socket) return;

    const handleAdminUpdate = (data) => {
      console.log('⚡ Admin update received:', data);
      
      // Add to updates list
      setAdminUpdates(prev => [data, ...prev.slice(0, 9)]);
      
      // Show toast notification based on type
      switch(data.type) {
        case 'user-updated':
          toast.success(`User ${data.data.email} updated`);
          break;
        case 'user-deleted':
          toast.success(`User ${data.data.email} deleted`);
          break;
        case 'user-status-changed':
          toast.success(`User ${data.data.email} status: ${data.data.status}`);
          break;
        default:
          toast.success(`Action completed: ${data.type}`);
      }
    };

    socket.on('admin-update', handleAdminUpdate);
    socket.on('user-updated', handleAdminUpdate);

    return () => {
      socket.off('admin-update', handleAdminUpdate);
      socket.off('user-updated', handleAdminUpdate);
    };
  }, [socket]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Connection Status */}
      {!isConnected && (
        <div className="fixed top-4 right-4 z-50">
          <div className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-800 rounded-full text-sm font-semibold shadow-md">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            Offline - Updates may be delayed
          </div>
        </div>
      )}
      
      {/* Sidebar */}
      <AdminSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      {/* Main Content Area */}
      <div className="lg:pl-72 min-h-screen">
        {/* Navbar */}
        <AdminNavbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        {/* Page Content */}
        <main className="min-h-[calc(100vh-68px)]">
          <div className="p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Admin Updates Log (Bottom Right) */}
      <div className="fixed bottom-4 right-4 z-40">
        {adminUpdates.slice(0, 3).map((update, index) => (
          <div
            key={index}
            className="mb-2 p-4 bg-white rounded-xl shadow-lg border border-gray-200 w-80 transform transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${
                update.type.includes('user') ? 'bg-blue-100' :
                update.type.includes('order') ? 'bg-green-100' :
                update.type.includes('product') ? 'bg-orange-100' :
                'bg-purple-100'
              }`}>
                <span className="text-xs font-bold">
                  {update.type.includes('user') ? '👤' :
                   update.type.includes('order') ? '📦' :
                   update.type.includes('product') ? '🛍️' : '⚡'}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  {update.type.replace(/-/g, ' ')}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {update.data?.email || update.data?.admin || 'System'}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(update.data?.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminLayout;