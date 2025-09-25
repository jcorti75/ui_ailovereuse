// profile.js - Sistema de Perfilamiento Corregido

// Estado del formulario
let profileData = {
  skin_color: null,
  age_range: null,
  gender: null
};

// NOTIFICACIÓN PERSONALIZADA MEJORADA CON NAVEGACIÓN
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

  // Auto-cerrar después de 8 segundos y navegar automáticamente
  setTimeout(() => {
    closeProfileNotification();
  }, 8000);
}

// Cerrar notificación con navegación automática
function closeProfileNotification() {
  const overlay = document.querySelector('.profile-success-overlay');
  if (overlay) {
    overlay.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
      overlay.remove();
      
      // NAVEGACIÓN AUTOMÁTICA CRUCIAL POST-PERFIL
      navigateToClosetOptions();
      
    }, 300);
  }
}

// NAVEGACIÓN AUTOMÁTICA A OPCIONES DEL CLOSET (función crítica)
function navigateToClosetOptions() {
  console.log('🎯 Navegando automáticamente a opciones del closet...');
  
  try {
    // 1. Ocultar formulario de perfil y bienvenida
    const profileForm = document.getElementById('profileForm');
    const welcomeSection = document.getElementById('welcomeSection');
    
    if (profileForm) profileForm.style.display = 'none';
    if (welcomeSection) welcomeSection.style.display = 'none';
    
    // 2. Mostrar opciones del closet
    const closetQuestion = document.getElementById('closetQuestion');
    if (closetQuestion) {
      closetQuestion.style.display = 'block';
      
      // 3. SCROLL AUTOMÁTICO SUAVE A LAS OPCIONES
      setTimeout(() => {
        closetQuestion.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        
        // 4. DESTACAR OPCIONES DESPUÉS DEL SCROLL
        setTimeout(() => {
          highlightClosetOptions();
          setupClosetOptionButtons(); // Asegurar que los botones funcionen
        }, 800);
        
      }, 500);
    }
    
    // 5. Mostrar mensaje contextual
    setTimeout(() => {
      if (typeof window.showNotification === 'function') {
        window.showNotification('Elige tu método preferido de recomendaciones', 'info');
      }
    }, 1500);
    
    console.log('✅ Navegación automática completada');
    
  } catch (error) {
    console.error('Error en navegación automática:', error);
    
    // Fallback: mostrar opciones sin animación
    const closetQuestion = document.getElementById('closetQuestion');
    if (closetQuestion) {
      closetQuestion.style.display = 'block';
      setupClosetOptionButtons();
    }
  }
}

