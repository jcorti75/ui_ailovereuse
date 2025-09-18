// globals.js - Variables y configuración global

// Configuración principal basada en especificaciones exactas
window.CONFIG = {
  GOOGLE_CLIENT_ID: "326940877598-ko13n1qcqkkugkoo6gu2n1avs46al09p.apps.googleusercontent.com",
  API_BASE: "https://noshopia-production.up.railway.app",
  
  // LÍMITES DIFERENCIADOS SEGÚN MODO
  RECOMMENDATION_LIMITS: { 
    tops: 3,     // Para recomendaciones sin closet: máximo 3 tops
    bottoms: 3,  // Para recomendaciones sin closet: máximo 3 bottoms  
    shoes: 5     // Para recomendaciones sin closet: máximo 5 shoes
  },
  
  CLOSET_MAX_TOTAL: 15,  // Para closet: máximo 15 prendas EN TOTAL
  
  // MÍNIMOS OBLIGATORIOS (ambos modos)
  MIN_REQUIRED: {
    tops: 1,     // Mínimo 1 top para generar recomendaciones
    bottoms: 1,  // Mínimo 1 bottom para generar recomendaciones  
    shoes: 1     // Mínimo 1 shoe para generar recomendaciones
  },
  
  // Configuración técnica
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
};

// Variables de autenticación
window.isLoggedIn = false;
window.currentUser = null;
window.profileCompleted = false;

// Variables de archivos subidos
window.uploadedFiles = { tops: [], bottoms: [], shoes: [] };
window.uploadedImages = { tops: [], bottoms: [], shoes: [] };

// Variables de closet
window.closetMode = false;
window.closetItems = { tops: [], bottoms: [], shoes: [] };

// Variables de ocasión y estado
window.selectedOccasion = null;
window.currentResults = null;
window.processingStartTime = 0;
window.userStats = { recommendations: 0 };

