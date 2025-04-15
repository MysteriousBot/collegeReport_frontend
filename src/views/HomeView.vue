<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getCollegeStats } from '@/services/api';
import { useRouter } from 'vue-router';
import { computed } from 'vue';

const router = useRouter();
const totalColleges = ref(0);
const statesRepresented = ref(0);
const isLoading = ref(true);
const isAuthenticated = computed(() => !!localStorage.getItem('access_token'));

onMounted(async () => {
  try {
    const stats = await getCollegeStats();
    totalColleges.value = stats.total_colleges;
    statesRepresented.value = stats.states_represented;
  } catch (err) {
    console.error('Error fetching stats:', err);
  } finally {
    isLoading.value = false;
  }
});

const navigateToLogin = () => {
  router.push('/login');
};

const navigateToColleges = () => {
  router.push('/colleges');
};
</script>

<template>
  <div class="home-view">
    <div class="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
      <h1 class="text-5xl font-bold tracking-tight text-white sm:text-6xl mb-6">
        Find Your Perfect College Match
      </h1>
      
      <div class="mt-8 text-xl text-gray-300 space-y-6 text-left">
        <p>
          <span class="text-blue-400 font-semibold">COLLEGE REPORT CARDS</span> is your comprehensive platform for college exploration and decision-making. We help prospective students access detailed information about institutions across the United States to make informed choices about their academic future.
        </p>
        
        <p>
          Our platform provides data on acceptance rates, costs, locations, and more to help you narrow down your options and find the perfect fit for your educational goals and preferences.
        </p>
      </div>
      
      <div v-if="!isLoading" class="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8">
        <div class="w-full sm:w-64 text-center px-8 py-6 bg-gray-800/50 rounded-lg border border-gray-700">
          <div class="text-4xl font-bold text-blue-400">{{ totalColleges }}</div>
          <div class="text-gray-300 mt-2 text-lg">Colleges in Database</div>
        </div>
        <div class="w-full sm:w-64 text-center px-8 py-6 bg-gray-800/50 rounded-lg border border-gray-700">
          <div class="text-4xl font-bold text-blue-400">{{ statesRepresented }}</div>
          <div class="text-gray-300 mt-2 text-lg">States Represented</div>
        </div>
      </div>
      
      <div class="mt-12 space-y-4">
        <p class="text-lg text-gray-300 mb-6">
          Ready to start exploring colleges and universities?
        </p>
        
        <button
          v-if="isAuthenticated"
          @click="navigateToColleges"
          class="rounded-md bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 transition-colors"
        >
          Explore Colleges
        </button>
        
        <button
          v-else
          @click="navigateToLogin"
          class="rounded-md bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 transition-colors"
        >
          Sign In to Begin
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
