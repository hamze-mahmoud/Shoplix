import { useEffect, useState } from "react";
import { userService } from "../../../../Shared/services/userService";

export default function ProfileHeader({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await userService.getCurrentUser();
        console.log("data user",data)
        setUser(data);
      } catch (error) {
        console.error("Failed to load user", error);
      }
    };

    fetchUser();
  }, [userId]);

  const initials = user?.name
    ?.split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center gap-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-[#16A34A] text-2xl font-bold text-white shadow-md">
        {initials || "U"}
      </div>

      <div className="flex-1">
        <h2 className="text-xl font-bold text-gray-900">
          {user?.firstName || "Loading..."}
        </h2>

        <p className="text-sm text-gray-500">
          {user?.email}
        </p>

        <div className="mt-2 flex items-center gap-2">
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
            Active Member
          </span>

          {user?.role && (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
              {user.role}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}