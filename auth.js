// auth.js - VERSIÓN SIMPLIFICADA - Solo lo esencial
console.log('🔧 Auth simplificado inicializando...');

(function() {
  'use strict';
  
  let googleInitialized = false;
  
  // INICIALIZACIÓN GOOGLE
  function initializeGoogleAuth() {
    if (typeof google === 'undefined' || !google.accounts || !CONFIG?.GOOGLE_CLIENT_ID) {
      console.warn('⚠️ Google API o CONFIG no disponible');
      return;
    }
    
    try {
      google.accounts.id.initialize({
        client_id: CONFIG.GOOGLE_CLIENT_ID,
        callback: window.handleGoogleCredentialResponse || handleGoogleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true
      });
      
      googleInitialized = true;
      setupLoginButton();
      console.log('✅ Google Auth inicializado');
      
    } catch (error) {
      console.error('❌ Error Google Auth:', error);
    }
  }
  
  // CONFIGURAR BOTÓN
  function setupLoginButton() {
    const btn = document.getElementById('headerLoginBtn');
    if (!btn) return;
    
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.innerHTML = '<i class="fab fa-google"></i> Conectar con Google';
    
    // Limpiar listeners anteriores
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.addEventListener('click', () => {
      if (googleInitialized && google.accounts) {
        google.accounts.id.prompt();
      }
    });
  }
  
  // MANEJO RESPUESTA GOOGLE (fallback si app.js no tiene)
  function handleGoogleCredentialResponse(response) {
    try {
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      const user = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        google: true,
        verified: payload.email_verified || false
      };
      
      // Llamar función de app.js si existe
      if (window.processLogin) {
        window.processLogin(user);
      } else {
        console.log('✅ Usuario autenticado:', user.name);
      }
      
    } catch (error) {
      console.error('❌ Error procesando Google:', error);
    }
  }
  
  // VERIFICAR SESIÓN EXISTENTE
  function checkExistingSession() {
    try {
      const savedAuth = localStorage.getItem('noshopia_auth');
      const loggedIn = localStorage.getItem('noshopia_logged_in') === 'true';
      
      if (savedAuth && loggedIn) {
        const userData = JSON.parse(savedAuth);
        if (userData.google && userData.email && userData.name) {
          console.log('🔄 Restaurando sesión:', userData.name);
          
          // Activar en app.js si existe
          if (window.processLogin) {
            window.processLogin(userData);
          }
          return true;
        }
      }
    } catch (error) {
      console.error('Error verificando sesión:', error);
      localStorage.removeItem('noshopia_auth');
      localStorage.removeItem('noshopia_logged_in');
    }
    return false;
  }
  
  // INICIALIZACIÓN AUTOMÁTICA
  function initialize() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initialize);
      return;
    }
    
    // Verificar sesión primero
    if (checkExistingSession()) return;
    
    // Esperar Google API
    let attempts = 0;
    const check = () => {
      if (typeof google !== 'undefined' && google.accounts && CONFIG) {
        initializeGoogleAuth();
      } else if (attempts++ < 10) {
        setTimeout(check, 500);
      }
    };
    setTimeout(check, 1000);
  }
  
  // EXPOSICIÓN GLOBAL (solo si app.js no las tiene)
  if (!window.handleGoogleCredentialResponse) {
    window.handleGoogleCredentialResponse = handleGoogleCredentialResponse;
  }
  
  // Auto-inicializar
  initialize();
  
})();

console.log('✅ Auth simplificado listo');
