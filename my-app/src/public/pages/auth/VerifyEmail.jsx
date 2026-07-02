import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token");

  useEffect(() => {
    if (token) {
      window.location.href = `${
        import.meta.env.VITE_BACKEND_URL
      }/api/auth/verify-email?token=${token}`;
    }
  }, [token]);

  return (
    <div className="flex justify-center mt-20">
      <p className="text-lg">Verifying your email...</p>
    </div>
  );
}