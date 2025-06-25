
import React from 'react';

interface AdminNotesSectionProps {
  adminNotes: string;
}

const AdminNotesSection: React.FC<AdminNotesSectionProps> = ({ adminNotes }) => {
  return (
    <div className="mt-3 p-3 bg-bullion-purple-50 border border-bullion-purple-200 rounded-md">
      <span className="text-sm font-medium block mb-1">Admin Notes:</span>
      <p className="text-sm text-gray-600">{adminNotes}</p>
    </div>
  );
};

export default AdminNotesSection;
