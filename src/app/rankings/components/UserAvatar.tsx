import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "../utils";
import { UserAvatarProps } from "../types";

const UserAvatar: React.FC<UserAvatarProps> = ({ userName }) => {
  return (
    <Avatar className="h-10 w-10">
      <AvatarImage
        src={`https://api.dicebear.com/6.x/initials/svg?seed=${userName}`}
      />
      <AvatarFallback>
        {getInitials(userName)}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
