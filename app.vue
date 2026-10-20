<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white">
    <NuxtPage />
    <ToastContainer />
    <LoginModal />
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
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Noto+Serif+Bengali:wght@600;700;800&family=Noto+Sans+Bengali:wght@400;500;600;700;800;900&family=Hind+Siliguri:wght@400;500;600;700&display=swap' }
  ]
})
</script>

<style>
/* Specific fix for Hind Siliguri Bengali digit 1 (১ - U+09E7) bug:
   Hind Siliguri has a deformed/broken glyph for Bengali digit ১ (U+09E7) in regular/medium weights.
   We override U+09E7 with Noto Sans Bengali so that Bengali 1 renders cleanly across all weights. */
@font-face {
  font-family: 'BengaliDigitFix';
  font-style: normal;
  font-weight: 400 700;
  font-display: swap;
  src: url('https://fonts.gstatic.com/s/notosansbengali/v33/Cn-fJsCGWQxOjaGwMQ6fIiMywrNJIky6nvd8BjzVMvJx2mc4I3mYvNY.woff2') format('woff2');
  unicode-range: U+09E7;
}

:root {
  --font-serif-bn: 'Noto Serif Bengali', 'Hind Siliguri', serif;
  --font-sans-bn: 'BengaliDigitFix', 'Hind Siliguri', 'Noto Sans Bengali', system-ui, sans-serif;
}

body {
  font-family: 'Plus Jakarta Sans', 'BengaliDigitFix', 'Hind Siliguri', 'Noto Sans Bengali', sans-serif;
}

.font-serif-bn {
  font-family: var(--font-serif-bn);
}

.font-sans-bn {
  font-family: var(--font-sans-bn);
}
</style>
