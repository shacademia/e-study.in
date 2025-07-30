"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Settings, UserCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useApiAuth';
import { User } from '@/constants/types';

// interface UserProfileMenuProps {
//   user: {
//     id: string;
//     name?: string;
//     email?: string;
//     role?: string;
//   };
// }

export const UserProfileMenu = (users: {user: User}) => {
  const router = useRouter();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const user = users.user

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Get user initials for the avatar fallback
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full cursor-pointer">
          <Avatar className="h-9 w-9">
            {user?.profileImage? 
            <AvatarImage src={ user.profileImage} alt={user?.name || "User"} />
            :
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(user?.name)}
            </AvatarFallback>
            }
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className='cursor-pointer' onClick={() => router.push('/profile')}>
          <UserCircle className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        {/* <DropdownMenuItem onClick={() => router.push('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem> */}
        <DropdownMenuSeparator />
        <DropdownMenuItem className='cursor-pointer' onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfileMenu;
