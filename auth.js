// auth.js - Sistema de Autenticación Corregido

// Variables globales de estado (centralizadas)
let isLoggedIn = false;
let currentUser = null;

// FUNCIONES AUXILIARES MEJORADAS
function showNotification(message, type = 'info') {
  console.log(`[${type.toUpperCase()}] ${message}`);
  
  try {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 10000;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white; padding: 1rem 2rem; border-radius: 15px; max-width: 350px;
      font-weight: 600; box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      animation: slideInRight 0.3s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  } catch (e) {
    console.log(`NOTIFICATION: ${message}`);
  }
}

// FUNCIONES DE ACCESO AL ESTADO GLOBAL (centralizadas)
window.isLoggedIn = () => isLoggedIn;
window.currentUser = () => currentUser;
window.setLoggedIn = (status) => { isLoggedIn = status; };
window.setCurrentUser = (user) => { currentUser = user; };

// VERIFICAR SI EL USUARIO YA COMPLETÓ SU PERFIL (corregido)
function hasCompletedProfile(email) {
  try {
    const profileCompleted = localStorage.getItem(`noshopia_profile_completed_${email}`);
    const profileData = localStorage.getItem(`noshopia_profile_${email}`);
    
    if (profileCompleted === 'true') {
      console.log('✅ Usuario ya completó perfil (flag verificado)');
      return true;
    }
    
    if (profileData) {
      try {
        const data = JSON.parse(profileData);
        if (data.skin_color && data.age_range && data.gender) {
          console.log('✅ Usuario ya completó perfil (datos verificados)');
          // Asegurar que el flag esté presente
          localStorage.setItem(`noshopia_profile_completed_${email}`, 'true');
          return true;
        }
      } catch (e) {
        console.warn('Error parseando datos de perfil existentes');
      }
    }
    
    console.log('❌ Usuario NO ha completado perfil');
    return false;
  } catch (e) {
    console.error('Error verificando perfil:', e);
    return false;
  }
}

// CARGAR GOOGLE SCRIPT CON MEJOR MANEJO DE ERRORES
function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (typeof google !== 'undefined' && google.accounts?.id) {
      resolve();
      return;
    }
    
    console.log('🔄 Cargando Google Sign-In...');
    
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    const timeoutId = setTimeout(() => {
      script.remove();
      reject('Timeout loading Google script');
    }, 10000);
    
    script.onload = () => {
      clearTimeout(timeoutId);
      setTimeout(() => {
        if (typeof google !== 'undefined' && google.accounts?.id) {
          console.log('✅ Google Sign-In cargado exitosamente');
          resolve();
        } else {
          reject('Google Auth no disponible');
        }
      }, 1000);
    };
    
    script.onerror = () => {
      clearTimeout(timeoutId);
      script.remove();
      reject('Error loading Google script');
    };
    
    document.head.appendChild(script);
  });
}

// INICIALIZAR GOOGLE AUTH MEJORADO
function initializeGoogleAuth() {
  try {
    google.accounts.id.initialize({
      client_id: CONFIG.GOOGLE_CLIENT_ID,
      callback: handleGoogleSignIn,
      auto_select: false,
      ux_mode: 'popup'
    });
    
    updateLoginButton();
    console.log('✅ Google Auth inicializado');
    
  } catch (e) {
    console.warn('Google Auth no disponible, usando fallback');
    showAlternativeLogin();
  }
}

// ACTUALIZAR BOTÓN DE LOGIN EN HEADER
function updateLoginButton() {
  const headerBtn = document.getElementById('headerLoginBtn');
  if (headerBtn) {
    headerBtn.innerHTML = '<i class="fab fa-google"></i> Iniciar sesión con Google';
    headerBtn.onclick = handleGoogleLogin;
    headerBtn.disabled = false;
    headerBtn.style.opacity = '1';
  }
}

// MOSTRAR LOGIN ALTERNATIVO
function showAlternativeLogin() {
  const headerBtn = document.getElementById('headerLoginBtn');
  if (headerBtn) {
    headerBtn.innerHTML = '<i class="fas fa-envelope"></i> Continuar con Email';
    headerBtn.onclick = showEmailLogin;
    headerBtn.disabled = false;
    headerBtn.style.opacity = '1';
  }
}

