// main.js - Inicialización Principal de la Aplicación

console.log('🚀 Iniciando aplicación NoShopiA...');

// =======================================================
// CONFIGURACIÓN INICIAL
// =======================================================

// Verificar dependencias críticas
function checkDependencies() {
  const requiredVars = [
    'CONFIG', 'isLoggedIn', 'currentUser', 'uploadedFiles', 
    'showNotification', 'getTypeName'
  ];
  
  const missing = requiredVars.filter(varName => typeof window[varName] === 'undefined');
  
  if (missing.length > 0) {
    console.error('❌ Variables faltantes:', missing);
    return false;
  }
  
  console.log('✅ Todas las dependencias están disponibles');
  return true;
}

// =======================================================
// GOOGLE LOGIN SETUP
// =======================================================

// Configurar Google Sign-In
function initializeGoogleLogin() {
  try {
    console.log('🔐 Configurando Google Sign-In...');
    
    // Verificar si Google está disponible
    if (typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.initialize({
        client_id: window.CONFIG.GOOGLE_CLIENT_ID,
        callback: handleGoogleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true
      });
      
      // Renderizar botón si existe
      const googleBtnContainer = document.getElementById('googleLoginContainer');
      if (googleBtnContainer) {
        google.accounts.id.renderButton(googleBtnContainer, {
          theme: 'outline',
          size: 'large',
          width: 250,
          text: 'continue_with',
          locale: 'es'
        });
      }
      
      console.log('✅ Google Sign-In inicializado');
      
    } else {
      console.warn('⚠️ Google Sign-In no disponible, configurando fallback...');
      setupGoogleLoginFallback();
    }
    
  } catch (error) {
    console.error('❌ Error configurando Google Login:', error);
    setupGoogleLoginFallback();
  }
}

// Fallback para Google Login
function setupGoogleLoginFallback() {
  console.log('🔧 Configurando login fallback...');
  
  // Buscar todos los botones de login
  const loginButtons = document.querySelectorAll('[onclick*="handleMainLogin"], .google-login-btn, #mainLoginBtn');
  
  loginButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('🔐 Login fallback activado');
      
      // Simular login para desarrollo
      simulateLogin();
    });
  });
}

// Simular login para desarrollo/testing
function simulateLogin() {
  console.log('🧪 Simulando login para desarrollo...');
  
  const userData = {
    name: 'Usuario Demo',
    email: 'demo@noshopia.com',
    picture: 'https://via.placeholder.com/40x40/3b82f6/ffffff?text=U'
  };
  
  // Actualizar estado global
  window.isLoggedIn = true;
  window.currentUser = userData;
  
  // Mostrar UI de usuario logueado
  showUserLoggedInState(userData);
  
  // Mostrar closet question
  showClosetQuestion();
  
  window.showNotification('Demo login exitoso - Funcionalidad completa habilitada', 'success');
}

// Manejar respuesta de Google
function handleGoogleCredentialResponse(response) {
  try {
    console.log('🔐 Procesando respuesta de Google...');
    
    // Decodificar JWT (simplificado)
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    
    const userData = {
      name: payload.name,
      email: payload.email,
      picture: payload.picture
    };
    
    // Actualizar estado global
    window.isLoggedIn = true;
    window.currentUser = userData;
    
    // Guardar en localStorage
    localStorage.setItem('noshopia_auth', JSON.stringify(userData));
    localStorage.setItem('noshopia_logged_in', 'true');
    
    // Mostrar UI de usuario logueado
    showUserLoggedInState(userData);
    
    // Mostrar closet question
    showClosetQuestion();
    
    window.showNotification(`¡Bienvenido ${userData.name}!`, 'success');
    
    console.log('✅ Login exitoso:', userData.name);
    
  } catch (error) {
    console.error('❌ Error procesando login:', error);
    window.showNotification('Error en el login. Intenta de nuevo.', 'error');
  }
}

// =======================================================
// ESTADO DE USUARIO LOGUEADO
// =======================================================

// Mostrar estado de usuario logueado
function showUserLoggedInState(userData) {
  try {
    // Ocultar botón de login principal
    const mainLoginBtn = document.getElementById('mainLoginBtn');
    if (mainLoginBtn) {
      mainLoginBtn.style.display = 'none';
    }
    
    // Mostrar info de usuario en header
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    
    if (userInfo) {
      userInfo.style.display = 'flex';
    }
    
    if (userName) {
      userName.textContent = userData.name;
    }
    
    if (userAvatar) {
      userAvatar.src = userData.picture;
      userAvatar.alt = userData.name;
    }
    
    // Mostrar sección de bienvenida
    const welcomeSection = document.getElementById('welcomeSection');
    if (welcomeSection) {
      welcomeSection.style.display = 'block';
      
      // Actualizar nombre en bienvenida
      const userNameElements = welcomeSection.querySelectorAll('[data-user-name]');
      userNameElements.forEach(el => el.textContent = userData.name);
    }
    
    console.log('✅ UI de usuario logueado actualizada');
    
  } catch (error) {
    console.error('❌ Error actualizando UI de usuario:', error);
  }
}

