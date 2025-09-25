// profile.js - Gestión del Perfil de Usuario (Versión Limpia)

// Estado del formulario
let profileData = {
  skin_color: null,
  age_range: null,
  gender: null
};

// NOTIFICACIÓN PERSONALIZADA MEJORADA
function showCustomProfileNotification() {
  // Eliminar notificación anterior si existe
  const existing = document.querySelector('.profile-success-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'profile-success-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(15px);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.4s ease;
  `;

  const modal = document.createElement('div');
  modal.style.cssText = `
    background: linear-gradient(135deg, #ffffff, #f8fafc);
    border-radius: 25px;
    padding: 3rem 2.5rem;
    max-width: 500px;
    width: 90%;
    text-align: center;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.25);
    border: 2px solid rgba(59, 130, 246, 0.1);
    animation: slideInScale 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
  `;

  modal.innerHTML = `
    <div class="success-icon">
      <i class="fas fa-check"></i>
    </div>
    
    <h2>¡Perfil Completado!</h2>
    
    <p>Tu perfil personalizado está listo para crear las mejores recomendaciones de moda sostenible.</p>
    
    <div class="brand-highlight">
      <span class="logo">
        <span style="color: #ef4444;">No</span><span style="color: #000000;">shop</span><span style="color: #22c55e;">i</span><span style="color: #22c55e;">A</span>
      </span>
      <span class="tagline">• Moda Sostenible con IA</span>
    </div>
    
    <button id="profileContinueBtn" class="continue-btn">
      <i class="fas fa-arrow-right"></i>
      Continuar a mis recomendaciones
    </button>
  `;

  // Agregar estilos
  addProfileStyles();

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Manejar click en continuar
  document.getElementById('profileContinueBtn').onclick = () => {
    closeProfileNotification();
  };

  // Cerrar al hacer click fuera
  overlay.onclick = (e) => {
    if (e.target === overlay) closeProfileNotification();
  };

  // Auto-cerrar después de 10 segundos
  setTimeout(closeProfileNotification, 10000);
}

// Cerrar notificación con animación
function closeProfileNotification() {
  const overlay = document.querySelector('.profile-success-overlay');
  if (overlay) {
    overlay.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => overlay.remove(), 300);
  }
}

// Agregar estilos CSS necesarios
function addProfileStyles() {
  const existingStyle = document.getElementById('profileStyles');
  if (existingStyle) return;

  const style = document.createElement('style');
  style.id = 'profileStyles';
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
    
    @keyframes slideInScale {
      0% { 
        opacity: 0; 
        transform: translateY(-30px) scale(0.9); 
      }
      100% { 
        opacity: 1; 
        transform: translateY(0) scale(1); 
      }
    }
    
    .profile-success-overlay .success-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #10b981, #059669);
      border-radius: 50%;
      margin: 0 auto 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
    }
    
    .profile-success-overlay .success-icon i {
      font-size: 2rem;
      color: white;
    }
    
    .profile-success-overlay h2 {
      font-size: 1.8rem;
      font-weight: 800;
      color: #000000;
      margin-bottom: 1rem;
      font-family: 'Poppins', sans-serif;
    }
    
    .profile-success-overlay p {
      color: #000000;
      opacity: 0.8;
      font-size: 1.1rem;
      line-height: 1.6;
      margin-bottom: 2rem;
      font-family: 'Poppins', sans-serif;
    }
    
    .profile-success-overlay .brand-highlight {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(34, 197, 94, 0.1));
      border: 2px solid rgba(59, 130, 246, 0.2);
      border-radius: 15px;
      padding: 1rem;
      margin-bottom: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    
    .profile-success-overlay .logo {
      font-size: 1.2rem;
      font-weight: 900;
      font-family: 'Poppins', sans-serif;
      letter-spacing: 1px;
    }
    
    .profile-success-overlay .tagline {
      color: #000000;
      opacity: 0.7;
      font-size: 0.9rem;
    }
    
    .profile-success-overlay .continue-btn {
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      color: white;
      border: none;
      padding: 1rem 2.5rem;
      border-radius: 25px;
      font-weight: 700;
      font-size: 1.1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
      font-family: 'Poppins', sans-serif;
      display: inline-flex;
      align-items: center;
      gap: 0.8rem;
    }
    
    .profile-success-overlay .continue-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 15px 40px rgba(59, 130, 246, 0.4);
    }
    
    .profile-option {
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
      cursor: pointer !important;
    }
    
    .profile-option:hover {
      transform: translateY(-3px) !important;
      border-color: var(--primary) !important;
      background: rgba(59, 130, 246, 0.05) !important;
    }
    
    .profile-option.selected {
      border-color: var(--primary) !important;
      background: rgba(59, 130, 246, 0.1) !important;
      transform: translateY(-3px) !important;
      box-shadow: 0 5px 15px rgba(59, 130, 246, 0.3) !important;
    }
  `;
  
  document.head.appendChild(style);
}

// CONFIGURAR FORMULARIO DE PERFIL
function setupProfileForm() {
  const profileOptions = document.querySelectorAll('.profile-option');
  const createBtn = document.getElementById('createProfileBtn');
  
  if (profileOptions.length === 0) return false;
  
  console.log('Configurando formulario de perfil...');
  
  profileOptions.forEach(option => {
    // Remover listeners anteriores
    option.replaceWith(option.cloneNode(true));
  });
  
  // Reseleccionar después del clone
  const newOptions = document.querySelectorAll('.profile-option');
  
  newOptions.forEach(option => {
    option.addEventListener('click', function(e) {
      e.preventDefault();
      
      const field = this.dataset.field;
      const value = this.dataset.value;
      
      if (!field || !value) return;
      
      // Limpiar selecciones del mismo campo
      const sameFieldOptions = document.querySelectorAll(`[data-field="${field}"]`);
      sameFieldOptions.forEach(opt => {
        opt.classList.remove('selected');
      });
      
      // Seleccionar actual
      this.classList.add('selected');
      profileData[field] = value;
      
      console.log('Seleccionado:', field, '=', value);
      
      // Verificar si está completo
      checkFormCompletion();
    });
  });
  
  // Configurar botón de crear perfil
  if (createBtn) {
    createBtn.addEventListener('click', function() {
      if (this.disabled) return;
      
      submitProfile();
    });
  }
  
  return true;
}

// Verificar completación del formulario
function checkFormCompletion() {
  const createBtn = document.getElementById('createProfileBtn');
  if (!createBtn) return;
  
  const isComplete = profileData.skin_color && 
                    profileData.age_range && 
                    profileData.gender;
  
  if (isComplete) {
    createBtn.disabled = false;
    createBtn.style.opacity = '1';
    createBtn.style.cursor = 'pointer';
    createBtn.innerHTML = '<i class="fas fa-user-plus"></i> Completar Perfil';
    createBtn.style.background = 'linear-gradient(135deg, var(--success), #059669)';
  } else {
    createBtn.disabled = true;
    createBtn.style.opacity = '0.6';
    createBtn.style.cursor = 'not-allowed';
    createBtn.innerHTML = '<i class="fas fa-user-plus"></i> Selecciona todas las opciones';
    createBtn.style.background = 'linear-gradient(135deg, var(--primary), #1d4ed8)';
  }
}

// Enviar perfil
function submitProfile() {
  console.log('Enviando perfil...', profileData);
  
  try {
    // Obtener email del usuario actual
    const email = (window.currentUser && window.currentUser()) ? 
                  window.currentUser().email : 
                  'default_user';
    
    // Guardar en localStorage
    localStorage.setItem(`noshopia_profile_${email}`, JSON.stringify(profileData));
    localStorage.setItem(`noshopia_profile_completed_${email}`, 'true');
    
    console.log('Perfil guardado para:', email);
    
    // Ocultar formulario
    const profileForm = document.getElementById('profileForm');
    const welcomeSection = document.getElementById('welcomeSection');
    
    if (profileForm) profileForm.style.display = 'none';
    if (welcomeSection) welcomeSection.style.display = 'none';
    
    // Mostrar siguiente paso
    const closetQuestion = document.getElementById('closetQuestion');
    if (closetQuestion) closetQuestion.style.display = 'block';
    
    // Mostrar notificación de éxito
    showCustomProfileNotification();
    
    console.log('Perfil completado exitosamente');
    
  } catch (error) {
    console.error('Error guardando perfil:', error);
    window.showNotification('Error al guardar perfil', 'error');
  }
}

// Cargar perfil existente
function loadExistingProfile() {
  if (!window.currentUser || !window.currentUser()) return;
  
  const email = window.currentUser().email;
  const savedProfile = localStorage.getItem(`noshopia_profile_${email}`);
  
  if (savedProfile) {
    try {
      profileData = JSON.parse(savedProfile);
      console.log('Perfil cargado:', profileData);
      return true;
    } catch (error) {
      console.error('Error cargando perfil:', error);
    }
  }
  
  return false;
}

// Inicializar sistema de perfiles
function initializeProfileSystem() {
  console.log('Inicializando sistema de perfiles...');
  
  // Agregar estilos
  addProfileStyles();
  
  // Intentar configurar formulario
  let attempts = 0;
  const maxAttempts = 5;
  
  const setupInterval = setInterval(() => {
    attempts++;
    
    if (setupProfileForm()) {
      console.log('Formulario de perfil configurado exitosamente');
      clearInterval(setupInterval);
    } else if (attempts >= maxAttempts) {
      console.log('No se pudo configurar el formulario después de', maxAttempts, 'intentos');
      clearInterval(setupInterval);
    }
  }, 1000);
}

// Observer para detectar cuando aparece el formulario
const profileObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'attributes' && 
        mutation.target.id === 'profileForm' && 
        mutation.target.style.display === 'block') {
      
      console.log('Formulario de perfil detectado');
      setTimeout(setupProfileForm, 200);
    }
  });
});

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
  console.log('profile.js cargado');
  
  setTimeout(initializeProfileSystem, 500);
  
  // Iniciar observer
  profileObserver.observe(document.body, {
    attributes: true,
    subtree: true,
    attributeFilter: ['style']
  });
});

