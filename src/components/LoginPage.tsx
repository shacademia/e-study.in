import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../hooks/useMockAuth';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(signInData.email, signInData.password);
      // Navigation will be handled by auth state change
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signUpData.password !== signUpData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await signUp(signUpData.email, signUpData.password, signUpData.name);
      // Navigation will be handled by auth state change
    } catch (error) {
      console.error('Sign up error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4" data-id="vord6mqvg" data-path="src/components/LoginPage.tsx">
      <Card className="w-full max-w-md" data-id="xmga1e3fi" data-path="src/components/LoginPage.tsx">
        <CardHeader className="text-center" data-id="l9aqdlosu" data-path="src/components/LoginPage.tsx">
          <div className="flex justify-center mb-4" data-id="mzjhm16lp" data-path="src/components/LoginPage.tsx">
            <GraduationCap className="h-12 w-12 text-blue-600" data-id="lzo1qglwf" data-path="src/components/LoginPage.tsx" />
          </div>
          <CardTitle className="text-2xl font-bold" data-id="uaukpg9pw" data-path="src/components/LoginPage.tsx">ExamPortal</CardTitle>
          <CardDescription data-id="2puub4dix" data-path="src/components/LoginPage.tsx">Advanced Exam Management System</CardDescription>
        </CardHeader>
        <CardContent data-id="72kzq24ug" data-path="src/components/LoginPage.tsx">
          <Tabs defaultValue="signin" className="w-full" data-id="8vfdjepve" data-path="src/components/LoginPage.tsx">
            <TabsList className="grid w-full grid-cols-2" data-id="uzvvvvc96" data-path="src/components/LoginPage.tsx">
              <TabsTrigger value="signin" data-id="kmspnnqou" data-path="src/components/LoginPage.tsx">Sign In</TabsTrigger>
              <TabsTrigger value="signup" data-id="q8y71u723" data-path="src/components/LoginPage.tsx">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" data-id="jhym7crpn" data-path="src/components/LoginPage.tsx">
              <Card data-id="s4q0iovsm" data-path="src/components/LoginPage.tsx">
                <CardHeader data-id="x7d8u8byp" data-path="src/components/LoginPage.tsx">
                  <CardTitle data-id="xihdiabkc" data-path="src/components/LoginPage.tsx">Sign In</CardTitle>
                  <CardDescription data-id="8dsgdpifj" data-path="src/components/LoginPage.tsx">
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2" data-id="em5b82a8o" data-path="src/components/LoginPage.tsx">
                  <form onSubmit={handleSignIn} className="space-y-4" data-id="3ru7m5c54" data-path="src/components/LoginPage.tsx">
                    <div className="space-y-1" data-id="rhcsx1nkd" data-path="src/components/LoginPage.tsx">
                      <div className="relative" data-id="2dmxqh8no" data-path="src/components/LoginPage.tsx">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" data-id="w16ih3ncc" data-path="src/components/LoginPage.tsx" />
                        <Input
                          type="email"
                          placeholder="Email"
                          className="pl-10"
                          value={signInData.email}
                          onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                          required data-id="d6o1de04s" data-path="src/components/LoginPage.tsx" />

                      </div>
                    </div>
                    <div className="space-y-1" data-id="antkfn8nf" data-path="src/components/LoginPage.tsx">
                      <div className="relative" data-id="k9yaaotng" data-path="src/components/LoginPage.tsx">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" data-id="1kvo3t768" data-path="src/components/LoginPage.tsx" />
                        <Input
                          type="password"
                          placeholder="Password"
                          className="pl-10"
                          value={signInData.password}
                          onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                          required data-id="nr71i5he8" data-path="src/components/LoginPage.tsx" />

                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading} data-id="yqmljlhlp" data-path="src/components/LoginPage.tsx">
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>
                  
                  <div className="mt-4 text-center" data-id="zrhf2t5cg" data-path="src/components/LoginPage.tsx">
                    <p className="text-sm text-muted-foreground" data-id="bs0e9ckqw" data-path="src/components/LoginPage.tsx">
                      Demo: Use <strong data-id="54yuvp3tr" data-path="src/components/LoginPage.tsx">admin@example.com</strong> for admin access
                    </p>
                    <p className="text-sm text-muted-foreground" data-id="lymovcdmd" data-path="src/components/LoginPage.tsx">
                      Or any other email for student access
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="signup" data-id="1ntmzhcao" data-path="src/components/LoginPage.tsx">
              <Card data-id="ivbhslaqu" data-path="src/components/LoginPage.tsx">
                <CardHeader data-id="fa0jcjno7" data-path="src/components/LoginPage.tsx">
                  <CardTitle data-id="dgs6yny88" data-path="src/components/LoginPage.tsx">Sign Up</CardTitle>
                  <CardDescription data-id="j5eanobjf" data-path="src/components/LoginPage.tsx">
                    Create a new account to get started
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2" data-id="0uvew38r3" data-path="src/components/LoginPage.tsx">
                  <form onSubmit={handleSignUp} className="space-y-4" data-id="5l9sjczz3" data-path="src/components/LoginPage.tsx">
                    <div className="space-y-1" data-id="l658sjzjc" data-path="src/components/LoginPage.tsx">
                      <div className="relative" data-id="ffwv5z4vh" data-path="src/components/LoginPage.tsx">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" data-id="929ugwh0e" data-path="src/components/LoginPage.tsx" />
                        <Input
                          type="text"
                          placeholder="Full Name"
                          className="pl-10"
                          value={signUpData.name}
                          onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                          required data-id="vma6mcnuz" data-path="src/components/LoginPage.tsx" />

                      </div>
                    </div>
                    <div className="space-y-1" data-id="5tan8opk8" data-path="src/components/LoginPage.tsx">
                      <div className="relative" data-id="5m1hikers" data-path="src/components/LoginPage.tsx">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" data-id="7kd9z4gl4" data-path="src/components/LoginPage.tsx" />
                        <Input
                          type="email"
                          placeholder="Email"
                          className="pl-10"
                          value={signUpData.email}
                          onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                          required data-id="4worb2mej" data-path="src/components/LoginPage.tsx" />

                      </div>
                    </div>
                    <div className="space-y-1" data-id="nomqnyb3x" data-path="src/components/LoginPage.tsx">
                      <div className="relative" data-id="e2x35x7u7" data-path="src/components/LoginPage.tsx">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" data-id="k3fopvdgk" data-path="src/components/LoginPage.tsx" />
                        <Input
                          type="password"
                          placeholder="Password"
                          className="pl-10"
                          value={signUpData.password}
                          onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                          required data-id="78qvwsew7" data-path="src/components/LoginPage.tsx" />

                      </div>
                    </div>
                    <div className="space-y-1" data-id="3r3qddclw" data-path="src/components/LoginPage.tsx">
                      <div className="relative" data-id="u78t4zrhd" data-path="src/components/LoginPage.tsx">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" data-id="zlc6t2p6r" data-path="src/components/LoginPage.tsx" />
                        <Input
                          type="password"
                          placeholder="Confirm Password"
                          className="pl-10"
                          value={signUpData.confirmPassword}
                          onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                          required data-id="pqwv7tuu4" data-path="src/components/LoginPage.tsx" />

                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading} data-id="5diy61480" data-path="src/components/LoginPage.tsx">
                      {loading ? 'Creating account...' : 'Sign Up'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>);

};

export default LoginPage;