// Función de notificaciones global
window.showNotification = function(message, type = 'info') {
  console.log(`[${type.toUpperCase()}] ${message}`);
  
  // Crear elemento de notificación si no existe
  let notification = document.getElementById('notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 9999;
      max-width: 300px;
      transform: translateX(400px);
      transition: transform 0.3s ease;
    `;
    document.body.appendChild(notification);
  }
  
  // Estilos según tipo
  const colors = {
    success: '#10b981',
    error: '#ef4444', 
    info: '#3b82f6',
    warning: '#f59e0b'
  };
  
  notification.style.backgroundColor = colors[type] || colors.info;
  notification.textContent = message;
  notification.style.transform = 'translateX(0)';
  
  // Ocultar después de 4 segundos
  setTimeout(() => {
    notification.style.transform = 'translateX(400px)';
  }, 4000);
};

// Funciones de validación basadas en especificaciones
window.validateUploadLimits = function(type, filesToAdd) {
  if (window.closetMode) {
    // CLOSET: Validar límite total de 15 prendas
    const currentTotal = getTotalClosetItems();
    const remaining = CONFIG.CLOSET_MAX_TOTAL - currentTotal;
    
    if (remaining <= 0) {
      return {
        valid: false,
        message: "Tu closet está lleno (15/15 prendas). Elimina algunas para subir nuevas."
      };
    }
    
    if (filesToAdd > remaining) {
      return {
        valid: false,
        message: `Solo puedes subir ${remaining} prenda${remaining === 1 ? '' : 's'} más. Te quedan ${remaining} espacios en tu closet.`
      };
    }
    
    return {
      valid: true,
      remainingAfter: remaining - filesToAdd
    };
    
  } else {
    // RECOMENDACIONES SIN CLOSET: Validar límites por tipo (3,3,5)
    const currentCount = (window.uploadedFiles[type] || []).filter(f => f instanceof File).length;
    const maxForType = CONFIG.RECOMMENDATION_LIMITS[type];
    const available = maxForType - currentCount;
    
    if (available <= 0) {
      return {
        valid: false,
        message: `Ya tienes el máximo de ${getTypeName(type)} para recomendaciones (${maxForType}). Elimina fotos o cambia a modo closet.`
      };
    }
    
    if (filesToAdd > available) {
      return {
        valid: false,
        message: `Solo puedes subir ${available} foto${available === 1 ? '' : 's'} más de ${getTypeName(type)} (máx ${maxForType}).`
      };
    }
    
    return {
      valid: true,
      remainingForType: available - filesToAdd
    };
  }
};

// Funciones auxiliares globales actualizadas
window.clearPreviousResults = function() {
  window.currentResults = null;
  const resultsContainer = document.getElementById('results');
  if (resultsContainer) {
    resultsContainer.innerHTML = '';
    resultsContainer.style.display = 'none';
  }
};

window.scrollToSection = function(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
};

// Función para generar mensajes de éxito específicos según modo
window.generateSuccessMessage = function(type, filesCount) {
  const typeName = getTypeName(type);
  const plural = filesCount > 1;
  let message = `${filesCount} foto${plural ? 's' : ''} subida${plural ? 's' : ''}`;
  
  if (window.closetMode) {
    // CLOSET: Mostrar contador descendente "te quedan X por subir"
    const totalAfter = getTotalClosetItems();
    const remaining = CONFIG.CLOSET_MAX_TOTAL - totalAfter;
    
    if (remaining > 0) {
      message += `. Te quedan ${remaining} por subir (${totalAfter}/15)`;
    } else {
      message += `. ¡Closet completo! (15/15 prendas)`;
    }
  } else {
    // RECOMENDACIONES: Mostrar contador por tipo
    const currentCount = (window.uploadedFiles[type] || []).filter(f => f instanceof File).length;
    const maxForType = CONFIG.RECOMMENDATION_LIMITS[type];
    const remainingForType = maxForType - currentCount;
    
    if (remainingForType > 0) {
      message += `. Puedes subir ${remainingForType} ${typeName} más (${currentCount}/${maxForType})`;
    } else {
      message += `. Máximo alcanzado para ${typeName} (${maxForType}/${maxForType})`;
    }
  }
  
  return message;
};

// Función para actualizar contador de closet con lógica "te quedan X por subir"
window.updateClosetCounterDisplay = function() {
  if (!window.closetMode) return;
  
  const counter = document.getElementById('closetCounter');
  if (!counter) return;
  
  const total = getTotalClosetItems();
  const remaining = CONFIG.CLOSET_MAX_TOTAL - total;
  
  if (remaining > 0) {
    counter.innerHTML = `📦 Closet: ${total}/15 - Te quedan ${remaining} por subir`;
    counter.className = 'closet-counter active';
    
    // Color según estado
    if (remaining <= 3) {
      counter.style.color = '#f59e0b'; // Amarillo - casi lleno
    } else {
      counter.style.color = '#10b981'; // Verde - normal
    }
  } else {
    counter.innerHTML = `📦 Closet completo: 15/15 prendas`;
    counter.className = 'closet-counter full';
    counter.style.color = '#ef4444'; // Rojo - lleno
  }
  
  counter.style.display = 'block';
};

// Función para generar mensaje de eliminación específico según modo  
window.generateRemovalMessage = function(type) {
  const typeName = getTypeName(type);
  
  if (window.closetMode) {
    const total = getTotalClosetItems();
    const remaining = CONFIG.CLOSET_MAX_TOTAL - total;
    return `Prenda eliminada del closet. Te quedan ${remaining} por subir (${total}/15)`;
  } else {
    const count = (window.uploadedFiles[type] || []).filter(f => f instanceof File).length;
    const max = CONFIG.RECOMMENDATION_LIMITS[type];
    const available = max - count;
    return `Imagen eliminada. Puedes subir ${available} ${typeName} más (${count}/${max})`;
  }
};

// Funciones de closet
window.saveUserClosetData = function() {
  if (!window.currentUser?.email) return;
  
  const userData = {
    email: window.currentUser.email,
    closetItems: window.closetItems,
    profileCompleted: window.profileCompleted,
    lastUpdated: new Date().toISOString()
  };
  
  try {
    localStorage.setItem(`noshopia_user_${window.currentUser.email}`, JSON.stringify(userData));
    console.log('Datos de closet guardados para:', window.currentUser.email);
  } catch (e) {
    console.error('Error guardando datos del closet:', e);
  }
};

window.loadUserClosetData = function() {
  if (!window.currentUser?.email) return false;
  
  try {
    const userData = localStorage.getItem(`noshopia_user_${window.currentUser.email}`);
    if (userData) {
      const data = JSON.parse(userData);
      if (data.closetItems) {
        window.closetItems = data.closetItems;
        window.profileCompleted = data.profileCompleted || false;
        console.log('Datos de closet cargados para:', window.currentUser.email);
        return true;
      }
    }
  } catch (e) {
    console.error('Error cargando datos del closet:', e);
  }
  return false;
};

window.loadClosetItems = function() {
  console.log('Cargando items del closet...');
  // Implementar lógica para mostrar items del closet en la UI
  // Esta función debe actualizar la interfaz con los items guardados
};

console.log('Globals.js cargado - Sistema configurado según especificaciones:');
console.log('• Recomendaciones sin closet: máx 3 tops, 3 bottoms, 5 shoes');
console.log('• Closet: máx 15 prendas totales con contador descendente');
console.log('• Mínimos obligatorios: 1 top, 1 bottom, 1 shoe (ambos modos)');
console.log('• Selección de ocasión requerida antes de generar');
console.log('• Closet con persistencia y guardado de recomendaciones');

// Función de inicialización global
window.initializeGlobals = function() {
  console.log('Inicializando variables globales del sistema...');
  
  // Verificar que todas las variables estén definidas
  if (!window.uploadedFiles) {
    window.uploadedFiles = { tops: [], bottoms: [], shoes: [] };
  }
  if (!window.uploadedImages) {
    window.uploadedImages = { tops: [], bottoms: [], shoes: [] };
  }
  if (!window.closetItems) {
    window.closetItems = { tops: [], bottoms: [], shoes: [] };
  }
  
  console.log('Variables globales inicializadas correctamente');
};
