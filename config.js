// config.js - CONFIGURACIÓN OAUTH CORREGIDA
// Reemplaza tu config.js actual con este contenido corregido

const CONFIG = {
  // GOOGLE OAUTH CORREGIDO - Cliente ID válido para producción
  GOOGLE_CLIENT_ID: '326940877598-ko13n1qcqkkugkoo6gu2n1avs46al09p.apps.googleusercontent.com',
  
  API_BASE: "https://noshopia-production.up.railway.app",
  
  FILE_LIMITS: { 
    tops: 5, 
    bottoms: 5, 
    shoes: 5 
  },
  
  TOTAL_CLOSET_LIMIT: 15,

  // CONFIGURACIÓN PROFESSIONAL GOOGLE SIGN-IN (SIN BETA)
  GOOGLE_OAUTH_CONFIG: {
    // Configuración profesional para producción
    client_id: '326940877598-ko13n1qcqkkugkoo6gu2n1avs46al09p.apps.googleusercontent.com',
    auto_select: false,
    cancel_on_tap_outside: true,
    context: 'signin',
    // CRÍTICO: SIN ux_mode para evitar popups beta
    itp_support: true
  },

  // EMAILS PROFESIONALES NOSHOPIA
  EMAILS: {
    PROFESSIONAL: {
      SUPPORT: 'soporte@noshopia.com',
      INFO: 'info@noshopia.com',
      PAYMENTS: 'pagos@noshopia.com',
      CEO: 'jcorti@noshopia.com',
      CREATIVE: 'paola@noshopia.com'
    },
    
    CONTACT_LINKS: {
      SUPPORT: 'mailto:soporte@noshopia.com?subject=Soporte%20NoshopiA&body=Hola%20equipo%20NoshopiA,%0A%0ADescribe%20tu%20problema:%0A%0A',
      GENERAL_INFO: 'mailto:info@noshopia.com?subject=Consulta%20NoshopiA&body=Hola,%0A%0AMe%20gustaría%20saber%20más%20sobre:%0A%0A',
      CEO_CONTACT: 'mailto:jcorti@noshopia.com?subject=Contacto%20Directo&body=Hola%20José,%0A%0A'
    }
  }
};

// VARIABLES GLOBALES DE ESTADO CORREGIDAS
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
let profileCompleted = false;

// Variables para closet selection
let closetSelectedItems = { tops: [], bottoms: [], shoes: [] };
let closetItems = { tops: [], bottoms: [], shoes: [] };
let closetSelectionMode = false;

// FUNCIÓN CORREGIDA: Obtener usuario actual de manera segura
function getCurrentUser() {
  try {
    // Priorizar usuario actual en memoria
    if (currentUser && currentUser.name && currentUser.email) {
      return currentUser;
    }
    
    // Verificar localStorage
    const storedAuth = localStorage.getItem('noshopia_current_user');
    if (storedAuth) {
      const authData = JSON.parse(storedAuth);
      if (authData.name && authData.email) {
        return authData;
      }
    }
    
    console.warn('⚠️ No se pudo obtener usuario válido');
    return null;
  } catch (error) {
    console.error('❌ Error obteniendo usuario:', error);
    return null;
  }
}

// FUNCIÓN CORREGIDA: Verificar login
function checkIsLoggedIn() {
  try {
    const user = getCurrentUser();
    const isValid = user && user.email && user.name;
    isLoggedIn = isValid;
    return isValid;
  } catch (error) {
    console.warn('Error verificando login:', error);
    isLoggedIn = false;
    return false;
  }
}

// Obtener total de items en closet
function getTotalClosetItems() {
  let total = 0;
  ['tops', 'bottoms', 'shoes'].forEach(type => {
    if (closetItems[type] && Array.isArray(closetItems[type])) {
      total += closetItems[type].length;
    }
  });
  return total;
}

// Obtener espacios restantes
function getRemainingClosetSlots() {
  const total = getTotalClosetItems();
  return Math.max(0, CONFIG.TOTAL_CLOSET_LIMIT - total);
}