// Exponer funciones globalmente si es necesario
window.showCustomProfileNotification = showCustomProfileNotification;
window.submitProfile = submitProfile;
window.loadExistingProfile = loadExistingProfile;

console.log('🔧 Iniciando solución de botones...');

// FUNCIÓN PRINCIPAL PARA ACTIVAR BOTONES
function activatePostLoginButtons() {
  console.log('🎯 Activando botones post-login...');
  
  // FORZAR configuración de botones con retry
  let attempts = 0;
  const maxAttempts = 10;
  
  const setupInterval = setInterval(() => {
    attempts++;
    console.log(`🔄 Intento ${attempts}/${maxAttempts} - configurando botones...`);
    
    // Buscar botones por múltiples métodos
    const enableBtn = document.getElementById('enableClosetBtn') || 
                      document.querySelector('[id*="closet"]') ||
                      document.querySelector('.closet-option:first-child');
                      
    const directBtn = document.getElementById('useDirectModeBtn') ||
                      document.querySelector('[id*="direct"]') ||
                      document.querySelector('.closet-option:last-child');
    
    console.log('Botones encontrados:', { enableBtn: !!enableBtn, directBtn: !!directBtn });
    
    if (enableBtn && directBtn) {
      // CONFIGURAR BOTÓN MI CLOSET DIGITAL
      const newEnableBtn = enableBtn.cloneNode(true);
      enableBtn.parentNode.replaceChild(newEnableBtn, enableBtn);
      
      newEnableBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('🎯 CLICK: Mi Closet Digital');
        
        try {
          // Ejecutar función desde closet.js
          if (typeof window.enableCloset === 'function') {
            window.enableCloset();
          } else if (typeof enableCloset === 'function') {
            enableCloset();
          } else {
            // Fallback manual
            enableClosetManual();
          }
        } catch (error) {
          console.error('Error en enableCloset:', error);
          enableClosetManual();
        }
      });
      
      // CONFIGURAR BOTÓN RECOMENDACIONES RÁPIDAS
      const newDirectBtn = directBtn.cloneNode(true);
      directBtn.parentNode.replaceChild(newDirectBtn, directBtn);
      
      newDirectBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('🎯 CLICK: Recomendaciones Rápidas');
        
        try {
          // Ejecutar función desde closet.js
          if (typeof window.useDirectMode === 'function') {
            window.useDirectMode();
          } else if (typeof useDirectMode === 'function') {
            useDirectMode();
          } else {
            // Fallback manual
            useDirectModeManual();
          }
        } catch (error) {
          console.error('Error en useDirectMode:', error);
          useDirectModeManual();
        }
      });
      
      // Marcar como configurados
      newEnableBtn.setAttribute('data-configured', 'true');
      newDirectBtn.setAttribute('data-configured', 'true');
      
      // Mejorar estilos visuales
      [newEnableBtn, newDirectBtn].forEach(btn => {
        btn.style.cursor = 'pointer';
        btn.style.transition = 'all 0.3s ease';
        
        btn.addEventListener('mouseenter', function() {
          this.style.transform = 'translateY(-5px)';
          this.style.boxShadow = '0 10px 30px rgba(59, 130, 246, 0.3)';
        });
        
        btn.addEventListener('mouseleave', function() {
          this.style.transform = 'translateY(0)';
          this.style.boxShadow = 'none';
        });
      });
      
      clearInterval(setupInterval);
      console.log('✅ Botones configurados exitosamente');
      showNotificationSafe('Botones activados correctamente', 'success');
      
    } else if (attempts >= maxAttempts) {
      clearInterval(setupInterval);
      console.log('⚠️ Máximo de intentos alcanzado - configuración parcial');
    }
  }, 500);
}

