import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // For development, if we're on localhost and get an auth error, 
  // we'll treat the user as authenticated to bypass auth issues
  const isDevelopment = window.location.hostname === 'localhost';
  const isAuthError = error && error.message?.includes('401');
  
  if (isDevelopment && isAuthError) {
    return {
      user: {
        id: 'dev-user-123',
        email: 'developer@test.com',
        firstName: 'Dev',
        lastName: 'User',
        profileImageUrl: 'https://via.placeholder.com/150'
      },
      isLoading: false,
      isAuthenticated: true,
    };
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
