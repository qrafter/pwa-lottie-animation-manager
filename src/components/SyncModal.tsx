import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';
import { useUserStore } from '@/stores/useStore';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SyncModal({ isOpen, onClose }: SyncModalProps) {
  const [showSignUp, setShowSignUp] = useState(false);
  const { localUser, syncUser } = useUserStore();
  const isOnline = useOnlineStatus();

  const handleSync = async () => {
    if (localUser?.onlineUserId) {
      await syncUser();
      onClose();
    }
  };

  if (!isOnline) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No Internet Connection</DialogTitle>
          </DialogHeader>
          <p>Please connect to the internet to sync your animations.</p>
          <p>In the meantime, you can continue to use the app offline. Your changes will be synced when you're back online.</p>
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
            <DialogTitle>Sync Animations</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to sync your animations?</p>
          <Button onClick={handleSync}>Sync</Button>
          <Button onClick={onClose} variant="outline">Cancel</Button>
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
        {showSignUp ? <SignUpForm /> : <SignInForm />}
        <Button variant={'link'} onClick={() => setShowSignUp(!showSignUp)}>
          {showSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}