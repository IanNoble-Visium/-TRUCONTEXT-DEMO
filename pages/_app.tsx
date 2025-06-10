import React from 'react'
import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react';
import 'leaflet/dist/leaflet.css';
import theme from '../lib/theme'
import '../styles/globals.css' // Import global styles

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}