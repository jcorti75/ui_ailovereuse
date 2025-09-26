
// ===================================================================
// SISTEMA DE AUTENTICACIÓN PROFESIONAL - SOLO GOOGLE REAL
// NoShopiA - Producción con CONFIG real
// ===================================================================

(function() {
  'use strict';
  
  console.log('🔧 INICIALIZANDO AUTENTICACIÓN PROFESIONAL NoShopiA...');
  
  // VARIABLES GLOBALES DE ESTADO
  let googleInitialized = false;
  let authSystemReady = false;
  
  // ===================================================================
  // 1. INICIALIZACIÓN GOOGLE SIGN-IN CON CONFIG REAL
  // ===================================================================
  function initializeGoogleAuth() {
    console.log('📡 Inicializando Google Sign-In con CLIENT_ID real...');
    
    // Verificar que Google API esté disponible
    if (typeof google === 'undefined' || !google.accounts) {
      console.warn('⚠️ Google API no disponible');
      showGoogleUnavailableError();
      return;
    }
    
    // Verificar que CONFIG esté disponible
    if (typeof CONFIG === 'undefined' || !CONFIG.GOOGLE_CLIENT_ID) {
      console.error('❌ CONFIG no disponible');
      showConfigError();
      return;
    }
    
    try {
      // Inicializar con el Client ID REAL de producción
      google.accounts.id.initialize({
        client_id: CONFIG.GOOGLE_CLIENT_ID,
        callback: handleGoogleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true
      });
      
      googleInitialized = true;
      console.log('✅ Google Sign-In inicializado con CLIENT_ID:', CONFIG.GOOGLE_CLIENT_ID.substring(0, 10) + '...');
      setupGoogleLoginButton();
      
    } catch (error) {
      console.error('❌ Error inicializando Google Sign-In:', error);
      showGoogleInitError();
    }
  }
  
  // ===================================================================
  // 2. CONFIGURACIÓN BOTÓN LOGIN - SOLO GOOGLE
  // ===================================================================
  function setupGoogleLoginButton() {
    const loginBtn = document.getElementById('headerLoginBtn');
    if (!loginBtn) {
      console.error('❌ Botón headerLoginBtn no encontrado');
      return;
    }
    
    // Habilitar botón con estado listo
    loginBtn.disabled = false;
    loginBtn.style.opacity = '1';
    loginBtn.innerHTML = '<i class="fab fa-google"></i> Conectar con Google';
    
    // Limpiar listeners anteriores
    const newBtn = loginBtn.cloneNode(true);
    loginBtn.parentNode.replaceChild(newBtn, loginBtn);
    
    // Solo evento Google Sign-In
    newBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('🔐 Iniciando Google Sign-In...');
      
      if (googleInitialized && google.accounts) {
        try {
          google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              console.log('📱 Prompt no mostrado');
              showGooglePromptHelper();
            }
          });
        } catch (error) {
          console.error('❌ Error con Google prompt:', error);
          showGooglePromptHelper();
        }
      } else {
        console.warn('⚠️ Google no inicializado');
        showGoogleInitError();
      }
    });
    
    console.log('✅ Botón Google configurado');
  }
  
  // ===================================================================
  // 3. HELPER GOOGLE SIGN-IN (SIN OPCIONES ALTERNAS)
  // ===================================================================
  function showGooglePromptHelper() {
    console.log('📱 Mostrando helper Google Sign-In...');
    
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10001;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      border-radius: 20px;
      padding: 3rem 2rem;
      max-width: 450px;
      width: 90%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    `;
    
    modal.innerHTML = `
      <div style="font-size: 3rem; margin-bottom: 1rem;">🔐</div>
      <h3 style="color: #000; margin-bottom: 1rem;">Acceso con Google</h3>
      <p style="color: #666; margin-bottom: 2rem;">
        NoShopiA requiere una cuenta de Google válida para funcionar.
      </p>
      
      <div style="background: rgba(59, 130, 246, 0.1); padding: 1rem; border-radius: 10px; margin-bottom: 2rem;">
        <p style="color: #3b82f6; font-size: 0.9rem; margin: 0;">
          💡 Si no aparece el popup, verifica que no esté bloqueado por tu navegador
        </p>
      </div>
      
      <button id="retryGoogleSignIn" style="
        width: 100%;
        padding: 1rem;
        background: #4285f4;
        color: white;
        border: none;
        border-radius: 10px;
        font-weight: 600;
        margin-bottom: 1rem;
        cursor: pointer;
        font-size: 1rem;
      ">
        <i class="fab fa-google"></i> Reintentar Google Sign-In
      </button>
      
      <div style="margin: 1rem 0; font-size: 0.9rem; color: #666;">
        <p>¿Problemas? <a href="mailto:info@noshopia.com" style="color: #3b82f6;">Contacta soporte</a></p>
      </div>
      
      <button id="closeHelperModal" style="
        width: 100%;
        padding: 0.8rem;
        background: transparent;
        color: #666;
        border: 1px solid #ddd;
        border-radius: 10px;
        cursor: pointer;
      ">
        Cerrar
      </button>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Event listeners
    document.getElementById('retryGoogleSignIn').onclick = () => {
      document.body.removeChild(overlay);
      retryGoogleSignIn();
    };
    
    document.getElementById('closeHelperModal').onclick = () => {
      document.body.removeChild(overlay);
    };
    
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
      }
    };
  }
  
  // ===================================================================
  // 4. MENSAJES DE ERROR PROFESIONALES
  // ===================================================================
  function showGoogleUnavailableError() {
    console.log('❌ Google API no disponible');
    
    showNotification('Google Sign-In no disponible. Recarga la página.', 'error');
    
    // Deshabilitar botón
    const loginBtn = document.getElementById('headerLoginBtn');
    if (loginBtn) {
      loginBtn.disabled = true;
      loginBtn.style.opacity = '0.6';
      loginBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Servicio no disponible';
    }
  }
  
  function showConfigError() {
    console.error('❌ Error de configuración');
    showNotification('Error de configuración. Contacta soporte.', 'error');
  }
  
  function showGoogleInitError() {
    console.log('❌ Error inicialización Google');
    showNotification('Error de autenticación. Recarga la página.', 'error');
  }
  
  // ===================================================================
  // 5. REINTENTO GOOGLE
  // ===================================================================
  function retryGoogleSignIn() {
    console.log('🔄 Reintentando Google Sign-In...');
    
    if (googleInitialized && google.accounts) {
      try {
        google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            showNotification('Google Sign-In no disponible. Verifica tu navegador.', 'error');
          }
        });
      } catch (error) {
        console.error('❌ Error en reintento:', error);
        showNotification('Error de autenticación. Recarga la página.', 'error');
      }
    } else {
      console.log('🔄 Reinicializando Google Auth...');
      initializeGoogleAuth();
    }
  }
  
  // ===================================================================
  // 6. ACTIVACIÓN USUARIO GOOGLE REAL
  // ===================================================================
  function activateUserSession(user) {
    console.log('✅ Activando sesión Google:', user.name);
    
    // Verificar que sea usuario Google válido
    if (!user.google || !user.email || !user.name) {
      console.error('❌ Usuario Google inválido');
      showNotification('Error en datos de usuario de Google', 'error');
      return;
    }
    
    // Actualizar variables globales
    window.isLoggedIn = true;
    window.currentUser = user;
    
    // Guardar en localStorage
    localStorage.setItem('noshopia_auth', JSON.stringify(user));
    localStorage.setItem('noshopia_logged_in', 'true');
    
    // Actualizar UI
    updateAuthUI(user);
    
    // Mostrar secciones de usuario
    showUserSections();
    
    // Cargar datos del usuario
    if (typeof window.loadUserData === 'function') {
      window.loadUserData();
    }
    
    // Verificar perfil
    setTimeout(() => {
      if (typeof window.checkProfileAndRedirect === 'function') {
        window.checkProfileAndRedirect();
      }
    }, 1000);
    
    showNotification(`Bienvenido ${user.name}!`, 'success');
    console.log('🎉 Usuario Google activado correctamente');
  }
  
  // ===================================================================
  // 7. ACTUALIZACIÓN UI
  // ===================================================================
  function updateAuthUI(user) {
    // Ocultar botón login
    const loginBtn = document.getElementById('headerLoginBtn');
    if (loginBtn) {
      loginBtn.style.display = 'none';
    }
    
    // Mostrar info usuario
    const userInfo = document.getElementById('userInfo');
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    
    if (userInfo) userInfo.style.display = 'flex';
    if (userAvatar) {
      userAvatar.src = user.picture;
      userAvatar.alt = user.name;
    }
    if (userName) userName.textContent = user.name;
    
    // Configurar logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.onclick = logout;
    }
    
    console.log('✅ UI actualizada para:', user.name);
  }
  
  function showUserSections() {
    // Mostrar sección welcome
    const welcomeSection = document.getElementById('welcomeSection');
    if (welcomeSection) {
      welcomeSection.style.display = 'block';
      
      // Actualizar nombre en welcome
      const welcomeUserName = document.getElementById('welcomeUserName');
      if (welcomeUserName && window.currentUser) {
        welcomeUserName.textContent = window.currentUser.name;
      }
    }
    
    console.log('✅ Secciones de usuario mostradas');
  }
  
  // ===================================================================
  // 8. LOGOUT LIMPIO
  // ===================================================================
  function logout() {
    console.log('🚪 Cerrando sesión...');
    
    // Limpiar variables globales
    window.isLoggedIn = false;
    window.currentUser = null;
    
    // Limpiar localStorage
    localStorage.removeItem('noshopia_auth');
    localStorage.removeItem('noshopia_logged_in');
    
    // Limpiar Google Sign-In
    if (googleInitialized && google.accounts) {
      try {
        google.accounts.id.disableAutoSelect();
      } catch (error) {
        console.log('⚠️ Error limpiando Google Sign-In:', error);
      }
    }
    
    showNotification('Sesión cerrada', 'success');
    
    // Recargar página para resetear estado
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
  
  // ===================================================================
  // 9. MANEJO RESPUESTA GOOGLE
  // ===================================================================
  function handleGoogleCredentialResponse(response) {
    console.log('📨 Respuesta Google recibida');
    
    try {
      // Decodificar token JWT
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      
      // Validar datos requeridos
      if (!payload.email || !payload.name) {
        throw new Error('Datos de Google incompletos');
      }
      
      const user = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(payload.name)}&background=3b82f6&color=fff`,
        google: true,
        verified: payload.email_verified || false,
        loginTime: new Date().toISOString()
      };
      
      console.log('✅ Usuario Google autenticado:', user.name, user.email);
      activateUserSession(user);
      
    } catch (error) {
      console.error('❌ Error procesando respuesta Google:', error);
      showNotification('Error en autenticación de Google', 'error');
    }
  }
  
  // ===================================================================
  // 10. VERIFICACIÓN SESIÓN EXISTENTE
  // ===================================================================
  function checkExistingSession() {
    try {
      const savedAuth = localStorage.getItem('noshopia_auth');
      const loggedIn = localStorage.getItem('noshopia_logged_in') === 'true';
      
      if (savedAuth && loggedIn) {
        const userData = JSON.parse(savedAuth);
        
        // SOLO restaurar si es usuario Google válido
        if (userData.google && userData.email && userData.name) {
          console.log('🔄 Restaurando sesión Google:', userData.name);
          
          window.isLoggedIn = true;
          window.currentUser = userData;
          
          updateAuthUI(userData);
          showUserSections();
          
          if (typeof window.loadUserData === 'function') {
            window.loadUserData();
          }
          
          setTimeout(() => {
            if (typeof window.checkProfileAndRedirect === 'function') {
              window.checkProfileAndRedirect();
            }
          }, 1500);
          
          showNotification(`Sesión restaurada: ${userData.name}`, 'success');
          return true;
        } else {
          // Limpiar sesión inválida
          localStorage.removeItem('noshopia_auth');
          localStorage.removeItem('noshopia_logged_in');
          console.log('🧹 Sesión inválida limpiada');
        }
      }
    } catch (error) {
      console.error('Error verificando sesión:', error);
      // Limpiar datos corruptos
      localStorage.removeItem('noshopia_auth');
      localStorage.removeItem('noshopia_logged_in');
    }
    
    return false;
  }
  
  // ===================================================================
  // 11. UTILIDADES
  // ===================================================================
  function showNotification(message, type = 'info') {
    console.log(`📢 ${type.toUpperCase()}: ${message}`);
    
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 2rem;
      border-radius: 15px;
      color: white;
      font-weight: 600;
      z-index: 10000;
      max-width: 350px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      animation: slideInRight 0.3s ease;
    `;
    
    if (type === 'success') {
      notification.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    } else if (type === 'error') {
      notification.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
    } else {
      notification.style.background = 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 4000);
  }
  
  // ===================================================================
  // 12. INICIALIZACIÓN AUTOMÁTICA
  // ===================================================================
  function initialize() {
    console.log('🚀 Inicializando autenticación profesional NoShopiA...');
    
    // Esperar DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initialize);
      return;
    }
    
    // Verificar sesión existente primero
    if (checkExistingSession()) {
      console.log('✅ Sesión existente restaurada');
      return;
    }
    
    // Esperar Google API con timeout
    let attempts = 0;
    const maxAttempts = 10; // 5 segundos
    
    const checkGoogleAPI = () => {
      attempts++;
      
      if (typeof google !== 'undefined' && google.accounts && typeof CONFIG !== 'undefined') {
        console.log('✅ Google API y CONFIG listos');
        initializeGoogleAuth();
      } else if (attempts >= maxAttempts) {
        console.warn('⚠️ Timeout: Google API no disponible');
        showGoogleUnavailableError();
      } else {
        setTimeout(checkGoogleAPI, 500);
      }
    };
    
    // Empezar verificación después de delay
    setTimeout(checkGoogleAPI, 1000);
  }
  
  // ===================================================================
  // 13. EXPOSICIÓN GLOBAL
  // ===================================================================
  window.handleGoogleCredentialResponse = handleGoogleCredentialResponse;
  window.logout = logout;
  
  // Auto-inicializar
  initialize();
  
  console.log('✅ Sistema autenticación profesional configurado - SOLO GOOGLE');
  
})();
