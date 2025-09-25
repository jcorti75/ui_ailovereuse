// auth.js - Sistema de Autenticación Completo CORREGIDO

// Las variables globales están definidas en globals.js o main.js
// No redefinir aquí, solo usarlas

// Función para cargar Google Script
function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (typeof google !== 'undefined') {
      console.log('Google ya está cargado');
      resolve();
      return;
    }
    
    console.log('Cargando Google Script...');
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('Google Script cargado exitosamente');
      resolve();
    };
    script.onerror = (error) => {
      console.error('Error cargando Google Script:', error);
      reject(error);
    };
    document.head.appendChild(script);
  });
}

// Verificar Google Auth
async function checkGoogleAuth() {
  console.log('Iniciando carga de Google Auth...');
  
  try {
    await loadGoogleScript();
    console.log('Google Script cargado exitosamente');
    initializeGoogleAuth();
  } catch (error) {
    console.error('Error cargando Google Script:', error);
    showAlternativeAuth();
  }
}

// Mostrar autenticación alternativa
function showAlternativeAuth() {
  const headerBtn = document.getElementById('headerLoginBtn');
  if (headerBtn) {
    headerBtn.innerHTML = '<i class="fab fa-google"></i> Iniciar con Gmail';
    headerBtn.onclick = () => {
      showManualEmailForm();
    };
  }
  showNotification('Ingresa tu Gmail para continuar', 'info');
}

// Formulario manual de email
function showManualEmailForm() {
  const email = prompt('Ingresa tu email para continuar:');
  if (email && email.includes('@')) {
    // Limpiar estado antes de nuevo login
    clearAllUserState();
    
    currentUser = {
      name: email.split('@')[0],
      email: email,
      picture: 'https://via.placeholder.com/40',
      token: 'manual_' + Date.now()
    };
    
    isLoggedIn = true;
    updateAuthUI();
    
    // Usar el flujo corregido
    checkProfileAndRedirectCorrect();
    
    showNotification(`Bienvenido ${currentUser.name}!`, 'success');
  } else {
    showNotification('Email inválido', 'error');
  }
}

// Inicializar Google Auth
function initializeGoogleAuth() {
  try {
    console.log('Inicializando Google Auth...');
    console.log('Client ID:', CONFIG.GOOGLE_CLIENT_ID);
    
    google.accounts.id.initialize({
      client_id: CONFIG.GOOGLE_CLIENT_ID,
      callback: handleGoogleSignIn,
      auto_select: false,
      ux_mode: 'popup'
    });
    
    console.log('Google Auth inicializado correctamente');
    
    const headerBtn = document.getElementById('headerLoginBtn');
    if (headerBtn) {
      headerBtn.innerHTML = '<i class="fab fa-google"></i> Iniciar sesión';
      headerBtn.onclick = handleMainLogin;
      headerBtn.disabled = false;
      headerBtn.style.opacity = '1';
      headerBtn.style.cursor = 'pointer';
    }
    
  } catch (e) {
    console.error('Error inicializando Google Auth:', e);
    showNotification('Error configurando Google Auth', 'error');
  }
}

// FUNCIÓN CORREGIDA: Manejar Google Sign In con flujo correcto
async function handleGoogleSignIn(response) {
  if (!response.credential) return;
  
  try {
    console.log('Procesando login de Google...');
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    
    // Limpiar estado antes de nuevo login
    clearAllUserState();
    
    currentUser = {
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
      token: response.credential
    };
    
    isLoggedIn = true;
    updateAuthUI();
    
    // FLUJO CORREGIDO: Verificar perfil y redirigir correctamente
    await checkProfileAndRedirectCorrect();
    
    console.log('Login exitoso:', currentUser.email);
  } catch (e) {
    console.error('Error en login:', e);
    showNotification('Error al iniciar sesión', 'error');
  }
}