// FALLBACK MANUAL PARA MI CLOSET DIGITAL
function enableClosetManual() {
  console.log('🔧 Ejecutando enableCloset manual...');
  
  try {
    // Ocultar pregunta del closet
    const closetQuestion = document.getElementById('closetQuestion');
    if (closetQuestion) {
      closetQuestion.style.display = 'none';
    }
    
    // Mostrar contenedor del closet
    const closetContainer = document.getElementById('closetContainer');
    if (closetContainer) {
      closetContainer.style.display = 'block';
      
      // Configurar email del usuario
      const userEmail = document.getElementById('userEmail');
      if (userEmail) {
        const user = getCurrentUserSafe();
        userEmail.textContent = user && user.email ? user.email : 'Usuario';
      }
      
      // Activar primera pestaña
      showClosetTabManual('superiores');
      
      showNotificationSafe('Mi Closet Digital activado', 'success');
    } else {
      console.error('No se encontró closetContainer');
      showNotificationSafe('Error: No se pudo activar el closet', 'error');
    }
  } catch (error) {
    console.error('Error en enableClosetManual:', error);
    showNotificationSafe('Error activando closet', 'error');
  }
}

// FALLBACK MANUAL PARA RECOMENDACIONES RÁPIDAS
function useDirectModeManual() {
  console.log('🔧 Ejecutando useDirectMode manual...');
  
  try {
    // Ocultar pregunta del closet
    const closetQuestion = document.getElementById('closetQuestion');
    if (closetQuestion) {
      closetQuestion.style.display = 'none';
    }
    
    // Mostrar selector de ocasiones
    const occasionSelector = document.getElementById('occasionSelector');
    if (occasionSelector) {
      occasionSelector.style.display = 'block';
      setupOccasionButtonsManual();
    }
    
    // Mostrar área de upload
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) {
      uploadArea.style.display = 'block';
      setupFileInputsManual();
    }
    
    showNotificationSafe('Recomendaciones Rápidas activado', 'success');
    
  } catch (error) {
    console.error('Error en useDirectModeManual:', error);
    showNotificationSafe('Error activando modo directo', 'error');
  }
}

