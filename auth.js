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
    showWelcomeSection();
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
    
    showWelcomeSection();
    showNotification(`¡Bienvenido ${currentUser.name}!`, 'success');
  } catch (e) {
    console.error('Error en login:', e);
    showNotification('Error al iniciar sesión', 'error');
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
  
  updateAuthUI();
  resetAllSections();
  showNotification('Sesión cerrada', 'info');
}

// Actualizar UI de autenticación
function updateAuthUI() {
  const userInfo = document.getElementById('userInfo');
  const mainLoginBtn = document.getElementById('mainLoginBtn');
  
  if (isLoggedIn && currentUser) {
    userInfo.style.display = 'flex';
    mainLoginBtn.style.display = 'none';
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userAvatar').src = currentUser.picture;
  } else {
    userInfo.style.display = 'none';
    mainLoginBtn.style.display = 'inline-flex';
  }
}

// Verificar perfil existente
async function checkExistingProfile(email) {
  try {
    console.log('🔍 Verificando perfil para:', email);
    const response = await fetch(`${CONFIG.API_BASE}/api/profile/check?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Datos de verificación:', data);
      return data.exists === true || data.profile_exists === true;
    } else {
      console.log('Error en response:', response.status);
      return false;
    }
  } catch (e) {
    console.error('Error verificando perfil:', e);
    return false;
  }
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