// LOGIN CON EMAIL (fallback)
function showEmailLogin() {
  const email = prompt('Ingresa tu email para continuar:');
  if (email && email.includes('@')) {
    processManualLogin(email);
  } else if (email) {
    showNotification('Email inválido', 'error');
  }
}

// PROCESAR LOGIN MANUAL
function processManualLogin(email) {
  try {
    const user = {
      name: email.split('@')[0].replace(/[._-]/g, ' '), // Convertir email a nombre
      email: email,
      picture: 'https://via.placeholder.com/40/3b82f6/ffffff?text=' + email.charAt(0).toUpperCase(),
      token: 'manual_' + Date.now()
    };
    
    processSuccessfulLogin(user);
    
  } catch (e) {
    console.error('Error en login manual:', e);
    showNotification('Error procesando login', 'error');
  }
}

// MANEJAR LOGIN CON GOOGLE (corregido)
async function handleGoogleSignIn(response) {
  if (!response.credential) return;
  
  try {
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    
    const user = {
      name: payload.name || payload.given_name || payload.email.split('@')[0],
      email: payload.email,
      picture: payload.picture || 'https://via.placeholder.com/40/3b82f6/ffffff?text=' + (payload.name?.[0] || 'U'),
      token: response.credential
    };
    
    processSuccessfulLogin(user);
    
  } catch (e) {
    console.error('Error procesando Google login:', e);
    showNotification('Error al iniciar sesión', 'error');
  }
}

// PROCESAR LOGIN EXITOSO (función centralizada)
function processSuccessfulLogin(user) {
  console.log('🎉 Login exitoso para:', user.name, `(${user.email})`);
  
  // Actualizar estado global
  currentUser = user;
  isLoggedIn = true;
  
  // Persistir sesión
  localStorage.setItem('noshopia_current_user', JSON.stringify(user));
  localStorage.setItem('noshopia_logged_in', 'true');
  
  // Actualizar UI
  updateAuthUI();
  
  showNotification(`¡Bienvenido ${user.name}!`, 'success');
  
  // NAVEGACIÓN INTELIGENTE BASADA EN PERFIL
  setTimeout(() => {
    navigateAfterLogin(user.email);
  }, 1000);
}

