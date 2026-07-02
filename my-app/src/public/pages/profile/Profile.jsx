import ProfileSidebar from "./components/ProfileSidebar";
import ProfileHeader from "./components/ProfileHeader";

export default function Profile() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex gap-6">

      <ProfileSidebar />

      <div className="flex-1 bg-white rounded-2xl shadow-sm p-6">
        <ProfileHeader />

        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Account Info</h2>

          <div className="grid grid-cols-2 gap-4">
            <input className="input" placeholder="Full Name" />
            <input className="input" placeholder="Email" />
            <input className="input" placeholder="Phone" />
            <input className="input" placeholder="Address" />
          </div>

          <button className="mt-6 bg-green-500 text-white px-6 py-2 rounded-xl hover:bg-green-600">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}