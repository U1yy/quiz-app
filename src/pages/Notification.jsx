import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import Sidebar from './Sidebar';
import { Bell, CheckCircle, Clock, User, Award, AlertCircle } from 'lucide-react';

const Notification = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const user =
    location.state?.user ||
    JSON.parse(localStorage.getItem("quizAppUser")) || null;

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;

    // Mark all as read when entering the page
    markAllAsRead();
    loadNotifications();
  }, [user]);

  const loadNotifications = () => {
    const activities = JSON.parse(localStorage.getItem("quizActivities")) || [];
    const users = JSON.parse(localStorage.getItem("quizAppUsers")) || [];

    // Filter student's quiz submissions
    const studentActivities = activities.filter(
      activity => activity.studentEmail === user.email
    );

    // Create notifications from activities
    const notifs = studentActivities.map((activity, index) => {
      // Find instructor who might have released the score
      const instructor = users.find(u => u.role === 'instructor');

      const isReleased = activity.scoreReleased === true;
      const submissionDate = new Date(activity.date || Date.now());

      return {
        id: activity.id || `notif_${index}`,
        type: isReleased ? 'score_released' : 'submission_confirmed',
        quizTitle: activity.quizTitle,
        score: activity.score,
        total: activity.total,
        violations: activity.tabSwitchViolations || 0,
        autoSubmitted: activity.autoSubmitted,
        timestamp: submissionDate,
        relativeTime: getRelativeTime(submissionDate),
        instructor: instructor ? {
          name: instructor.name,
          email: instructor.email
        } : {
          name: 'Quiz Administrator',
          email: 'admin@quizmaster.com'
        },
        isReleased: isReleased
      };
    });

    // Sort by timestamp (newest first)
    notifs.sort((a, b) => b.timestamp - a.timestamp);

    setNotifications(notifs);
  };

  const getRelativeTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const markAllAsRead = () => {
    const activities = JSON.parse(localStorage.getItem("quizActivities")) || [];
    const studentActivities = activities.filter(
      activity => activity.studentEmail === user.email
    );

    const allIds = studentActivities.map((activity, index) =>
      activity.id || `notif_${index}`
    );

    localStorage.setItem(
      `notifications_read_${user.email}`,
      JSON.stringify(allIds)
    );
  };

  const handleNotificationClick = (notification) => {
    if (notification.isReleased) {
      navigate('/student-results', { state: { user } });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("quizAppUser");
    localStorage.removeItem("quizAppLoggedIn");
    localStorage.removeItem("quizAppRole");
    navigate("/login");
  };

  const getNotificationIcon = (notification) => {
    if (notification.isReleased) {
      return <CheckCircle className="w-6 h-6 text-green-600" />;
    }
    if (notification.autoSubmitted) {
      return <AlertCircle className="w-6 h-6 text-red-600" />;
    }
    return <Clock className="w-6 h-6 text-yellow-600" />;
  };

  const getNotificationTitle = (notification) => {
    if (notification.isReleased) {
      return `Score Released: ${notification.quizTitle}`;
    }
    if (notification.autoSubmitted) {
      return `Quiz Auto-Submitted: ${notification.quizTitle}`;
    }
    return `Quiz Submitted: ${notification.quizTitle}`;
  };

  const getNotificationMessage = (notification) => {
    if (notification.isReleased) {
      return `Your score for ${notification.quizTitle} has been released by ${notification.instructor.name}. You scored ${notification.score}/${notification.total} (${Math.round((notification.score / notification.total) * 100)}%).`;
    }
    if (notification.autoSubmitted) {
      return `Your quiz was automatically submitted due to ${notification.violations >= 3 ? 'multiple tab switches' : 'time limit'}. The instructor will review your submission.`;
    }
    return `You have successfully submitted ${notification.quizTitle}. Your instructor will review and release your score soon.`;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar user={user} onLogout={handleLogout} />

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-5xl mx-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <Bell className="w-8 h-8 text-gray-700" />
                  Notifications
                </h1>
                <p className="text-gray-600">Stay updated on your quiz submissions and scores</p>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="p-12">
                <div className="text-center">
                  <Bell className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500 text-lg">No notifications yet</p>
                  <p className="text-gray-400 text-sm mt-2">
                    You'll receive notifications when you submit quizzes and when scores are released
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className="cursor-pointer transition-all hover:shadow-lg hover:bg-gray-50"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                        notification.isReleased
                          ? 'bg-green-100'
                          : notification.autoSubmitted
                          ? 'bg-red-100'
                          : 'bg-yellow-100'
                      }`}>
                        {getNotificationIcon(notification)}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        {/* Title */}
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            {getNotificationTitle(notification)}
                          </h3>
                        </div>

                        {/* Message */}
                        <p className="text-gray-700 mb-3">
                          {getNotificationMessage(notification)}
                        </p>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                          {/* Score (if released) */}
                          {notification.isReleased && (
                            <div className="flex items-center gap-2 text-sm">
                              <Award className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-600">
                                Score: <span className="font-semibold text-gray-900">
                                  {notification.score}/{notification.total}
                                </span>
                              </span>
                            </div>
                          )}

                          {/* Violations */}
                          <div className="flex items-center gap-2 text-sm">
                            <AlertCircle className={`w-4 h-4 ${
                              notification.violations > 0 ? 'text-red-500' : 'text-green-500'
                            }`} />
                            <span className="text-gray-600">
                              Violations: <span className={`font-semibold ${
                                notification.violations > 0 ? 'text-red-600' : 'text-green-600'
                              }`}>
                                {notification.violations}
                              </span>
                            </span>
                          </div>

                          {/* Instructor */}
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600 truncate">
                              {notification.instructor.name}
                            </span>
                          </div>

                          {/* Time */}
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600">
                              {notification.relativeTime}
                            </span>
                          </div>
                        </div>

                        {!notification.isReleased && (
                          <div className="inline-flex items-center gap-2 text-sm text-yellow-700 bg-yellow-100 px-3 py-1.5 rounded-full">
                            <Clock className="w-4 h-4" />
                            Pending instructor review
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Summary Stats */}
          {notifications.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm text-gray-600 mb-1">Total Notifications</div>
                  <div className="text-2xl font-bold text-gray-900">{notifications.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm text-gray-600 mb-1">Scores Released</div>
                  <div className="text-2xl font-bold text-green-600">
                    {notifications.filter(n => n.isReleased).length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm text-gray-600 mb-1">Pending Review</div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {notifications.filter(n => !n.isReleased).length}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notification;