import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Sidebar from './Sidebar';

const Profile = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const user =
    location.state?.user ||
    JSON.parse(localStorage.getItem("quizAppUser")) || null;

  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    const savedImage = localStorage.getItem(`profileImage_${user.email}`);
    if (savedImage) {
      setProfileImage(savedImage);
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("quizAppUser");
    navigate("/login");
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setProfileImage(base64String);
        localStorage.setItem(`profileImage_${user.email}`, base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    localStorage.removeItem(`profileImage_${user.email}`);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar user={user} onLogout={handleLogout} />

      {/* Main Content Area*/}
      <div 
        className="flex-1 overflow-y-auto relative bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/profile_bg.svg')" }}
      >
        <div className="absolute inset-0 bg-white/30 pointer-events-none"></div>
        
        <div className="min-h-screen flex items-center justify-center p-8 relative z-10">
          <Card className="w-full max-w-4xl bg-white shadow-xl rounded-3xl">
            <CardContent className="p-12">
              {/* Profile Title */}
              <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>

              {/* Profile Content */}
              <div className="flex gap-12 items-start bg-white/80 p-6 rounded-xl shadow-lg">
                {/* Profile Picture */}
                <div className="shrink-0">
                  <div className="w-72 h-72 bg-gray-200 rounded-xl border-2 border-gray-400 flex items-center justify-center overflow-hidden relative group">
                    {profileImage ? (
                      <>
                        <img 
                          src={profileImage} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                          <label htmlFor="profile-upload" className="cursor-pointer">
                            <Button className="bg-white text-gray-900 hover:bg-gray-100">
                              Change Photo
                            </Button>
                          </label>
                          <Button 
                            onClick={handleRemoveImage}
                            variant="destructive"
                            className="bg-red-500 hover:bg-red-600 text-white"
                          >
                            Remove Photo
                          </Button>
                        </div>
                      </>
                    ) : (
                      <label 
                        htmlFor="profile-upload" 
                        className="cursor-pointer w-full h-full flex flex-col items-center justify-center hover:bg-gray-300 transition-colors"
                      >
                        <svg className="w-24 h-24 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <p className="text-sm text-gray-500">Click to Upload Photo</p>
                      </label>
                    )}
                  </div>
                  <input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Profile Information */}
                <div className="flex-1 space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Name:
                    </label>
                    <p className="text-gray-600 text-lg">
                      {user?.name || user?.email || 'N/A'}
                    </p>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Email:
                    </label>
                    <p className="text-gray-600 text-lg">
                      {user?.email || 'N/A'}
                    </p>
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Role:
                    </label>
                    <p className="text-gray-600 text-lg">
                      {user?.role || 'Student'}
                    </p>
                  </div>

                  {/* Course */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Course:
                    </label>
                    <p className="text-gray-600 text-lg"> 
                      Bachelor of Science in Computer Science
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;