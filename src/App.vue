<script setup lang="ts">
import { RouterView } from 'vue-router'
import logoUrl from '@/assets/logo.svg'
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="brand">
        <img class="brand-logo" :src="logoUrl" alt="Movie / Series Tracker" />
      </div>

      <div class="header-actions">
        <!-- optional: später Login Button -->
        <!-- <button class="btn">Login</button> -->
      </div>
    </header>

    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<style>
/* GLOBAL (nicht scoped) */
:root {
  --bg: #050505;
  --panel: rgba(255, 255, 255, 0.06);
  --panel-2: rgba(255, 255, 255, 0.08);
  --border: rgba(255, 255, 255, 0.10);
  --text: #ffffff;
  --muted: rgba(255, 255, 255, 0.65);
  --accent: #e50914;
}

html, body {
  margin: 0;
  padding: 0;
  background: var(--bg);
  color: var(--text);
  font-family: Arial, Helvetica, sans-serif; /* <- Georgia weg */
}

* { box-sizing: border-box; }
</style>

<style scoped>
.app-shell {
  min-height: 100vh;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  background: linear-gradient(to bottom, rgba(0,0,0,0.88), rgba(0,0,0,0.60));
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(10px);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-logo {
  height: 44px;
  width: auto;
  display: block;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.btn {
  background: var(--panel);
  border: 1px solid var(--border);
  color: var(--text);
  padding: 10px 12px;
  border-radius: 12px;
  cursor: pointer;
}
.btn:hover {
  background: var(--panel-2);
}

.app-main {
  padding: 18px;
}
</style>
