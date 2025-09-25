// auth.js - Sistema de Autenticación Limpio (Sin Variables Duplicadas)

// FUNCIÓN PRINCIPAL DE VERIFICACIÓN GOOGLE AUTH
async function checkGoogleAuth() {
  console.log('🔐 Iniciando verificación Google Auth...');
  
  try {
    await window.loadGoogleScript();
    console.log('✅ Google Script cargado exitosamente');
    initializeGoogleAuth();
  } catch (error) {
    console.error('❌ Error cargando Google Script:', error);
    showAlternativeAuth();
  }
}

// INICIALIZAR GOOGLE AUTH CON CONFIG UNIFICADO
function initializeGoogleAuth() {
  try {
    console.log('🔧 Inicializando Google Auth...');
    console.log('📋 Client ID:', CONFIG.GOOGLE_CLIENT_ID);
    
    google.accounts.id.initialize({
      client_id: CONFIG.GOOGLE_CLIENT_ID,
      callback: handleGoogleSignIn,
      auto_select: false,
      ux_mode: 'popup'
    });
    
    console.log('✅ Google Auth inicializado correctamente');
    updateHeaderLoginButton();
    
  } catch (e) {
    console.error('❌ Error inicializando Google Auth:', e);
    window.showNotification('Error configurando Google Auth', 'error');
  }
}

// ACTUALIZAR BOTÓN DE LOGIN EN HEADER
function updateHeaderLoginButton() {
  const headerBtn = document.getElementById('headerLoginBtn');
  if (headerBtn) {
    headerBtn.innerHTML = '<i class="fab fa-google"></i> Iniciar sesión';
    headerBtn.onclick = handleMainLogin;
    headerBtn.disabled = false;
    headerBtn.style.opacity = '1';
    headerBtn.style.cursor = 'pointer';
  }
}

// MOSTRAR AUTENTICACIÓN ALTERNATIVA
function showAlternativeAuth() {
  const headerBtn = document.getElementById('headerLoginBtn');
  if (headerBtn) {
    headerBtn.innerHTML = '<i class="fab fa-google"></i> Iniciar con Gmail';
    headerBtn.onclick = showManualEmailForm;
  }
  window.showNotification('Ingresa tu Gmail para continuar', 'info');
}

// FORMULARIO MANUAL DE EMAIL (FALLBACK)
function showManualEmailForm() {
  const email = prompt('Ingresa tu email para continuar:');
  if (email && email.includes('@')) {
    processManualLogin(email);
  } else {
    window.showNotification('Email inválido', 'error');
  }
}

// PROCESAR LOGIN MANUAL
function processManualLogin(email) {
  // Limpiar estado usando función unificada
  window.clearAllUserState();
  
  // Establecer usuario usando setters unificados
  window.setCurrentUser({
    name: email.split('@')[0],
    email: email,
    picture: 'https://via.placeholder.com/40',
    token: 'manual_' + Date.now()
  });
  
  window.setLoggedIn(true);
  updateAuthUI();
  
  // Usar flujo unificado de verificación de perfil
  checkProfileAndRedirectCorrect();
  
  window.showNotification(`Bienvenido ${window.currentUser().name}!`, 'success');
}

// MANEJAR GOOGLE SIGN IN (CORREGIDO SIN DUPLICAR VARIABLES)
async function handleGoogleSignIn(response) {
  if (!response.credential) return;
  
  try {
    console.log('🔐 Procesando login de Google...');
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    
    // Limpiar estado usando función unificada
    window.clearAllUserState();
    
    // Establecer usuario usando setters unificados
    window.setCurrentUser({
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
      token: response.credential
    });
    
    window.setLoggedIn(true);
    updateAuthUI();
    
    // FLUJO CORRECTO: Verificar perfil y redirigir
    await checkProfileAndRedirectCorrect();
    
    console.log('✅ Login exitoso:', window.currentUser().email);
  } catch (e) {
    console.error('❌ Error en login:', e);
    window.showNotification('Error al iniciar sesión', 'error');
  }
}

