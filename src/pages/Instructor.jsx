import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Send, AlertCircle } from 'lucide-react';

const Instructor = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const user =
    location.state?.user ||
    JSON.parse(localStorage.getItem("quizAppUser")) || null;

  //State for submissions
  const [allSubmissions, setAllSubmissions] = useState([]);

  // State for notification
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  // State for loading
  const [isReleasing, setIsReleasing] = useState(false);
  const [releasingId, setReleasingId] = useState(null);

  // State for success view
  const [resultsReleased, setResultsReleased] = useState(false);
  const [releasedCount, setReleasedCount] = useState(0);

  // Check authentication
  useEffect(() => {
    if (!user || user.role !== 'instructor') {
      navigate("/login", { state: { role: 'instructor' } });
    }
  }, [user, navigate]);

  // Load all quiz submissions from localStorage
  useEffect(() => {
    loadAllQuizSubmissions();
  }, []);

  // Load all quiz submissions
  const loadAllQuizSubmissions = () => {
    const activities = JSON.parse(localStorage.getItem("quizActivities")) || [];

    // Map all activities to submission format with index for sorting
    const mappedSubmissions = activities.map((activity, index) => ({
      id: activity.id || `${activity.studentEmail}_${activity.quizTitle}_${Date.now()}`,
      name: activity.studentName || activity.studentEmail.split('@')[0],
      email: activity.studentEmail,
      quizTitle: activity.quizTitle,
      score: activity.score,
      total: activity.total,
      violations: activity.tabSwitchViolations || (activity.autoSubmitted && activity.submitReason === 'tab-switch' ? 3 : 0),
      timestamp: activity.date,
      released: activity.scoreReleased || false,
      autoSubmitted: activity.autoSubmitted || false,
      submissionIndex: index
    }));

    // Sort by submission index in REVERSE (newest first, oldest last)
    const sortedSubmissions = mappedSubmissions.sort((a, b) => b.submissionIndex - a.submissionIndex);

    setAllSubmissions(sortedSubmissions);
  };

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Release individual result
  const releaseIndividualResult = (submissionId) => {
    const submission = allSubmissions.find(s => s.id === submissionId);

    if (!submission) {
      showNotification('Submission not found', 'error');
      return;
    }

    if (submission.released) {
      showNotification(`Result already released for ${submission.name}`, 'info');
      return;
    }

    setReleasingId(submissionId);

    try {
      // Update the activity in localStorage
      const activities = JSON.parse(localStorage.getItem("quizActivities")) || [];
      const updatedActivities = activities.map(activity => {
        if (activity.studentEmail === submission.email &&
            activity.quizTitle === submission.quizTitle &&
            activity.date === submission.timestamp) {
          return { ...activity, scoreReleased: true };
        }
        return activity;
      });

      localStorage.setItem("quizActivities", JSON.stringify(updatedActivities));

      // Update local state
      setAllSubmissions(prev =>
        prev.map(s =>
          s.id === submissionId ? { ...s, released: true } : s
        )
      );

      // Show success view
      setReleasedCount(1);
      setResultsReleased(true);
    } catch (error) {
      console.error('Error releasing individual result:', error);
      showNotification('Failed to release result', 'error');
    } finally {
      setReleasingId(null);
    }
  };

  // Release all results
  const releaseAllResults = () => {
    const unreleasedSubmissions = allSubmissions.filter(s => !s.released);

    if (unreleasedSubmissions.length === 0) {
      showNotification('All results have already been released', 'info');
      return;
    }

    setIsReleasing(true);

    try {
      // Update all activities in localStorage
      const activities = JSON.parse(localStorage.getItem("quizActivities")) || [];
      const updatedActivities = activities.map(activity => {
        // Check if this activity should be released
        const shouldRelease = unreleasedSubmissions.some(sub =>
          activity.studentEmail === sub.email &&
          activity.quizTitle === sub.quizTitle &&
          activity.date === sub.timestamp &&
          !activity.scoreReleased
        );

        if (shouldRelease) {
          return { ...activity, scoreReleased: true };
        }
        return activity;
      });

      localStorage.setItem("quizActivities", JSON.stringify(updatedActivities));

      // Update all submissions to released
      setAllSubmissions(prev =>
        prev.map(s => {
          const shouldRelease = unreleasedSubmissions.some(us => us.id === s.id);
          return shouldRelease ? { ...s, released: true } : s;
        })
      );

      // Show success view
      setReleasedCount(unreleasedSubmissions.length);
      setResultsReleased(true);
    } catch (error) {
      console.error('Error releasing all results:', error);
      showNotification('Failed to release all results', 'error');
    } finally {
      setIsReleasing(false);
    }
  };

  // Handle back to dashboard
  const handleBackToDashboard = () => {
    setResultsReleased(false);
    loadAllQuizSubmissions(); // Reload data
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("quizAppUser");
    localStorage.removeItem("quizAppLoggedIn");
    localStorage.removeItem("quizAppRole");
    navigate("/login", { state: { role: 'instructor' } });
  };

  // Get count of unreleased results
  const unreleasedCount = allSubmissions.filter(s => !s.released).length;
  const allReleased = unreleasedCount === 0;
  const totalUnreleased = allSubmissions.filter(s => !s.released).length;

  // Success View
  if (resultsReleased) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-8"
        style={{
          backgroundImage: "url('/results_bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="text-center max-w-2xl">
          {/* Check Icon with Glow */}
          <div className="relative inline-flex items-center justify-center mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-40 h-40 bg-[#b8e6ea] rounded-full blur-3xl opacity-60"></div>
            </div>
            <div className="relative w-32 h-32 rounded-full flex items-center justify-center border-4 border-black bg-white">
              <img src="/checkicon.svg" alt="Success" className="w-16 h-16" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Results Successfully Released
          </h2>

          {/* Message */}
          <p className="text-lg text-gray-700 mb-12 max-w-xl mx-auto">
            {releasedCount === 1
              ? "The student can now view their quiz score on their dashboard."
              : `${releasedCount} results released. Students can now view their quiz scores on their dashboards.`
            }
          </p>

          {/* Button */}
          <button
            onClick={handleBackToDashboard}
            className="bg-[#a8dfe3] hover:bg-[#96d5d9] text-gray-900 font-semibold px-12 py-4 rounded-full text-lg shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Main Dashboard View
  return (
    <div className="min-h-screen bg-linear-to-br from-[#d4f1f4] via-[#c8e9ec] to-[#b8dfe3]">
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div
            className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg ${
              notification.type === 'success'
                ? 'bg-green-500 text-white'
                : notification.type === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-blue-500 text-white'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : notification.type === 'error' ? (
              <XCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm px-8 py-4 h-24">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-full">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img src="/quizmaster.svg" alt="Logo" className="h-12 w-auto" />
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-12">
            <button
              onClick={() => navigate('/Instructor', { state: { user } })}
              className="text-gray-600 hover:text-[#1a3a5f] transition-colors font-thin text-xl"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/Profile', { state: { user } })}
              className="text-gray-600 hover:text-[#1a3a5f] transition-colors font-thin text-xl"
            >
              Profile
            </button>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="bg-[#1a3a5f] hover:bg-[#2d5a88] text-white px-8 py-2.5 rounded-full font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Welcome Banner */}
        <div className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden">
          <div className="flex items-center justify-between p-8">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Welcome back! Let's continue your learning journey
              </h1>
              <p className="text-gray-600 text-base leading-relaxed max-w-xl">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus.
                Suspendisse lectus tortor,
              </p>
            </div>
            <div className="shrink-0 ml-8">
              <img
                src="/image-assets.png"
                alt="Learning illustration"
                className="w-80 h-auto"
              />
            </div>
          </div>
        </div>

        {/* Results Table */}
        {allSubmissions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 text-lg">No submissions yet</p>
              <p className="text-gray-400 text-sm mt-2">Student submissions will appear here once they complete quizzes</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden text-center">
            {/* Table Header */}
            <div className="bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-7 gap-4 px-8 py-5">
                <div className="text-gray-700 font-semibold text-base">Name</div>
                <div className="text-gray-700 font-semibold text-base">Quiz/Subject</div>
                <div className="text-gray-700 font-semibold text-base">Score</div>
                <div className="text-gray-700 font-semibold text-base">Violations</div>
                <div className="text-gray-700 font-semibold text-base">Timestamp</div>
                <div className="text-gray-700 font-semibold text-base">Status</div>
                <div className="text-gray-700 font-semibold text-base text-center">Action</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {allSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className={`grid grid-cols-7 gap-4 px-8 py-6 hover:bg-gray-50 transition-colors ${
                    submission.released ? 'bg-green-50' : ''
                  }`}
                >
                  <div className="text-gray-800 text-base flex items-center">
                    {submission.name}
                  </div>
                  <div className="text-gray-800 text-base font-medium">
                    {submission.quizTitle}
                  </div>
                  <div className="text-gray-800 text-base">
                    {submission.score}/{submission.total}
                    <span className="text-gray-500 text-sm ml-1">
                      ({Math.round((submission.score / submission.total) * 100)}%)
                    </span>
                  </div>
                  <div className={`text-base font-medium ${
                    submission.violations > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {submission.violations}
                  </div>
                  <div className="text-gray-800 text-base">{submission.timestamp}</div>
                  <div>
                    {submission.autoSubmitted ? (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Auto-Submitted
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Completed
                      </span>
                    )}
                  </div>
                  <div className="flex justify-center">
                    {submission.released ? (
                      <span className="text-green-600 font-medium text-sm flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Released
                      </span>
                    ) : (
                      <button
                        onClick={() => releaseIndividualResult(submission.id)}
                        disabled={releasingId === submission.id}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {releasingId === submission.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            Releasing...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Release
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Release Results Button */}
            <div className="flex justify-between items-center px-8 py-8 bg-gray-50">
              <div className="text-sm text-gray-600">
                {allReleased ? (
                  <span className="text-green-600 font-medium flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    All results have been released to students
                  </span>
                ) : (
                  <span>
                    Click "Release Results" to release all pending results at once
                  </span>
                )}
              </div>
              <button
                onClick={releaseAllResults}
                disabled={isReleasing || allReleased || allSubmissions.length === 0}
                className="bg-[#f9c74f] hover:bg-[#f8b92e] text-gray-900 px-10 py-3 rounded-full font-semibold text-base shadow-md hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
              >
                {isReleasing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-900 border-t-transparent"></div>
                    Releasing Results...
                  </>
                ) : (
                  <>
                    Release Results
                    {!allReleased && unreleasedCount > 0 && (
                      <span className="bg-gray-900 text-white px-2 py-1 rounded-full text-xs ml-2">
                        {unreleasedCount}
                      </span>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Summary Statistics */}
        {allSubmissions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="text-sm text-gray-600 mb-1">Total Submissions</div>
              <div className="text-2xl font-bold text-gray-900">{allSubmissions.length}</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="text-sm text-gray-600 mb-1">Released</div>
              <div className="text-2xl font-bold text-green-600">
                {allSubmissions.filter(s => s.released).length}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="text-sm text-gray-600 mb-1">Pending</div>
              <div className="text-2xl font-bold text-orange-600">{totalUnreleased}</div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Instructor;