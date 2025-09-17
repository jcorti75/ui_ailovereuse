// auth.js - Funciones de Autenticación

// ✅ VARIABLES GLOBALES PARA CONTROL
let profileCheckInProgress = false;
let profileCheckCache = null;

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
    if (typeof clearAllUserState === 'function') {
      clearAllUserState();
    }
    
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
    
    if (typeof google === 'undefined' || !google.accounts) {
      throw new Error('Google API no está disponible');
    }
    
    google.accounts.id.initialize({
      client_id: CONFIG.GOOGLE_CLIENT_ID,
      callback: handleGoogleSignIn,
      auto_select: false
      // ✅ REMOVIDO: ux_mode: 'popup' <- ESTO CAUSABA EL ERROR
      // ✅ REMOVIDO: cancel_on_tap_outside: false
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
    // Fallback automático al login manual
    setTimeout(() => {
      showAlternativeAuth();
    }, 1000);
  }
}

// Manejar Google Sign In
async function handleGoogleSignIn(response) {
  if (!response.credential) {
    console.log('❌ No se recibió credencial de Google');
    return;
  }
  
  try {
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    console.log('✅ Login exitoso con Google:', payload.email);
    
    // Limpiar estado antes de nuevo login
    if (typeof clearAllUserState === 'function') {
      clearAllUserState();
    }
    
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
    console.error('❌ Error en handleGoogleSignIn:', e);
    showNotification('Error procesando login de Google', 'error');
  }
}

// Manejar flujo después del login - VERSIÓN ULTRA DEFENSIVA
async function handlePostLogin() {
  try {
    console.log('🔍 Verificando estado del usuario...');
    
    if (!currentUser || !currentUser.email) {
      throw new Error('Usuario no válido');
    }
    
    // Verificar si el perfil ya está completado
    let hasProfile = false;
    try {
      hasProfile = await checkExistingProfile(currentUser.email);
    } catch (profileError) {
      console.log('⚠️ Error verificando perfil:', profileError.message);
      hasProfile = false;
    }
    
    if (hasProfile) {
      console.log('✅ Usuario ya tiene perfil completado');
      profileCompleted = true;
      
      // Cargar configuración del usuario
      try {
        loadUserConfiguration();
      } catch (configError) {
        console.log('⚠️ Error cargando configuración:', configError.message);
        closetMode = false;
      }
      
      // Mostrar mensaje de bienvenida
      try {
        if (typeof showWelcomeSection === 'function') {
          showWelcomeSection();
        }
      } catch (welcomeError) {
        console.log('⚠️ Error mostrando bienvenida:', welcomeError.message);
      }
      
      // Decidir qué mostrar basado en closetMode
      if (closetMode) {
        console.log('✅ Closet mode activo - mostrando closet');
        try {
          if (typeof showClosetContainer === 'function') {
            showClosetContainer();
          } else {
            console.log('⚠️ showClosetContainer no existe, saltando');
          }
        } catch (closetError) {
          console.log('⚠️ Error mostrando closet:', closetError.message);
        }
      } else {
        console.log('✅ Modo directo - mostrando upload area');
        try {
          if (typeof showDirectUploadMode === 'function') {
            showDirectUploadMode();
          } else if (typeof showOccasionSelector === 'function') {
            showOccasionSelector();
          } else {
            console.log('⚠️ Funciones de modo directo no existen, saltando');
          }
        } catch (directError) {
          console.log('⚠️ Error mostrando modo directo:', directError.message);
        }
      }
    } else {
      console.log('📝 Usuario nuevo - mostrando formulario de perfil');
      profileCompleted = false;
      
      try {
        if (typeof showWelcomeSection === 'function') {
          showWelcomeSection();
        }
      } catch (welcomeError) {
        console.log('⚠️ Error mostrando bienvenida:', welcomeError.message);
      }
      
      try {
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
          profileForm.style.display = 'block';
          
          // Inicializar listeners del formulario si la función existe
          if (typeof setupProfileListeners === 'function') {
            setTimeout(() => {
              setupProfileListeners();
            }, 500);
          }
        } else {
          console.log('⚠️ Elemento profileForm no encontrado');
        }
      } catch (formError) {
        console.log('⚠️ Error mostrando formulario:', formError.message);
      }
    }
    
    // Actualizar UI del botón Mi Closet
    try {
      updateMiClosetButton();
    } catch (buttonError) {
      console.log('⚠️ Error actualizando botón Mi Closet:', buttonError.message);
    }
    
    console.log('✅ handlePostLogin completado exitosamente');
    
  } catch (error) {
    console.error('❌ Error en handlePostLogin:', error);
    
    // Fallback de emergencia
    try {
      if (typeof showWelcomeSection === 'function') {
        showWelcomeSection();
      }
      const profileForm = document.getElementById('profileForm');
      if (profileForm) {
        profileForm.style.display = 'block';
      }
    } catch (fallbackError) {
      console.error('❌ Error incluso en fallback:', fallbackError);
    }
  }
}

