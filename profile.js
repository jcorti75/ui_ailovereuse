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

console.log('✅ profile.js - Sistema de Perfiles cargado');
