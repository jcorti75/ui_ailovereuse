// config.js - Configuración completa consolidada

const CONFIG = {
  GOOGLE_CLIENT_ID: "326940877598-ko13n1qcqkkugkoo6gu2n1avs46al09p.apps.googleusercontent.com",
  API_BASE: "https://noshopia-production.up.railway.app",
  
  // LÍMITES DIFERENCIADOS
  RECOMMENDATION_LIMITS: { tops: 3, bottoms: 3, shoes: 5 },  // Sin closet
  CLOSET_MAX_TOTAL: 15,                                      // Closet total
  MIN_REQUIRED: { tops: 1, bottoms: 1, shoes: 1 },         // Mínimos obligatorios
  
  // Configuración técnica
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
};

// Variables globales
window.uploadedFiles = { tops: [], bottoms: [], shoes: [] };
window.uploadedImages = { tops: [], bottoms: [], shoes: [] };
window.closetItems = { tops: [], bottoms: [], shoes: [] };
window.closetMode = false;
window.selectedOccasion = null;
window.isLoggedIn = false;
window.currentUser = null;
window.currentResults = null;

// Funciones auxiliares consolidadas
window.getTypeName = function(type) {
  const names = { tops: 'superiores', bottoms: 'inferiores', shoes: 'zapatos' };
  return names[type] || type;
};

window.getTotalClosetItems = function() {
  if (!closetMode || !closetItems) return 0;
  const tops = (closetItems.tops || []).length;
  const bottoms = (closetItems.bottoms || []).length;
  const shoes = (closetItems.shoes || []).length;
  return tops + bottoms + shoes;
};

window.validateUploadLimits = function(type, filesToAdd) {
  if (closetMode) {
    // CLOSET: 15 total
    const currentTotal = getTotalClosetItems();
    const remaining = CONFIG.CLOSET_MAX_TOTAL - currentTotal;
    
    if (remaining < filesToAdd) {
      return {
        valid: false,
        message: remaining === 0 
          ? "Tu closet está lleno (15/15). Elimina prendas para subir nuevas."
          : `Solo puedes subir ${remaining} más. Te quedan ${remaining} espacios.`
      };
    }
    return { valid: true, remainingAfter: remaining - filesToAdd };
  } else {
    // RECOMENDACIONES: Por tipo
    const current = uploadedFiles[type].filter(f => f instanceof File).length;
    const max = CONFIG.RECOMMENDATION_LIMITS[type];
    const available = max - current;
    
    if (available < filesToAdd) {
      return {
        valid: false,
        message: available === 0 
          ? `Máximo de ${getTypeName(type)} alcanzado (${max}). Cambia a closet para más espacio.`
          : `Solo puedes subir ${available} ${getTypeName(type)} más.`
      };
    }
    return { valid: true, remainingForType: available - filesToAdd };
  }
};

window.generateSuccessMessage = function(type, filesCount) {
  const typeName = getTypeName(type);
  const plural = filesCount > 1;
  let message = `${filesCount} foto${plural ? 's' : ''} subida${plural ? 's' : ''}`;
  
  if (closetMode) {
    const total = getTotalClosetItems();
    const remaining = CONFIG.CLOSET_MAX_TOTAL - total;
    message += remaining > 0 
      ? `. Te quedan ${remaining} por subir (${total}/15)`
      : `. ¡Closet completo! (15/15)`;
  } else {
    const current = uploadedFiles[type].filter(f => f instanceof File).length;
    const max = CONFIG.RECOMMENDATION_LIMITS[type];
    const remaining = max - current;
    message += remaining > 0 
      ? `. Puedes subir ${remaining} ${typeName} más (${current}/${max})`
      : `. Máximo alcanzado (${max}/${max})`;
  }
  
  return message;
};

window.showNotification = function(message, type = 'info') {
  console.log(`[${type.toUpperCase()}] ${message}`);
  
  let notification = document.getElementById('notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'notification';
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px; padding: 15px 20px;
      border-radius: 8px; color: white; font-weight: 500; z-index: 9999;
      max-width: 300px; transform: translateX(400px);
      transition: transform 0.3s ease;
    `;
    document.body.appendChild(notification);
  }
  
  const colors = { success: '#10b981', error: '#ef4444', info: '#3b82f6', warning: '#f59e0b' };
  notification.style.backgroundColor = colors[type] || colors.info;
  notification.textContent = message;
  notification.style.transform = 'translateX(0)';
  
  setTimeout(() => notification.style.transform = 'translateX(400px)', 4000);
};

console.log('Config.js cargado - Sistema consolidado listo');
