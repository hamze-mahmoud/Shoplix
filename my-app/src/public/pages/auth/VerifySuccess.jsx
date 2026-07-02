import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

export default function VerifySuccess() {
  return (
    <div className="text-center mt-20 px-6">
      <div className="w-16 h-16 rounded-full bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center mx-auto mb-5">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <h1 className="text-3xl font-bold text-green-600">Email Verified</h1>

      <p className="mt-3 text-gray-600">You can now login to your account.</p>

      <Link
        to="/login"
        className="btn-press inline-block mt-6 bg-gradient-to-r from-green-500 to-[#16A34A] text-white px-6 py-3 rounded-xl font-semibold shadow-sm hover:shadow-lg transition"
      >
        Go to Login
      </Link>
    </div>
  );
}
