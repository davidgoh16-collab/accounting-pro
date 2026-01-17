import React from 'react';
import { AuthUser } from '../types';
import HubLayout from './HubLayout';
import RevisionPlannerContent from './RevisionPlannerContent';

interface RevisionPlannerViewProps {
    user: AuthUser;
    onBack: () => void;
}

const RevisionPlannerView: React.FC<RevisionPlannerViewProps> = ({ user, onBack }) => {
    return (
        <HubLayout 
            title="Revision Planner" 
            subtitle="Optimise your memory with spaced repetition." 
            gradient="bg-gradient-to-r from-cyan-500 to-blue-500"
            onBack={onBack}
        >
            <RevisionPlannerContent user={user} />
        </HubLayout>
    );
};

export default RevisionPlannerView;
