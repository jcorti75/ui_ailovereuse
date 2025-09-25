// config.js - Configuración Global Centralizada y Corregida

console.log('🔧 Cargando configuración global centralizada...');

// CONFIGURACIÓN PRINCIPAL
const CONFIG = {
  // Google Sign-In
  GOOGLE_CLIENT_ID: '326940877598-ko13n1qcqkkugkoo6gu2n1avs46al09p.apps.googleusercontent.com',
  
  // API Backend
  API_BASE: "https://noshopia-production.up.railway.app",
  
  // Límites de archivos por tipo
  FILE_LIMITS: { 
    tops: 3, 
    bottoms: 3, 
    shoes: 5 
  },
  
  // Mínimo requerido para generar recomendaciones
  MIN_REQUIRED: {
    tops: 1,
    bottoms: 1,  
    shoes: 1
  },
  
  // Límite total del closet
  TOTAL_CLOSET_LIMIT: 15,
  
  // Tamaño máximo de archivo (5MB)
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  
  // Tipos de archivo válidos
  VALID_FILE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  
  // Emails profesionales
  EMAILS: {
    SUPPORT: 'soporte@noshopia.com',
    INFO: 'info@noshopia.com',
    CEO: 'jcorti@noshopia.com'
  }
};

// VARIABLES GLOBALES DE ESTADO (fuente única de verdad)
let isLoggedIn = false;
let currentUser = null;
let selectedOccasion = null;
let closetMode = false;
let processingStartTime = 0;

// Arrays de archivos y datos
let uploadedFiles = { tops: [], bottoms: [], shoes: [] };
let uploadedImages = { tops: [], bottoms: [], shoes: [] };
let closetItems = { tops: [], bottoms: [], shoes: [] };

// Estadísticas del usuario
let userStats = { 
  visits: 1, 
  recommendations: 0, 
  savedOutfits: 0 
};

// Recomendaciones guardadas
let savedRecommendations = [];

// Estado del perfil
let userProfile = { 
  skin_color: null, 
  age_range: null, 
  gender: null 
};
let profileCompleted = false;

// FUNCIONES DE ACCESO CENTRALIZADO AL ESTADO
window.isLoggedIn = () => isLoggedIn;
window.currentUser = () => currentUser;
window.selectedOccasion = () => selectedOccasion;
window.closetMode = () => closetMode;

window.setLoggedIn = (status) => { 
  isLoggedIn = status; 
  console.log(`🔐 Estado de login actualizado: ${status}`);
};

window.setCurrentUser = (user) => { 
  currentUser = user; 
  console.log(`👤 Usuario actual actualizado: ${user?.name || 'null'}`);
};

window.setSelectedOccasion = (occasion) => { 
  selectedOccasion = occasion; 
  console.log(`🎯 Ocasión seleccionada: ${occasion}`);
};

window.setClosetMode = (mode) => { 
  closetMode = mode; 
  console.log(`👗 Modo closet: ${mode}`);
};

// FUNCIONES DE VALIDACIÓN CENTRALIZADAS
window.validateFileType = (file) => {
  return CONFIG.VALID_FILE_TYPES.includes(file.type);
};

window.validateFileSize = (file) => {
  return file.size <= CONFIG.MAX_FILE_SIZE;
};

window.validateUploadLimits = (type, fileCount) => {
  const currentCount = uploadedFiles[type]?.length || 0;
  const maxAllowed = CONFIG.FILE_LIMITS[type];
  const totalAfterUpload = currentCount + fileCount;
  
  if (totalAfterUpload > maxAllowed) {
    return {
      valid: false,
      message: `Máximo ${maxAllowed} archivos para ${getTypeName(type)}. Actualmente tienes ${currentCount}.`
    };
  }
  
  // Verificar límite total del closet si está en modo closet
  if (closetMode) {
    const totalItems = getTotalClosetItems();
    const remainingSlots = CONFIG.TOTAL_CLOSET_LIMIT - totalItems;
    
    if (fileCount > remainingSlots) {
      return {
        valid: false,
        message: `Solo quedan ${remainingSlots} espacios en tu closet (${totalItems}/${CONFIG.TOTAL_CLOSET_LIMIT}).`
      };
    }
  }
  
  return { valid: true };
};

// FUNCIONES AUXILIARES CENTRALIZADAS
window.getTypeName = (type) => {
  const names = {
    'tops': 'superiores',
    'bottoms': 'inferiores', 
    'shoes': 'zapatos'
  };
  return names[type] || type;
};

window.getTotalClosetItems = () => {
  return (closetItems.tops?.length || 0) + 
         (closetItems.bottoms?.length || 0) + 
         (closetItems.shoes?.length || 0);
};

window.getRemainingClosetSlots = () => {
  return Math.max(0, CONFIG.TOTAL_CLOSET_LIMIT - window.getTotalClosetItems());
};

