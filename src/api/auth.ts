import { apiFetch } from './client';
import { saveToken, getToken, logoutUser } from './authStorage';

export { saveToken, getToken, logoutUser };

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export const registerUser = async (userData: { name: string; email: string; password: string }) => {
  return apiFetch<{ msg: string }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const loginUser = async (userData: { email: string; password: string }) => {
  return apiFetch<{ token: string; user: AuthUser }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const getCurrentUser = async () => {
  return apiFetch<{ user: AuthUser }>('/api/auth/me');
};
