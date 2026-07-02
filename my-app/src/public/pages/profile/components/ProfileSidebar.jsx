export default function ProfileSidebar() {
  return (
    <div className="w-64 bg-white rounded-2xl shadow-sm p-4 h-fit">

      <div className="mb-6">
        <p className="font-semibold">My Account</p>
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <button className="text-left px-3 py-2 rounded-lg hover:bg-gray-100">
          Profile
        </button>

        <button className="text-left px-3 py-2 rounded-lg hover:bg-gray-100">
          Orders
        </button>

        <button className="text-left px-3 py-2 rounded-lg hover:bg-gray-100">
          Settings
        </button>
      </div>
    </div>
  );
}