window.generateSuccessMessage = (type, count) => {
  const typeName = window.getTypeName(type);
  const remaining = window.getRemainingClosetSlots();
  
  if (closetMode) {
    return `✅ ${count} ${typeName} agregado(s) al closet. ${remaining} espacios restantes.`;
  } else {
    return `✅ ${count} ${typeName} subido(s) exitosamente.`;
  }
};

// FUNCIONES DE PERSISTENCIA CENTRALIZADAS
window.saveUserData = () => {
  try {
    if (!currentUser || !currentUser.email) {
      console.warn('No hay usuario para guardar datos');
      return false;
    }
    
    const userData = {
      // Información del usuario
      email: currentUser.email,
      name: currentUser.name,
      
      // Datos del closet
      closetItems,
      uploadedFiles,
      uploadedImages,
      
      // Estado del perfil
      userProfile,
      profileCompleted,
      
      // Estadísticas
      userStats,
      savedRecommendations,
      
      // Metadatos
      totalItems: window.getTotalClosetItems(),
      lastSaved: new Date().toISOString(),
      version: '1.0'
    };
    
    localStorage.setItem(`noshopia_user_data_${currentUser.email}`, JSON.stringify(userData));
    console.log(`💾 Datos completos guardados para ${currentUser.name}`);
    
    return true;
    
  } catch (error) {
    console.error('Error guardando datos del usuario:', error);
    return false;
  }
};

window.loadUserData = () => {
  try {
    if (!currentUser || !currentUser.email) {
      console.warn('No hay usuario para cargar datos');
      return false;
    }
    
    const savedData = localStorage.getItem(`noshopia_user_data_${currentUser.email}`);
    if (!savedData) {
      console.log('No hay datos previos para este usuario');
      return false;
    }
    
    const userData = JSON.parse(savedData);
    
    // Restaurar datos
    closetItems = userData.closetItems || { tops: [], bottoms: [], shoes: [] };
    uploadedFiles = userData.uploadedFiles || { tops: [], bottoms: [], shoes: [] };
    uploadedImages = userData.uploadedImages || { tops: [], bottoms: [], shoes: [] };
    
    userProfile = userData.userProfile || { skin_color: null, age_range: null, gender: null };
    profileCompleted = userData.profileCompleted || false;
    
    userStats = userData.userStats || { visits: 1, recommendations: 0, savedOutfits: 0 };
    savedRecommendations = userData.savedRecommendations || [];
    
    console.log(`📂 Datos completos cargados para ${userData.name}: ${userData.totalItems || 0} prendas`);
    
    return true;
    
  } catch (error) {
    console.error('Error cargando datos del usuario:', error);
    return false;
  }
};

window.clearUserData = (email = null) => {
  try {
    const targetEmail = email || (currentUser && currentUser.email);
    
    if (targetEmail) {
      localStorage.removeItem(`noshopia_user_data_${targetEmail}`);
      localStorage.removeItem(`noshopia_profile_${targetEmail}`);
      localStorage.removeItem(`noshopia_profile_completed_${targetEmail}`);
      localStorage.removeItem(`noshopia_closet_${targetEmail}`);
      localStorage.removeItem(`noshopia_current_user`);
      localStorage.removeItem(`noshopia_logged_in`);
      
      console.log(`🗑️ Datos limpiados para ${targetEmail}`);
    }
    
    // Resetear variables globales
    isLoggedIn = false;
    currentUser = null;
    selectedOccasion = null;
    closetMode = false;
    
    uploadedFiles = { tops: [], bottoms: [], shoes: [] };
    uploadedImages = { tops: [], bottoms: [], shoes: [] };
    closetItems = { tops: [], bottoms: [], shoes: [] };
    
    userStats = { visits: 1, recommendations: 0, savedOutfits: 0 };
    savedRecommendations = [];
    userProfile = { skin_color: null, age_range: null, gender: null };
    profileCompleted = false;
    
    console.log('🔄 Estado global reseteado');
    
    return true;
    
  } catch (error) {
    console.error('Error limpiando datos:', error);
    return false;
  }
};

// FUNCIONES DE VERIFICACIÓN DE PERFIL CENTRALIZADAS
window.hasCompletedProfile = (email = null) => {
  try {
    const targetEmail = email || (currentUser && currentUser.email);
    if (!targetEmail) return false;
    
    // Verificar flag de perfil completado
    const profileCompleted = localStorage.getItem(`noshopia_profile_completed_${targetEmail}`);
    if (profileCompleted === 'true') {
      return true;
    }
    
    // Verificar datos de perfil como fallback
    const profileData = localStorage.getItem(`noshopia_profile_${targetEmail}`);
    if (profileData) {
      try {
        const data = JSON.parse(profileData);
        if (data.skin_color && data.age_range && data.gender) {
          // Asegurar que el flag esté presente
          localStorage.setItem(`noshopia_profile_completed_${targetEmail}`, 'true');
          return true;
        }
      } catch (e) {
        console.warn('Error parseando datos de perfil');
      }
    }
    
    return false;
    
  } catch (error) {
    console.error('Error verificando perfil:', error);
    return false;
  }
};