// FUNCIÓN NUEVA: Verificar perfil y redirigir según flujo correcto
async function checkProfileAndRedirectCorrect() {
  try {
    showNotification(`Bienvenido ${currentUser.name}! Verificando perfil...`, 'info');
    
    // Verificar si el usuario ya tiene un perfil completo
    const hasProfile = await checkExistingProfile(currentUser.email);
    
    if (hasProfile) {
      // USUARIO EXISTENTE → Ir directo a opciones (Closet vs Directo)
      console.log('Usuario existente - ir directo a opciones');
      loadUserClosetData();
      
      setTimeout(() => {
        scrollToSection('upload');
        showFinalOptions(); // Ir directo a opciones finales
      }, 1500);
      
      showNotification('Perfil cargado. Elige tu método de recomendación.', 'success');
      
    } else {
      // USUARIO NUEVO → Perfilamiento primero
      console.log('Usuario nuevo - mostrar perfilamiento');
      
      setTimeout(() => {
        scrollToSection('upload');
        showNewUserProfileForm();
      }, 1500);
      
      showNotification('¡Bienvenido! Completa tu perfil para continuar.', 'success');
    }
    
  } catch (error) {
    console.error('Error en verificación de perfil:', error);
    // En caso de error, mostrar perfilamiento por seguridad
    setTimeout(() => {
      scrollToSection('upload');
      showNewUserProfileForm();
    }, 1500);
  }
}

// FUNCIÓN NUEVA: Mostrar formulario de perfil para usuarios nuevos
function showNewUserProfileForm() {
  console.log('Mostrando formulario de perfil para usuario nuevo');
  
  // Ocultar todas las secciones principales
  hideAllMainSections();
  
  // Mostrar SOLO la sección de bienvenida y perfil
  const welcomeSection = document.getElementById('welcomeSection');
  if (welcomeSection) {
    welcomeSection.style.display = 'block';
    updateWelcomeStats();
  }
  
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.style.display = 'block';
    setupProfileFormHandlers();
  }
}

// FUNCIÓN NUEVA: Mostrar opciones finales (Closet vs Directo)
function showFinalOptions() {
  console.log('Mostrando opciones finales: Closet Digital vs Recomendaciones Rápidas');
  
  // Ocultar todas las demás secciones
  hideAllMainSections();
  
  // Mostrar ÚNICAMENTE las opciones finales
  const closetQuestion = document.getElementById('closetQuestion');
  if (closetQuestion) {
    closetQuestion.style.display = 'block';
    setupFinalOptionsHandlers();
  }
}

// FUNCIÓN NUEVA: Configurar manejadores del formulario de perfil
function setupProfileFormHandlers() {
  console.log('Configurando manejadores del formulario de perfil');
  
  const profileOptions = document.querySelectorAll('.profile-option');
  const createBtn = document.getElementById('createProfileBtn');
  
  let selectedOptions = {
    skin_color: null,
    age_range: null,
    gender: null
  };
  
  profileOptions.forEach(option => {
    option.addEventListener('click', function() {
      const field = this.dataset.field;
      const value = this.dataset.value;
      
      // Desseleccionar otras opciones del mismo campo
      document.querySelectorAll(`[data-field="${field}"]`).forEach(opt => {
        opt.classList.remove('selected');
      });
      
      // Seleccionar esta opción
      this.classList.add('selected');
      selectedOptions[field] = value;
      
      // Verificar si todas las opciones están seleccionadas
      const allSelected = Object.values(selectedOptions).every(val => val !== null);
      
      if (createBtn) {
        if (allSelected) {
          createBtn.disabled = false;
          createBtn.style.opacity = '1';
          createBtn.innerHTML = '<i class="fas fa-user-plus"></i> Completar Perfil';
        } else {
          createBtn.disabled = true;
          createBtn.style.opacity = '0.6';
          createBtn.innerHTML = '<i class="fas fa-user-plus"></i> Selecciona todas las opciones';
        }
      }
    });
  });
  
  // Configurar botón de crear perfil
  if (createBtn) {
    createBtn.onclick = function() {
      if (Object.values(selectedOptions).every(val => val !== null)) {
        submitUserProfile(selectedOptions);
      }
    };
  }
}

