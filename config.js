// config.js - Configuración Global de NoShopiA

const CONFIG = {
  GOOGLE_CLIENT_ID: '326940877598-ko13n1qcqkkugkoo6gu2n1avs46al09p.apps.googleusercontent.com',
  API_BASE: "https://noshopia-production.up.railway.app",
  FILE_LIMITS: { 
    tops: 3, 
    bottoms: 3, 
    shoes: 5 
  },
  TOTAL_CLOSET_LIMIT: 15,  // Límite total de prendas en el armario

  // EMAILS PROFESIONALES NOSHOPIA (Cloudflare Email Routing)
  EMAILS: {
    // Emails profesionales - Lo que ven los usuarios
    PROFESSIONAL: {
      SUPPORT: 'soporte@noshopia.com',
      INFO: 'info@noshopia.com',
      PAYMENTS: 'pagos@noshopia.com',
      CEO: 'jcorti@noshopia.com',
      CREATIVE: 'paola@noshopia.com'
    },
    
    // Emails Gmail que recibirán los mensajes (configurados en Cloudflare)
    BACKEND_GMAIL: {
      SUPPORT: 'soportenoshopia@gmail.com',
      INFO: 'infonoshopia@gmail.com',
      PAYMENTS: 'pagosrecibidosnoshopia@gmail.com',
      CEO: 'jcorti75@gmail.com',
      CREATIVE: 'paola.curti@gmail.com'
    },
    
    // Enlaces mailto para botones en tu app
    CONTACT_LINKS: {
      SUPPORT: 'mailto:soporte@noshopia.com?subject=Soporte%20NoshopiA&body=Hola%20equipo%20NoshopiA,%0A%0ADescribe%20tu%20problema:%0A%0A',
      PREMIUM_HELP: 'mailto:soporte@noshopia.com?subject=Ayuda%20Plan%20Premium&body=Hola,%0A%0ATengo%20una%20consulta%20sobre%20mi%20plan%20premium:%0A%0A',
      BUG_REPORT: 'mailto:soporte@noshopia.com?subject=Reporte%20de%20Bug&body=Hola,%0A%0AEncontré%20un%20problema:%0A%0APasos%20para%20reproducir:%0A1.%20%0A2.%20%0A3.%20%0A%0ANavegador:%20%0ADispositivo:%20%0A',
      GENERAL_INFO: 'mailto:info@noshopia.com?subject=Consulta%20NoshopiA&body=Hola,%0A%0AMe%20gustaría%20saber%20más%20sobre:%0A%0A',
      PARTNERSHIP: 'mailto:info@noshopia.com?subject=Propuesta%20de%20Partnership&body=Hola,%0A%0AMe%20gustaría%20proponer%20una%20colaboración:%0A%0A',
      PAYMENT_ISSUE: 'mailto:pagos@noshopia.com?subject=Problema%20con%20Pago&body=Hola,%0A%0ATengo%20un%20problema%20con%20mi%20pago:%0A%0AID%20de%20transacción:%20%0AProblema:%20%0A',
      CEO_CONTACT: 'mailto:jcorti@noshopia.com?subject=Contacto%20Directo&body=Hola%20José,%0A%0A',
      CREATIVE_FEEDBACK: 'mailto:paola@noshopia.com?subject=Feedback%20de%20Diseño&body=Hola%20Paola,%0A%0ATengo%20feedback%20sobre%20el%20diseño:%0A%0A'
    },
    
    // Templates de respuestas rápidas
    QUICK_RESPONSES: {
      WELCOME: '¡Bienvenido a NoshopiA! 🌱 Estamos aquí para ayudarte a maximizar tu ropa y minimizar tu impacto ambiental.',
      PREMIUM_THANKS: '¡Gracias por actualizar a Premium! 🚀 Ya tienes acceso completo a todas las funcionalidades.',
      SUPPORT_ACK: 'Hemos recibido tu consulta y te responderemos en las próximas 2-4 horas. 🛠️',
      PARTNERSHIP_THANKS: 'Gracias por tu interés en colaborar con NoshopiA. Revisaremos tu propuesta. 🤝'
    },

    // Templates de emails automáticos
    TEMPLATES: {
      WELCOME: {
        subject: '🎉 ¡Bienvenido a NoshopiA!',
        from: 'soporte@noshopia.com',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 2rem; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 1.8rem;">
                <span style="color: #ef4444;">No</span><span>shop</span><span style="color: #22c55e;">i</span><span style="color: #22c55e;">A</span>
              </h1>
              <p style="margin: 0.5rem 0;">¡Bienvenido a NoshopiA!</p>
              <p style="font-size: 0.9rem; opacity: 0.9;">Maximiza tu ropa, minimiza tu impacto ambiental</p>
            </div>
            
            <div style="padding: 2rem; background: white;">
              <h2 style="color: #1f2937;">¡Hola {userName}! 👋</h2>
              <p>Gracias por unirte a la revolución de la moda sostenible. Tu cuenta está lista para usar.</p>
              
              <div style="background: rgba(59, 130, 246, 0.1); border-radius: 10px; padding: 1.5rem; margin: 2rem 0;">
                <h3 style="color: #3b82f6; margin-top: 0;">🎁 Tu Plan Gratis incluye:</h3>
                <ul style="margin: 1rem 0; padding-left: 1.5rem;">
                  <li>✅ 30 combinaciones mensuales</li>
                  <li>✅ IA básica de recomendaciones</li>
                  <li>✅ Mi Closet Favorito (15 prendas)</li>
                  <li>✅ Análisis de compatibilidad instantáneo</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 2rem 0;">
                <a href="https://noshopia.com" style="background: #3b82f6; color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 25px; font-weight: 600;">
                  🚀 Comenzar a crear outfits
                </a>
              </div>
              
              <p style="color: #666;">Si tienes dudas, responde este email o escríbenos a soporte@noshopia.com</p>
            </div>
            
            <div style="text-align: center; padding: 1rem; color: #999; font-size: 0.8rem;">
              NoshopiA - Moda Sostenible con IA | https://noshopia.com
            </div>
          </div>
        `
      },

      PREMIUM_ACTIVATED: {
        subject: '⭐ ¡Tu Plan Premium está activo!',
        from: 'pagos@noshopia.com',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #fbbf24, #f59e0b); padding: 2rem; text-align: center; color: black;">
              <h1 style="margin: 0; font-size: 1.8rem;">⭐ ¡Premium Activado!</h1>
              <p style="margin: 0.5rem 0;">Tu cuenta ha sido actualizada</p>
            </div>
            
            <div style="padding: 2rem; background: white;">
              <h2 style="color: #1f2937;">¡Gracias {userName}! 🎉</h2>
              <p>Tu pago ha sido confirmado y tu Plan Premium está activo.</p>
              
              <div style="background: rgba(251, 191, 36, 0.1); border-radius: 10px; padding: 1.5rem; margin: 2rem 0;">
                <h3 style="color: #f59e0b; margin-top: 0;">🚀 Ahora tienes acceso a:</h3>
                <ul style="margin: 1rem 0; padding-left: 1.5rem;">
                  <li>✅ Recomendaciones ILIMITADAS</li>
                  <li>✅ IA avanzada personalizada</li>
                  <li>✅ Prendas y zapatos ILIMITADOS</li>
                  <li>✅ Soporte prioritario</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 2rem 0;">
                <a href="https://noshopia.com" style="background: #f59e0b; color: black; padding: 1rem 2rem; text-decoration: none; border-radius: 25px; font-weight: 600;">
                  🎨 Crear outfits premium
                </a>
              </div>
              
              <p style="color: #666;">Para consultas: pagos@noshopia.com</p>
            </div>
          </div>
        `
      },

      SUPPORT_TICKET: {
        subject: '🛠️ Ticket #{ticketId} - {issueType}',
        from: 'soporte@noshopia.com',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 2rem; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 1.8rem;">🛠️ Ticket de Soporte</h1>
              <p style="margin: 0.5rem 0;">Hemos recibido tu consulta</p>
            </div>
            
            <div style="padding: 2rem; background: white;">
              <h2 style="color: #1f2937;">Hola {userName} 👋</h2>
              <p>Gracias por contactarnos. Hemos recibido tu consulta y la estamos revisando.</p>
              
              <div style="background: rgba(16, 185, 129, 0.1); border-radius: 10px; padding: 1.5rem; margin: 2rem 0;">
                <h3 style="color: #10b981; margin-top: 0;">📋 Detalles del ticket:</h3>
                <p style="margin: 0.5rem 0; color: #374151;">
                  <strong>ID:</strong> #{ticketId}<br>
                  <strong>Tipo:</strong> {issueType}<br>
                  <strong>Fecha:</strong> {currentDate}
                </p>
                <div style="background: white; padding: 1rem; border-radius: 5px; margin-top: 1rem;">
                  <strong>Tu consulta:</strong><br>
                  <em style="color: #666;">"{issueDescription}"</em>
                </div>
              </div>
              
              <p><strong>🕐 Tiempo de respuesta estimado:</strong> 2-4 horas en días hábiles</p>
              
              <p style="color: #666; margin-top: 2rem;">
                Te responderemos pronto a este mismo email. Si tienes más información que agregar, 
                responde citando el número de ticket <strong>#{ticketId}</strong>
              </p>
            </div>
          </div>
        `
      }
    }
  }
};

// Variables globales de estado
let isLoggedIn = false;
let currentUser = null;
let uploadedFiles = { tops: [], bottoms: [], shoes: [] };
let uploadedImages = { tops: [], bottoms: [], shoes: [] };
let selectedOccasion = null;
let closetMode = false;
let savedRecommendations = [];
let userStats = { visits: 1, recommendations: 0, savedOutfits: 0 };
let processingStartTime = 0;
let userProfile = { skin_color: null, age_range: null, gender: null };
let profileCompleted = false; // Para evitar repetir perfilamiento

// Variables para closet selection
let closetSelectedItems = { tops: [], bottoms: [], shoes: [] };
let closetItems = { tops: [], bottoms: [], shoes: [] };
let closetSelectionMode = false;

// Función para obtener total de prendas en closet
function getTotalClosetItems() {
  return closetItems.tops.length + closetItems.bottoms.length + closetItems.shoes.length;
}

// Función para obtener prendas restantes
function getRemainingClosetSlots() {
  const total = getTotalClosetItems();
  return CONFIG.TOTAL_CLOSET_LIMIT - total;
}

// Funciones de persistencia
function saveUserClosetData() {
  if (!currentUser?.email) return;
  
  const userData = {
    email: currentUser.email,
    closetItems: closetItems,
    uploadedFiles: uploadedFiles,
    uploadedImages: uploadedImages,
    userStats: userStats,
    profileCompleted: profileCompleted,
    userProfile: userProfile,
    lastSaved: Date.now()
  };
  
  localStorage.setItem(`noshopia_user_${currentUser.email}`, JSON.stringify(userData));
  console.log('✅ Datos del usuario guardados localmente');
}

// Cargar datos del usuario
function loadUserClosetData() {
  if (!currentUser?.email) return false;
  
  try {
    const savedData = localStorage.getItem(`noshopia_user_${currentUser.email}`);
    if (!savedData) return false;
    
    const userData = JSON.parse(savedData);
    
    // Restaurar datos
    closetItems = userData.closetItems || { tops: [], bottoms: [], shoes: [] };
    uploadedFiles = userData.uploadedFiles || { tops: [], bottoms: [], shoes: [] };
    uploadedImages = userData.uploadedImages || { tops: [], bottoms: [], shoes: [] };
    userStats = userData.userStats || { visits: 1, recommendations: 0, savedOutfits: 0 };
    profileCompleted = userData.profileCompleted || false;
    userProfile = userData.userProfile || { skin_color: null, age_range: null, gender: null };
    
    console.log('✅ Datos del usuario cargados:', {
      totalItems: getTotalClosetItems(),
      profileCompleted: profileCompleted
    });
    
    return true;
  } catch (e) {
    console.error('Error cargando datos del usuario:', e);
    return false;
  }
}

// Función para cargar script de Google
function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    // Verificar si ya está cargado
    if (typeof google !== 'undefined' && google.accounts?.id) {
      resolve();
      return;
    }
    
    console.log('🔥 Cargando script de Google...');
    console.log('🔍 URL del script:', 'https://accounts.google.com/gsi/client');
    console.log('🔍 User Agent:', navigator.userAgent);
    console.log('🔍 Protocolo:', window.location.protocol);
    
    // Verificar conectividad básica
    fetch('https://www.google.com', { mode: 'no-cors' })
      .then(() => console.log('✅ Google.com accesible'))
      .catch(() => console.log('❌ Google.com no accesible'));
    
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    let timeoutId = setTimeout(() => {
      console.log('⏰ Timeout: Script tardó más de 10 segundos');
      script.remove();
      reject('Timeout cargando script');
    }, 10000);
    
    script.onload = () => {
      clearTimeout(timeoutId);
      console.log('✅ Script de Google cargado');
      
      // Esperar inicialización
      setTimeout(() => {
        if (typeof google !== 'undefined' && google.accounts?.id) {
          console.log('✅ Google Auth disponible');
          resolve();
        } else {
          console.log('❌ Google Auth no disponible después de cargar');
          reject('Google Auth no inicializado');
        }
      }, 1000);
    };
    
    script.onerror = (error) => {
      clearTimeout(timeoutId);
      console.log('❌ Error cargando script de Google');
      console.log('❌ Error details:', error);
      console.log('❌ Script src:', script.src);
      script.remove();
      reject('Error cargando script');
    };
    
    document.head.appendChild(script);
    console.log('📤 Script agregado al DOM');
  });
}