// Cargar configuración del usuario
function loadUserConfiguration() {
  try {
    if (!currentUser || !currentUser.email) {
      console.log('⚠️ No hay usuario para cargar configuración');
      return;
    }
    
    const userData = localStorage.getItem(`noshopia_user_${currentUser.email}`);
    if (userData) {
      const config = JSON.parse(userData);
      closetMode = config.closetMode || false;
      console.log('Configuración cargada - closetMode:', closetMode);
    } else {
      closetMode = false;
      console.log('No hay configuración guardada, usando valores por defecto');
    }
  } catch (e) {
    console.error('Error cargando configuración:', e);
    closetMode = false;
  }
}

// Actualizar botón Mi Closet condicionalmente
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
  console.log('🔑 Iniciando proceso de login...');
  
  // Intentar login con Google primero
  if (typeof google !== 'undefined' && google.accounts?.id) {
    loginWithGoogle();
  } else {
    console.log('❌ Google Auth no disponible, usando login manual');
    showManualEmailForm();
  }
}

// Login con Google
function loginWithGoogle() {
  console.log('🔑 Intentando login con Google...');
  
  if (typeof google === 'undefined' || !google.accounts?.id) {
    console.log('❌ Google Auth no está disponible');
    showNotification('Google Auth no está cargado. Usando login alternativo...', 'info');
    setTimeout(() => {
      showManualEmailForm();
    }, 1000);
    return;
  }
  
  try {
    console.log('✅ Llamando google.accounts.id.prompt()');
    google.accounts.id.prompt((notification) => {
      console.log('Google prompt result:', notification);
      
      if (notification.isNotDisplayed()) {
        console.log('⚠️ Google prompt no se mostró');
        showNotification('Problema con Google Auth. Usa login alternativo.', 'info');
        setTimeout(() => {
          showAlternativeAuth();
        }, 2000);
      } else if (notification.isSkippedMoment()) {
        console.log('⚠️ Usuario canceló Google login');
      } else if (notification.isDismissedMoment()) {
        console.log('⚠️ Usuario cerró Google login');
      }
    });
  } catch (e) {
    console.error('❌ Error en login con Google:', e);
    showNotification('Error con Google Auth. Usa login alternativo.', 'error');
    setTimeout(() => {
      showAlternativeAuth();
    }, 1000);
  }
}

// Logout con limpieza completa
function logout() {
  console.log('🚪 Cerrando sesión y limpiando estado completo...');
  
  try {
    // Limpiar cache de verificación de perfil
    clearProfileCheckCache();
    
    // Intentar desconectar de Google Auth
    if (typeof google !== 'undefined' && google.accounts?.id) {
      try {
        google.accounts.id.disableAutoSelect();
        console.log('✅ Google Auth auto-select deshabilitado');
      } catch (e) {
        console.log('⚠️ Error deshabilitando Google Auth:', e.message);
      }
    }
    
    // Limpiar estado de la aplicación
    if (typeof clearAllUserState === 'function') {
      clearAllUserState();
    }
    
    // Reset variables globales
    isLoggedIn = false;
    currentUser = null;
    profileCompleted = false;
    closetMode = false;
    
    // Reset variables de closet si existen
    if (typeof closetItems !== 'undefined') {
      closetItems = { tops: [], bottoms: [], shoes: [] };
    }
    if (typeof uploadedFiles !== 'undefined') {
      uploadedFiles = { tops: [], bottoms: [], shoes: [] };
    }
    if (typeof uploadedImages !== 'undefined') {
      uploadedImages = { tops: [], bottoms: [], shoes: [] };
    }
    if (typeof savedRecommendations !== 'undefined') {
      savedRecommendations = [];
    }
    
    // Reset UI
    updateAuthUI();
    
    // Reset secciones
    if (typeof resetAllSections === 'function') {
      resetAllSections();
    } else {
      resetSectionsManually();
    }
    
    // Limpiar resultados
    if (typeof clearPreviousResults === 'function') {
      clearPreviousResults();
    }
    
    showNotification('Sesión cerrada correctamente', 'success');
    console.log('✅ Logout completado - listo para nuevo login');
    
  } catch (error) {
    console.error('❌ Error durante logout:', error);
    location.reload();
  }
}