// FUNCIÓN NUEVA: Enviar perfil del usuario
async function submitUserProfile(profileData) {
  if (!profileData || !currentUser) {
    showNotification('Error: datos de perfil incompletos', 'error');
    return;
  }
  
  try {
    showNotification('Guardando perfil...', 'info');
    
    const profilePayload = {
      email: currentUser.email,
      name: currentUser.name,
      ...profileData,
      created_at: new Date().toISOString(),
      profileCompleted: true
    };
    
    // Guardar en localStorage
    localStorage.setItem(`noshopia_profile_${currentUser.email}`, JSON.stringify(profilePayload));
    localStorage.setItem(`noshopia_user_${currentUser.email}`, JSON.stringify(profilePayload));
    
    // Intentar guardar en backend (sin bloquear el flujo)
    try {
      const response = await fetch(`${CONFIG.API_BASE}/api/profile/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profilePayload)
      });
      
      if (response.ok) {
        console.log('Perfil guardado en backend');
      }
    } catch (backendError) {
      console.log('Backend no disponible, perfil guardado localmente');
    }
    
    profileCompleted = true;
    
    showNotification('¡Perfil completado!', 'success');
    
    // FLUJO CORREGIDO: Ir directo a opciones finales después de 1 segundo
    setTimeout(() => {
      showClosetQuestionAfterProfile();
    }, 1000);
    
  } catch (error) {
    console.error('Error guardando perfil:', error);
    showNotification('Error guardando perfil. Inténtalo de nuevo.', 'error');
  }
}

// FUNCIÓN NUEVA: Después del perfilamiento → Ir directo a opciones finales
function showClosetQuestionAfterProfile() {
  console.log('Perfilamiento completado - mostrando opciones finales');
  
  // Ocultar formulario de perfil y bienvenida
  const profileForm = document.getElementById('profileForm');
  const welcomeSection = document.getElementById('welcomeSection');
  
  if (profileForm) profileForm.style.display = 'none';
  if (welcomeSection) welcomeSection.style.display = 'none';
  
  // Mostrar INMEDIATAMENTE las opciones finales
  showFinalOptions();
  
  showNotification('Perfil creado. Ahora elige cómo quieres obtener recomendaciones.', 'success');
}

// FUNCIÓN NUEVA: Configurar manejadores de las opciones finales
function setupFinalOptionsHandlers() {
  console.log('Configurando opciones finales: Closet Digital vs Recomendaciones Rápidas');
  
  // Configurar opción "Mi Closet" (Closet Digital)
  const closetOption = document.querySelector('.closet-option[onclick="enableCloset()"]');
  if (closetOption) {
    closetOption.onclick = function() {
      console.log('Usuario eligió: Closet Digital');
      activateClosetDigitalMode();
    };
  }
  
  // Configurar opción "Ir directo" (Recomendaciones Rápidas)
  const directOption = document.querySelector('.closet-option[onclick="useDirectMode()"]');
  if (directOption) {
    directOption.onclick = function() {
      console.log('Usuario eligió: Recomendaciones Rápidas');
      activateDirectRecommendationsMode();
    };
  }
}

// FUNCIÓN NUEVA: Activar Closet Digital
function activateClosetDigitalMode() {
  console.log('Activando Closet Digital...');
  closetMode = true;
  
  // Ocultar pregunta de opciones
  const closetQuestion = document.getElementById('closetQuestion');
  if (closetQuestion) closetQuestion.style.display = 'none';
  
  // Mostrar contenedor del closet
  const closetContainer = document.getElementById('closetContainer');
  if (closetContainer) {
    closetContainer.style.display = 'block';
    
    // Configurar datos del usuario en el closet
    const userEmail = document.getElementById('userEmail');
    if (userEmail) userEmail.textContent = currentUser.email;
    
    // Cargar datos existentes si los hay
    loadUserClosetData();
    
    // Configurar funcionalidad del closet (debería estar en closet.js)
    if (typeof updateClosetDisplay === 'function') {
      updateClosetDisplay();
    }
    
    // Configurar carpetas para subir (debería estar en closet.js)  
    setTimeout(() => {
      if (typeof setupClosetFolderUploads === 'function') {
        setupClosetFolderUploads();
      }
    }, 500);
  }
  
  // Mostrar selector de ocasiones también
  showOccasionSelector();
  
  showNotification('Closet Digital activado. Organiza tu ropa por categorías.', 'success');
}

// FUNCIÓN NUEVA: Activar Recomendaciones Rápidas (Modo Directo)
function activateDirectRecommendationsMode() {
  console.log('Activando Recomendaciones Rápidas...');
  closetMode = false;
  
  // Ocultar pregunta de opciones
  const closetQuestion = document.getElementById('closetQuestion');
  if (closetQuestion) closetQuestion.style.display = 'none';
  
  // Mostrar selector de ocasiones PRIMERO
  showOccasionSelector();
  
  // Después mostrar área de upload
  setTimeout(() => {
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) {
      uploadArea.style.display = 'block';
    }
  }, 1000);
  
  showNotification('Recomendaciones Rápidas activado. Sube fotos directamente.', 'success');
}

// Manejar login principal
function handleMainLogin() {
  loginWithGoogle();
}

// Login con Google
function loginWithGoogle() {
  console.log('Intentando login con Google...');
  
  if (typeof google === 'undefined' || !google.accounts?.id) {
    console.log('Google Auth no está disponible');
    showNotification('Google Auth no está cargado. Recarga la página.', 'error');
    return;
  }
  
  try {
    console.log('Llamando google.accounts.id.prompt()');
    google.accounts.id.prompt((notification) => {
      console.log('Google prompt result:', notification);
      if (notification.isNotDisplayed()) {
        showNotification('Para continuar, debes autorizar el popup de Google', 'info');
      }
    });
  } catch (e) {
    console.error('Error en login:', e);
    showNotification('Error en login: ' + e.message, 'error');
  }
}

// Logout
function logout() {
  console.log('Cerrando sesión y limpiando estado...');
  
  // Limpiar todo el estado
  clearAllUserState();
  
  // Reset variables de autenticación
  isLoggedIn = false;
  currentUser = null;
  profileCompleted = false;
  
  updateAuthUI();
  resetAllSections();
  showNotification('Sesión cerrada', 'info');
}

// Actualizar UI de autenticación
function updateAuthUI() {
  const userInfo = document.getElementById('userInfo');
  const headerLoginBtn = document.getElementById('headerLoginBtn');
  
  if (isLoggedIn && currentUser) {
    if (userInfo) {
      userInfo.style.display = 'flex';
      const userName = document.getElementById('userName');
      const userAvatar = document.getElementById('userAvatar');
      if (userName) userName.textContent = currentUser.name;
      if (userAvatar) userAvatar.src = currentUser.picture;
    }
    if (headerLoginBtn) headerLoginBtn.style.display = 'none';
  } else {
    if (userInfo) userInfo.style.display = 'none';
    if (headerLoginBtn) headerLoginBtn.style.display = 'inline-flex';
  }
}

// Verificar perfil existente
async function checkExistingProfile(email) {
  try {
    console.log('Verificando perfil para:', email);
    
    // PRIMERO: Verificar en localStorage si ya completó el perfil
    const localData = localStorage.getItem(`noshopia_user_${email}`);
    if (localData) {
      try {
        const userData = JSON.parse(localData);
        if (userData.profileCompleted) {
          console.log('Perfil completado encontrado en localStorage');
          profileCompleted = true;
          return true;
        }
      } catch (e) {
        console.log('Error leyendo localStorage:', e);
      }
    }
    
    // SEGUNDO: Verificar en backend
    const response = await fetch(`${CONFIG.API_BASE}/api/profile/check?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Datos de verificación del backend:', data);
      
      const hasProfile = data.exists === true || data.profile_exists === true;
      if (hasProfile) {
        profileCompleted = true;
        // Guardar en localStorage para próximas visitas
        const userData = JSON.parse(localData || '{}');
        userData.profileCompleted = true;
        localStorage.setItem(`noshopia_user_${email}`, JSON.stringify(userData));
      }
      
      return hasProfile;
    } else {
      console.log('Error en response:', response.status);
      return false;
    }
  } catch (e) {
    console.error('Error verificando perfil:', e);
    return false;
  }
}

// FUNCIONES AUXILIARES NUEVAS

// Ocultar secciones principales
function hideAllMainSections() {
  const sections = [
    'welcomeSection',
    'profileForm', 
    'closetQuestion',
    'closetContainer',
    'uploadArea',
    'occasionSelector'
  ];
  
  sections.forEach(sectionId => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.style.display = 'none';
    }
  });
}

