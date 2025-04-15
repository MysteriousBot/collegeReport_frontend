<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { logoutUser } from '@/services/api'

const route = useRoute()
const router = useRouter()
const mobileMenuOpen = ref(false)
const isProfileOpen = ref(false)
const user = ref({
  name: '',
  token: ''
})

// Remove unused imports and stores for now
// We can add auth later if needed

// Check authentication status
const isAuthenticated = computed(() => {
  return !!user.value.token
})

// Get username
const username = computed(() => {
  return user.value.name || 'User'
})

// Get the first letter of username for the avatar
const userInitial = computed(() => {
  return username.value.charAt(0).toUpperCase()
})

// Function to logout
const logout = () => {
  // Use our API service for logout
  logoutUser()
  
  // Close dropdown
  isProfileOpen.value = false
  
  // Close mobile menu if open
  mobileMenuOpen.value = false
  
  // Clear user state
  user.value = {
    name: '',
    token: ''
  }
  
  // Clear localStorage
  localStorage.removeItem('access_token')
  localStorage.removeItem('user_name')
  
  // Force reactive update
  checkLoginState()
  
  // Redirect to home
  router.push('/')
}

// Function to check login state from localStorage
const checkLoginState = () => {
  const token = localStorage.getItem('access_token')
  const name = localStorage.getItem('user_name')
  
  if (token) {
    user.value = {
      name: name || 'User',
      token: token
    }
    console.log('User authenticated from localStorage:', user.value)
  } else {
    user.value = {
      name: '',
      token: ''
    }
    console.log('No authentication found in localStorage')
  }
}

// Close profile dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (isProfileOpen.value && target.closest('#user-menu-button') === null) {
    isProfileOpen.value = false
  }
}

// Handle login state updates from other components
const handleLoginEvent = (event: Event) => {
  const detail = (event as CustomEvent).detail;
  if (detail?.action === 'login') {
    checkLoginState()
  } else if (detail?.action === 'logout') {
    // Make sure to update UI when logout event is dispatched
    checkLoginState()
  }
}

// Watch for route changes and update login state
watch(route, () => {
  checkLoginState()
})

onMounted(() => {
  // Check login state when app mounts
  checkLoginState()
  
  // Add event listener to close dropdown when clicking outside
  document.addEventListener('click', handleClickOutside)
  
  // Listen for custom login events
  window.addEventListener('auth-event', handleLoginEvent)
})

// Clean up event listeners when component is unmounted
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('auth-event', handleLoginEvent)
})
</script>

<template>
  <div id="app" class="flex flex-col min-h-screen bg-[#1C1C1E] text-gray-100 w-full">
    <!-- Navigation Bar -->
    <nav class="sticky top-0 z-10 border-b border-gray-800 bg-black w-full">
      <div class="w-full max-w-[95%] mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <router-link to="/" class="uppercase tracking-wide text-white font-bold text-lg sm:text-xl">COLLEGE REPORT CARDS</router-link>
            
            <!-- Navigation Links -->
            <div class="hidden md:block ml-10">
              <div class="flex items-baseline space-x-4">
                <router-link 
                  v-if="isAuthenticated"
                  to="/colleges" 
                  class="px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  :class="[$route.path === '/colleges' ? 
                    'bg-gray-800 text-white' : 
                    'text-gray-300 hover:bg-gray-800 hover:text-white']"
                >
                  Colleges
                </router-link>
              </div>
            </div>
          </div>
          
          <!-- Profile Dropdown - Only show on desktop (md and up) -->
          <div class="ml-4 hidden md:flex items-center md:ml-6">
            <!-- Not Logged In State -->
            <router-link 
              v-if="!isAuthenticated" 
              to="/login"
              class="bg-transparent border-2 border-gray-600 text-gray-200 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 hover:border-gray-500 transition-all duration-200"
            >
              Login
            </router-link>
            
            <!-- Logged In State: Profile Button with Username -->
            <div v-else class="relative ml-3">
              <button 
                @click="isProfileOpen = !isProfileOpen" 
                class="flex items-center text-sm bg-transparent border border-gray-700 rounded-md px-3 py-2 focus:outline-none"
                id="user-menu-button"
                aria-expanded="false"
                aria-haspopup="true"
              >
                <span class="sr-only">Open user menu</span>
                <div class="flex items-center">
                  <div class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center font-medium text-white mr-2">
                    {{ userInitial }}
                  </div>
                  <span class="text-white">Hello, {{ username }}</span>
                  <svg class="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </button>
              
              <!-- Profile Dropdown Menu -->
              <div 
                v-if="isProfileOpen" 
                class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-black ring-1 ring-black ring-opacity-5 focus:outline-none z-50 border border-gray-800"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu-button"
                tabindex="-1"
              >
                <div class="block px-4 py-2 text-sm text-gray-300 border-b border-gray-800">
                  Signed in as <span class="font-medium">{{ username }}</span>
                </div>
                <a 
                  href="#" 
                  @click.prevent="logout"
                  class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white" 
                  role="menuitem" 
                  tabindex="-1" 
                  id="user-menu-item-2"
                >
                  Logout
                </a>
              </div>
            </div>
          </div>
          
          <!-- Mobile Menu Button -->
          <div class="flex items-center md:hidden">
            <button 
              type="button" 
              class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none"
              @click="mobileMenuOpen = !mobileMenuOpen"
            >
              <span class="sr-only">Open main menu</span>
              <!-- Icon when menu is closed -->
              <svg 
                class="h-6 w-6" 
                :class="{'hidden': mobileMenuOpen, 'block': !mobileMenuOpen }"
                stroke="currentColor" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <!-- Icon when menu is open -->
              <svg 
                class="h-6 w-6" 
                :class="{'block': mobileMenuOpen, 'hidden': !mobileMenuOpen }"
                stroke="currentColor" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile menu -->
      <div class="md:hidden" :class="{'block': mobileMenuOpen, 'hidden': !mobileMenuOpen}">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <router-link 
            v-if="isAuthenticated"
            to="/colleges" 
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
            :class="[$route.path === '/colleges' ? 'bg-gray-800 text-white' : '']"
            @click="mobileMenuOpen = false"
          >
            Colleges
          </router-link>
          <div v-if="isAuthenticated" class="border-t border-gray-800 pt-4 pb-3">
            <div class="flex items-center px-5">
              <div class="flex-shrink-0">
                <div class="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  {{ userInitial }}
                </div>
              </div>
              <div class="ml-3">
                <div class="text-base font-medium leading-none text-white">{{ username }}</div>
              </div>
            </div>
            <div class="mt-3 px-2 space-y-1">
              <a 
                href="#" 
                @click.prevent="logout"
                class="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-800"
              >
                Logout
              </a>
            </div>
          </div>
          <router-link
            v-if="!isAuthenticated"
            to="/login"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
            :class="[$route.path === '/login' ? 'bg-gray-800 text-white' : '']"
            @click="mobileMenuOpen = false"
          >
            Login
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-grow w-full">
      <div class="w-full max-w-[95%] mx-auto px-4 py-6">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<style>
/* Global CSS reset */
body, html {
  margin: 0;
  padding: 0;
  width: 100vw;
  min-height: 100vh;
  overflow-x: hidden;
  background-color: black;
}

/* Remove the width constraint from #app */
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100vw;
}

/* Remove default link styles */
a {
  text-decoration: none;
  color: inherit;
}

/* Dropdown animation */
@keyframes dropdownFade {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

#user-menu-button + div {
  animation: dropdownFade 0.2s ease;
}
</style>
