import { useState } from "react";

type LoginInput = {
  email: string;
  password: string;
};

type UseLoginOptions = {
  onSuccess?: () => void;
  onError?: (error: string) => void;
};

export const useLogin = (options?: UseLoginOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async ({ email, password }: LoginInput) => {
    setIsLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (email === "admin@example.com" && password === "admin123") {
        options?.onSuccess?.();
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      options?.onError?.(message);
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error };
};