// VERIFICAR PERFIL Y REDIRIGIR (FLUJO CORRECTO PRESERVADO)
async function checkProfileAndRedirectCorrect() {
  try {
    const currentUserData = window.currentUser();
    window.showNotification(`Bienvenido ${currentUserData.name}! Verificando perfil...`, 'info');
    
    // Verificar perfil existente
    const hasProfile = await checkExistingProfile(currentUserData.email);
    
    if (hasProfile) {
      // USUARIO EXISTENTE → Cargar datos y ir a opciones
      console.log('👤 Usuario existente - cargar datos y ir a opciones');
      window.loadUserClosetData();
      
      setTimeout(() => {
        scrollToSection('upload');
        showFinalOptions();
      }, 1500);
      
      window.showNotification('Perfil cargado. Elige tu método de recomendación.', 'success');
      
    } else {
      // USUARIO NUEVO → Perfilamiento
      console.log('🆕 Usuario nuevo - mostrar perfilamiento');
      
      setTimeout(() => {
        scrollToSection('upload');
        showNewUserProfileForm();
      }, 1500);
      
      window.showNotification('¡Bienvenido! Completa tu perfil para continuar.', 'success');
    }
    
  } catch (error) {
    console.error('❌ Error en verificación de perfil:', error);
    // Fallback seguro
    setTimeout(() => {
      scrollToSection('upload');
      showNewUserProfileForm();
    }, 1500);
  }
}

// VERIFICAR PERFIL EXISTENTE CON VALIDACIÓN MEJORADA
async function checkExistingProfile(email) {
  try {
    console.log('🔍 Verificando perfil para:', email);
    
    // Verificar localStorage primero
    const localData = localStorage.getItem(`noshopia_user_${email}`);
    if (localData) {
      try {
        const userData = JSON.parse(localData);
        if (userData.profileCompleted) {
          console.log('✅ Perfil completado encontrado localmente');
          window.setProfileCompleted(true);
          return true;
        }
      } catch (e) {
        console.log('⚠️ Error leyendo localStorage:', e);
      }
    }
    
    // Verificar backend
    const response = await fetch(`${CONFIG.API_BASE}/api/profile/check?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      const data = await response.json();
      const hasProfile = data.exists === true || data.profile_exists === true;
      
      if (hasProfile) {
        window.setProfileCompleted(true);
        // Sincronizar con localStorage
        const userData = JSON.parse(localData || '{}');
        userData.profileCompleted = true;
        localStorage.setItem(`noshopia_user_${email}`, JSON.stringify(userData));
      }
      
      return hasProfile;
    }
    
    return false;
  } catch (e) {
    console.error('❌ Error verificando perfil:', e);
    return false;
  }
}

// MOSTRAR FORMULARIO DE PERFIL PARA USUARIOS NUEVOS
function showNewUserProfileForm() {
  console.log('📝 Mostrando formulario de perfil para usuario nuevo');
  
  hideAllMainSections();
  
  // Mostrar secciones de perfilamiento
  showElement('welcomeSection', true);
  showElement('profileForm', true);
  
  updateWelcomeStats();
  setupProfileFormHandlers();
}

// CONFIGURAR MANEJADORES DEL FORMULARIO DE PERFIL
function setupProfileFormHandlers() {
  console.log('🔧 Configurando manejadores del formulario de perfil');
  
  const profileOptions = document.querySelectorAll('.profile-option');
  const createBtn = document.getElementById('createProfileBtn');
  
  let selectedOptions = {
    skin_color: null,
    age_range: null,
    gender: null
  };
  
  // Configurar clicks en opciones
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
      
      updateCreateProfileButton(createBtn, allSelected);
    });
  });
  
  // Configurar botón de crear perfil
  if (createBtn) {
    createBtn.onclick = () => {
      if (Object.values(selectedOptions).every(val => val !== null)) {
        submitUserProfile(selectedOptions);
      }
    };
  }
}

// ACTUALIZAR BOTÓN DE CREAR PERFIL
function updateCreateProfileButton(button, allSelected) {
  if (!button) return;
  
  if (allSelected) {
    button.disabled = false;
    button.style.opacity = '1';
    button.innerHTML = '<i class="fas fa-user-plus"></i> Completar Perfil';
  } else {
    button.disabled = true;
    button.style.opacity = '0.6';
    button.innerHTML = '<i class="fas fa-user-plus"></i> Selecciona todas las opciones';
  }
}

// ENVIAR PERFIL DEL USUARIO
async function submitUserProfile(profileData) {
  const currentUserData = window.currentUser();
  if (!profileData || !currentUserData) {
    window.showNotification('Error: datos de perfil incompletos', 'error');
    return;
  }
  
  try {
    window.showNotification('Guardando perfil...', 'info');
    
    const profilePayload = {
      email: currentUserData.email,
      name: currentUserData.name,
      ...profileData,
      created_at: new Date().toISOString(),
      profileCompleted: true
    };
    
    // Guardar localmente (prioritario)
    localStorage.setItem(`noshopia_profile_${currentUserData.email}`, JSON.stringify(profilePayload));
    localStorage.setItem(`noshopia_user_${currentUserData.email}`, JSON.stringify(profilePayload));
    
    // Intentar guardar en backend (sin bloquear)
    try {
      await fetch(`${CONFIG.API_BASE}/api/profile/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profilePayload)
      });
    } catch (backendError) {
      console.log('⚠️ Backend no disponible, perfil guardado localmente');
    }
    
    window.setProfileCompleted(true);
    window.showNotification('¡Perfil completado!', 'success');
    
    // Ir a opciones finales después de completar perfil
    setTimeout(showClosetQuestionAfterProfile, 1000);
    
  } catch (error) {
    console.error('❌ Error guardando perfil:', error);
    window.showNotification('Error guardando perfil. Inténtalo de nuevo.', 'error');
  }
}

