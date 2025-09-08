import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0',
        allowedHosts: [
            'localhost',
            'ec2-13-125-18-51.ap-northeast-2.compute.amazonaws.com'
        ]
    }
});