// NAVEGACIÓN DESPUÉS DEL LOGIN (corregida)
function navigateAfterLogin(email) {
  try {
    // Scroll a la sección de upload
    const uploadSection = document.getElementById('upload');
    if (uploadSection) {
      uploadSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    if (hasCompletedProfile(email)) {
      // USUARIO EXISTENTE - Ir directo a opciones
      console.log('👤 Usuario existente - mostrando opciones del closet');
      
      setTimeout(() => {
        hideAllSections();
        showClosetOptions();
        highlightOptions(); // Nueva función para destacar opciones
      }, 1500);
      
      showNotification('¡Bienvenido de nuevo! Elige tu método de recomendación.', 'success');
      
    } else {
      // USUARIO NUEVO - Mostrar formulario de perfil
      console.log('🆕 Usuario nuevo - mostrando formulario de perfil');
      
      setTimeout(() => {
        hideAllSections();
        showWelcomeAndProfile();
      }, 1500);
      
      showNotification('Completa tu perfil una sola vez para mejores recomendaciones.', 'info');
    }
    
  } catch (error) {
    console.error('Error en navegación post-login:', error);
    // Fallback: mostrar formulario de perfil
    setTimeout(() => {
      hideAllSections();
      showWelcomeAndProfile();
    }, 1500);
  }
}

// MOSTRAR BIENVENIDA Y PERFIL
function showWelcomeAndProfile() {
  const welcomeSection = document.getElementById('welcomeSection');
  const profileForm = document.getElementById('profileForm');
  
  if (welcomeSection) {
    welcomeSection.style.display = 'block';
    
    // Actualizar contadores en bienvenida
    document.getElementById('visitCounter').textContent = '1';
    document.getElementById('recommendationCounter').textContent = '0';
    document.getElementById('outfitCounter').textContent = '0';
  }
  
  if (profileForm) {
    profileForm.style.display = 'block';
    
    // Activar el sistema de formulario de perfil
    if (typeof window.setupProfileForm === 'function') {
      window.setupProfileForm();
    }
  }
}

// MOSTRAR OPCIONES DEL CLOSET CON NAVEGACIÓN MEJORADA
function showClosetOptions() {
  const closetQuestion = document.getElementById('closetQuestion');
  if (closetQuestion) {
    closetQuestion.style.display = 'block';
    
    // SCROLL AUTOMÁTICO A LAS OPCIONES
    setTimeout(() => {
      closetQuestion.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }, 500);
    
    // Configurar botones de opciones
    setupClosetOptionButtons();
  }
}

// DESTACAR OPCIONES VISUALMENTE (nueva función)
function highlightOptions() {
  setTimeout(() => {
    const options = document.querySelectorAll('.closet-option');
    options.forEach((option, index) => {
      setTimeout(() => {
        option.style.animation = 'pulse 0.6s ease-in-out';
        option.style.transform = 'scale(1.05)';
        
        setTimeout(() => {
          option.style.transform = 'scale(1)';
        }, 600);
      }, index * 200);
    });
  }, 800);
}

// CONFIGURAR BOTONES DE OPCIONES (función crítica)
function setupClosetOptionButtons() {
  console.log('🔧 Configurando botones de opciones del closet...');
  
  // Buscar botones por ID y por posición
  const enableBtn = document.getElementById('enableClosetBtn') || 
                   document.querySelector('.closet-option:first-child');
  const directBtn = document.getElementById('useDirectModeBtn') || 
                   document.querySelector('.closet-option:last-child');
  
  if (enableBtn && directBtn) {
    // CONFIGURAR MI CLOSET DIGITAL
    enableBtn.onclick = function(e) {
      e.preventDefault();
      console.log('🎯 CLICK: Mi Closet Digital');
      
      try {
        if (typeof window.enableCloset === 'function') {
          window.enableCloset();
        } else {
          console.warn('enableCloset no disponible, usando fallback');
          enableClosetFallback();
        }
      } catch (error) {
        console.error('Error en enableCloset:', error);
        enableClosetFallback();
      }
    };
    
    // CONFIGURAR RECOMENDACIONES RÁPIDAS
    directBtn.onclick = function(e) {
      e.preventDefault();
      console.log('🎯 CLICK: Recomendaciones Rápidas');
      
      try {
        if (typeof window.useDirectMode === 'function') {
          window.useDirectMode();
        } else {
          console.warn('useDirectMode no disponible, usando fallback');
          useDirectModeFallback();
        }
      } catch (error) {
        console.error('Error en useDirectMode:', error);
        useDirectModeFallback();
      }
    };
    
    console.log('✅ Botones de opciones configurados exitosamente');
    
  } else {
    console.error('❌ No se pudieron encontrar los botones de opciones');
  }
}

// FALLBACK PARA MI CLOSET DIGITAL
function enableClosetFallback() {
  hideAllSections();
  const closetContainer = document.getElementById('closetContainer');
  if (closetContainer) {
    closetContainer.style.display = 'block';
    
    // Configurar información del usuario en el closet
    const userEmail = document.getElementById('userEmail');
    if (userEmail && currentUser) {
      userEmail.textContent = `${currentUser.name} (${currentUser.email})`;
    }
    
    showNotification('Mi Closet Digital activado', 'success');
  }
}

// FALLBACK PARA RECOMENDACIONES RÁPIDAS
function useDirectModeFallback() {
  hideAllSections();
  
  const occasionSelector = document.getElementById('occasionSelector');
  const uploadArea = document.getElementById('uploadArea');
  
  if (occasionSelector) {
    occasionSelector.style.display = 'block';
  }
  
  if (uploadArea) {
    uploadArea.style.display = 'block';
  }
  
  showNotification('Recomendaciones Rápidas activado', 'success');
}

// OCULTAR TODAS LAS SECCIONES
function hideAllSections() {
  const sections = [
    'welcomeSection', 'profileForm', 'closetQuestion',
    'closetContainer', 'uploadArea', 'occasionSelector'
  ];
  
  sections.forEach(sectionId => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.style.display = 'none';
    }
  });
}

