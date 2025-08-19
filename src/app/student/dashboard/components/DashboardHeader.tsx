import React from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, Trophy, Menu, X, UserCog, LogOut } from "lucide-react";
import { UserProfileMenu } from "@/components/UserProfileMenu";
import { useAuth } from "@/hooks/useApiAuth";
import { DashboardHeaderProps } from "../types";
import { useRouter } from 'next/navigation';

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onRankingsClick }) => {
  const { user } = useAuth();
  const { logout } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  console.log('This is the data From dashboard', user);

  return (
    <header className="bg-white md:shadow-sm shadow-xs border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main header content */}
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo and title - simplified for mobile */}
          <div className="flex items-center">
            <BookOpen className="md:h-8 md:w-8 h-6 w-6 text-blue-600 mr-3" />
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              <span className="hidden sm:inline">Student Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </h1>
          </div>

          {/* Desktop navigation - clean and simple */}
          <div className="hidden sm:flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onRankingsClick}
              className="h-9"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Rankings
            </Button>
            {user && <UserProfileMenu user={user} />}
          </div>
          
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden h-8 w-8 p-0"
            >
              {isMobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
        </div>

        {/* Mobile dropdown - minimal and clean */}
        {isMobileMenuOpen && (
          <div className="sm:hidden">
            <div className="border bg-gray-50/50 px-4 py-3 rounded-2xl shadow-2xs mb-3">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-10 text-gray-700 hover:bg-white hover:text-gray-900"
                onClick={() => {
                  onRankingsClick();
                  setIsMobileMenuOpen(false);
                }}
              >
                <Trophy className="h-4 w-4 mr-3" />
                Rankings
              </Button>
              {user && (
              <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-10 text-gray-700 hover:bg-white hover:text-gray-900"
                    onClick={() => {
                      router.push('/profile');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <UserCog className="h-4 w-4 mr-3" />
                    Profile
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-10 text-gray-700 hover:bg-white hover:text-gray-900"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Log Out
                  </Button>
              </div>)}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default DashboardHeader;
