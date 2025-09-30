// app.js - NoShopiA v2.5 - Botón generar funcionando
console.log('🚀 NoShopiA v2.5 - Botón generar corregido');

// VARIABLES GLOBALES
let isLoggedIn = false;
let currentUser = null;
let selectedOccasion = null;
let uploadedFiles = { tops: [], bottoms: [], shoes: [] };
let uploadedImages = { tops: [], bottoms: [], shoes: [] };
let closetItems = { tops: [], bottoms: [], shoes: [] };
let userStats = { visits: 1, recommendations: 0, savedOutfits: 0 };
let closetMode = false;
let processingStartTime = null;
let currentResults = [];
let savedRecommendations = [];
let userProfile = { skin_color: null, age_range: null, gender: null };

// UTILIDADES
function showNotification(message, type = 'info') {
  console.log(`📢 ${type.toUpperCase()}: ${message}`);
  
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => notification.remove(), 4000);
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// DETECCIÓN IA
async function detectGarmentType(file) {
  try {
    showNotification('🔍 Detectando tipo de prenda con IA...', 'info');
    
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${CONFIG.API_BASE}/api/detect`, {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.detail || 'Error en detección');
    }
    
    return {
      success: result.success,
      item_detected: result.item_detected,
      category: result.category
    };
    
  } catch (error) {
    console.error('❌ Error detectando prenda:', error);
    showNotification(`Error detectando prenda: ${error.message}`, 'error');
    return {
      success: false,
      error: error.message,
      item_detected: 'unknown',
      category: 'unknown'
    };
  }
}

// BACKEND SYNC
async function syncWithBackend(email) {
  try {
    const profileResponse = await fetch(`${CONFIG.API_BASE}/api/profile/check/${encodeURIComponent(email)}`);
    
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      
      if (profileData.exists) {
        const analyticsResponse = await fetch(`${CONFIG.API_BASE}/api/user/history/${encodeURIComponent(email)}`);
        
        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json();
          
          return {
            exists: profileData.exists,
            has_profile: profileData.has_profile,
            profile: profileData.profile,
            userStats: analyticsData.user,
            statistics: analyticsData.statistics,
            recent_outfits: analyticsData.recent_outfits,
            recent_feedback: analyticsData.recent_feedback
          };
        }
      }
      
      return profileData;
    }
    
    return { exists: false, has_profile: false };
  } catch (error) {
    console.error('❌ Error verificando usuario:', error);
    return { exists: false, has_profile: false };
  }
}

async function createUserProfile(userData, profileData) {
  try {
    const formData = new URLSearchParams({
      email: userData.email,
      skin_color: profileData.skin_color,
      age_range: profileData.age_range,
      gender: profileData.gender
    });
    
    const response = await fetch(`${CONFIG.API_BASE}/api/profile/create`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Perfil creado en servidor:', result);
      return result;
    }
    
    throw new Error(`Error ${response.status}: ${await response.text()}`);
    
  } catch (error) {
    console.error('Error creando perfil:', error);
    throw error;
  }
}

// CLOSET INTELIGENTE - CORREGIDO: Valida contra límite total de 15
async function handleIntelligentUpload(files) {
  console.log('🚀 CLOSET INTELIGENTE: Upload automático');
  
  if (!files || files.length === 0) return;
  
  // MODO CLOSET: Verificar límite TOTAL de 15 prendas
  const currentTotal = getTotalClosetItems();
  const remaining = CONFIG.TOTAL_CLOSET_LIMIT - currentTotal;
  
  if (files.length > remaining) {
    showNotification(`⚠️ Solo puedes subir ${remaining} prendas más. Closet: ${currentTotal}/${CONFIG.TOTAL_CLOSET_LIMIT}`, 'error');
    return;
  }
  
  showNotification('🤖 IA analizando imágenes...', 'info');
  
  let successCount = 0;
  let lastCategory = null;
  
  for (const file of files) {
    try {
      const detection = await detectGarmentType(file);
      
      if (!detection.success || detection.category === 'unknown') {
        console.log(`❓ No categorizado: ${file.name}`);
        continue;
      }
      
      const imageUrl = await fileToDataUrl(file);
      categorizeIntelligentItem(detection, imageUrl, file);
      lastCategory = detection.category;
      successCount++;
      
    } catch (error) {
      console.error('❌ Error IA:', error);
    }
  }
  
  if (successCount > 0) {
    saveUserData();
    updateClosetUI();
    updateTabCounters();
    
    // Navegar a la pestaña correcta
    if (lastCategory) {
      const tabMap = { tops: 'superiores', bottoms: 'inferiores', shoes: 'calzado' };
      const tabId = tabMap[lastCategory];
      if (tabId) {
        showClosetTab(tabId);
        
        setTimeout(() => {
          const tabContent = document.getElementById(tabId);
          if (tabContent) {
            tabContent.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 300);
      }
    }
    
    const newTotal = getTotalClosetItems();
    const newRemaining = CONFIG.TOTAL_CLOSET_LIMIT - newTotal;
    
    showNotification(`✅ ${successCount} prenda(s) categorizadas. Closet: ${newTotal}/${CONFIG.TOTAL_CLOSET_LIMIT} (${newRemaining} restantes)`, 'success');
  }
}

function categorizeIntelligentItem(detection, imageUrl, file) {
  const { category, item_detected } = detection;
  
  const itemObject = {
    imageUrl: imageUrl,
    item_detected: item_detected,
    category: category,
    timestamp: Date.now(),
    file: file
  };
  
  uploadedFiles[category].push(file);
  uploadedImages[category].push(imageUrl);
  closetItems[category].push(itemObject);
}

// AUTENTICACIÓN
function handleGoogleCredentialResponse(response) {
  try {
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    const userData = { 
      name: payload.name, 
      email: payload.email, 
      picture: payload.picture,
      google: true,
      verified: payload.email_verified || false
    };
    
    processLogin(userData);
  } catch (error) {
    console.error('Error Google login:', error);
    showNotification('Error en login de Google', 'error');
  }
}

async function processLogin(userData) {
  console.log('🔄 PROCESANDO LOGIN:', userData.name);
  
  isLoggedIn = true;
  currentUser = userData;
  
  localStorage.setItem('noshopia_auth', JSON.stringify(userData));
  localStorage.setItem('noshopia_logged_in', 'true');
  
  updateUserUI();
  loadUserData();
  
  try {
    showNotification('Verificando perfil...', 'info');
    const backendData = await syncWithBackend(userData.email);
    
    if (backendData && backendData.has_profile) {
      console.log('✅ USUARIO CON PERFIL COMPLETO');
      
      if (backendData.statistics) {
        userStats = {
          visits: 1,
          recommendations: backendData.statistics.total_recommendations,
          savedOutfits: backendData.statistics.accepted_outfits,
          feedbackGiven: backendData.statistics.total_feedback
        };
      }
      
      userProfile = backendData.profile || { completed: true };
      
      setTimeout(() => {
        showClosetQuestion();
        scrollToSection('upload');
      }, 1000);
      
      showNotification(`Bienvenido ${userData.name}! Perfil cargado.`, 'success');
      return;
    }
  } catch (error) {
    console.error('Error verificando BD:', error);
  }
  
  console.log('📋 USUARIO SIN PERFIL');
  setTimeout(() => {
    showProfileForm();
  }, 1000);
  
  showNotification(`¡Bienvenido ${userData.name}! Completa tu perfil.`, 'success');
}

function updateUserUI() {
  const loginBtn = document.getElementById('headerLoginBtn');
  if (loginBtn) {
    loginBtn.style.display = 'none';
  }
  
  const userInfo = document.getElementById('userInfo');
  const userName = document.getElementById('userName');
  const userAvatar = document.getElementById('userAvatar');
  
  if (userInfo) userInfo.style.display = 'flex';
  if (userName) userName.textContent = currentUser.name;
  if (userAvatar) {
    userAvatar.src = currentUser.picture;
    userAvatar.alt = currentUser.name;
  }
  
  const welcomeSection = document.getElementById('welcomeSection');
  if (welcomeSection) {
    welcomeSection.style.display = 'block';
    
    const welcomeUserName = document.getElementById('welcomeUserName');
    if (welcomeUserName) {
      welcomeUserName.textContent = currentUser.name;
    }
  }
}

function logout() {
  console.log('👋 LOGOUT...');
  
  isLoggedIn = false;
  currentUser = null;
  selectedOccasion = null;
  uploadedFiles = { tops: [], bottoms: [], shoes: [] };
  uploadedImages = { tops: [], bottoms: [], shoes: [] };
  closetItems = { tops: [], bottoms: [], shoes: [] };
  closetMode = false;
  
  localStorage.removeItem('noshopia_auth');
  localStorage.removeItem('noshopia_logged_in');
  
  showNotification('Sesión cerrada', 'success');
  setTimeout(() => window.location.reload(), 1000);
}

// PERFIL
function showProfileForm() {
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.style.display = 'block';
    setTimeout(() => {
      profileForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 500);
  }
}

function handleProfileSelection(field, value) {
  userProfile[field] = value;
  
  const isComplete = userProfile.skin_color && userProfile.age_range && userProfile.gender;
  const createBtn = document.getElementById('createProfileBtn');
  
  if (createBtn) {
    if (isComplete) {
      createBtn.disabled = false;
      createBtn.innerHTML = '<i class="fas fa-user-plus"></i> Crear Mi Perfil';
      createBtn.style.opacity = '1';
      createBtn.onclick = submitUserProfile;
    } else {
      createBtn.disabled = true;
      createBtn.innerHTML = '<i class="fas fa-user-plus"></i> Selecciona todas las opciones';
      createBtn.style.opacity = '0.6';
    }
  }
}

async function submitUserProfile() {
  if (!userProfile.skin_color || !userProfile.age_range || !userProfile.gender) {
    showNotification('Completa todos los campos', 'error');
    return;
  }
  
  console.log('👤 ENVIANDO PERFIL...', userProfile);
  
  try {
    showNotification('Guardando en servidor...', 'info');
    await createUserProfile(currentUser, userProfile);
    console.log('✅ PERFIL CREADO BD');
    
    if (currentUser?.email) {
      localStorage.setItem(`noshopia_profile_${currentUser.email}`, JSON.stringify(userProfile));
    }
    
    showNotification('Perfil guardado', 'success');
    
  } catch (error) {
    console.error('Error BD:', error);
    
    if (currentUser?.email) {
      localStorage.setItem(`noshopia_profile_${currentUser.email}`, JSON.stringify(userProfile));
      showNotification('Guardado localmente', 'info');
    }
  }
  
  const profileForm = document.getElementById('profileForm');
  if (profileForm) profileForm.style.display = 'none';
  
  setTimeout(() => {
    showClosetQuestion();
    setTimeout(() => {
      const closetQuestion = document.getElementById('closetQuestion');
      if (closetQuestion) {
        closetQuestion.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 500);
  }, 1000);
  
  showNotification('¡Perfil completo!', 'success');
}

// MODALIDADES
function showClosetQuestion() {
  const closetQuestion = document.getElementById('closetQuestion');
  if (closetQuestion) {
    closetQuestion.style.display = 'block';
  }
}

function enableCloset() {
  console.log('✨ CLOSET INTELIGENTE ACTIVADO');
  
  if (!isLoggedIn) {
    showNotification('Debes iniciar sesión', 'error');
    return;
  }
  
  closetMode = true;
  
  const closetQuestion = document.getElementById('closetQuestion');
  if (closetQuestion) closetQuestion.style.display = 'none';
  
  const closetContainer = document.getElementById('closetContainer');
  const occasionSelector = document.getElementById('occasionSelector');
  
  // CORRECCIÓN 1: Ocultar sección de generar del modo directo
  const uploadArea = document.getElementById('uploadArea');
  if (uploadArea) uploadArea.style.display = 'none';
  
  if (closetContainer) {
    closetContainer.style.display = 'block';
  }
  
  if (occasionSelector) {
    occasionSelector.style.display = 'block';
  }
  
  setTimeout(() => {
    if (closetContainer) {
      closetContainer.scrollIntoView({ behavior: 'smooth' });
    }
    showClosetTab('superiores');
    updateClosetUI();
    updateTabCounters();
  }, 500);
  
  const userEmail = document.getElementById('userEmail');
  if (userEmail && currentUser) {
    userEmail.textContent = `Bienvenido ${currentUser.name}`;
    userEmail.style.fontSize = '1.9rem';
    userEmail.style.textAlign = 'left';
    userEmail.style.fontWeight = '600';
  }
  
  showNotification('Closet Inteligente activado', 'success');
}

function useDirectMode() {
  console.log('⚡ RECOMENDACIONES RÁPIDAS ACTIVADAS');
  
  closetMode = false;
  
  const closetQuestion = document.getElementById('closetQuestion');
  if (closetQuestion) closetQuestion.style.display = 'none';
  
  // Ocultar closet container
  const closetContainer = document.getElementById('closetContainer');
  if (closetContainer) closetContainer.style.display = 'none';
  
  const occasionSelector = document.getElementById('occasionSelector');
  const uploadArea = document.getElementById('uploadArea');
  
  if (occasionSelector) occasionSelector.style.display = 'block';
  if (uploadArea) uploadArea.style.display = 'block';
  
  showNotification('Recomendaciones Rápidas activadas', 'success');
}

// CLOSET UI
function showClosetTab(tabId) {
  document.querySelectorAll('.closet-tab-content').forEach(content => {
    content.style.display = 'none';
  });
  
  document.querySelectorAll('.closet-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  const selectedContent = document.getElementById(tabId);
  if (selectedContent) selectedContent.style.display = 'block';
  
  const selectedTab = document.querySelector(`[data-tab="${tabId}"]`);
  if (selectedTab) selectedTab.classList.add('active');
  
  const typeMap = { 'superiores': 'tops', 'inferiores': 'bottoms', 'calzado': 'shoes' };
  const type = typeMap[tabId];
  
  if (type && tabId !== 'recomendaciones') {
    renderClosetTab(tabId, type);
  }
}

function renderClosetTab(tabId, type) {
  const tabContent = document.getElementById(tabId);
  if (!tabContent) return;
  
  const items = closetItems[type] || [];
  
  if (items.length === 0) {
    const typeNames = { tops: 'superiores', bottoms: 'inferiores', shoes: 'calzado' };
    const icons = { tops: 'tshirt', bottoms: 'user-tie', shoes: 'shoe-prints' };
    
    tabContent.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: #666;">
        <i class="fas fa-${icons[type]}" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
        <p>No hay ${typeNames[type]} aún</p>
        <p style="font-size: 0.9rem; opacity: 0.7;">Sube fotos en "Sube cualquier prenda" y la IA las detectará</p>
      </div>
    `;
    return;
  }
  
  const subcategories = getSubcategoriesList(items);
  const subcategoriesText = subcategories.length > 0 ? ` (${subcategories.join(', ')})` : '';
  
  const typeNames = { tops: 'Superiores', bottoms: 'Inferiores', shoes: 'Calzado' };
  
  let html = `
    <div style="margin-bottom: 2rem;">
      <h3 style="margin: 0; color: #000000;">${items.length} ${typeNames[type]}${subcategoriesText}</h3>
      <p style="margin: 0.5rem 0 0 0; color: #666; font-size: 0.9rem;">Gestiona tus prendas subidas</p>
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
  `;
  
  items.forEach((itemObj, index) => {
    const imageUrl = itemObj.imageUrl || itemObj;
    const detectedItem = itemObj.item_detected || `${typeNames[type]} ${index + 1}`;
    
    html += `
      <div style="position: relative; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); transition: all 0.3s ease;">
        
        <img src="${imageUrl}" style="width: 100%; height: 200px; object-fit: cover;" alt="${detectedItem}">
        
        <div style="position: absolute; top: 10px; right: 10px; background: #ef4444; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; cursor: pointer;" onclick="removeClosetItem('${type}', ${index})">×</div>
        
        <div style="padding: 1rem;">
          <div style="font-weight: 600; color: #000; margin-bottom: 0.5rem;">${detectedItem}</div>
          <div style="font-size: 0.8rem; color: #666;">${itemObj.timestamp ? new Date(itemObj.timestamp).toLocaleDateString() : ''}</div>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  tabContent.innerHTML = html;
}

function getSubcategoriesList(items) {
  const subcategories = [...new Set(
    items
      .map(item => item.item_detected)
      .filter(item => item && item !== 'unknown' && item !== 'Unknown')
  )];
  return subcategories.slice(0, 3);
}

function removeClosetItem(type, index) {
  console.log(`🗑️ Eliminando ${type}[${index}]`);
  
  closetItems[type].splice(index, 1);
  uploadedFiles[type].splice(index, 1);
  uploadedImages[type].splice(index, 1);
  
  saveUserData();
  updateClosetUI();
  updateTabCounters();
  
  const activeTab = document.querySelector('.closet-tab.active');
  if (activeTab) {
    const tabId = activeTab.dataset.tab;
    const typeMap = { 'superiores': 'tops', 'inferiores': 'bottoms', 'calzado': 'shoes' };
    const currentType = typeMap[tabId];
    if (currentType) {
      renderClosetTab(tabId, currentType);
    }
  }
  
  showNotification('Prenda eliminada', 'success');
}

function updateClosetUI() {
  const total = getTotalClosetItems();
  const remaining = CONFIG.TOTAL_CLOSET_LIMIT - total;
  
  const closetHeader = document.querySelector('.closet-header h2');
  if (closetHeader) {
    closetHeader.innerHTML = `Mi Closet Inteligente <span style="font-size: 0.8rem; opacity: 0.8;">(${total}/${CONFIG.TOTAL_CLOSET_LIMIT} prendas, ${remaining} restantes)</span>`;
  }
  
  const stats = ['closetVisits', 'closetRecommendations', 'closetOutfits'];
  const values = [userStats.visits, userStats.recommendations, userStats.savedOutfits];
  
  stats.forEach((id, index) => {
    const el = document.getElementById(id);
    if (el) el.textContent = values[index];
  });
}

function updateTabCounters() {
  const tabMap = {
    'superiores': 'tops',
    'inferiores': 'bottoms',
    'calzado': 'shoes'
  };
  
  Object.entries(tabMap).forEach(([tabId, type]) => {
    const tab = document.querySelector(`[data-tab="${tabId}"]`);
    if (!tab) return;
    
    const count = closetItems[type]?.length || 0;
    const badge = tab.querySelector('.tab-subcategory-count');
    
    if (badge) {
      if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'block';
      } else {
        badge.style.display = 'none';
      }
    }
  });
}

function getTotalClosetItems() {
  return Object.values(closetItems).reduce((sum, items) => sum + items.length, 0);
}

// OCASIONES - CORREGIDO: llama a updateGenerateButton
function selectOccasion(occasion) {
  console.log('📅 Ocasión seleccionada:', occasion);
  selectedOccasion = occasion;
  
  const occasionNames = {
    'oficina': 'Oficina/Trabajo', 'deportivo': 'Deportes/Gym',
    'casual': 'Casual', 'formal': 'Formal', 'matrimonio': 'Matrimonio'
  };
  
  showNotification(`Ocasión: ${occasionNames[occasion] || occasion}`, 'success');
  
  // CORRECCIÓN 3: Actualizar botón después de seleccionar ocasión
  updateGenerateButton();
}

// UPLOAD DIRECTO - CORREGIDO: llama a updateGenerateButton
function handleFileUpload(type, files) {
  console.log(`📤 Upload directo: ${files.length} → ${type}`);
  
  const maxFiles = CONFIG.DIRECT_UPLOAD_LIMITS[type] || 3;
  const currentFiles = uploadedFiles[type].length;
  
  if (currentFiles + files.length > maxFiles) {
    showNotification(`Máximo ${maxFiles} archivos para ${type}`, 'error');
    return;
  }
  
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const invalidFiles = files.filter(file => !validTypes.includes(file.type));
  
  if (invalidFiles.length > 0) {
    showNotification('Solo JPG, PNG o WebP', 'error');
    return;
  }
  
  showNotification(`Procesando ${files.length} imagen(es)...`, 'info');
  
  files.forEach(async (file) => {
    try {
      const imageUrl = await fileToDataUrl(file);
      
      uploadedFiles[type].push(file);
      uploadedImages[type].push(imageUrl);
      closetItems[type].push({
        imageUrl: imageUrl,
        item_detected: `${type} item`,
        category: type,
        timestamp: Date.now()
      });
      
    } catch (error) {
      console.error('Error:', error);
      showNotification(`Error procesando ${file.name}`, 'error');
    }
  });
  
  updateUploadUI(type);
  saveUserData();
  
  showNotification(`${files.length} imagen(es) procesadas`, 'success');
  
  // CORRECCIÓN 3: Actualizar botón después de subir archivos
  updateGenerateButton();
}

function updateUploadUI(type) {
  const label = document.querySelector(`label[for="${type}-upload"]`);
  const preview = document.getElementById(`${type}-preview`);
  
  if (label) {
    const typeNames = { tops: 'Superiores', bottoms: 'Inferiores', shoes: 'Calzado' };
    const maxFiles = CONFIG.DIRECT_UPLOAD_LIMITS[type] || 3;
    const files = uploadedFiles[type];
    
    if (files.length === 0) {
      label.textContent = `📤 Subir ${typeNames[type]} (máx ${maxFiles})`;
    } else {
      label.textContent = `📤 ${typeNames[type]}: ${files.length}/${maxFiles} subidos`;
    }
  }
  
  if (preview) {
    preview.innerHTML = '';
    uploadedImages[type].forEach((imageUrl, index) => {
      const div = document.createElement('div');
      div.style.position = 'relative';
      div.style.display = 'inline-block';
      div.innerHTML = `
        <img src="${imageUrl}" class="preview-image">
        <button onclick="removeImage('${type}', ${index})" class="remove-image" style="position: absolute; top: -8px; right: -8px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center;">×</button>
      `;
      preview.appendChild(div);
    });
  }
}

// CORRECCIÓN 3: Nueva función para actualizar botón generar
function updateGenerateButton() {
  const generateBtn = document.getElementById('generateBtn');
  if (!generateBtn) return;
  
  const hasOccasion = selectedOccasion !== null;
  const hasFiles = uploadedFiles.tops.length > 0 && 
                   uploadedFiles.bottoms.length > 0 && 
                   uploadedFiles.shoes.length > 0;
  
  if (hasOccasion && hasFiles) {
    generateBtn.disabled = false;
    generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generar Recomendaciones';
    generateBtn.style.opacity = '1';
    generateBtn.style.cursor = 'pointer';
  } else if (!hasOccasion) {
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fas fa-calendar"></i> Selecciona ocasión primero';
    generateBtn.style.opacity = '0.6';
    generateBtn.style.cursor = 'not-allowed';
  } else {
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fas fa-upload"></i> Completa todos los campos';
    generateBtn.style.opacity = '0.6';
    generateBtn.style.cursor = 'not-allowed';
  }
}

function removeImage(type, index) {
  uploadedFiles[type].splice(index, 1);
  uploadedImages[type].splice(index, 1);
  closetItems[type].splice(index, 1);
  
  updateUploadUI(type);
  saveUserData();
  
  showNotification('Imagen eliminada', 'success');
  
  // CORRECCIÓN 3: Actualizar botón después de eliminar
  updateGenerateButton();
}

// RECOMENDACIONES
async function getRecommendation() {
  if (!selectedOccasion) {
    showNotification('Selecciona una ocasión primero', 'error');
    return;
  }
  
  if (!isLoggedIn) {
    showNotification('Debes estar logueado', 'error');
    return;
  }
  
  const hasFiles = uploadedFiles.tops.length > 0 && 
                   uploadedFiles.bottoms.length > 0 && 
                   uploadedFiles.shoes.length > 0;
                   
  if (!hasFiles) {
    showNotification('Sube al menos 1 imagen de cada categoría', 'error');
    return;
  }
  
  showNotification('Generando recomendaciones...', 'info');
  console.log('🎯 Generando recomendaciones directas');
  
  // TODO: Llamar al API aquí
}

function generateFromCloset() {
  if (!selectedOccasion) {
    showNotification('Selecciona una ocasión primero', 'error');
    return;
  }
  
  if (!isLoggedIn) {
    showNotification('Debes estar logueado', 'error');
    return;
  }
  
  const hasMinimum = 
    closetItems.tops.length >= CONFIG.MINIMUM_IN_CLOSET.tops && 
    closetItems.bottoms.length >= CONFIG.MINIMUM_IN_CLOSET.bottoms && 
    closetItems.shoes.length >= CONFIG.MINIMUM_IN_CLOSET.shoes;
                   
  if (!hasMinimum) {
    showNotification('Sube al menos 1 prenda de cada categoría al closet', 'error');
    return;
  }
  
  showNotification('Generando desde closet...', 'info');
  console.log('🧠 Generando recomendaciones desde closet inteligente');
  
  // TODO: Llamar al API aquí
}

// PLANES
function startFreePlan() {
  console.log('🎁 Plan gratuito activado');
  showNotification('Plan gratuito activado', 'success');
  
  setTimeout(() => {
    scrollToSection('upload');
  }, 1000);
}

function upgradeToPremium() {
  console.log('⭐ Upgrade premium');
  showNotification('Funcionalidad premium próximamente', 'info');
}

// NAVEGACIÓN
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
}

// PERSISTENCIA
function saveUserData() {
  if (!currentUser?.email) return;
  
  const userData = {
    email: currentUser.email, name: currentUser.name,
    uploadedFiles, uploadedImages, closetItems,
    userStats, savedRecommendations, lastUpdated: new Date().toISOString()
  };
  
  localStorage.setItem(`noshopia_user_data_${currentUser.email}`, JSON.stringify(userData));
}

function loadUserData() {
  if (!currentUser?.email) return;
  
  try {
    const userData = localStorage.getItem(`noshopia_user_data_${currentUser.email}`);
    
    if (userData) {
      const data = JSON.parse(userData);
      uploadedFiles = data.uploadedFiles || { tops: [], bottoms: [], shoes: [] };
      uploadedImages = data.uploadedImages || { tops: [], bottoms: [], shoes: [] };
      closetItems = data.closetItems || { tops: [], bottoms: [], shoes: [] };
      userStats = data.userStats || { visits: 1, recommendations: 0, savedOutfits: 0 };
      savedRecommendations = data.savedRecommendations || [];
      
      updateTabCounters();
    }
  } catch (error) {
    console.error('Error cargando datos:', error);
  }
}

// INICIALIZACIÓN GOOGLE
function initializeGoogleLogin() {
  if (typeof google === 'undefined') {
    setTimeout(initializeGoogleLogin, 1000);
    return;
  }
  
  google.accounts.id.initialize({
    client_id: CONFIG.GOOGLE_CLIENT_ID,
    callback: handleGoogleCredentialResponse,
    auto_select: false,
    cancel_on_tap_outside: true
  });
  
  const mainBtn = document.getElementById('headerLoginBtn');
  if (mainBtn) {
    mainBtn.disabled = false;
    mainBtn.style.opacity = '1';
    mainBtn.innerHTML = '<i class="fab fa-google"></i> Conectar con Google';
    mainBtn.onclick = () => {
      google.accounts.id.prompt();
    };
  }
}

function initializeApp() {
  console.log('🔧 INICIALIZANDO NoShopiA v2.5');
  
  setTimeout(initializeGoogleLogin, 2000);
  
  console.log('✅ NoShopiA v2.5 inicializada');
}

// EXPOSICIÓN GLOBAL
window.handleIntelligentUpload = handleIntelligentUpload;
window.handleGoogleCredentialResponse = handleGoogleCredentialResponse;
window.logout = logout;
window.enableCloset = enableCloset;
window.useDirectMode = useDirectMode;
window.showClosetTab = showClosetTab;
window.removeClosetItem = removeClosetItem;
window.scrollToSection = scrollToSection;
window.handleProfileSelection = handleProfileSelection;
window.submitUserProfile = submitUserProfile;
window.selectOccasion = selectOccasion;
window.getRecommendation = getRecommendation;
window.startFreePlan = startFreePlan;
window.upgradeToPremium = upgradeToPremium;
window.handleFileUpload = handleFileUpload;
window.updateUploadUI = updateUploadUI;
window.removeImage = removeImage;
window.generateFromCloset = generateFromCloset;
window.updateTabCounters = updateTabCounters;
window.updateGenerateButton = updateGenerateButton;

// VARIABLES GLOBALES EXPUESTAS
window.selectedOccasion = selectedOccasion;
window.userProfile = userProfile;
window.isLoggedIn = isLoggedIn;
window.currentUser = currentUser;

// AUTO-INICIALIZACIÓN
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  setTimeout(initializeApp, 100);
}

console.log('✅ app.js v2.5 - COMPLETO con botón generar funcionando');