// ACTUALIZAR UI DE AUTENTICACIÓN (corregida)
function updateAuthUI() {
  try {
    const userInfo = document.getElementById('userInfo');
    const headerLoginBtn = document.getElementById('headerLoginBtn');
    
    if (isLoggedIn && currentUser) {
      // MOSTRAR INFO DEL USUARIO
      if (userInfo) {
        userInfo.style.display = 'flex';
        
        const userName = document.getElementById('userName');
        const userAvatar = document.getElementById('userAvatar');
        
        if (userName) {
          // MOSTRAR NOMBRE REAL, NO EMAIL
          userName.textContent = currentUser.name;
        }
        
        if (userAvatar) {
          userAvatar.src = currentUser.picture;
        }
      }
      
      // OCULTAR BOTÓN DE LOGIN
      if (headerLoginBtn) {
        headerLoginBtn.style.display = 'none';
      }
      
    } else {
      // MOSTRAR BOTÓN DE LOGIN
      if (userInfo) {
        userInfo.style.display = 'none';
      }
      
      if (headerLoginBtn) {
        headerLoginBtn.style.display = 'inline-flex';
      }
    }
  } catch (e) {
    console.error('Error actualizando UI de auth:', e);
  }
}

// LOGOUT FUNCIONAL (corregido)
function logout() {
  try {
    console.log('👋 Cerrando sesión...');
    
    // Limpiar estado global
    currentUser = null;
    isLoggedIn = false;
    
    // Limpiar localStorage
    localStorage.removeItem('noshopia_current_user');
    localStorage.removeItem('noshopia_logged_in');
    
    // Ocultar todas las secciones
    hideAllSections();
    
    // Actualizar UI
    updateAuthUI();
    
    // Scroll al inicio
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    showNotification('Sesión cerrada correctamente', 'info');
    
  } catch (e) {
    console.error('Error en logout:', e);
    showNotification('Error cerrando sesión', 'error');
  }
}

// RESTAURAR SESIÓN AL CARGAR PÁGINA
function restoreSession() {
  try {
    const savedUser = localStorage.getItem('noshopia_current_user');
    const savedLoginStatus = localStorage.getItem('noshopia_logged_in');
    
    if (savedUser && savedLoginStatus === 'true') {
      const user = JSON.parse(savedUser);
      
      console.log('🔄 Restaurando sesión para:', user.name);
      
      currentUser = user;
      isLoggedIn = true;
      
      updateAuthUI();
      
      // No navegar automáticamente en restore, solo restaurar estado
      console.log('✅ Sesión restaurada exitosamente');
      return true;
    }
    
    return false;
    
  } catch (e) {
    console.error('Error restaurando sesión:', e);
    // Limpiar datos corruptos
    localStorage.removeItem('noshopia_current_user');
    localStorage.removeItem('noshopia_logged_in');
    return false;
  }
}

// MANEJAR LOGIN PRINCIPAL (desde botones)
function handleGoogleLogin() {
  console.log('🔄 Iniciando proceso de login...');
  
  try {
    if (typeof google !== 'undefined' && google.accounts?.id) {
      google.accounts.id.prompt();
    } else {
      console.log('Google no disponible, usando login con email');
      showEmailLogin();
    }
  } catch (e) {
    console.warn('Error en Google login, usando fallback');
    showEmailLogin();
  }
}

// VERIFICAR E INICIALIZAR GOOGLE AUTH
async function checkAndInitializeGoogleAuth() {
  console.log('🔍 Verificando Google Auth...');
  
  try {
    await loadGoogleScript();
    initializeGoogleAuth();
  } catch (error) {
    console.warn('Google Auth no disponible:', error);
    showAlternativeLogin();
  }
}

// FUNCIONES PARA BOTONES DE PLANES
function startFreePlan() {
  if (!isLoggedIn) {
    handleGoogleLogin();
  } else {
    showNotification('Plan Gratis ya activado', 'success');
    const uploadSection = document.getElementById('upload');
    if (uploadSection) {
      uploadSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

function upgradeToPremium() {
  showNotification('Próximamente: Sistema de pagos Premium', 'info');
}

// EXPONER FUNCIONES GLOBALMENTE
window.handleMainLogin = handleGoogleLogin;
window.startFreePlan = startFreePlan;
window.upgradeToPremium = upgradeToPremium;
window.logout = logout;
window.showNotification = showNotification;

// INICIALIZACIÓN PRINCIPAL
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Inicializando sistema de autenticación...');
  
  try {
    // Configurar botón de logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.onclick = logout;
    }
    
    // Restaurar sesión si existe
    const sessionRestored = restoreSession();
    
    if (!sessionRestored) {
      // Solo inicializar Google Auth si no hay sesión
      checkAndInitializeGoogleAuth();
    }
    
    console.log('✅ Sistema de autenticación inicializado');
    
  } catch (e) {
    console.error('Error en inicialización de auth:', e);
    // Fallback de emergencia
    setTimeout(() => {
      const headerBtn = document.getElementById('headerLoginBtn');
      if (headerBtn) {
        headerBtn.onclick = showEmailLogin;
        headerBtn.disabled = false;
        headerBtn.style.opacity = '1';
        headerBtn.innerHTML = '<i class="fas fa-envelope"></i> Continuar con Email';
      }
    }, 1000);
  }
});
// CORRECCIONES ESPECÍFICAS PARA auth.js
// Agrega estas funciones y modificaciones a tu archivo auth.js actual

