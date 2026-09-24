import { test, expect } from '@playwright/test';
import fs from 'node:fs';

test('Android OAuth callback forces a fresh dashboard load', async () => {
  const native = fs.readFileSync('scripts/apply-android-native-polish.mjs', 'utf8');
  expect(native).toContain('com.gingerdragonstudios.rpgcompanion');
  expect(native).toContain('login-callback');
  expect(native).toContain('/dashboard?oauth_return=1');
  expect(native).not.toContain('origin + "/login" + suffix');
});

test('authenticated users cannot remain on the login page', async () => {
  const login = fs.readFileSync('src/pages/Login.jsx', 'utf8');
  expect(login).toContain('isAuthenticated');
  expect(login).toContain('isLoadingAuth');
  expect(login).toContain('navigate(returnTo === "/" ? "/dashboard" : returnTo');
});

test('installed app icon uses the approved Ginger Dragon emblem', async () => {
  const icon = fs.readFileSync('public/brand/app-icon.svg', 'utf8');
  expect(icon).toContain('Ginger Dragon Studios emblem');
  expect(icon).toContain('#8f2034');
  expect(icon).toContain('#f3a04f');
  expect(icon).toContain('#138e86');
  expect(icon).not.toContain('data:image/webp;base64');
  expect(icon).not.toContain('Fire Studios');
});