// Mostrar pregunta del closet
function showClosetQuestion() {
  try {
    // Ocultar sección de login requerido si existe
    const loginRequired = document.querySelector('.login-required');
    if (loginRequired) {
      loginRequired.style.display = 'none';
    }
    
    // Mostrar pregunta del closet
    const closetQuestion = document.getElementById('closetQuestion');
    if (closetQuestion) {
      closetQuestion.style.display = 'block';
      
      // Scroll suave hacia el closet
      setTimeout(() => {
        closetQuestion.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
      }, 500);
    }
    
    console.log('✅ Pregunta del closet mostrada');
    
  } catch (error) {
    console.error('❌ Error mostrando pregunta del closet:', error);
  }
}

// =======================================================
// LOGOUT
// =======================================================

// Función de logout
function logout() {
  try {
    console.log('👋 Cerrando sesión...');
    
    // Limpiar estado global
    window.isLoggedIn = false;
    window.currentUser = null;
    window.selectedOccasion = null;
    window.uploadedFiles = { tops: [], bottoms: [], shoes: [] };
    window.uploadedImages = { tops: [], bottoms: [], shoes: [] };
    window.closetItems = { tops: [], bottoms: [], shoes: [] };
    
    // Limpiar localStorage
    localStorage.removeItem('noshopia_auth');
    localStorage.removeItem('noshopia_logged_in');
    
    // Restaurar UI inicial
    restoreInitialUI();
    
    window.showNotification('Sesión cerrada correctamente', 'success');
    
    // Scroll al inicio
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 500);
    
  } catch (error) {
    console.error('❌ Error en logout:', error);
    window.showNotification('Error cerrando sesión', 'error');
  }
}

// Restaurar UI inicial
function restoreInitialUI() {
  try {
    // Mostrar botón de login principal
    const mainLoginBtn = document.getElementById('mainLoginBtn');
    if (mainLoginBtn) {
      mainLoginBtn.style.display = 'flex';
    }
    
    // Ocultar info de usuario
    const userInfo = document.getElementById('userInfo');
    if (userInfo) {
      userInfo.style.display = 'none';
    }
    
    // Ocultar secciones de usuario logueado
    const sectionsToHide = [
      'welcomeSection', 'profileForm', 'closetQuestion', 
      'closetContainer', 'occasionSelector', 'uploadArea'
    ];
    
    sectionsToHide.forEach(sectionId => {
      const section = document.getElementById(sectionId);
      if (section) {
        section.style.display = 'none';
      }
    });
    
    // Limpiar resultados si existen
    const result = document.getElementById('result');
    if (result) {
      result.innerHTML = '';
      result.style.display = 'none';
    }
    
    console.log('✅ UI inicial restaurada');
    
  } catch (error) {
    console.error('❌ Error restaurando UI:', error);
  }
}

// =======================================================
// VERIFICAR SESIÓN EXISTENTE
// =======================================================

// Verificar si hay una sesión guardada
function checkExistingSession() {
  try {
    const savedAuth = localStorage.getItem('noshopia_auth');
    const isLoggedIn = localStorage.getItem('noshopia_logged_in') === 'true';
    
    if (savedAuth && isLoggedIn) {
      const userData = JSON.parse(savedAuth);
      
      if (userData.name && userData.email) {
        console.log('🔄 Restaurando sesión guardada:', userData.name);
        
        // Actualizar estado global
        window.isLoggedIn = true;
        window.currentUser = userData;
        
        // Mostrar UI de usuario logueado
        showUserLoggedInState(userData);
        showClosetQuestion();
        
        // Si existe función de actualizar display de usuario en closet
        if (typeof window.updateUserDisplayInfo === 'function') {
          window.updateUserDisplayInfo();
        }
        
        window.showNotification(`Bienvenido de vuelta, ${userData.name}`, 'success');
        return true;
      }
    }
    
    return false;
    
  } catch (error) {
    console.error('❌ Error verificando sesión existente:', error);
    return false;
  }
}

// =======================================================
// INICIALIZACIÓN PRINCIPAL
// =======================================================

// Función principal de inicialización
function initializeApp() {
  console.log('🔧 Inicializando aplicación...');
  
  try {
    // 1. Verificar dependencias
    if (!checkDependencies()) {
      console.error('❌ Faltan dependencias críticas');
      return;
    }
    
    // 2. Configurar Google Login
    setTimeout(() => {
      initializeGoogleLogin();
    }, 500);
    
    // 3. Verificar sesión existente
    setTimeout(() => {
      checkExistingSession();
    }, 1000);
    
    // 4. Exponer funciones globalmente
    window.logout = logout;
    window.handleGoogleCredentialResponse = handleGoogleCredentialResponse;
    window.handleMainLogin = simulateLogin; // Para desarrollo
    
    console.log('✅ Aplicación inicializada correctamente');
    
  } catch (error) {
    console.error('❌ Error fatal inicializando aplicación:', error);
    window.showNotification('Error inicializando aplicación', 'error');
  }
}

// =======================================================
// AUTO-INICIALIZACIÓN
// =======================================================

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM ya está listo
  setTimeout(initializeApp, 100);
}

// Backup: inicializar en window.load si no se ejecutó antes
window.addEventListener('load', () => {
  if (!window.APP_INITIALIZED) {
    console.log('🔄 Inicialización de respaldo...');
    setTimeout(initializeApp, 500);
  }
});

// Marcar que se intentó inicializar
window.APP_INITIALIZED = true;

console.log('✅ main.js cargado - Aplicación lista para inicializar');
