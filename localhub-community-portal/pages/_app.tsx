import type { AppProps } from 'next/app';
import { useState, useEffect } from 'react';
import '@/styles/globals.css';
import Layout from '@/components/Layout';
import { AuthProvider } from '@/lib/auth/AuthContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  );
}