// Actualizar estadísticas de bienvenida
function updateWelcomeStats() {
  const visitCounter = document.getElementById('visitCounter');
  const recommendationCounter = document.getElementById('recommendationCounter');
  const outfitCounter = document.getElementById('outfitCounter');
  
  if (visitCounter) visitCounter.textContent = '1';
  if (recommendationCounter) recommendationCounter.textContent = '0';
  if (outfitCounter) outfitCounter.textContent = '0';
}

// Mostrar selector de ocasiones
function showOccasionSelector() {
  const occasionSelector = document.getElementById('occasionSelector');
  if (occasionSelector) {
    occasionSelector.style.display = 'block';
    setupOccasionHandlers();
  }
}

// Configurar manejadores de ocasiones  
function setupOccasionHandlers() {
  const occasionBtns = document.querySelectorAll('.occasion-btn');
  
  occasionBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      // Remover selección previa
      occasionBtns.forEach(b => b.classList.remove('selected'));
      
      // Seleccionar esta ocasión
      this.classList.add('selected');
      
      // Guardar ocasión seleccionada
      window.selectedOccasion = this.dataset.occasion;
      
      console.log('Ocasión seleccionada:', window.selectedOccasion);
      
      // Habilitar funcionalidades según el modo
      if (closetMode) {
        // Si está en modo closet, activar selección del closet
        if (typeof activateClosetSelectionMode === 'function') {
          activateClosetSelectionMode();
        }
      } else {
        // Si está en modo directo, habilitar botón de generar
        if (typeof updateGenerateButton === 'function') {
          updateGenerateButton();
        }
      }
      
      showNotification(`Ocasión "${this.textContent.trim()}" seleccionada`, 'success');
    });
  });
}