// CORRECCIÓN 1: Función mejorada para procesar login exitoso con nombre real
function processSuccessfulLogin(user) {
  console.log('🎉 Login exitoso para:', user.name, `(${user.email})`);
  
  // CORREGIDO: Extraer nombre real de Google, no usar email
  const realName = user.name || user.given_name || extractNameFromEmail(user.email);
  
  // Actualizar estado global con nombre real
  currentUser = {
    ...user,
    name: realName, // CRÍTICO: Usar nombre real siempre
    displayName: realName
  };
  isLoggedIn = true;
  
  // Persistir sesión con nombre real
  localStorage.setItem('noshopia_current_user', JSON.stringify(currentUser));
  localStorage.setItem('noshopia_logged_in', 'true');
  
  // Actualizar UI inmediatamente
  updateAuthUI();
  
  showNotification(`¡Bienvenido ${realName}!`, 'success'); // Usar nombre real
  
  // NAVEGACIÓN INTELIGENTE BASADA EN PERFIL
  setTimeout(() => {
    navigateAfterLogin(user.email);
  }, 1000);
}

// FUNCIÓN AUXILIAR: Extraer nombre legible del email
function extractNameFromEmail(email) {
  if (!email) return 'Usuario';
  
  const localPart = email.split('@')[0];
  
  // Convertir patrones comunes a nombres legibles
  return localPart
    .replace(/[._-]/g, ' ') // Reemplazar puntos, guiones por espacios
    .replace(/\d+/g, '') // Remover números
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalizar
    .join(' ')
    .trim() || 'Usuario';
}

