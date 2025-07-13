import React from 'react'
import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react';
import 'leaflet/dist/leaflet.css';
import theme from '../lib/theme'
import '../styles/globals.css' // Import global styles

// Register cytoscape-fcose extension globally
import cytoscape from 'cytoscape';
// @ts-ignore
import fcose from 'cytoscape-fcose';
cytoscape.use(fcose);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}