// FUNCIONES AUXILIARES EXISTENTES

// Funciones auxiliares necesarias
function clearAllUserState() {
  // Limpiar localStorage selectivamente
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('noshopia_')) {
      localStorage.removeItem(key);
    }
  });
  
  // Limpiar sessionStorage
  sessionStorage.clear();
  
  // Resetear variables de archivos
  uploadedFiles = { tops: [], bottoms: [], shoes: [] };
  uploadedImages = { tops: [], bottoms: [], shoes: [] };
  
  // Limpiar previews
  ['tops', 'bottoms', 'shoes'].forEach(type => {
    const preview = document.getElementById(`${type}-preview`);
    if (preview) preview.innerHTML = '';
  });
}

function resetAllSections() {
  const sections = ['welcomeSection', 'profileForm', 'closetQuestion', 'closetContainer', 'uploadArea', 'occasionSelector'];
  sections.forEach(id => {
    const element = document.getElementById(id);
    if (element) element.style.display = 'none';
  });
  
  // Limpiar previews
  ['tops', 'bottoms', 'shoes'].forEach(type => {
    const preview = document.getElementById(`${type}-preview`);
    if (preview) preview.innerHTML = '';
  });
}

function loadUserClosetData() {
  if (!currentUser?.email) return false;
  
  const userData = localStorage.getItem(`noshopia_user_${currentUser.email}`);
  if (userData) {
    try {
      const data = JSON.parse(userData);
      if (data.closetItems) {
        // Cargar datos del closet si existen
        return true;
      }
    } catch (e) {
      console.log('Error cargando datos del usuario:', e);
    }
  }
  return false;
}

// Funciones de precios
function startFreePlan() {
  if (!isLoggedIn) {
    loginWithGoogle();
    return;
  } else {
    showNotification('¡Plan Gratis ya activado!', 'success');
    scrollToSection('upload');
  }
}

function upgradeToPremium() {
  showNotification('Próximamente: Sistema de pagos Premium', 'info');
}

function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
}

// Función de notificación básica (si no existe en otro archivo)
function showNotification(message, type = 'info') {
  console.log(`[${type.toUpperCase()}] ${message}`);
  
  // Si existe una función global de notificaciones, usarla
  if (typeof window.showNotification === 'function') {
    window.showNotification(message, type);
    return;
  }
  
  // Si no, mostrar un alert básico
  if (type === 'error') {
    alert('Error: ' + message);
  } else if (type === 'success') {
    alert('Éxito: ' + message);
  } else {
    alert(message);
  }
}

// EXPONER FUNCIONES GLOBALMENTE
window.activateClosetDigitalMode = activateClosetDigitalMode;
window.activateDirectRecommendationsMode = activateDirectRecommendationsMode;
window.showFinalOptions = showFinalOptions;

// REEMPLAZAR las funciones globales enableCloset y useDirectMode
window.enableCloset = activateClosetDigitalMode;
window.useDirectMode = activateDirectRecommendationsMode;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM cargado, iniciando verificación de Google Auth...');
  checkGoogleAuth();
  
  // Exponer variables globalmente si es necesario
  window.CONFIG = CONFIG;
  window.isLoggedIn = isLoggedIn;
  window.currentUser = currentUser;
});

console.log('✅ auth.js - Sistema de Autenticación Completo Corregido cargado');