// Convertir archivo a Data URL
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// FUNCIONES DE PERSISTENCIA
function saveUserClosetData() {
  const user = getCurrentUser();
  if (!user?.email) return;
  
  const userData = {
    email: user.email,
    name: user.name,
    closetItems: closetItems,
    uploadedFiles: uploadedFiles,
    uploadedImages: uploadedImages,
    userStats: userStats,
    profileCompleted: profileCompleted,
    userProfile: userProfile,
    lastSaved: Date.now()
  };
  
  localStorage.setItem(`noshopia_user_${user.email}`, JSON.stringify(userData));
  console.log('✅ Datos del usuario guardados:', user.name);
}

function loadUserClosetData() {
  const user = getCurrentUser();
  if (!user?.email) return false;
  
  try {
    const savedData = localStorage.getItem(`noshopia_user_${user.email}`);
    if (!savedData) return false;
    
    const userData = JSON.parse(savedData);
    
    // Restaurar datos
    closetItems = userData.closetItems || { tops: [], bottoms: [], shoes: [] };
    uploadedFiles = userData.uploadedFiles || { tops: [], bottoms: [], shoes: [] };
    uploadedImages = userData.uploadedImages || { tops: [], bottoms: [], shoes: [] };
    userStats = userData.userStats || { visits: 1, recommendations: 0, savedOutfits: 0 };
    profileCompleted = userData.profileCompleted || false;
    userProfile = userData.userProfile || { skin_color: null, age_range: null, gender: null };
    
    console.log('✅ Datos cargados para:', user.name, {
      totalItems: getTotalClosetItems(),
      profileCompleted: profileCompleted
    });
    
    return true;
  } catch (e) {
    console.error('Error cargando datos del usuario:', e);
    return false;
  }
}

// FUNCIÓN CORREGIDA: Cargar script de Google de manera robusta
function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    // Verificar si ya está cargado
    if (typeof google !== 'undefined' && google.accounts?.id) {
      resolve();
      return;
    }
    
    console.log('🔄 Cargando Google Sign-In API...');
    
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    let timeoutId = setTimeout(() => {
      console.error('⏰ Timeout: Google script tardó más de 15 segundos');
      script.remove();
      reject(new Error('Timeout cargando Google script'));
    }, 15000);
    
    script.onload = () => {
      clearTimeout(timeoutId);
      console.log('✅ Google script cargado exitosamente');
      
      // Esperar inicialización completa
      setTimeout(() => {
        if (typeof google !== 'undefined' && google.accounts?.id) {
          console.log('✅ Google Sign-In API disponible');
          resolve();
        } else {
          console.error('❌ Google Sign-In API no se inicializó correctamente');
          reject(new Error('Google Sign-In API no disponible'));
        }
      }, 1000);
    };
    
    script.onerror = (error) => {
      clearTimeout(timeoutId);
      console.error('❌ Error cargando Google script:', error);
      script.remove();
      reject(new Error('Error cargando Google script'));
    };
    
    document.head.appendChild(script);
    console.log('📤 Google script agregado al DOM');
  });
}

// VALIDACIONES MEJORADAS
function validateGoogleConfig() {
  if (!CONFIG.GOOGLE_CLIENT_ID || CONFIG.GOOGLE_CLIENT_ID === 'your-google-client-id') {
    console.error('❌ GOOGLE_CLIENT_ID no configurado correctamente');
    return false;
  }
  
  if (!CONFIG.GOOGLE_CLIENT_ID.includes('.googleusercontent.com')) {
    console.error('❌ GOOGLE_CLIENT_ID parece inválido');
    return false;
  }
  
  console.log('✅ Configuración de Google OAuth válida');
  return true;
}

// AUTO-VALIDACIÓN AL CARGAR
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔧 Validando configuración OAuth...');
  
  if (validateGoogleConfig()) {
    console.log('✅ CONFIG.JS cargado correctamente');
  } else {
    console.error('❌ Errores en configuración OAuth');
  }
});

console.log('✅ config.js - Configuración OAuth Profesional cargada');
