// ui.js - Funciones UI Mínimas Esenciales

console.log('🎨 Cargando funciones UI mínimas...');

// =======================================================
// NAVEGACIÓN Y SCROLL
// =======================================================

// Scroll suave a sección
function scrollToSection(sectionId) {
  try {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      
      // Actualizar navegación activa
      document.querySelectorAll('.nav-pill').forEach(pill => {
        pill.classList.remove('active');
      });
      
      const activePill = document.querySelector(`[href="#${sectionId}"]`);
      if (activePill) {
        activePill.classList.add('active');
      }
      
      console.log(`📍 Navegando a: ${sectionId}`);
    }
  } catch (error) {
    console.error('Error en scroll:', error);
  }
}

// Toggle menú móvil
function toggleMobileMenu() {
  try {
    const mobileNav = document.getElementById('mobileNav');
    const toggle = document.querySelector('.mobile-menu-toggle i');
    
    if (mobileNav && toggle) {
      if (mobileNav.classList.contains('active')) {
        mobileNav.classList.remove('active');
        toggle.className = 'fas fa-bars';
      } else {
        mobileNav.classList.add('active');
        toggle.className = 'fas fa-times';
      }
    }
  } catch (error) {
    console.error('Error toggle menú:', error);
  }
}

// =======================================================
// SISTEMA DE NOTIFICACIONES
// =======================================================

// Mostrar notificación global
function showNotification(message, type = 'info') {
  console.log(`📢 ${type.toUpperCase()}: ${message}`);
  
  try {
    // Crear notificación
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.classList.add(type);
    notification.textContent = message;
    
    // Estilos
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 10000;
      background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
      color: white; padding: 1rem 2rem; border-radius: 10px;
      font-weight: 600; box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      transform: translateX(100%); opacity: 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      max-width: 350px; word-wrap: break-word;
    `;
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Mostrar con animación
    requestAnimationFrame(() => {
      notification.style.transform = 'translateX(0)';
      notification.style.opacity = '1';
    });
    
    // Auto-remove
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      notification.style.opacity = '0';
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 300);
    }, 4000);
    
  } catch (error) {
    console.error('Error mostrando notificación:', error);
    alert(message); // Fallback
  }
}

// =======================================================
// FUNCIONES DE LOGIN Y PLANES
// =======================================================

// Login principal desde hero
function handleMainLogin() {
  console.log('🔐 Iniciando login desde botón principal...');
  
  try {
    // Verificar si ya está logueado
    if (window.isLoggedIn && window.currentUser) {
      showNotification('Ya estás logueado', 'info');
      scrollToSection('upload');
      return;
    }
    
    // Verificar si existe función de Google Login
    if (typeof window.handleGoogleLogin === 'function') {
      window.handleGoogleLogin();
    } else if (typeof handleGoogleLogin === 'function') {
      handleGoogleLogin();
    } else {
      // Fallback - buscar botón de Google
      const googleBtn = document.querySelector('[data-login="google"]') || 
                       document.querySelector('.google-login-btn') ||
                       document.getElementById('googleLoginBtn');
      
      if (googleBtn) {
        googleBtn.click();
      } else {
        showNotification('Sistema de login no disponible. Recarga la página.', 'error');
        console.error('No se encontró método de login');
      }
    }
  } catch (error) {
    console.error('Error en login principal:', error);
    showNotification('Error iniciando sesión', 'error');
  }
}

// Iniciar plan gratuito
function startFreePlan() {
  console.log('🎁 Iniciando plan gratuito...');
  
  showNotification('¡Plan gratuito activado! Inicia sesión para comenzar.', 'success');
  
  setTimeout(() => {
    handleMainLogin();
  }, 1500);
}

// Upgrade a premium
function upgradeToPremium() {
  console.log('⭐ Solicitando upgrade a premium...');
  
  showNotification('Funcionalidad premium próximamente disponible', 'info');
  
  // Scroll a sección de contacto o información
  setTimeout(() => {
    scrollToSection('equipo');
  }, 1000);
}

// =======================================================
// EFECTOS VISUALES
// =======================================================

// Animación de barras de impacto
function animateImpactBars() {
  try {
    const impactFills = document.querySelectorAll('.impact-fill');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const fill = entry.target;
          const width = fill.dataset.width;
          if (width) {
            setTimeout(() => {
              fill.style.width = width + '%';
            }, 200);
          }
        }
      });
    });
    
    impactFills.forEach(fill => observer.observe(fill));
    
  } catch (error) {
    console.error('Error animando barras:', error);
  }
}

// =======================================================
// MANEJO DE OCASIONES
// =======================================================

// Seleccionar ocasión
function selectOccasion(occasion) {
  try {
    console.log('📅 Ocasión seleccionada:', occasion);
    
    // Actualizar variable global
    window.selectedOccasion = occasion;
    
    // Actualizar UI
    document.querySelectorAll('.occasion-btn').forEach(btn => {
      btn.classList.remove('selected');
    });
    
    const selectedBtn = document.querySelector(`[data-occasion="${occasion}"]`);
    if (selectedBtn) {
      selectedBtn.classList.add('selected');
    }
    
    // Actualizar botón de generar si existe
    if (typeof window.updateGenerateButton === 'function') {
      window.updateGenerateButton();
    }
    
    showNotification(`Ocasión seleccionada: ${occasion}`, 'success');
    
  } catch (error) {
    console.error('Error seleccionando ocasión:', error);
  }
}

// =======================================================
// INICIALIZACIÓN UI
// =======================================================

// Configurar event listeners básicos
function setupBasicEventListeners() {
  try {
    // Ocasiones
    document.querySelectorAll('.occasion-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const occasion = this.dataset.occasion;
        if (occasion) {
          selectOccasion(occasion);
        }
      });
    });
    
    // Cerrar menú móvil al hacer click en enlaces
    document.querySelectorAll('.mobile-nav-item').forEach(item => {
      item.addEventListener('click', function() {
        const mobileNav = document.getElementById('mobileNav');
        const toggle = document.querySelector('.mobile-menu-toggle i');
        
        if (mobileNav && mobileNav.classList.contains('active')) {
          mobileNav.classList.remove('active');
          if (toggle) toggle.className = 'fas fa-bars';
        }
      });
    });
    
    // Animar barras cuando sea visible
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', animateImpactBars);
    } else {
      animateImpactBars();
    }
    
    console.log('✅ Event listeners básicos configurados');
    
  } catch (error) {
    console.error('Error configurando listeners:', error);
  }
}

// =======================================================
// FUNCIONES GLOBALES
// =======================================================

// Exponer funciones globalmente
window.scrollToSection = scrollToSection;
window.toggleMobileMenu = toggleMobileMenu;
window.showNotification = showNotification;
window.handleMainLogin = handleMainLogin;
window.startFreePlan = startFreePlan;
window.upgradeToPremium = upgradeToPremium;
window.selectOccasion = selectOccasion;

// =======================================================
// AUTO-INICIALIZACIÓN
// =======================================================

// Configurar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupBasicEventListeners);
} else {
  setupBasicEventListeners();
}

console.log('✅ UI básica cargada correctamente');
