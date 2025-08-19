'use client';
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useApiAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { userService, ApiError } from '@/services';
import { UserCircle, Mail, Shield, ArrowLeft, Phone, Calendar, CheckCircle, XCircle, FileText, Edit, Camera, Key } from 'lucide-react';

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  // State for edit profile dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    bio: user?.bio || ''
  });

  // Update form when user data changes
  React.useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        phoneNumber: user.phoneNumber || '',
        bio: user.bio || ''
      });
    }
  }, [user]);
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Get user initials for the avatar fallback
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // Handle profile update
  const handleUpdateProfile = async () => {
    try {
      setIsLoading(true);
      await userService.updateProfile(editForm);
      await refreshUser();
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error) {
      const apiError = error as ApiError;
      toast({
        title: "Error",
        description: apiError.error || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await userService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword
      });
      setIsPasswordDialogOpen(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast({
        title: "Success",
        description: "Password changed successfully!",
      });
    } catch (error) {
      const apiError = error as ApiError;
      toast({
        title: "Error",
        description: apiError.error || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle photo upload
  const handlePhotoUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await userService.uploadProfileImage(selectedFile);
      await refreshUser();
      setIsPhotoDialogOpen(false);
      setSelectedFile(null);
      toast({
        title: "Success",
        description: `Profile photo updated successfully! File: ${result.upload.fileName}`,
      });
    } catch (error) {
      const apiError = error as ApiError;
      toast({
        title: "Error",
        description: apiError.error || "Failed to upload photo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Error",
          description: "File size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  // State for email verification
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerificationSent, setIsVerificationSent] = useState(false);

  // Handle email verification
  const handleSendVerification = async () => {
    try {
      setIsLoading(true);
      await userService.sendEmailVerification();
      setIsVerificationSent(true);
      setIsVerificationDialogOpen(true);
      toast({
        title: "Verification Email Sent",
        description: "Please check your email for the 6-digit verification code.",
      });
    } catch (error) {
      const apiError = error as ApiError;
      toast({
        title: "Error",
        description: apiError.error || "Failed to send verification email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle code verification
  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a 6-digit verification code",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await userService.verifyEmail(verificationCode);
      await refreshUser();
      setIsVerificationDialogOpen(false);
      setVerificationCode('');
      setIsVerificationSent(false);
      toast({
        title: "Success",
        description: "Email verified successfully!",
      });
    } catch (error) {
      const apiError = error as ApiError;
      toast({
        title: "Error",
        description: apiError.error || "Failed to verify email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <p className="text-center text-sm sm:text-base">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-10 px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => user.role === 'ADMIN' ? router.push('/admin/dashboard') : router.push('/student/dashboard')}
          className="mb-4 sm:mb-6 text-sm sm:text-base cursor-pointer"
        >
          <ArrowLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          Back
        </Button>
        
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 px-1">User Profile</h1>
        
        <Card className="mb-6 sm:mb-8">
          <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
            <CardTitle className="text-lg sm:text-xl">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-start gap-6 sm:gap-8 px-4 sm:px-6">
            <div className="flex flex-col items-center space-y-3 sm:space-y-4 w-full md:w-auto">
              <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
                <AvatarImage className='object-cover' src={user?.profileImage || "/placeholder.svg"} alt={user?.name || "User"} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl sm:text-4xl">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
              <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm cursor-pointer">
                    <Camera className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    Change Photo
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl">Change Profile Photo</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="photo" className="text-sm">Select Photo</Label>
                      <Input
                        id="photo"
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="mt-1 cursor-pointer hover:bg-gray-100 text-xs sm:text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
                      </p>
                    </div>
                    {selectedFile && (
                      <div className="space-y-2">
                        <div className="text-xs sm:text-sm text-muted-foreground break-all">
                          Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </div>
                        <div className="flex justify-center">
                          <img
                            src={URL.createObjectURL(selectedFile)}
                            alt="Preview"
                            className="max-w-24 max-h-24 sm:max-w-32 sm:max-h-32 object-cover rounded-lg border"
                          />
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                      <Button className='cursor-pointer text-sm' variant="outline" onClick={() => setIsPhotoDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button className='cursor-pointer text-sm' onClick={handlePhotoUpload} disabled={!selectedFile || isLoading}>
                        {isLoading ? 'Uploading...' : 'Upload'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="space-y-4 sm:space-y-6 flex-1 w-full">
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center">
                  <UserCircle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Full Name
                </p>
                <p className="text-base sm:text-lg font-medium break-words">{user.name || 'Not provided'}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center">
                  <Mail className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Email Address
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <p className="text-base sm:text-lg font-medium break-words">{user.email || 'Not provided'}</p>
                  <div className="flex items-center gap-2">
                    {user.isEmailVerified ? (
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                    )}
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {user.isEmailVerified ? 'Verified' : 'Not verified'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center">
                  <Phone className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Phone Number
                </p>
                <p className="text-base sm:text-lg font-medium break-words">{user.phoneNumber || 'Not provided'}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center">
                  <Shield className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Role
                </p>
                <p className="text-base sm:text-lg font-medium capitalize">{user.role || 'User'}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center">
                  <FileText className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Bio
                </p>
                <p className="text-base sm:text-lg font-medium break-words">{user.bio || 'No bio available'}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center">
                  <Calendar className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Member Since
                </p>
                <p className="text-base sm:text-lg font-medium">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Unknown'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 sm:mb-8">
          <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
            <CardTitle className="text-lg sm:text-xl">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-muted-foreground">Account Created</p>
                <p className="text-base sm:text-lg font-medium">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'Unknown'}
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-muted-foreground">Last Updated</p>
                <p className="text-base sm:text-lg font-medium">
                  {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'Unknown'}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-muted-foreground">User ID</p>
                <p className="text-xs sm:text-sm font-mono bg-gray-100 p-2 rounded break-all">
                  {user.id || 'Unknown'}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-muted-foreground">Email Status</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    {user.isEmailVerified ? (
                      <>
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                        <span className="text-green-600 font-medium text-sm">Verified</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                        <span className="text-red-600 font-medium text-sm">Not Verified</span>
                      </>
                    )}
                  </div>
                  {!user.isEmailVerified && (
                    <Button 
                      variant="link" 
                      className="text-blue-600 p-0 h-auto text-sm cursor-pointer"
                      onClick={handleSendVerification}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Sending...' : 'Verify Now'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-6 sm:mt-8 px-1">
          <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-sm sm:text-base cursor-pointer">
                <Key className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Change Password
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Change Password</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleChangePassword();
              }} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword" className="text-sm">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="mt-1 text-sm"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword" className="text-sm">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="mt-1 text-sm"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword" className="text-sm">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="mt-1 text-sm"
                    required
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsPasswordDialogOpen(false)} className="text-sm cursor-pointer">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading} className="text-sm cursor-pointer">
                    {isLoading ? 'Changing...' : 'Change Password'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button className='cursor-pointer text-sm sm:text-base'>
                <Edit className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Edit Profile</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm">Full Name</Label>
                  <Input
                    id="name"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber" className="text-sm">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={editForm.phoneNumber}
                    onChange={(e) => setEditForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="bio" className="text-sm">Bio</Label>
                  <Textarea
                    id="bio"
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    className="mt-1 text-sm"
                    rows={3}
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button className='cursor-pointer text-sm' variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateProfile} disabled={isLoading} className="text-sm cursor-pointer">
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Email Verification Dialog */}
          <Dialog open={isVerificationDialogOpen} onOpenChange={setIsVerificationDialogOpen}>
            <DialogContent className="w-[95vw] max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Verify Your Email</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  We&apos;ve sent a 6-digit verification code to your email address. 
                  Please enter the code below to verify your email.
                </p>
                <div>
                  <Label htmlFor="verificationCode" className="text-sm">Verification Code</Label>
                  <Input
                    id="verificationCode"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="mt-1 text-center text-base sm:text-lg tracking-widest"
                    maxLength={6}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Code expires in 10 minutes
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={handleSendVerification}
                    disabled={isLoading}
                    className="text-sm cursor-pointer"
                  >
                    {isLoading ? 'Sending...' : 'Resend Code'}
                  </Button>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => setIsVerificationDialogOpen(false)} className="text-sm cursor-pointer">
                      Cancel
                    </Button>
                    <Button onClick={handleVerifyCode} disabled={isLoading || verificationCode.length !== 6} className="text-sm cursor-pointer">
                      {isLoading ? 'Verifying...' : 'Verify'}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
