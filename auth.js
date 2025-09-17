// auth.js - Funciones de Autenticación

// Verificar Google Auth
async function checkGoogleAuth() {
  console.log('🔍 Iniciando carga de Google Auth...');
  
  try {
    await loadGoogleScript();
    console.log('✅ Google Script cargado exitosamente');
    initializeGoogleAuth();
  } catch (error) {
    console.error('❌ Error cargando Google Script:', error);
    showAlternativeAuth();
  }
}

// Mostrar autenticación alternativa
function showAlternativeAuth() {
  const mainBtn = document.getElementById('mainLoginBtn');
  if (mainBtn) {
    mainBtn.innerHTML = '<i class="fab fa-google"></i> Iniciar con Gmail';
    mainBtn.onclick = () => {
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
    handlePostLogin();
    showNotification(`Bienvenido ${currentUser.name}!`, 'success');
  } else {
    showNotification('Email inválido', 'error');
  }
}

// Inicializar Google Auth
function initializeGoogleAuth() {
  try {
    console.log('🚀 Inicializando Google Auth...');
    console.log('Client ID:', CONFIG.GOOGLE_CLIENT_ID);
    
    google.accounts.id.initialize({
      client_id: CONFIG.GOOGLE_CLIENT_ID,
      callback: handleGoogleSignIn,
      auto_select: false,
      ux_mode: 'popup'
    });
    
    console.log('✅ Google Auth inicializado correctamente');
    
    const mainBtn = document.getElementById('mainLoginBtn');
    if (mainBtn) {
      mainBtn.innerHTML = '<i class="fab fa-google"></i> Conectar con Google - ¡Es Gratis!';
      mainBtn.onclick = handleMainLogin;
    }
    
  } catch (e) {
    console.error('❌ Error inicializando Google Auth:', e);
    showNotification('Error configurando Google Auth', 'error');
  }
}

// Manejar Google Sign In
async function handleGoogleSignIn(response) {
  if (!response.credential) return;
  
  try {
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
    
    // Manejar el flujo post-login
    await handlePostLogin();
    showNotification(`¡Bienvenido ${currentUser.name}!`, 'success');
  } catch (e) {
    console.error('Error en login:', e);
    showNotification('Error al iniciar sesión', 'error');
  }
}

// ✅ NUEVA FUNCIÓN: Manejar flujo después del login
async function handlePostLogin() {
  console.log('🔍 Verificando estado del usuario...');
  
  // Verificar si el perfil ya está completado
  const hasProfile = await checkExistingProfile(currentUser.email);
  
  if (hasProfile) {
    console.log('✅ Usuario ya tiene perfil completado');
    profileCompleted = true;
    
    // Cargar configuración del usuario (incluyendo closetMode)
    loadUserConfiguration();
    
    // Mostrar mensaje de bienvenida para usuario existente
    showWelcomeSection();
    
    // Decidir qué mostrar basado en closetMode
    if (closetMode) {
      console.log('✅ Closet mode activo - mostrando closet');
      showClosetContainer();
    } else {
      console.log('✅ Modo directo - mostrando upload area');
      showDirectUploadMode();
    }
  } else {
    console.log('📝 Usuario nuevo - mostrando formulario de perfil');
    profileCompleted = false;
    showWelcomeSection();
    showProfileForm();
  }
  
  // Actualizar UI del botón Mi Closet
  updateMiClosetButton();
}

// ✅ NUEVA FUNCIÓN: Cargar configuración del usuario
function loadUserConfiguration() {
  try {
    const userData = localStorage.getItem(`noshopia_user_${currentUser.email}`);
    if (userData) {
      const config = JSON.parse(userData);
      closetMode = config.closetMode || false;
      console.log('Configuración cargada - closetMode:', closetMode);
    }
  } catch (e) {
    console.error('Error cargando configuración:', e);
    closetMode = false;
  }
}

// ✅ NUEVA FUNCIÓN: Actualizar botón Mi Closet condicionalmente
function updateMiClosetButton() {
  const miClosetBtn = document.querySelector('.mi-closet-btn');
  
  if (miClosetBtn) {
    if (isLoggedIn && closetMode) {
      miClosetBtn.style.display = 'flex';
      console.log('✅ Botón Mi Closet mostrado - closetMode activo');
    } else {
      miClosetBtn.style.display = 'none';
      console.log('❌ Botón Mi Closet oculto - closetMode inactivo');
    }
  }
}

// Manejar login principal
function handleMainLogin() {
  loginWithGoogle();
}

// Login con Google
function loginWithGoogle() {
  console.log('🔑 Intentando login con Google...');
  
  if (typeof google === 'undefined' || !google.accounts?.id) {
    console.log('❌ Google Auth no está disponible');
    showNotification('Google Auth no está cargado. Recarga la página.', 'error');
    return;
  }
  
  try {
    console.log('✅ Llamando google.accounts.id.prompt()');
    google.accounts.id.prompt((notification) => {
      console.log('Google prompt result:', notification);
      if (notification.isNotDisplayed()) {
        showNotification('Para continuar, debes autorizar el popup de Google', 'info');
      }
    });
  } catch (e) {
    console.error('❌ Error en login:', e);
    showNotification('Error en login: ' + e.message, 'error');
  }
}

// Logout
function logout() {
  console.log('🚪 Cerrando sesión y limpiando estado...');
  
  // Limpiar todo el estado
  clearAllUserState();
  
  // Reset variables de autenticación
  isLoggedIn = false;
  currentUser = null;
  profileCompleted = false;
  closetMode = false; // Reset closetMode también
  
  updateAuthUI();
  resetAllSections();
  showNotification('Sesión cerrada', 'info');
}

// ✅ CORREGIDA: Actualizar UI de autenticación
function updateAuthUI() {
  const userInfo = document.getElementById('userInfo');
  const mainLoginBtn = document.getElementById('mainLoginBtn');
  
  if (isLoggedIn && currentUser) {
    userInfo.style.display = 'flex';
    mainLoginBtn.style.display = 'none';
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userAvatar').src = currentUser.picture;
    
    // Actualizar botón Mi Closet según closetMode
    updateMiClosetButton();
  } else {
    userInfo.style.display = 'none';
    mainLoginBtn.style.display = 'inline-flex';
    
    // Ocultar botón Mi Closet si no está loggeado
    const miClosetBtn = document.querySelector('.mi-closet-btn');
    if (miClosetBtn) {
      miClosetBtn.style.display = 'none';
    }
  }
}

// ✅ VARIABLE PARA EVITAR MÚLTIPLES LLAMADAS
let profileCheckInProgress = false;
let profileCheckCache = null;

// ✅ CORREGIDA: Verificar perfil existente - VERSIÓN ULTRA DEFENSIVA
async function checkExistingProfile(email) {
  // Evitar múltiples llamadas simultáneas
  if (profileCheckInProgress) {
    console.log('⏳ Verificación de perfil ya en progreso, esperando...');
    return profileCheckCache;
  }
  
  if (profileCheckCache !== null) {
    console.log('📋 Usando cache de verificación de perfil:', profileCheckCache);
    return profileCheckCache;
  }
  
  profileCheckInProgress = true;
  
  try {
    console.log('🔍 Verificando perfil para:', email);
    
    // PRIMERO: Verificación muy permisiva de localStorage
    const localStorageKey = `noshopia_user_${email}`;
    const localData = localStorage.getItem(localStorageKey);
    
    if (localData) {
      try {
        const userData = JSON.parse(localData);
        console.log('📋 Datos locales:', userData);
        
        // MUY PERMISIVO - cualquier indicación de perfil completado
        if (userData.profileCompleted === true || 
            userData.profile || 
            userData.skin_color || 
            userData.age_range || 
            userData.gender) {
          console.log('✅ PERFIL ENCONTRADO EN LOCALSTORAGE - ACEPTANDO');
          profileCheckCache = true;
          return true;
        }
      } catch (e) {
        console.log('Error parsing localStorage, ignorando:', e.message);
      }
    }
    
    // Si llegamos aquí, NO HAY PERFIL LOCAL
    console.log('❌ No hay perfil en localStorage');
    
    // SEGUNDO: UNA SOLA llamada al backend con timeout corto
    console.log('🌐 Haciendo UNA verificación en backend...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout
    
    try {
      const response = await fetch(`${CONFIG.API_BASE}/api/profile/check?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('📡 Backend response:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        if (data.exists === true || data.profile_exists === true) {
          console.log('✅ Backend confirma perfil existe');
          
          // Guardar en localStorage para evitar futuras llamadas
          const userData = {
            email: email,
            profileCompleted: true,
            profile: data.profile || { completed: true },
            savedAt: Date.now()
          };
          localStorage.setItem(localStorageKey, JSON.stringify(userData));
          profileCheckCache = true;
          return true;
        }
      }
      
      // Backend dice que no existe
      console.log('❌ Backend confirma que NO existe perfil');
      profileCheckCache = false;
      return false;
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.log('⏰ Timeout en verificación de backend');
      } else {
        console.log('🔌 Error de conectividad:', fetchError.message);
      }
      
      // Si hay error de conectividad, asumir que NO hay perfil
      // para que muestre el formulario en lugar de estar en limbo
      console.log('❌ Error de backend - asumiendo perfil NO existe');
      profileCheckCache = false;
      return false;
    }
    
  } catch (e) {
    console.error('Error general en verificación:', e);
    profileCheckCache = false;
    return false;
  } finally {
    profileCheckInProgress = false;
  }
}

// ✅ NUEVA: Limpiar cache cuando se completa el perfil
function clearProfileCheckCache() {
  profileCheckCache = null;
  profileCheckInProgress = false;
}

// ✅ NUEVA FUNCIÓN: Activar closet mode (llamada desde closet.js)
function activateClosetMode() {
  console.log('✅ Activando closet mode...');
  closetMode = true;
  
  // Guardar en localStorage
  if (currentUser) {
    const userData = JSON.parse(localStorage.getItem(`noshopia_user_${currentUser.email}`) || '{}');
    userData.closetMode = true;
    localStorage.setItem(`noshopia_user_${currentUser.email}`, JSON.stringify(userData));
  }
  
  // Mostrar botón Mi Closet
  updateMiClosetButton();
}

// ✅ NUEVA FUNCIÓN: Desactivar closet mode (modo directo)
function deactivateClosetMode() {
  console.log('❌ Desactivando closet mode (modo directo)...');
  closetMode = false;
  
  // Guardar en localStorage
  if (currentUser) {
    const userData = JSON.parse(localStorage.getItem(`noshopia_user_${currentUser.email}`) || '{}');
    userData.closetMode = false;
    localStorage.setItem(`noshopia_user_${currentUser.email}`, JSON.stringify(userData));
  }
  
  // Ocultar botón Mi Closet
  updateMiClosetButton();
}

// ✅ NUEVA FUNCIÓN: Marcar perfil como completado (llamada desde profile.js)
function markProfileAsCompleted(profileData) {
  console.log('✅ Marcando perfil como completado:', profileData);
  
  profileCompleted = true;
  
  // Limpiar cache para forzar nueva verificación
  clearProfileCheckCache();
  
  if (currentUser) {
    const userData = {
      email: currentUser.email,
      name: currentUser.name,
      profileCompleted: true,
      profile: profileData,
      closetMode: false, // Por defecto, se decidirá después
      completedAt: Date.now(),
      lastLogin: Date.now()
    };
    
    const storageKey = `noshopia_user_${currentUser.email}`;
    localStorage.setItem(storageKey, JSON.stringify(userData));
    
    console.log('✅ Perfil guardado en localStorage:', userData);
  }
  
  // Ocultar formulario de perfil
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.style.display = 'none';
  }
  
  // Mostrar pregunta del closet
  const closetQuestion = document.getElementById('closetQuestion');
  if (closetQuestion) {
    closetQuestion.style.display = 'block';
  }
}

// ✅ NUEVA FUNCIÓN: Verificar si el perfil está realmente completo
function isProfileComplete() {
  return profileCompleted === true;
}

// ✅ NUEVA FUNCIÓN: Obtener datos del perfil guardado
function getUserProfileData() {
  if (!currentUser) return null;
  
  try {
    const userData = localStorage.getItem(`noshopia_user_${currentUser.email}`);
    if (userData) {
      const parsed = JSON.parse(userData);
      return parsed.profile || null;
    }
  } catch (e) {
    console.error('Error obteniendo datos del perfil:', e);
  }
  
  return null;
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
