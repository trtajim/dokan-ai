<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white">
    <NuxtPage />
    <ToastContainer />
  </div>
</template>

<script setup>
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - DokanAI` : 'DokanAI - AI-Powered Single-Product COD Store Generator';
  },
  meta: [
    { name: 'description', content: 'Generate high-converting 1-page Cash-on-Delivery e-commerce stores in seconds with autonomous AI agents.' }
  ],
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Hind+Siliguri:wght@400;500;600;700&display=swap' }
  ]
})
</script>

<style>
body {
  font-family: 'Plus Jakarta Sans', 'Hind Siliguri', sans-serif;
}
</style>