// Reset manual de secciones
function resetSectionsManually() {
  try {
    const sectionsToHide = [
      'welcomeSection',
      'profileForm', 
      'closetQuestion',
      'closetContainer',
      'occasionSelector',
      'uploadArea'
    ];
    
    sectionsToHide.forEach(sectionId => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.style.display = 'none';
      }
    });
    
    const elementsToClean = ['result', 'savedRecommendationsList'];
    
    elementsToClean.forEach(elementId => {
      const element = document.getElementById(elementId);
      if (element) {
        element.innerHTML = '';
        element.style.display = 'none';
      }
    });
    
    console.log('✅ Secciones reseteadas manualmente');
    
  } catch (e) {
    console.log('⚠️ Error en reset manual:', e.message);
  }
}

// Actualizar UI de autenticación
function updateAuthUI() {
  const userInfo = document.getElementById('userInfo');
  const mainLoginBtn = document.getElementById('mainLoginBtn');
  
  if (isLoggedIn && currentUser) {
    if (userInfo) userInfo.style.display = 'flex';
    if (mainLoginBtn) mainLoginBtn.style.display = 'none';
    
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    
    if (userName) userName.textContent = currentUser.name;
    if (userAvatar) userAvatar.src = currentUser.picture;
    
    updateMiClosetButton();
  } else {
    if (userInfo) userInfo.style.display = 'none';
    if (mainLoginBtn) mainLoginBtn.style.display = 'inline-flex';
    
    const miClosetBtn = document.querySelector('.mi-closet-btn');
    if (miClosetBtn) {
      miClosetBtn.style.display = 'none';
    }
  }
}

// Verificar perfil existente - VERSIÓN ULTRA DEFENSIVA
async function checkExistingProfile(email) {
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
    
    // Verificar localStorage primero
    const localStorageKey = `noshopia_user_${email}`;
    const localData = localStorage.getItem(localStorageKey);
    
    if (localData) {
      try {
        const userData = JSON.parse(localData);
        console.log('📋 Datos locales:', userData);
        
        if (userData.profileCompleted === true || 
            userData.profile || 
            userData.skin_color || 
            userData.age_range || 
            userData.gender) {
          console.log('✅ PERFIL ENCONTRADO EN LOCALSTORAGE');
          profileCheckCache = true;
          return true;
        }
      } catch (e) {
        console.log('Error parsing localStorage:', e.message);
      }
    }
    
    console.log('❌ No hay perfil en localStorage');
    
    // Verificar backend con timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
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
      
      console.log('❌ Backend confirma que NO existe perfil');
      profileCheckCache = false;
      return false;
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.log('🔌 Error de backend:', fetchError.message);
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

// Limpiar cache de verificación de perfil
function clearProfileCheckCache() {
  profileCheckCache = null;
  profileCheckInProgress = false;
}

// Activar closet mode
function activateClosetMode() {
  console.log('✅ Activando closet mode...');
  closetMode = true;
  
  if (currentUser) {
    const userData = JSON.parse(localStorage.getItem(`noshopia_user_${currentUser.email}`) || '{}');
    userData.closetMode = true;
    localStorage.setItem(`noshopia_user_${currentUser.email}`, JSON.stringify(userData));
  }
  
  updateMiClosetButton();
}

// Desactivar closet mode
function deactivateClosetMode() {
  console.log('❌ Desactivando closet mode...');
  closetMode = false;
  
  if (currentUser) {
    const userData = JSON.parse(localStorage.getItem(`noshopia_user_${currentUser.email}`) || '{}');
    userData.closetMode = false;
    localStorage.setItem(`noshopia_user_${currentUser.email}`, JSON.stringify(userData));
  }
  
  updateMiClosetButton();
}

// Marcar perfil como completado
function markProfileAsCompleted(profileData) {
  console.log('✅ Marcando perfil como completado:', profileData);
  
  profileCompleted = true;
  clearProfileCheckCache();
  
  if (currentUser) {
    const userData = {
      email: currentUser.email,
      name: currentUser.name,
      profileCompleted: true,
      profile: profileData,
      closetMode: false,
      completedAt: Date.now(),
      lastLogin: Date.now()
    };
    
    localStorage.setItem(`noshopia_user_${currentUser.email}`, JSON.stringify(userData));
    console.log('✅ Perfil guardado en localStorage');
  }
  
  // Ocultar formulario y mostrar closet question
  const profileForm = document.getElementById('profileForm');
  const closetQuestion = document.getElementById('closetQuestion');
  
  if (profileForm) profileForm.style.display = 'none';
  if (closetQuestion) closetQuestion.style.display = 'block';
}

// Verificar si el perfil está completo
function isProfileComplete() {
  return profileCompleted === true;
}

// Obtener datos del perfil guardado
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
    handleMainLogin();
    return;
  } else {
    showNotification('¡Plan Gratis ya activado!', 'success');
    if (typeof scrollToSection === 'function') {
      scrollToSection('upload');
    }
  }
}

function upgradeToPremium() {
  showNotification('Próximamente: Sistema de pagos Premium', 'info');
}
