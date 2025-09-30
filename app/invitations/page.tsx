import PendingInvitations from '../../components/PendingInvitations';
import VerticalLayout from '../../components/VerticalLayout';
import ProtectedRoute from '../../components/ProtectedRoute';

const InvitationsPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <VerticalLayout>
        <PendingInvitations />
      </VerticalLayout>
    </ProtectedRoute>
  );
};

export default InvitationsPage;
