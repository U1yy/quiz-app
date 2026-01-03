import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import Sidebar from './Sidebar';

const StudentResults = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const user =
    location.state?.user ||
    JSON.parse(localStorage.getItem("quizAppUser")) || null;

  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    
    const activities = JSON.parse(localStorage.getItem("quizActivities")) || [];
    const studentResults = activities.filter(activity => activity.studentEmail === user.email);
    setResults(studentResults);
  }, [user?.email]);

  const handleLogout = () => {
    localStorage.removeItem("quizAppUser");
    navigate("/login");
  };

  const getViolationCount = (result) => {
    if (result.tabSwitchViolations !== undefined) {
      return result.tabSwitchViolations;
    }
    if (!result.autoSubmitted) return 0;
    if (result.submitReason === 'tab-switch') return 3;
    return 0;
  };

  const getStatusBadge = (result) => {
    if (result.autoSubmitted) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Auto-Submitted
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Completed
      </span>
    );
  };

  const isScoreReleased = (result) => {
    return result.scoreReleased === true;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar user={user} onLogout={handleLogout} />

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-7xl mx-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Quiz Results</h1>
            <p className="text-gray-600">View your quiz submissions and scores</p>
          </div>

          {/* Results Cards */}
          {results.length === 0 ? (
            <Card>
              <CardContent className="p-12">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500 text-lg">No quiz results yet</p>
                  <p className="text-gray-400 text-sm mt-2">Complete a quiz to see your results here</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {results.map((result, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-bold text-gray-900">{result.quizTitle}</h3>
                          {getStatusBadge(result)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          {/* Score Section */}
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600 mb-1">Score</div>
                            {isScoreReleased(result) ? (
                              <div className="text-2xl font-bold text-gray-900">
                                {result.score}/{result.total}
                                <span className="text-base text-gray-500 ml-2">
                                  ({Math.round((result.score / result.total) * 100)}%)
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                  Pending Review
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Violations Section */}
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600 mb-1">Violations</div>
                            <div className="flex items-center gap-2">
                              <span className={`text-2xl font-bold ${
                                getViolationCount(result) > 0 ? 'text-red-600' : 'text-green-600'
                              }`}>
                                {getViolationCount(result)}
                              </span>
                              <span className="text-sm text-gray-500">
                                tab switch{getViolationCount(result) !== 1 ? 'es' : ''}
                              </span>
                            </div>
                          </div>

                          {/* Submission Time Section */}
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600 mb-1">Submitted</div>
                            <div className="text-sm font-medium text-gray-900">
                              {result.date}
                            </div>
                          </div>
                        </div>

                        {/* Warning message for auto-submitted */}
                        {result.autoSubmitted && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              <div>
                                <p className="text-sm font-medium text-red-800">
                                  This quiz was automatically submitted
                                </p>
                                <p className="text-xs text-red-600 mt-1">
                                  {result.submitReason === 'tab-switch' 
                                    ? 'You switched tabs or left the page 3 times during the quiz'
                                    : 'Time limit was reached'}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Pending score message */}
                        {!isScoreReleased(result) && (
                          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <p className="text-sm text-yellow-800">
                                Your score is pending review by the instructor. You'll be able to see your results once they're released.
                              </p>
                            </div>
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
          {results.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm text-gray-600 mb-1">Total Quizzes</div>
                  <div className="text-2xl font-bold text-gray-900">{results.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm text-gray-600 mb-1">Scores Released</div>
                  <div className="text-2xl font-bold text-green-600">
                    {results.filter(r => isScoreReleased(r)).length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm text-gray-600 mb-1">Pending Review</div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {results.filter(r => !isScoreReleased(r)).length}
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

export default StudentResults;