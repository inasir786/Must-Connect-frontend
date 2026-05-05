import { defineConfig } from '@tanstack/react-start/config'

export default defineConfig({
  server: {
    preset: 'node-server'
  },
  routers: {
    client: {
      base: '/admin',
    },
    server: {
      base: '/admin',
    },
  },
})
