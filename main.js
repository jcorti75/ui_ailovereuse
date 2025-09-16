// main.js - Inicialización y Coordinación

// Inicialización principal de la aplicación
document.addEventListener('DOMContentLoaded', () => {
  console.log('Inicializando aplicación NoShopiA...');
  
  // Limpieza inicial de estado al cargar la página
  console.log('Limpiando estado inicial...');
  clearAllUserState();
  
  updateAuthUI();
  checkGoogleAuth();
  
  // Configurar event listeners con delay
  setTimeout(() => {
    setupEventListeners();
    setupProfileListeners();
    setupClosetFeatures();
  }, 1000);
  
  // Animar barras de impacto cuando se ven
  setupImpactAnimation();
  
  console.log('Aplicación inicializada con estado limpio');
});

// Configurar funcionalidades del closet
function setupClosetFeatures() {
  console.log('🏗️ Configurando funcionalidades del closet...');
  
  // Verificar si las fotos ya están subidas para activar modo selección
  if (uploadedImages.tops.length > 0 || uploadedImages.bottoms.length > 0 || uploadedImages.shoes.length > 0) {
    loadClosetItems();
  }
  
  // Event listeners para pestañas del closet
  document.querySelectorAll('.closet-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      const tabId = this.dataset.tab;
      showClosetTab(tabId);
      
      // Si es una pestaña de prendas y hay items, mostrar opción de selección
      if ((tabId === 'superiores' || tabId === 'inferiores' || tabId === 'calzado')) {
        // Configurar subida desde carpetas después de cambiar pestaña
        setTimeout(() => {
          setupClosetFolderUploads();
          
          // Mostrar opción de selección si hay items
          const typeMap = {
            'superiores': 'tops',
            'inferiores': 'bottoms',
            'calzado': 'shoes'
          };
          const type = typeMap[tabId];
          if (type && closetItems[type] && closetItems[type].length > 0) {
            showClosetSelectionOption(tabId);
          }
        }, 200);
      }
    });
  });
  
  // Configurar subida inicial desde carpetas
  setTimeout(() => {
    setupClosetFolderUploads();
  }, 500);
  
  console.log('✅ Funcionalidades del closet configuradas');
}

// Mostrar opción de selección en closet
function showClosetSelectionOption(tabId) {
  const tabContent = document.getElementById(tabId);
  if (!tabContent || closetSelectionMode) return;
  
  const typeMap = {
    'superiores': 'tops',
    'inferiores': 'bottoms', 
    'calzado': 'shoes'
  };
  
  const type = typeMap[tabId];
  const itemCount = closetItems[type]?.length || 0;
  
  if (itemCount === 0) return;
  
  // Verificar si ya existe el botón
  const existingButton = tabContent.querySelector('.selection-mode-btn');
  if (existingButton) return;
  
  // Crear botón de modo selección
  const selectionButton = document.createElement('div');
  selectionButton.className = 'selection-mode-btn';
  selectionButton.style.cssText = `
    background: var(--primary);
    color: white;
    padding: 1rem 2rem;
    border-radius: 15px;
    text-align: center;
    margin: 1rem 0;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
  `;
  
  selectionButton.innerHTML = `
    <i class="fas fa-hand-pointer"></i>
    Seleccionar ${type === 'tops' ? 'Superiores' : type === 'bottoms' ? 'Inferiores' : 'Calzado'} para Generar (${itemCount} disponibles)
  `;
  
  selectionButton.addEventListener('click', () => {
    activateClosetSelectionMode();
    selectionButton.remove();
  });
  
  selectionButton.addEventListener('mouseenter', () => {
    selectionButton.style.transform = 'translateY(-2px)';
    selectionButton.style.boxShadow = '0 5px 15px rgba(59, 130, 246, 0.3)';
  });
  
  selectionButton.addEventListener('mouseleave', () => {
    selectionButton.style.transform = 'translateY(0)';
    selectionButton.style.boxShadow = 'none';
  });
  
  // Insertar después del título o al principio si no hay título
  const title = tabContent.querySelector('h3');
  if (title) {
    title.parentNode.insertBefore(selectionButton, title.nextSibling);
  } else {
    tabContent.insertBefore(selectionButton, tabContent.firstChild);
  }
}

// Configurar animación de barras de impacto
function setupImpactAnimation() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fills = entry.target.querySelectorAll('.impact-fill');
        fills.forEach(fill => {
          const width = fill.getAttribute('data-width');
          fill.style.width = width + '%';
        });
      }
    });
  });
  
  const impactSection = document.querySelector('.impact-bars');
  if (impactSection) {
    observer.observe(impactSection);
  }
}

// Funciones globales necesarias para el HTML
window.scrollToSection = scrollToSection;
window.toggleMobileMenu = toggleMobileMenu;
window.handleMainLogin = handleMainLogin;
window.logout = logout;
window.submitUserProfile = submitUserProfile;
window.enableCloset = enableCloset;
window.useDirectMode = useDirectMode;
window.showClosetTab = showClosetTab;
window.handleFileUpload = handleFileUpload;
window.getRecommendation = getRecommendation;
window.generateFromCloset = generateFromCloset;
window.saveRecommendationToCloset = saveRecommendationToCloset;
window.startFreePlan = startFreePlan;
window.upgradeToPremium = upgradeToPremium;
window.handleClosetPhotoClick = handleClosetPhotoClick;
window.activateClosetSelectionMode = activateClosetSelectionMode;

// Variables globales necesarias para compatibilidad
window.CONFIG = CONFIG;
window.isLoggedIn = () => isLoggedIn;
window.currentUser = () => currentUser;
window.selectedOccasion = () => selectedOccasion;
window.closetMode = () => closetMode;

console.log('🚀 NoShopiA modularizado cargado correctamente');