// CONFIGURAR PESTAÑAS DEL CLOSET MANUAL
function showClosetTabManual(tabId) {
  console.log('📂 Mostrando pestaña manual:', tabId);
  
  // Ocultar todas las pestañas
  document.querySelectorAll('.closet-tab-content').forEach(content => {
    content.style.display = 'none';
  });
  
  // Remover clase active
  document.querySelectorAll('.closet-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Mostrar pestaña seleccionada
  const selectedContent = document.getElementById(tabId);
  if (selectedContent) {
    selectedContent.style.display = 'block';
  }
  
  // Activar tab
  const selectedTab = document.querySelector(`[data-tab="${tabId}"]`);
  if (selectedTab) {
    selectedTab.classList.add('active');
  }
  
  // Configurar clicks en pestañas
  document.querySelectorAll('.closet-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      const newTabId = this.dataset.tab;
      if (newTabId) {
        showClosetTabManual(newTabId);
      }
    });
  });
}

// CONFIGURAR BOTONES DE OCASIÓN MANUAL
function setupOccasionButtonsManual() {
  console.log('🎯 Configurando botones de ocasión manual...');
  
  const occasionBtns = document.querySelectorAll('.occasion-btn');
  
  occasionBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      // Remover selección anterior
      occasionBtns.forEach(b => {
        b.classList.remove('selected');
        b.style.borderColor = 'var(--border)';
        b.style.background = 'var(--background)';
      });
      
      // Seleccionar actual
      this.classList.add('selected');
      this.style.borderColor = 'var(--primary)';
      this.style.background = 'rgba(59, 130, 246, 0.1)';
      
      // Guardar ocasión
      const occasion = this.dataset.occasion;
      window.selectedOccasion = occasion;
      
      console.log('Ocasión seleccionada:', occasion);
      showNotificationSafe(`Ocasión: ${occasion}`, 'success');
      
      // Actualizar botón de generar
      updateGenerateButtonManual();
    });
  });
}

