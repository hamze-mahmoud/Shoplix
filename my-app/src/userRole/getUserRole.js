import { jwtDecode } from 'jwt-decode';

export const getUserRole = () => {
  const token = localStorage.getItem('authToken');
console.log("retrieved token:", token)
  if (!token) return null;

  try {
    const decodedToken = jwtDecode(token);
    console.log("Decoded token:", decodedToken);

    return decodedToken.role; // make sure 'role' exists in payload
  } catch (error) {
    console.error('Failed to decode token:', error);
    localStorage.removeItem('token');
    return null;
  }
};