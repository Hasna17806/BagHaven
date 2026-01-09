import { useSocket } from '../../context/SocketContext';

const UserManagement = () => {
  const { emitAdminUpdate } = useSocket();

  const updateUser = async (userId, updates) => {
    try {
      const response = await API.put(`/admin/users/${userId}`, updates);
      
      // Emit real-time update
      emitAdminUpdate('user-updated', {
        userId,
        updates,
        timestamp: new Date().toISOString(),
        admin: getAdminEmail()
      });
      
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const deleteUser = async (userId) => {
    try {
      await API.delete(`/admin/users/${userId}`);
      
      // Emit real-time update
      emitAdminUpdate('user-deleted', {
        userId,
        timestamp: new Date().toISOString(),
        admin: getAdminEmail()
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };
};