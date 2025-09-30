// config.js - Límites Separados por Modo
const CONFIG = {
  // OAuth Google - NO MODIFICAR
  GOOGLE_CLIENT_ID: '326940877598-ko13n1qcqkkugkoo6gu2n1avs46al09p.apps.googleusercontent.com',
  
  // API Backend - NO MODIFICAR
  API_BASE: 'https://noshopia-production.up.railway.app',
  
  // ===== CLOSET INTELIGENTE =====
  // Límite TOTAL de prendas en el closet (distribución LIBRE)
  // Ejemplos: 12 bottoms + 1 top + 2 shoes = 15 ✓
  //           5 bottoms + 5 tops + 5 shoes = 15 ✓
  TOTAL_CLOSET_LIMIT: 15,
  
  // Mínimo requerido de cada tipo en el closet
  MINIMUM_IN_CLOSET: {
    tops: 1,
    bottoms: 1,
    shoes: 1
  },
  
  // ===== RECOMENDACIONES DIRECTAS (sin closet) =====
  // Límites FIJOS para subida directa
  DIRECT_UPLOAD_LIMITS: {
    tops: 3,      // MÁXIMO 3 tops
    bottoms: 3,   // MÁXIMO 3 bottoms
    shoes: 5      // MÁXIMO 5 shoes
  }
};

console.log('✅ Config: Closet 15 libre | Directo 3-3-5 fijo');
