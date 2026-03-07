import React, { useState } from 'react';
import { User } from '../types';
import { FeatureName, useFeatureAccess } from '../hooks/useFeatureAccess';
import UpgradeModal from './UpgradeModal';

interface ProtectedFeatureProps {
  feature: FeatureName;
  user: User | null;
  onRequestLogin: () => void;
  children: React.ReactNode;
}

const ProtectedFeature: React.FC<ProtectedFeatureProps> = ({
  feature,
  user,
  onRequestLogin,
  children,
}) => {
  const [modalDismissed, setModalDismissed] = useState(false);
  const { canAccess, reason, requiredTier } = useFeatureAccess(feature, user);

  if (canAccess) return <>{children}</>;

  if (modalDismissed) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
          <i className="fas fa-lock text-2xl text-slate-400" />
        </div>
        <p className="text-slate-500 font-medium">This feature requires an upgrade.</p>
        <button
          onClick={() => setModalDismissed(false)}
          className="text-sm font-bold text-indigo-600 hover:underline"
        >
          View upgrade options
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="pointer-events-none select-none opacity-30 blur-sm">
        {children}
      </div>
      <UpgradeModal
        feature={feature}
        reason={reason}
        requiredTier={requiredTier}
        onDismiss={() => setModalDismissed(true)}
        onLogin={() => {
          onRequestLogin();
          setModalDismissed(true);
        }}
      />
    </>
  );
};

export default ProtectedFeature;