// CONFIGURAR FILE INPUTS MANUAL
function setupFileInputsManual() {
  console.log('📁 Configurando file inputs manual...');
  
  const inputs = ['tops-upload', 'bottoms-upload', 'shoes-upload'];
  
  inputs.forEach(inputId => {
    const input = document.getElementById(inputId);
    if (input) {
      input.addEventListener('change', function(e) {
        const type = inputId.split('-')[0]; // tops, bottoms, shoes
        handleFileUploadManual(type, this);
      });
    }
  });
}

// MANEJAR UPLOAD DE ARCHIVOS MANUAL
function handleFileUploadManual(type, input) {
  const files = Array.from(input.files);
  if (files.length === 0) return;
  
  console.log(`📷 Archivos para ${type}:`, files.length);
  
  // Inicializar arrays globales
  if (!window.uploadedFiles) window.uploadedFiles = { tops: [], bottoms: [], shoes: [] };
  if (!window.uploadedImages) window.uploadedImages = { tops: [], bottoms: [], shoes: [] };
  
  // Limpiar archivos anteriores
  window.uploadedFiles[type] = [];
  window.uploadedImages[type] = [];
  
  let processed = 0;
  
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = function(e) {
      window.uploadedFiles[type].push(file);
      window.uploadedImages[type].push(e.target.result);
      
      processed++;
      if (processed === files.length) {
        updatePreviewManual(type);
        updateGenerateButtonManual();
        showNotificationSafe(`${files.length} archivo(s) agregado(s)`, 'success');
      }
    };
    reader.readAsDataURL(file);
  });
}

// ACTUALIZAR PREVIEW MANUAL
function updatePreviewManual(type) {
  const previewContainer = document.getElementById(`${type}-preview`);
  if (!previewContainer || !window.uploadedImages) return;
  
  const images = window.uploadedImages[type] || [];
  
  previewContainer.innerHTML = images.map((imageUrl, index) => `
    <div style="position: relative; display: inline-block; margin: 5px;">
      <img src="${imageUrl}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 10px; border: 2px solid var(--primary);">
      <button onclick="removeImageManual('${type}', ${index})" style="position: absolute; top: -8px; right: -8px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-size: 12px;">×</button>
    </div>
  `).join('');
}

// REMOVER IMAGEN MANUAL
function removeImageManual(type, index) {
  if (window.uploadedFiles && window.uploadedFiles[type]) {
    window.uploadedFiles[type].splice(index, 1);
    window.uploadedImages[type].splice(index, 1);
    
    updatePreviewManual(type);
    updateGenerateButtonManual();
    showNotificationSafe('Imagen eliminada', 'info');
  }
}

