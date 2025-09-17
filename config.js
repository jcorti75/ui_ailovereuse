// config.js - Configuración Global de NoShopiA

const CONFIG = {
  // API Configuration
  API_BASE: 'https://noshopia-production.up.railway.app',
  
  // Google OAuth - TU CLIENT ID CORRECTO
  GOOGLE_CLIENT_ID: '326940877598-ko13n1qcqkkugkoo6gu2n1avs46al09p.apps.googleusercontent.com',
  
  // Límite total del closet - CORREGIDO A 6
  TOTAL_CLOSET_LIMIT: 6,
  
  // File upload limits per type
  FILE_LIMITS: {
    tops: 3,     // Máximo 3 superiores seleccionables para recomendación
    bottoms: 3,  // Máximo 3 inferiores seleccionables para recomendación  
    shoes: 5     // Máximo 5 zapatos seleccionables para recomendación
  },
  
  // Supported file types
  SUPPORTED_FORMATS: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  
  // Maximum file size (5MB)
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  
  // Performance settings
  MAX_COMBINATIONS: 100,
  PROCESSING_TIMEOUT: 30000,
  
  // UI Settings
  ANIMATION_DURATION: 300,
  NOTIFICATION_DURATION: 3000,
  
  // Feature flags
  FEATURES: {
    CLOSET_MODE: true,
    DIRECT_MODE: true,
    SAVE_RECOMMENDATIONS: true,
    USER_PROFILES: true
  }
};

// Variables globales de estado
let isLoggedIn = false;
let currentUser = null;
let uploadedFiles = { tops: [], bottoms: [], shoes: [] };
let uploadedImages = { tops: [], bottoms: [], shoes: [] };
let selectedOccasion = null;
let closetMode = false;
let savedRecommendations = [];
let userStats = { visits: 1, recommendations: 0, savedOutfits: 0 };
let processingStartTime = 0;
let userProfile = { skin_color: null, age_range: null, gender: null };
let profileCompleted = false; // NUEVO: Para evitar repetir perfilamiento

// Variables para closet selection
let closetSelectedItems = { tops: [], bottoms: [], shoes: [] };
let closetItems = { tops: [], bottoms: [], shoes: [] };
let closetSelectionMode = false;

// NUEVO: Función para obtener total de prendas en closet
function getTotalClosetItems() {
  return closetItems.tops.length + closetItems.bottoms.length + closetItems.shoes.length;
}

// NUEVO: Función para obtener prendas restantes
function getRemainingClosetSlots() {
  const total = getTotalClosetItems();
  return CONFIG.TOTAL_CLOSET_LIMIT - total;
}

// NUEVO: Funciones de persistencia
function saveUserClosetData() {
  if (!currentUser?.email) return;
  
  const userData = {
    email: currentUser.email,
    closetItems: closetItems,
    uploadedFiles: uploadedFiles,
    uploadedImages: uploadedImages,
    userStats: userStats,
    profileCompleted: profileCompleted,
    userProfile: userProfile,
    lastSaved: Date.now()
  };
  
  localStorage.setItem(`noshopia_user_${currentUser.email}`, JSON.stringify(userData));
  console.log('✅ Datos del usuario guardados localmente');
}

// NUEVO: Cargar datos del usuario
function loadUserClosetData() {
  if (!currentUser?.email) return false;
  
  try {
    const savedData = localStorage.getItem(`noshopia_user_${currentUser.email}`);
    if (!savedData) return false;
    
    const userData = JSON.parse(savedData);
    
    // Restaurar datos
    closetItems = userData.closetItems || { tops: [], bottoms: [], shoes: [] };
    uploadedFiles = userData.uploadedFiles || { tops: [], bottoms: [], shoes: [] };
    uploadedImages = userData.uploadedImages || { tops: [], bottoms: [], shoes: [] };
    userStats = userData.userStats || { visits: 1, recommendations: 0, savedOutfits: 0 };
    profileCompleted = userData.profileCompleted || false;
    userProfile = userData.userProfile || { skin_color: null, age_range: null, gender: null };
    
    console.log('✅ Datos del usuario cargados:', {
      totalItems: getTotalClosetItems(),
      profileCompleted: profileCompleted
    });
    
    return true;
  } catch (e) {
    console.error('Error cargando datos del usuario:', e);
    return false;
  }
}

// Función para cargar script de Google
function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    // Verificar si ya está cargado
    if (typeof google !== 'undefined' && google.accounts?.id) {
      resolve();
      return;
    }
    
    console.log('🔥 Cargando script de Google...');
    console.log('🔍 URL del script:', 'https://accounts.google.com/gsi/client');
    console.log('🔍 User Agent:', navigator.userAgent);
    console.log('🔍 Protocolo:', window.location.protocol);
    
    // Verificar conectividad básica
    fetch('https://www.google.com', { mode: 'no-cors' })
      .then(() => console.log('✅ Google.com accesible'))
      .catch(() => console.log('❌ Google.com no accesible'));
    
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    let timeoutId = setTimeout(() => {
      console.log('⏰ Timeout: Script tardó más de 10 segundos');
      script.remove();
      reject('Timeout cargando script');
    }, 10000);
    
    script.onload = () => {
      clearTimeout(timeoutId);
      console.log('✅ Script de Google cargado');
      
      // Esperar inicialización
      setTimeout(() => {
        if (typeof google !== 'undefined' && google.accounts?.id) {
          console.log('✅ Google Auth disponible');
          resolve();
        } else {
          console.log('❌ Google Auth no disponible después de cargar');
          reject('Google Auth no inicializado');
        }
      }, 1000);
    };
    
    script.onerror = (error) => {
      clearTimeout(timeoutId);
      console.log('❌ Error cargando script de Google');
      console.log('❌ Error details:', error);
      console.log('❌ Script src:', script.src);
      script.remove();
      reject('Error cargando script');
    };
    
    document.head.appendChild(script);
    console.log('📤 Script agregado al DOM');
  });
}
