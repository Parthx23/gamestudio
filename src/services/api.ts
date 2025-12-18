const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers
      }
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth methods
  async getProfile() {
    return this.request('/auth/profile');
  }

  // Game methods
  async createGame(gameData: any) {
    return this.request('/games', {
      method: 'POST',
      body: JSON.stringify(gameData)
    });
  }

  async generateAIGame(prompt: string) {
    try {
      console.log('API call to generate AI game:', prompt);
      const response = await this.request('/games/generate', {
        method: 'POST',
        body: JSON.stringify({ prompt })
      });
      console.log('API response:', response);
      return response;
    } catch (error) {
      console.error('API error:', error);
      throw error;
    }
  }

  async getUserGames() {
    return this.request('/games/my-games');
  }

  async getGame(id: string) {
    return this.request(`/games/${id}`);
  }

  async deleteGame(id: string) {
    return this.request(`/games/${id}`, {
      method: 'DELETE'
    });
  }

  // Room methods
  async createRoom(roomData: any) {
    return this.request('/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData)
    });
  }

  async joinRoom(roomId: string) {
    return this.request(`/rooms/${roomId}/join`, {
      method: 'POST'
    });
  }

  async getRoomInfo(roomId: string) {
    return this.request(`/rooms/${roomId}`);
  }
}

export const apiService = new ApiService();