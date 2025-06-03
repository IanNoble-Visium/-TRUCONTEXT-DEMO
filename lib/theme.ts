import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  colors: {
    visium: {
      50: '#e6f0ff',
      100: '#cce0ff',
      200: '#99c0ff',
      300: '#66a1ff',
      400: '#3381ff',
      500: '#003087', // Primary blue from Visium site
      600: '#002670',
      700: '#001d59',
      800: '#001342',
      900: '#000a2b',
    },
    brand: {
      50: '#e6f0ff',
      100: '#cce0ff',
      200: '#99c0ff',
      300: '#66a1ff',
      400: '#3381ff',
      500: '#003087',
      600: '#002670',
      700: '#001d59',
      800: '#001342',
      900: '#000a2b',
    }
  },
  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif',
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'bold',
        borderRadius: 'md',
      },
      variants: {
        solid: {
          bg: 'visium.500',
          color: 'white',
          _hover: {
            bg: 'visium.600',
          },
        },
        outline: {
          borderColor: 'visium.500',
          color: 'visium.500',
          _hover: {
            bg: 'visium.50',
          },
        },
      },
    },
    Heading: {
      baseStyle: {
        color: 'visium.500',
      },
    },
  },
})

export default theme;
