import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import Button from "../components/ui/Button";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 px-4">
      <div className="text-center max-w-md space-y-6">
        <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-accent-500">
          404
        </div>

        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Page Not Found
          </h1>
          <p className="text-neutral-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-2">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => navigate("/")}
          >
            Go Home
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
