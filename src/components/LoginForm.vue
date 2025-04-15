<template>
  <div class="bg-[#2C2C2E] p-6 rounded-lg shadow-lg max-w-md mx-auto">
    <h2 class="text-xl font-bold mb-4 text-[#F3F4F6]">Login to FlippyBot</h2>
    
    <div v-if="error" class="bg-red-500 bg-opacity-10 text-red-500 p-3 rounded-md mb-4">
      {{ error }}
    </div>
    
    <form @submit.prevent="handleLogin">
      <div class="mb-4">
        <label for="username" class="block text-[#F3F4F6] mb-1">Username</label>
        <input 
          type="text" 
          id="username" 
          v-model="username" 
          class="w-full p-2 rounded bg-[#1C1C1E] text-[#F3F4F6] border border-[#31415F]"
          required
        />
      </div>
      
      <div class="mb-6">
        <label for="password" class="block text-[#F3F4F6] mb-1">Password</label>
        <input 
          type="password" 
          id="password" 
          v-model="password" 
          class="w-full p-2 rounded bg-[#1C1C1E] text-[#F3F4F6] border border-[#31415F]"
          required
        />
      </div>
      
      <button 
        type="submit" 
        class="w-full bg-[#3B82F6] text-white py-2 px-4 rounded hover:bg-opacity-90"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Logging in...' : 'Login' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '@/services/api';

const username = ref('');
const password = ref('');
const error = ref('');
const isLoading = ref(false);
const router = useRouter();

const handleLogin = async () => {
  isLoading.value = true;
  error.value = '';
  
  try {
    const success = await login(username.value, password.value);
    
    if (success) {
      router.push('/');
    } else {
      error.value = 'Login failed. Please check your credentials.';
    }
  } catch (err: any) {
    error.value = err.message || 'An error occurred during login';
  } finally {
    isLoading.value = false;
  }
};
</script> 