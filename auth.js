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

// ✅ MEJORADA: Verificar perfil existente - VERSIÓN MÁS ROBUSTA
async function checkExistingProfile(email) {
  try {
    console.log('🔍 Verificando perfil para:', email);
    
    // PRIMERO: Verificar en localStorage con verificación más flexible
    const localStorageKey = `noshopia_user_${email}`;
    const localData = localStorage.getItem(localStorageKey);
    
    if (localData) {
      try {
        const userData = JSON.parse(localData);
        console.log('📋 Datos locales encontrados:', userData);
        
        // VERIFICACIÓN MÁS FLEXIBLE - Solo requiere que esté marcado como completado
        if (userData.profileCompleted === true) {
          console.log('✅ Perfil marcado como completado en localStorage');
          
          // Verificar que tenga al menos algo en profile (más flexible)
          if (userData.profile && Object.keys(userData.profile).length > 0) {
            console.log('✅ Perfil tiene datos válidos');
            return true;
          } else {
            console.log('⚠️ Perfil completado pero sin datos - aceptando');
            return true; // Aceptar incluso sin datos detallados
          }
        } else {
          console.log('❌ Perfil NO marcado como completado en localStorage');
        }
      } catch (e) {
        console.log('Error leyendo localStorage:', e);
        localStorage.removeItem(localStorageKey); // Limpiar datos corruptos
      }
    } else {
      console.log('❌ No hay datos en localStorage para:', localStorageKey);
    }
    
    // SEGUNDO: Solo verificar backend si localStorage no tiene nada
    console.log('🌐 Verificando en backend...');
    try {
      const response = await fetch(`${CONFIG.API_BASE}/api/profile/check?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Datos de verificación del backend:', data);
        
        const hasProfile = data.exists === true || data.profile_exists === true;
        
        if (hasProfile) {
          console.log('✅ Backend confirma que el perfil existe');
          // Actualizar localStorage con confirmación del backend
          const userData = {
            email: email,
            profileCompleted: true,
            profile: data.profile || { completed: true },
            closetMode: data.closetMode || false,
            lastVerified: Date.now(),
            source: 'backend'
          };
          localStorage.setItem(localStorageKey, JSON.stringify(userData));
          return true;
        } else {
          console.log('❌ Backend dice que no existe el perfil');
        }
      } else if (response.status === 404) {
        console.log('❌ Backend devuelve 404 - perfil no existe en backend');
      } else {
        console.log('⚠️ Error en response del backend:', response.status);
      }
    } catch (apiError) {
      console.log('🔌 Error conectando con API (normal si está offline):', apiError.message);
      
      // Si no podemos conectar al backend, ser más permisivo con localStorage
      if (localData) {
        try {
          const userData = JSON.parse(localData);
          if (userData.profileCompleted === true) {
            console.log('✅ Aceptando perfil local debido a error de conectividad');
            return true;
          }
        } catch (e) {
          // Ignorar errores de parsing
        }
      }
    }
    
    console.log('❌ No se encontró perfil válido en localStorage ni backend');
    return false;
    
  } catch (e) {
    console.error('Error general verificando perfil:', e);
    return false;
  }
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
