import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';
import { useUserStore } from '@/stores/useStore';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [showSignUp, setShowSignUp] = useState(false);
  const { localUser } = useUserStore();
  const isOnline = useOnlineStatus();
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);

  useEffect(() => {
    // Simulate a network check delay
    const timer = setTimeout(() => {
      setIsCheckingConnection(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isCheckingConnection) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Checking Connection</DialogTitle>
          </DialogHeader>
          <p>Please wait while we check your internet connection...</p>
        </DialogContent>
      </Dialog>
    );
  }

  if (!isOnline) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No Internet Connection</DialogTitle>
          </DialogHeader>
          <p>Please connect to the internet to sign in or create an account.</p>
          <p>You can continue to use the app offline, but some features may be limited.</p>
          <Button onClick={onClose}>Close</Button>
        </DialogContent>
      </Dialog>
    );
  }

  if (localUser?.onlineUserId) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Already Signed In</DialogTitle>
          </DialogHeader>
          <p>You are already signed in as {localUser.email}.</p>
          <Button onClick={onClose}>Close</Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{showSignUp ? 'Sign Up' : 'Sign In'}</DialogTitle>
        </DialogHeader>
        {showSignUp ? <SignUpForm onSuccess={onClose} /> : <SignInForm onSuccess={onClose} />}
        <Button variant="link" onClick={() => setShowSignUp(!showSignUp)}>
          {showSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}