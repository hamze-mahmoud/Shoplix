import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import Button from "../components/ui/Button";

export default function ServerError() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 px-4">
      <div className="text-center max-w-md space-y-6">
        <div className="flex justify-center">
          <AlertTriangle className="w-20 h-20 text-error animate-bounce" />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Server Error
          </h1>
          <p className="text-neutral-600">
            Something went wrong on our end. Please try again later.
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
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </div>
      </div>
    </div>
  );
}
