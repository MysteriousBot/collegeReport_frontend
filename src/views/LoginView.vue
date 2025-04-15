<template>
  <div class="login-container flex items-center justify-center">
    <div class="max-w-md w-full mx-6 bg-black p-6 rounded-lg shadow-lg border border-gray-800">
      <div>
        <h1 class="text-center text-4xl sm:text-5xl font-bold uppercase tracking-wide text-blue-400 mb-6">
          COLLEGE REPORT CARDS
        </h1>
      </div>
      
      <div v-if="error" class="mb-4 bg-red-500 bg-opacity-10 text-red-500 p-3 rounded-md">
        {{ error }}
      </div>
      
      <form @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="username" class="sr-only">Email or Username</label>
            <input 
              id="username" 
              v-model="credentials.username" 
              name="username" 
              type="text" 
              required 
              class="appearance-none rounded-none relative block w-full px-3 py-2 bg-[#1C1C1E] border border-gray-800 placeholder-gray-500 text-[#F3F4F6] rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10"
              placeholder="Email or Username"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input 
              id="password" 
              v-model="credentials.password" 
              name="password" 
              type="password" 
              required 
              class="appearance-none rounded-none relative block w-full px-3 py-2 bg-[#1C1C1E] border border-gray-800 placeholder-gray-500 text-[#F3F4F6] rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10"
              placeholder="Password"
            />
          </div>
        </div>

        <div class="mt-5">
          <button 
            type="submit" 
            class="group relative w-full h-9 flex justify-center items-center py-1.5 px-4 border border-gray-600 text-gray-200 font-medium rounded-md bg-transparent hover:bg-gray-800 hover:border-gray-500 transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Signing in</span>
            </span>
            <span v-else>
              Sign in
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { loginUser, getUserProfile } from '@/services/api';

const router = useRouter();
const isLoading = ref(false);
const error = ref('');
const credentials = ref({
  username: '',
  password: ''
});

const handleLogin = async () => {
  isLoading.value = true;
  error.value = '';
  
  try {
    // Attempt to login
    const response = await loginUser(credentials.value.username, credentials.value.password);
    
    if (response.success) {
      // Get user profile to store username
      try {
        const userProfile = await getUserProfile();
        if (userProfile && userProfile.username) {
          localStorage.setItem('user_name', userProfile.username);
        } else {
          // Fallback to entered username if profile doesn't return one
          localStorage.setItem('user_name', credentials.value.username);
        }
      } catch (profileErr) {
        console.warn('Could not fetch user profile, using entered username instead');
        localStorage.setItem('user_name', credentials.value.username);
      }
      
      // Dispatch custom event to notify App.vue about login
      window.dispatchEvent(new CustomEvent('auth-event', { 
        detail: { action: 'login' } 
      }));
      
      // Redirect to colleges page
      router.push('/colleges');
    } else {
      error.value = 'Login failed. Please check your credentials.';
    }
  } catch (err: any) {
    console.error('Login error:', err);
    
    // Handle different error types
    if (err.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (err.response.status === 401) {
        error.value = 'Incorrect username or password.';
      } else {
        error.value = err.response.data?.detail || 'Login failed. Please try again.';
      }
    } else if (err.request) {
      // The request was made but no response was received
      error.value = 'No response from server. Please check your connection.';
    } else {
      // Something happened in setting up the request that triggered an Error
      error.value = 'Login failed. Please try again.';
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  background-color: black;
}
</style> 