// ACTUALIZAR BOTÓN DE GENERAR MANUAL
function updateGenerateButtonManual() {
  const generateBtn = document.getElementById('generateBtn');
  if (!generateBtn) return;
  
  const hasOccasion = window.selectedOccasion;
  
  let hasAllFiles = false;
  if (window.uploadedFiles) {
    const hasTops = window.uploadedFiles.tops && window.uploadedFiles.tops.length > 0;
    const hasBottoms = window.uploadedFiles.bottoms && window.uploadedFiles.bottoms.length > 0;
    const hasShoes = window.uploadedFiles.shoes && window.uploadedFiles.shoes.length > 0;
    hasAllFiles = hasTops && hasBottoms && hasShoes;
  }
  
  if (hasOccasion && hasAllFiles) {
    generateBtn.disabled = false;
    generateBtn.style.opacity = '1';
    generateBtn.style.cursor = 'pointer';
    generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generar Recomendaciones';
    
    // Configurar click del botón generar
    generateBtn.onclick = function() {
      console.log('🚀 Generando recomendaciones...');
      
      if (typeof window.getRecommendation === 'function') {
        window.getRecommendation();
      } else {
        showNotificationSafe('Generando recomendaciones...', 'info');
        // Aquí puedes agregar la lógica de generación
      }
    };
    
  } else {
    generateBtn.disabled = true;
    generateBtn.style.opacity = '0.6';
    generateBtn.style.cursor = 'not-allowed';
    
    if (!hasOccasion) {
      generateBtn.innerHTML = '<i class="fas fa-calendar"></i> Selecciona una ocasión primero';
    } else {
      generateBtn.innerHTML = '<i class="fas fa-upload"></i> Sube fotos de cada categoría';
    }
  }
}

// FUNCIÓN DE NOTIFICACIÓN SEGURA
function showNotificationSafe(message, type = 'info') {
  console.log(`📢 ${type.toUpperCase()}: ${message}`);
  
  try {
    if (typeof window.showNotification === 'function') {
      window.showNotification(message, type);
      return;
    }
    
    // Crear notificación propia
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
      color: white;
      padding: 1rem 2rem;
      border-radius: 10px;
      z-index: 10000;
      font-weight: 600;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      max-width: 300px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 3000);
    
  } catch (error) {
    console.error('Error mostrando notificación:', error);
  }
}

// OBTENER USUARIO ACTUAL SEGURO
function getCurrentUserSafe() {
  try {
    if (window.currentUser && typeof window.currentUser === 'object') {
      return window.currentUser;
    }
    return null;
  } catch (error) {
    return null;
  }
}

// EXPONER FUNCIONES GLOBALMENTE
window.activatePostLoginButtons = activatePostLoginButtons;
window.removeImageManual = removeImageManual;

// AUTO-INICIALIZACIÓN CON OBSERVERS
const initObserver = new MutationObserver(() => {
  const closetQuestion = document.getElementById('closetQuestion');
  if (closetQuestion && closetQuestion.style.display === 'block') {
    console.log('👁️ Observer detectó closetQuestion visible');
    setTimeout(activatePostLoginButtons, 200);
  }
});

// Iniciar observer
setTimeout(() => {
  const body = document.body;
  if (body) {
    initObserver.observe(body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style']
    });
    console.log('👁️ Observer iniciado para detectar cambios');
  }
}, 1000);

// MODIFICAR LA FUNCIÓN submitUserProfile EN profile.js
// Agregar al final de la función existente:
function enhanceSubmitUserProfile() {
  // Buscar la función original
  const originalSubmit = window.submitUserProfile;
  
  if (originalSubmit) {
    window.submitUserProfile = function() {
      // Ejecutar función original
      const result = originalSubmit.apply(this, arguments);
      
      // CRÍTICO: Activar botones después del perfil
      setTimeout(() => {
        console.log('🎯 Activando botones post-perfil...');
        activatePostLoginButtons();
      }, 1000);
      
      return result;
    };
    
    console.log('✅ submitUserProfile mejorado para activar botones');
  }
}

// Ejecutar mejora cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', enhanceSubmitUserProfile);
} else {
  enhanceSubmitUserProfile();
}
console.log('✅ profile.js - Sistema de Perfiles cargado');