// DESPUÉS DEL PERFILAMIENTO → OPCIONES FINALES
function showClosetQuestionAfterProfile() {
  console.log('✅ Perfilamiento completado - mostrando opciones finales');
  
  hideAllMainSections();
  showFinalOptions();
  
  window.showNotification('Perfil creado. Ahora elige cómo quieres obtener recomendaciones.', 'success');
}

// MOSTRAR OPCIONES FINALES (CLOSET VS DIRECTO)
function showFinalOptions() {
  console.log('🎯 Mostrando opciones finales: Closet Digital vs Recomendaciones Rápidas');
  
  showElement('closetQuestion', true);
  setupFinalOptionsHandlers();
}

// CONFIGURAR MANEJADORES DE OPCIONES FINALES
function setupFinalOptionsHandlers() {
  console.log('🔧 Configurando opciones finales');
  
  // Closet Digital
  const closetBtn = document.getElementById('enableClosetBtn');
  if (closetBtn) {
    closetBtn.onclick = activateClosetDigitalMode;
  }
  
  // Recomendaciones Rápidas
  const directBtn = document.getElementById('useDirectModeBtn');
  if (directBtn) {
    directBtn.onclick = activateDirectRecommendationsMode;
  }
}

// ACTIVAR CLOSET DIGITAL
function activateClosetDigitalMode() {
  console.log('📁 Activando Closet Digital...');
  
  window.setClosetMode(true);
  hideAllMainSections();
  
  showElement('closetContainer', true);
  
  // Configurar datos del usuario
  const userEmail = document.getElementById('userEmail');
  if (userEmail) {
    userEmail.textContent = window.currentUser().email;
  }
  
  // Cargar datos existentes
  window.loadUserClosetData();
  
  // Configurar funcionalidad del closet
  if (typeof updateClosetDisplay === 'function') {
    updateClosetDisplay();
  }
  
  setTimeout(() => {
    if (typeof setupClosetFolderUploads === 'function') {
      setupClosetFolderUploads();
    }
  }, 500);
  
  showOccasionSelector();
  window.showNotification('Closet Digital activado. Organiza tu ropa por categorías.', 'success');
}

// ACTIVAR RECOMENDACIONES RÁPIDAS
function activateDirectRecommendationsMode() {
  console.log('⚡ Activando Recomendaciones Rápidas...');
  
  window.setClosetMode(false);
  hideAllMainSections();
  
  showOccasionSelector();
  
  setTimeout(() => {
    showElement('uploadArea', true);
    
    // Inicializar sistema de upload si existe
    if (typeof window.initializeUploadSystem === 'function') {
      window.initializeUploadSystem();
    }
  }, 1000);
  
  window.showNotification('Recomendaciones Rápidas activado. Sube fotos directamente.', 'success');
}

// MANEJAR LOGIN PRINCIPAL
function handleMainLogin() {
  loginWithGoogle();
}

// LOGIN CON GOOGLE
function loginWithGoogle() {
  console.log('🔐 Intentando login con Google...');
  
  if (typeof google === 'undefined' || !google.accounts?.id) {
    console.log('❌ Google Auth no está disponible');
    window.showNotification('Google Auth no está cargado. Recarga la página.', 'error');
    return;
  }
  
  try {
    google.accounts.id.prompt((notification) => {
      console.log('📋 Google prompt result:', notification);
      if (notification.isNotDisplayed()) {
        window.showNotification('Para continuar, debes autorizar el popup de Google', 'info');
      }
    });
  } catch (e) {
    console.error('❌ Error en login:', e);
    window.showNotification('Error en login: ' + e.message, 'error');
  }
}

