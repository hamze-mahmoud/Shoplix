import { Link } from "react-router-dom";

export default function VerifyError() {
  return (
    <div className="text-center mt-20">

      <h1 className="text-3xl font-bold text-red-600">
        Verification Failed ❌
      </h1>

      <p className="mt-3 text-gray-600">
        The link is invalid or expired.
      </p>

      <Link
        to="/register"
        className="inline-block mt-5 bg-green-600 text-white px-4 py-2"
      >
        Register Again
      </Link>

    </div>
  );
}