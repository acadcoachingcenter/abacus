// Centralized branding configuration for ACAD Abacus.
// Change logo, name, tagline, contact info, and theme tokens here —
// nothing else in the app should hard-code these values.

export const branding = {
  productName: 'ACAD Abacus',
  parentBrand: 'ACAD',
  domain: 'abacus.acadapp.in',
  tagline: 'Learn Abacus. Calculate Faster. Think Smarter.',
  footerLine: 'ACAD — Interactive Abacus Learning',
  logoUrl: null, // set to a URL/path once a logo asset is supplied
  contact: {
    email: 'hr.skylinepixelstudio@gmail.com',
  },
  theme: {
    // Named palette — see src/index.css :root for the actual CSS variables.
    rosewood: '#3B2417',
    sandalwood: '#C99765',
    saffron: '#F4A93B',
    deepTeal: '#0F5E56',
    ivory: '#FBF6EE',
    ink: '#1C1410',
  },
  fonts: {
    display: 'Outfit',
    body: 'Nunito',
    mono: 'Roboto Mono',
  },
};

export default branding;
