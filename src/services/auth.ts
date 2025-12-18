import { apiService } from './api';

export const authService = {
  login() {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/google`;
  },

  async demoLogin() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/demo-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.token) {
        this.setToken(data.token);
        window.location.reload();
        return data;
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Demo login error:', error);
      alert('Demo login failed: ' + error.message);
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('auth_token');
    window.location.reload();
  },

  async getProfile() {
    try {
      return await apiService.getProfile();
    } catch (error) {
      this.logout();
      throw error;
    }
  },

  setToken(token: string) {
    localStorage.setItem('auth_token', token);
  },

  getToken() {
    return localStorage.getItem('auth_token');
  },

  isAuthenticated() {
    return !!this.getToken();
  }
};