// CORRECCIÓN 2: Función mejorada de Google Sign-In para extraer nombre real
async function handleGoogleSignIn(response) {
  if (!response.credential) return;
  
  try {
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    
    // CORREGIDO: Priorizar nombre real de Google
    const realName = payload.name || payload.given_name || 
                     (payload.given_name && payload.family_name ? 
                      `${payload.given_name} ${payload.family_name}` : null) ||
                     extractNameFromEmail(payload.email);
    
    const user = {
      name: realName, // CRÍTICO: Nombre real, no email
      email: payload.email,
      picture: payload.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(realName)}&background=3b82f6&color=fff`,
      token: response.credential,
      given_name: payload.given_name,
      family_name: payload.family_name
    };
    
    console.log('✅ Usuario extraído de Google:', {
      name: user.name,
      email: user.email,
      hasRealName: !!payload.name
    });
    
    processSuccessfulLogin(user);
    
  } catch (e) {
    console.error('Error procesando Google login:', e);
    showNotification('Error al iniciar sesión', 'error');
  }
}

// CORRECCIÓN 3: Actualización de UI corregida para mostrar nombre real
function updateAuthUI() {
  try {
    const userInfo = document.getElementById('userInfo');
    const headerLoginBtn = document.getElementById('headerLoginBtn');
    
    if (isLoggedIn && currentUser) {
      // MOSTRAR INFO DEL USUARIO CON NOMBRE REAL
      if (userInfo) {
        userInfo.style.display = 'flex';
        
        const userName = document.getElementById('userName');
        const userAvatar = document.getElementById('userAvatar');
        
        if (userName) {
          // CRÍTICO: Mostrar nombre real, nunca el email
          userName.textContent = currentUser.name || currentUser.displayName || 'Usuario';
          userName.title = `${currentUser.name} (${currentUser.email})`; // Tooltip con info completa
        }
        
        if (userAvatar) {
          userAvatar.src = currentUser.picture;
          userAvatar.alt = currentUser.name;
        }
      }
      
      // ACTUALIZAR TAMBIÉN OTROS LUGARES DONDE APARECE EL NOMBRE
      updateUserNameInCloset();
      
      // OCULTAR BOTÓN DE LOGIN
      if (headerLoginBtn) {
        headerLoginBtn.style.display = 'none';
      }
      
    } else {
      // MOSTRAR BOTÓN DE LOGIN
      if (userInfo) {
        userInfo.style.display = 'none';
      }
      
      if (headerLoginBtn) {
        headerLoginBtn.style.display = 'inline-flex';
      }
    }
  } catch (e) {
    console.error('Error actualizando UI de auth:', e);
  }
}

// FUNCIÓN NUEVA: Actualizar nombre en el closet y otras secciones
function updateUserNameInCloset() {
  if (!currentUser) return;
  
  const realName = currentUser.name || currentUser.displayName || 'Usuario';
  
  // Actualizar en closet header
  const userEmail = document.getElementById('userEmail');
  if (userEmail) {
    userEmail.textContent = `Bienvenido ${realName}`; // CORREGIDO: Nombre real
  }
  
  // Actualizar en sección de bienvenida
  const welcomeUserName = document.getElementById('welcomeUserName');
  if (welcomeUserName) {
    welcomeUserName.textContent = realName;
  }
  
  // Actualizar cualquier elemento con data-user-name
  document.querySelectorAll('[data-user-name="true"]').forEach(element => {
    element.textContent = realName;
  });
  
  console.log('✅ Nombre actualizado en UI:', realName);
}

// CORRECCIÓN 4: Configuración mejorada de Google Auth sin pop-ups beta
function initializeGoogleAuth() {
  try {
    // CONFIGURACIÓN PROFESIONAL SIN REFERENCIAS BETA
    google.accounts.id.initialize({
      client_id: CONFIG.GOOGLE_CLIENT_ID,
      callback: handleGoogleSignIn,
      auto_select: false,
      cancel_on_tap_outside: true,
      context: 'signin', // Contexto profesional
      // SIN ux_mode para evitar pop-ups beta
    });
    
    updateLoginButton();
    console.log('✅ Google Auth inicializado profesionalmente');
    
  } catch (e) {
    console.warn('Google Auth no disponible, usando fallback');
    showAlternativeLogin();
  }
}

// CORRECCIÓN 5: Función de login mejorada para ir directo a Google
function handleGoogleLogin() {
  console.log('🔄 Iniciando login profesional con Google...');
  
  try {
    if (typeof google !== 'undefined' && google.accounts?.id) {
      // CORREGIDO: Usar prompt directo sin configuraciones beta
      google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          console.log('⚠️ Google login no mostrado, usando fallback');
          showEmailLogin();
        } else if (notification.isSkippedMoment()) {
          console.log('👤 Usuario omitió login con Google');
        }
      });
    } else {
      console.log('Google no disponible, usando login con email');
      showEmailLogin();
    }
  } catch (e) {
    console.warn('Error en Google login, usando fallback:', e);
    showEmailLogin();
  }
}

// CORRECCIÓN 6: Mejorar restauración de sesión
function restoreSession() {
  try {
    const savedUser = localStorage.getItem('noshopia_current_user');
    const savedLoginStatus = localStorage.getItem('noshopia_logged_in');
    
    if (savedUser && savedLoginStatus === 'true') {
      const user = JSON.parse(savedUser);
      
      console.log('🔄 Restaurando sesión para:', user.name);
      
      // ASEGURAR QUE TENEMOS NOMBRE REAL
      if (!user.name || user.name === user.email) {
        user.name = user.displayName || extractNameFromEmail(user.email);
      }
      
      currentUser = user;
      isLoggedIn = true;
      
      updateAuthUI();
      
      console.log('✅ Sesión restaurada exitosamente para:', user.name);
      return true;
    }
    
    return false;
    
  } catch (e) {
    console.error('Error restaurando sesión:', e);
    // Limpiar datos corruptos
    localStorage.removeItem('noshopia_current_user');
    localStorage.removeItem('noshopia_logged_in');
    return false;
  }
}

// CORRECCIÓN 7: Exponer función para actualizar nombres desde otros archivos
window.updateUserNameInCloset = updateUserNameInCloset;
window.getCurrentUserName = () => currentUser?.name || currentUser?.displayName || 'Usuario';

console.log('✅ Correcciones de auth.js aplicadas - Login profesional y nombres reales habilitados');

console.log('✅ auth.js - Sistema de Autenticación Corregido cargado');