// FUNCIÓN DE CARGA DE GOOGLE SCRIPT CENTRALIZADA
window.loadGoogleScript = () => {
  return new Promise((resolve, reject) => {
    // Verificar si ya está cargado
    if (typeof google !== 'undefined' && google.accounts?.id) {
      resolve();
      return;
    }
    
    console.log('🔄 Cargando Google Sign-In...');
    
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    const timeoutId = setTimeout(() => {
      script.remove();
      reject(new Error('Timeout loading Google script'));
    }, 10000);
    
    script.onload = () => {
      clearTimeout(timeoutId);
      setTimeout(() => {
        if (typeof google !== 'undefined' && google.accounts?.id) {
          console.log('✅ Google Sign-In cargado exitosamente');
          resolve();
        } else {
          reject(new Error('Google Auth no disponible'));
        }
      }, 1000);
    };
    
    script.onerror = () => {
      clearTimeout(timeoutId);
      script.remove();
      reject(new Error('Error loading Google script'));
    };
    
    document.head.appendChild(script);
  });
};

// FUNCIONES DE OCASIONES
const OCCASION_NAMES = {
  'oficina': 'Oficina/Trabajo',
  'deportivo': 'Deportes/Gym',
  'casual': 'Casual',
  'formal': 'Formal',
  'matrimonio': 'Matrimonio'
};

window.getOccasionName = (occasion) => {
  return OCCASION_NAMES[occasion] || occasion;
};

// FUNCIÓN DE NOTIFICACIÓN GLOBAL MEJORADA
window.showNotification = (message, type = 'info') => {
  console.log(`📢 ${type.toUpperCase()}: ${message}`);
  
  try {
    // Remover notificaciones anteriores
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Estilos según el tipo
    const colors = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    };
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type] || colors.info};
      color: white;
      padding: 1rem 2rem;
      border-radius: 15px;
      z-index: 10000;
      font-weight: 600;
      max-width: 350px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      animation: slideInRight 0.3s ease;
      font-family: 'Poppins', sans-serif;
      font-size: 0.9rem;
      line-height: 1.4;
    `;
    
    // Agregar animación si no existe
    if (!document.getElementById('notificationStyles')) {
      const style = document.createElement('style');
      style.id = 'notificationStyles';
      style.textContent = `
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto-remover después de 3 segundos
    setTimeout(() => {
      notification.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
    
  } catch (error) {
    console.error('Error mostrando notificación:', error);
  }
};

// FUNCIONES DE DEBUG Y DESARROLLO
window.debugNoshopiA = () => {
  console.log('=== DEBUG NOSHOPIA ===');
  console.log('Estado de login:', isLoggedIn);
  console.log('Usuario actual:', currentUser);
  console.log('Ocasión seleccionada:', selectedOccasion);
  console.log('Modo closet:', closetMode);
  console.log('Perfil completado:', profileCompleted);
  console.log('Total items closet:', window.getTotalClosetItems());
  console.log('Archivos subidos:', uploadedFiles);
  console.log('Stats usuario:', userStats);
  console.log('===================');
};

window.resetNoshopiA = () => {
  if (confirm('¿Estás seguro de que quieres resetear toda la aplicación?')) {
    window.clearUserData();
    location.reload();
  }
};

// FUNCIONES DE MIGRACIÓN DE DATOS (para versiones anteriores)
window.migrateOldData = () => {
  console.log('🔄 Verificando datos anteriores para migrar...');
  
  try {
    if (!currentUser || !currentUser.email) return false;
    
    const email = currentUser.email;
    let migrated = false;
    
    // Migrar datos del closet antiguos
    const oldClosetData = localStorage.getItem(`noshopia_closet_${email}`);
    if (oldClosetData) {
      const data = JSON.parse(oldClosetData);
      if (data.closetItems) {
        closetItems = data.closetItems;
        uploadedFiles = data.uploadedFiles || { tops: [], bottoms: [], shoes: [] };
        uploadedImages = data.uploadedImages || { tops: [], bottoms: [], shoes: [] };
        migrated = true;
        console.log('📦 Datos de closet migrados');
      }
    }
    
    // Migrar perfil antiguo
    const oldProfile = localStorage.getItem(`noshopia_profile_${email}`);
    if (oldProfile) {
      userProfile = JSON.parse(oldProfile);
      profileCompleted = true;
      migrated = true;
      console.log('👤 Datos de perfil migrados');
    }
    
    if (migrated) {
      // Guardar en nuevo formato
      window.saveUserData();
      console.log('✅ Migración completada');
    }
    
    return migrated;
    
  } catch (error) {
    console.error('Error en migración:', error);
    return false;
  }
};

// INICIALIZACIÓN DE CONFIG
console.log('📊 Configuración cargada:', {
  closetLimit: CONFIG.TOTAL_CLOSET_LIMIT,
  fileLimits: CONFIG.FILE_LIMITS,
  apiBase: CONFIG.API_BASE
});

// Exponer CONFIG globalmente
window.CONFIG = CONFIG;

console.log('✅ config.js - Configuración Global Centralizada cargada');
