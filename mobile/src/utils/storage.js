import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@calorie_token';
const USER_KEY = '@calorie_user';
const SERVER_URL_KEY = '@calorie_server_url';

export const storage = {
  async saveToken(token) {
    try {
      if (token) {
        await AsyncStorage.setItem(TOKEN_KEY, token);
      } else {
        await AsyncStorage.removeItem(TOKEN_KEY);
      }
    } catch (e) {
      console.warn('Storage saveToken error:', e);
    }
  },

  async getToken() {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (e) {
      console.warn('Storage getToken error:', e);
      return null;
    }
  },

  async saveUser(user) {
    try {
      if (user) {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      } else {
        await AsyncStorage.removeItem(USER_KEY);
      }
    } catch (e) {
      console.warn('Storage saveUser error:', e);
    }
  },

  async getUser() {
    try {
      const data = await AsyncStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn('Storage getUser error:', e);
      return null;
    }
  },

  async saveServerUrl(url) {
    try {
      await AsyncStorage.setItem(SERVER_URL_KEY, url);
    } catch (e) {
      console.warn('Storage saveServerUrl error:', e);
    }
  },

  async getServerUrl() {
    try {
      return await AsyncStorage.getItem(SERVER_URL_KEY);
    } catch (e) {
      console.warn('Storage getServerUrl error:', e);
      return null;
    }
  },

  async clearAll() {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    } catch (e) {
      console.warn('Storage clearAll error:', e);
    }
  },
};

