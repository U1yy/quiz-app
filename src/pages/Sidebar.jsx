import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

const Sidebar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const menuItems = [
    { icon: '/dashboard-icon.svg', label: 'Dashboard', path: '/student_dashboard' },
    { icon: '/results.png', label: 'Quiz Results', path: '/student-results' },
    { icon: 'bell', label: 'Notifications', path: '/notifications', hasNotification: true },
    { icon: '/profile-icon.svg', label: 'Profile', path: '/Profile' }
  ];

  // Load unread notifications count
  useEffect(() => {
    if (!user) return;

    const loadUnreadCount = () => {
      const activities = JSON.parse(localStorage.getItem("quizActivities")) || [];
      const studentActivities = activities.filter(
        activity => activity.studentEmail === user.email && activity.scoreReleased === true
      );

      const readNotifications = JSON.parse(
        localStorage.getItem(`notifications_read_${user.email}`) || '[]'
      );

      const unread = studentActivities.filter(
        activity => !readNotifications.includes(activity.id)
      ).length;

      setUnreadCount(unread);
    };

    loadUnreadCount();

    // Reload count periodically
    const interval = setInterval(loadUnreadCount, 3000);
    return () => clearInterval(interval);
  }, [user, location.pathname]);

  const handleNavigate = (path) => {
    // Force navigation with state to ensure proper routing
    navigate(path, { state: { user }, replace: false });
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <div className="w-64 h-screen bg-gray-50 border-r border-gray-200 flex flex-col">

        {/* Logo (clickable) */}
        <div
          onClick={() => handleNavigate('/student_dashboard')}
          className="h-32 flex items-center justify-center border-b border-gray-200 cursor-pointer"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleNavigate('/student_dashboard')}
        >
          <img
            src="/quizmaster.svg"
            alt="Logo"
            className="w-40 h-24 object-contain"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <li key={index}>
                <button
                  onClick={() => handleNavigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left relative ${
                    isActive(item.path)
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {/* Icon */}
                  {item.icon === 'bell' ? (
                    <Bell className="w-6 h-6" />
                  ) : (
                    <img src={item.icon} alt={item.label} className="w-6 h-6" />
                  )}

                  {/* Label */}
                  <span className="font-medium inline-block transition-transform duration-150 hover:scale-105">
                    {item.label}
                  </span>

                  {/* Unread Badge */}
                  {item.hasNotification && unreadCount > 0 && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <Button
            onClick={() => setShowLogoutWarning(true)}
            className="w-full bg-red-400 hover:bg-red-700 text-gray-100 font-medium py-3 rounded-full"
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Logout Warning Modal */}
      {showLogoutWarning && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Confirm Logout</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to log out?
            </p>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowLogoutWarning(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={onLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;