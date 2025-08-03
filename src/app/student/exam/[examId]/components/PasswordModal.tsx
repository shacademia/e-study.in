import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Lock, Eye, EyeOff } from "lucide-react";
import { PasswordModalProps } from "../types";

const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  password,
  passwordError,
  showPassword,
  onPasswordChange,
  onTogglePasswordVisibility,
  onSubmit,
  onClose,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSubmit();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Lock className="h-5 w-5 mr-2" />
            Enter Exam Password
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              This exam is password protected. Please enter the password to continue.
            </p>
          </div>
          <div className="relative">
            <Label htmlFor="exam-password">Password</Label>
            <div className="relative">
              <Input
                id="exam-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter exam password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer"
                onClick={onTogglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {passwordError && (
              <p className="text-sm text-red-600 mt-1">{passwordError}</p>
            )}
          </div>
          <Button onClick={onSubmit} className="w-full cursor-pointer">
            Start Exam
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordModal;