// LOGOUT CON LIMPIEZA COMPLETA
function logout() {
  console.log('🚪 Cerrando sesión y limpiando estado...');
  
  // Limpiar usando función unificada
  window.clearAllUserState();
  
  // Reset variables usando setters unificados
  window.setLoggedIn(false);
  window.setCurrentUser(null);
  window.setProfileCompleted(false);
  
  updateAuthUI();
  resetAllSections();
  
  window.showNotification('Sesión cerrada', 'info');
}

// ACTUALIZAR UI DE AUTENTICACIÓN
function updateAuthUI() {
  const userInfo = document.getElementById('userInfo');
  const headerLoginBtn = document.getElementById('headerLoginBtn');
  
  if (window.isLoggedIn() && window.currentUser()) {
    // Mostrar info del usuario
    if (userInfo) {
      userInfo.style.display = 'flex';
      const userName = document.getElementById('userName');
      const userAvatar = document.getElementById('userAvatar');
      const currentUserData = window.currentUser();
      
      if (userName) userName.textContent = currentUserData.name;
      if (userAvatar) userAvatar.src = currentUserData.picture;
    }
    if (headerLoginBtn) headerLoginBtn.style.display = 'none';
    
  } else {
    // Mostrar botón de login
    if (userInfo) userInfo.style.display = 'none';
    if (headerLoginBtn) headerLoginBtn.style.display = 'inline-flex';
  }
}

// FUNCIONES AUXILIARES MEJORADAS

function hideAllMainSections() {
  const sections = [
    'welcomeSection', 'profileForm', 'closetQuestion',
    'closetContainer', 'uploadArea', 'occasionSelector'
  ];
  
  sections.forEach(sectionId => {
    showElement(sectionId, false);
  });
}

function showElement(elementId, show) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = show ? 'block' : 'none';
  }
}

function updateWelcomeStats() {
  const elements = [
    { id: 'visitCounter', value: '1' },
    { id: 'recommendationCounter', value: '0' },
    { id: 'outfitCounter', value: '0' }
  ];
  
  elements.forEach(({ id, value }) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  });
}

function showOccasionSelector() {
  showElement('occasionSelector', true);
  setupOccasionHandlers();
}

function setupOccasionHandlers() {
  const occasionBtns = document.querySelectorAll('.occasion-btn');
  
  occasionBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      occasionBtns.forEach(b => b.classList.remove('selected'));
      this.classList.add('selected');
      
      window.setSelectedOccasion(this.dataset.occasion);
      
      // Habilitar funcionalidades según modo
      if (window.closetMode()) {
        if (typeof activateClosetSelectionMode === 'function') {
          activateClosetSelectionMode();
        }
      } else {
        if (typeof window.updateGenerateButton === 'function') {
          window.updateGenerateButton();
        }
      }
      
      window.showNotification(`Ocasión "${this.textContent.trim()}" seleccionada`, 'success');
    });
  });
}

function resetAllSections() {
  hideAllMainSections();
  
  // Limpiar previews si existen
  ['tops', 'bottoms', 'shoes'].forEach(type => {
    const preview = document.getElementById(`${type}-preview`);
    if (preview) preview.innerHTML = '';
  });
}

function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
}

// FUNCIONES DE PRECIOS
function startFreePlan() {
  if (!window.isLoggedIn()) {
    loginWithGoogle();
  } else {
    window.showNotification('¡Plan Gratis ya activado!', 'success');
    scrollToSection('upload');
  }
}

function upgradeToPremium() {
  window.showNotification('Próximamente: Sistema de pagos Premium', 'info');
}

// EXPONER FUNCIONES GLOBALMENTE (sin duplicar variables)
window.enableCloset = activateClosetDigitalMode;
window.useDirectMode = activateDirectRecommendationsMode;
window.logout = logout;
window.handleMainLogin = handleMainLogin;
window.startFreePlan = startFreePlan;
window.upgradeToPremium = upgradeToPremium;

// INICIALIZAR CUANDO DOM ESTÉ LISTO
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 DOM cargado, iniciando verificación de Google Auth...');
  
  // Configurar logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.onclick = logout;
  }
  
  checkGoogleAuth();
});

console.log('✅ auth.js - Sistema de Autenticación Limpio cargado');
