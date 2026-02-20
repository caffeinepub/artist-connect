import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function UserProfileSetup() {
    const { identity } = useInternetIdentity();
    const [showSetup] = useState(false);

    // Since backend doesn't have user profile methods, we skip the profile setup
    // Users can still use the platform without this step
    if (!showSetup) {
        return null;
    }

    return (
        <Dialog open={false}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-display text-2xl">Welcome to Artist Connect!</DialogTitle>
                    <DialogDescription>
                        Let's set up your profile.
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}
