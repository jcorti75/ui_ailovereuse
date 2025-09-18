// auth.js - Funciones de Autenticación CORREGIDAS

// Las variables globales están definidas en globals.js
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
    console.log('Inicializando Google Auth...');
    console.log('Client ID:', CONFIG.GOOGLE_CLIENT_ID);
    
    google.accounts.id.initialize({
      client_id: CONFIG.GOOGLE_CLIENT_ID,
      callback: handleGoogleSignIn,
      auto_select: false,
      ux_mode: 'popup'
    });
    
    console.log('Google Auth inicializado correctamente');
    
    const mainBtn = document.getElementById('mainLoginBtn');
    if (mainBtn) {
      mainBtn.innerHTML = '<i class="fab fa-google"></i> Conectar con Google - ¡Es Gratis!';
      mainBtn.onclick = handleMainLogin;
      mainBtn.disabled = false;
      mainBtn.style.opacity = '1';
      mainBtn.style.cursor = 'pointer';
    }
    
  } catch (e) {
    console.error('Error inicializando Google Auth:', e);
    showNotification('Error configurando Google Auth', 'error');
  }
}

// Manejar Google Sign In
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
    
    // Cargar datos del usuario para verificar si ya tiene perfil
    const hasUserData = loadUserClosetData();
    
    showWelcomeSection();
    showNotification(`¡Bienvenido ${currentUser.name}!`, 'success');
    
    console.log('Login exitoso:', currentUser.email);
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
  const mainLoginBtn = document.getElementById('mainLoginBtn');
  
  if (isLoggedIn && currentUser) {
    if (userInfo) {
      userInfo.style.display = 'flex';
      const userName = document.getElementById('userName');
      const userAvatar = document.getElementById('userAvatar');
      if (userName) userName.textContent = currentUser.name;
      if (userAvatar) userAvatar.src = currentUser.picture;
    }
    if (mainLoginBtn) mainLoginBtn.style.display = 'none';
  } else {
    if (userInfo) userInfo.style.display = 'none';
    if (mainLoginBtn) mainLoginBtn.style.display = 'inline-flex';
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

function showWelcomeSection() {
  const welcomeSection = document.getElementById('welcome');
  if (welcomeSection) {
    welcomeSection.style.display = 'block';
  }
  
  // Scroll suave al área principal
  const mainSection = document.getElementById('main') || document.querySelector('main');
  if (mainSection) {
    mainSection.scrollIntoView({ behavior: 'smooth' });
  }
}

function resetAllSections() {
  const sections = ['welcome', 'upload', 'results'];
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

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM cargado, iniciando verificación de Google Auth...');
  checkGoogleAuth();
  
  // Exponer variables globalmente si es necesario
  window.CONFIG = CONFIG;
  window.isLoggedIn = isLoggedIn;
  window.currentUser = currentUser;
});