// DESTACAR OPCIONES DEL CLOSET VISUALMENTE
function highlightClosetOptions() {
  console.log('✨ Destacando opciones del closet...');
  
  const options = document.querySelectorAll('.closet-option');
  
  options.forEach((option, index) => {
    // Animación escalonada para cada opción
    setTimeout(() => {
      // Efecto de pulse con escala
      option.style.animation = 'pulse 1s ease-in-out';
      option.style.transform = 'scale(1.05)';
      option.style.boxShadow = '0 15px 40px rgba(59, 130, 246, 0.3)';
      option.style.borderColor = 'var(--primary)';
      
      // Volver al estado normal después de la animación
      setTimeout(() => {
        option.style.transform = 'scale(1)';
        option.style.boxShadow = 'none';
        option.style.borderColor = 'var(--border)';
      }, 1000);
      
    }, index * 300); // 300ms de delay entre cada opción
  });
  
  // Agregar estilos de animación si no existen
  if (!document.getElementById('highlightStyles')) {
    const style = document.createElement('style');
    style.id = 'highlightStyles';
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
      }
    `;
    document.head.appendChild(style);
  }
}

// CONFIGURAR BOTONES DE OPCIONES DEL CLOSET
function setupClosetOptionButtons() {
  console.log('🔧 Configurando botones de opciones desde profile.js...');
  
  const enableBtn = document.getElementById('enableClosetBtn') || 
                   document.querySelector('.closet-option:first-child');
  const directBtn = document.getElementById('useDirectModeBtn') || 
                   document.querySelector('.closet-option:last-child');
  
  if (enableBtn && directBtn) {
    // Limpiar event listeners anteriores clonando elementos
    const newEnableBtn = enableBtn.cloneNode(true);
    const newDirectBtn = directBtn.cloneNode(true);
    
    enableBtn.parentNode.replaceChild(newEnableBtn, enableBtn);
    directBtn.parentNode.replaceChild(newDirectBtn, directBtn);
    
    // MI CLOSET DIGITAL
    newEnableBtn.onclick = function(e) {
      e.preventDefault();
      console.log('🎯 CLICK desde profile.js: Mi Closet Digital');
      
      if (typeof window.enableCloset === 'function') {
        window.enableCloset();
      } else {
        enableClosetFromProfile();
      }
    };
    
    // RECOMENDACIONES RÁPIDAS
    newDirectBtn.onclick = function(e) {
      e.preventDefault();
      console.log('⚡ CLICK desde profile.js: Recomendaciones Rápidas');
      
      if (typeof window.useDirectMode === 'function') {
        window.useDirectMode();
      } else {
        useDirectModeFromProfile();
      }
    };
    
    // Mejorar estilos hover
    [newEnableBtn, newDirectBtn].forEach(btn => {
      btn.style.cursor = 'pointer';
      btn.style.transition = 'all 0.3s ease';
      
      btn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
        this.style.boxShadow = '0 10px 30px rgba(59, 130, 246, 0.2)';
      });
      
      btn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = 'none';
      });
    });
    
    console.log('✅ Botones configurados desde profile.js');
    
  } else {
    console.warn('❌ No se encontraron botones de opciones');
  }
}

// FALLBACK: ACTIVAR MI CLOSET DIGITAL DESDE PROFILE
function enableClosetFromProfile() {
  console.log('🔧 Activando Mi Closet Digital desde profile...');
  
  const closetQuestion = document.getElementById('closetQuestion');
  const closetContainer = document.getElementById('closetContainer');
  
  if (closetQuestion) closetQuestion.style.display = 'none';
  
  if (closetContainer) {
    closetContainer.style.display = 'block';
    
    // Configurar información del usuario
    const userEmail = document.getElementById('userEmail');
    if (userEmail && window.currentUser && typeof window.currentUser === 'function') {
      const user = window.currentUser();
      if (user) {
        userEmail.textContent = `${user.name} (${user.email})`;
      }
    }
    
    // Scroll al closet
    setTimeout(() => {
      closetContainer.scrollIntoView({ behavior: 'smooth' });
    }, 300);
    
    if (typeof window.showNotification === 'function') {
      window.showNotification('Mi Closet Digital activado', 'success');
    }
    
    console.log('✅ Mi Closet Digital activado desde profile');
  }
}

// FALLBACK: ACTIVAR RECOMENDACIONES RÁPIDAS DESDE PROFILE
function useDirectModeFromProfile() {
  console.log('⚡ Activando Recomendaciones Rápidas desde profile...');
  
  const closetQuestion = document.getElementById('closetQuestion');
  const occasionSelector = document.getElementById('occasionSelector');
  const uploadArea = document.getElementById('uploadArea');
  
  if (closetQuestion) closetQuestion.style.display = 'none';
  
  if (occasionSelector) {
    occasionSelector.style.display = 'block';
  }
  
  if (uploadArea) {
    uploadArea.style.display = 'block';
    
    // Scroll al área de upload
    setTimeout(() => {
      uploadArea.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  }
  
  if (typeof window.showNotification === 'function') {
    window.showNotification('Recomendaciones Rápidas activado', 'success');
  }
  
  console.log('✅ Recomendaciones Rápidas activado desde profile');
}

// AGREGAR ESTILOS CSS NECESARIOS
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

// CONFIGURAR FORMULARIO DE PERFIL (mejorado)
function setupProfileForm() {
  console.log('📋 Configurando formulario de perfil...');
  
  // Verificar que los elementos existen
  const profileOptions = document.querySelectorAll('.profile-option');
  const createBtn = document.getElementById('createProfileBtn');
  
  if (profileOptions.length === 0) {
    console.warn('No se encontraron opciones de perfil');
    return false;
  }
  
  // Limpiar selecciones anteriores
  profileData = { skin_color: null, age_range: null, gender: null };
  
  // Remover listeners anteriores clonando elementos
  const newOptions = [];
  profileOptions.forEach(option => {
    const newOption = option.cloneNode(true);
    option.parentNode.replaceChild(newOption, option);
    newOptions.push(newOption);
  });
  
  // Configurar nuevos listeners
  newOptions.forEach(option => {
    option.addEventListener('click', function(e) {
      e.preventDefault();
      
      const field = this.dataset.field;
      const value = this.dataset.value;
      
      if (!field || !value) {
        console.warn('Opción sin field o value:', this);
        return;
      }
      
      // Limpiar selecciones del mismo campo
      const sameFieldOptions = document.querySelectorAll(`[data-field="${field}"]`);
      sameFieldOptions.forEach(opt => {
        opt.classList.remove('selected');
      });
      
      // Seleccionar actual
      this.classList.add('selected');
      profileData[field] = value;
      
      console.log('Selección actualizada:', field, '=', value);
      
      // Verificar completación
      checkFormCompletion();
    });
  });
  
  // Verificar botón inicialmente
  checkFormCompletion();
  
  console.log('✅ Formulario de perfil configurado');
  return true;
}

// VERIFICAR COMPLETACIÓN DEL FORMULARIO
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
    
    // Configurar click del botón
    createBtn.onclick = function() {
      if (!this.disabled) {
        submitProfile();
      }
    };
    
  } else {
    createBtn.disabled = true;
    createBtn.style.opacity = '0.6';
    createBtn.style.cursor = 'not-allowed';
    createBtn.innerHTML = '<i class="fas fa-user-plus"></i> Selecciona todas las opciones';
    createBtn.style.background = 'linear-gradient(135deg, #6b7280, #4b5563)';
    createBtn.onclick = null;
  }
}

// ENVIAR PERFIL (función principal)
function submitProfile() {
  console.log('📤 Enviando perfil...', profileData);
  
  try {
    // Obtener email del usuario actual
    let email = 'default_user';
    if (window.currentUser && typeof window.currentUser === 'function') {
      const user = window.currentUser();
      if (user && user.email) {
        email = user.email;
      }
    }
    
    // Guardar datos de perfil
    localStorage.setItem(`noshopia_profile_${email}`, JSON.stringify(profileData));
    localStorage.setItem(`noshopia_profile_completed_${email}`, 'true');
    
    console.log('💾 Perfil guardado para:', email);
    
    // Deshabilitar botón durante el proceso
    const createBtn = document.getElementById('createProfileBtn');
    if (createBtn) {
      createBtn.disabled = true;
      createBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    }
    
    // Mostrar notificación de éxito con navegación automática
    setTimeout(() => {
      showCustomProfileNotification();
    }, 500);
    
    console.log('✅ Perfil completado exitosamente');
    
  } catch (error) {
    console.error('❌ Error guardando perfil:', error);
    
    if (typeof window.showNotification === 'function') {
      window.showNotification('Error al guardar perfil. Intenta de nuevo.', 'error');
    }
    
    // Rehabilitar botón
    const createBtn = document.getElementById('createProfileBtn');
    if (createBtn) {
      createBtn.disabled = false;
      createBtn.innerHTML = '<i class="fas fa-user-plus"></i> Completar Perfil';
    }
  }
}

// CARGAR PERFIL EXISTENTE
function loadExistingProfile(email) {
  if (!email) return false;
  
  try {
    const savedProfile = localStorage.getItem(`noshopia_profile_${email}`);
    if (savedProfile) {
      profileData = JSON.parse(savedProfile);
      console.log('📂 Perfil existente cargado:', profileData);
      return true;
    }
  } catch (error) {
    console.error('Error cargando perfil existente:', error);
  }
  
  return false;
}

// INICIALIZACIÓN DEL SISTEMA DE PERFILES
function initializeProfileSystem() {
  console.log('🚀 Inicializando sistema de perfiles...');
  
  // Agregar estilos
  addProfileStyles();
  
  // Configurar formulario si está visible
  const profileForm = document.getElementById('profileForm');
  if (profileForm && profileForm.style.display !== 'none') {
    setTimeout(() => {
      setupProfileForm();
    }, 500);
  }
  
  console.log('✅ Sistema de perfiles inicializado');
}

// OBSERVER PARA DETECTAR CUANDO APARECE EL FORMULARIO
const profileObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'attributes' && 
        mutation.target.id === 'profileForm' && 
        mutation.target.style.display === 'block') {
      
      console.log('👁️ Formulario de perfil detectado visible');
      setTimeout(() => {
        setupProfileForm();
      }, 200);
    }
  });
});

// EXPONER FUNCIONES GLOBALMENTE
window.setupProfileForm = setupProfileForm;
window.submitProfile = submitProfile;
window.loadExistingProfile = loadExistingProfile;
window.navigateToClosetOptions = navigateToClosetOptions;

// INICIALIZACIÓN PRINCIPAL
document.addEventListener('DOMContentLoaded', function() {
  console.log('📄 profile.js cargando...');
  
  // Inicializar sistema
  setTimeout(initializeProfileSystem, 100);
  
  // Iniciar observer
  if (document.body) {
    profileObserver.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ['style']
    });
    console.log('👁️ Observer de perfil iniciado');
  }
  
  console.log('✅ profile.js cargado completamente');
});

console.log('✅ profile.js - Sistema de Perfilamiento Corregido cargado');
