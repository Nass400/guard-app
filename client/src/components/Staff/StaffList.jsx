import { useStaff } from '../../context/StaffContext';

export default function StaffList() {
  const { currentStaffDetails, isCreator, toggleModerator } = useStaff();

  if (!currentStaffDetails) {
    return null;
  }

  const handleToggleMod = async (userId) => {
    try {
      await toggleModerator(userId);
    } catch (err) {
      console.error('Failed to toggle moderator:', err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-800 mb-3">Members</h3>
      <div className="space-y-2">
        {currentStaffDetails.members?.map(member => {
          const isMemberCreator = member.id === currentStaffDetails.creatorId;
          const isMemberMod = (currentStaffDetails.moderatorIds || []).includes(member.id);

          return (
            <div
              key={member.id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center flex-wrap gap-1">
                <span className="font-medium text-gray-800">
                  {member.firstName} {member.lastName}
                </span>
                {isMemberCreator && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    Creator
                  </span>
                )}
                {isMemberMod && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    Moderator
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 capitalize">{member.position}</span>
                {isCreator && !isMemberCreator && (
                  <button
                    onClick={() => handleToggleMod(member.id)}
                    className={`text-xs px-2 py-0.5 rounded ${
                      isMemberMod
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                  >
                    {isMemberMod ? 'Remove mod' : 'Make mod'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Share code: <span className="font-mono font-bold">{currentStaffDetails.code}</span>
        </p>
      </div>
    </div>
  );
}
