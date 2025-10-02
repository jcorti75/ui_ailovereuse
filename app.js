// app.js - NoShopiA v3.3 DEFINITIVO - ERROR CORREGIDO
console.log('🚀 NoShopiA v3.3 - Sistema Completo');

// ========================================
// NOTA: CONFIG se carga desde config.js externo
// ========================================

// ========================================
// VARIABLES GLOBALES
// ========================================
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

const OCCASION_NAMES = {
  'oficina': 'Oficina/Trabajo',
  'deportivo': 'Deportes/Gym',
  'casual': 'Casual',
  'formal': 'Formal',
  'matrimonio': 'Matrimonio'
};

// ========================================
// UTILIDADES
// ========================================
function showNotification(message, type = 'info') {
  console.log(`${type.toUpperCase()}: ${message}`);
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

function getTotalClosetItems() {
  return Object.values(closetItems).reduce((sum, items) => sum + items.length, 0);
}

function getRemainingClosetSlots() {
  return CONFIG.TOTAL_CLOSET_LIMIT - getTotalClosetItems();
}

// ========================================
// DETECCIÓN IA
// ========================================
async function detectGarmentType(file) {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${CONFIG.API_BASE}/api/detect`, {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    if (!response.ok) throw new Error(result.detail || 'Error en detección');
    
    return {
      success: result.success,
      item_detected: result.item_detected,
      category: result.category
    };
  } catch (error) {
    console.error('❌ Error detectando prenda:', error);
    return { success: false, error: error.message, item_detected: 'unknown', category: 'unknown' };
  }
}

// ========================================
// UPLOAD - FUNCIÓN UNIFICADA CORREGIDA
// ========================================
async function handleFileUpload(type, inputOrFileList) {
  console.log('📤 handleFileUpload llamado:', type);
  
  // Detectar si es FileList o Input Element
  let files = [];
  
  if (inputOrFileList instanceof FileList) {
    files = Array.from(inputOrFileList);
  } else if (inputOrFileList?.files) {
    files = Array.from(inputOrFileList.files);
  } else {
    showNotification('Error: parámetro inválido', 'error');
    return;
  }
  
  if (files.length === 0) {
    showNotification('No se seleccionaron archivos', 'error');
    return;
  }
  
  console.log(`📷 ${files.length} archivo(s) para ${type}`);
  
  // Validar límites según modo
  let maxFiles;
  if (closetMode) {
    const remaining = getRemainingClosetSlots();
    if (remaining <= 0) {
      const total = getTotalClosetItems();
      showNotification(`⚠️ Armario lleno (${total}/${CONFIG.TOTAL_CLOSET_LIMIT})`, 'error');
      return;
    }
    maxFiles = remaining;
  } else {
    maxFiles = CONFIG.DIRECT_UPLOAD_LIMITS[type] || 3;
    const currentCount = uploadedFiles[type].length;
    if (currentCount + files.length > maxFiles) {
      showNotification(`Máximo ${maxFiles} prendas de ${type}`, 'error');
      return;
    }
  }
  
  showNotification(`🔄 Procesando ${files.length} imagen(es)...`, 'info');
  
  let successCount = 0;
  let errorMessages = [];
  
  for (const file of files) {
    try {
      console.log(`📸 Detectando: ${file.name}`);
      
      const detection = await detectGarmentType(file);
      
      if (!detection.success || detection.category === 'unknown') {
        errorMessages.push(`${file.name}: no es prenda válida`);
        continue;
      }
      
      if (detection.category !== type) {
        errorMessages.push(`${file.name}: es ${detection.category}, no ${type}`);
        continue;
      }
      
      const imageUrl = await fileToDataUrl(file);
      
      uploadedFiles[type].push(file);
      uploadedImages[type].push(imageUrl);
      closetItems[type].push({
        imageUrl: imageUrl,
        item_detected: detection.item_detected,
        category: type,
        timestamp: Date.now(),
        file: file
      });
      
      successCount++;
      console.log(`✅ ${file.name} → ${detection.item_detected}`);
      
    } catch (error) {
      console.error(`❌ Error: ${file.name}`, error);
      errorMessages.push(`${file.name}: error al procesar`);
    }
  }
  
  // Mostrar errores si los hay (pero solo si no hubo éxitos)
  if (errorMessages.length > 0 && successCount === 0) {
    showNotification(`❌ ${errorMessages[0]}`, 'error');
  }
  
  if (successCount > 0) {
    // Guardar datos
    saveUserData();
    
    // Actualizar UI según modo
    if (closetMode) {
      updateClosetUI();
      updateTabCounters();
      
      // Re-renderizar pestaña actual
      const tabMap = { 'tops': 'superiores', 'bottoms': 'inferiores', 'shoes': 'calzado' };
      const tabId = tabMap[type];
      if (tabId) renderClosetTab(tabId, type);
      
      const total = getTotalClosetItems();
      const remaining = getRemainingClosetSlots();
      showNotification(`✅ ${successCount} prenda(s) agregada(s)! Armario: ${total}/${CONFIG.TOTAL_CLOSET_LIMIT} (${remaining} restantes)`, 'success');
    } else {
      updateUploadUI(type);
      showNotification(`✅ ${successCount} prenda${successCount > 1 ? 's' : ''} subida${successCount > 1 ? 's' : ''}`, 'success');
    }
    
    updateGenerateButton();
  } else {
    showNotification('❌ No se agregó ninguna prenda', 'error');
  }
  
  // Limpiar input si es elemento
  if (inputOrFileList?.value !== undefined) {
    inputOrFileList.value = '';
  }
}

// ========================================
// CLOSET - CARPETAS
// ========================================
function setupClosetFolderUploads() {
  console.log('📂 Configurando carpetas...');
  
  const folders = document.querySelectorAll('.folder-item');
  console.log(`✅ ${folders.length} carpetas encontradas`);
  
  folders.forEach((folder) => {
    // Clonar para limpiar listeners
    const newFolder = folder.cloneNode(true);
    folder.parentNode.replaceChild(newFolder, folder);
    
    newFolder.style.cursor = 'pointer';
    
    newFolder.addEventListener('click', async function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('🖱️ Click en carpeta');
      
      if (!isLoggedIn) {
        showNotification('Debes iniciar sesión', 'error');
        return;
      }
      
      const remaining = getRemainingClosetSlots();
      if (remaining <= 0) {
        const total = getTotalClosetItems();
        showNotification(`⚠️ Armario lleno (${total}/${CONFIG.TOTAL_CLOSET_LIMIT})`, 'error');
        return;
      }
      
      // Determinar tipo
      const activeTab = document.querySelector('.closet-tab.active');
      if (!activeTab) {
        showNotification('Error: No hay pestaña activa', 'error');
        return;
      }
      
      const tabId = activeTab.dataset.tab;
      const typeMap = {
        'superiores': 'tops',
        'inferiores': 'bottoms',
        'calzado': 'shoes'
      };
      
      const type = typeMap[tabId];
      if (!type) {
        showNotification('Error: Tipo no reconocido', 'error');
        return;
      }
      
      console.log(`🎯 Tipo: ${type}`);
      
      // Crear input
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.multiple = true;
      fileInput.style.display = 'none';
      
      fileInput.onchange = async function(e) {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        console.log(`📷 ${files.length} archivo(s)`);
        
        const currentRemaining = getRemainingClosetSlots();
        if (files.length > currentRemaining) {
          const currentTotal = getTotalClosetItems();
          showNotification(`Solo ${currentRemaining} más. Armario: ${currentTotal}/${CONFIG.TOTAL_CLOSET_LIMIT}`, 'error');
          return;
        }
        
        showNotification(`🔄 Procesando...`, 'info');
        
        let successCount = 0;
        
        for (const file of files) {
          try {
            const detection = await detectGarmentType(file);
            
            if (!detection.success) {
              console.warn(`⚠️ No detectado: ${file.name}`);
              continue;
            }
            
            if (detection.category !== type) {
              showNotification(`❌ ${file.name} es ${detection.category}, no ${type}`, 'error');
              continue;
            }
            
            const imageUrl = await fileToDataUrl(file);
            
            uploadedFiles[type].push(file);
            uploadedImages[type].push(imageUrl);
            closetItems[type].push({
              imageUrl: imageUrl,
              item_detected: detection.item_detected,
              category: type,
              timestamp: Date.now(),
              file: file
            });
            
            successCount++;
            console.log(`✅ ${file.name} → ${detection.item_detected}`);
            
          } catch (error) {
            console.error(`❌ Error: ${file.name}`, error);
          }
        }
        
        if (successCount > 0) {
          saveUserData();
          updateClosetUI();
          updateTabCounters();
          renderClosetTab(tabId, type);
          
          const newTotal = getTotalClosetItems();
          const newRemaining = getRemainingClosetSlots();
          
          showNotification(`✅ ${successCount} prenda(s) agregada(s)! Armario: ${newTotal}/${CONFIG.TOTAL_CLOSET_LIMIT} (${newRemaining} restantes)`, 'success');
        } else {
          showNotification('❌ No se agregó ninguna prenda', 'error');
        }
        
        if (document.body.contains(fileInput)) {
          document.body.removeChild(fileInput);
        }
      };
      
      document.body.appendChild(fileInput);
      fileInput.click();
    });
    
    // Hover effects
    newFolder.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px)';
      this.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
      this.style.borderColor = 'var(--primary)';
    });
    
    newFolder.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
      this.style.borderColor = 'var(--border)';
    });
  });
  
  console.log('✅ Carpetas configuradas');
}

// ========================================
// CLOSET - RENDER
// ========================================
function showClosetTab(tabId) {
  console.log(`📑 Mostrando: ${tabId}`);
  
  document.querySelectorAll('.closet-tab-content').forEach(c => c.style.display = 'none');
  document.querySelectorAll('.closet-tab').forEach(t => t.classList.remove('active'));
  
  const content = document.getElementById(tabId);
  if (content) content.style.display = 'block';
  
  const tab = document.querySelector(`[data-tab="${tabId}"]`);
  if (tab) tab.classList.add('active');
  
  setTimeout(() => {
    setupClosetFolderUploads();
    updateClosetUI();
  }, 200);
  
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
  const typeNames = { tops: 'Superiores', bottoms: 'Inferiores', shoes: 'Calzado' };
  const icons = { tops: 'tshirt', bottoms: 'user-tie', shoes: 'shoe-prints' };
  
  const total = getTotalClosetItems();
  const remaining = getRemainingClosetSlots();
  
  if (items.length === 0) {
    tabContent.innerHTML = `
      <div style="background: rgba(59, 130, 246, 0.1); border-radius: 10px; padding: 1rem; margin-bottom: 1rem; text-align: center; border: 2px solid rgba(59, 130, 246, 0.2);">
        <div style="font-weight: 600; color: var(--primary); margin-bottom: 0.5rem;">
          ${typeNames[type]}: 0 prendas
        </div>
        <div style="font-size: 0.9rem; color: #666;">
          ${remaining} espacios restantes (${total}/${CONFIG.TOTAL_CLOSET_LIMIT})
        </div>
      </div>
      <div style="text-align: center; padding: 3rem; color: #666;">
        <i class="fas fa-${icons[type]}" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
        <p>No hay ${typeNames[type].toLowerCase()} aún</p>
        <p style="font-size: 0.9rem; opacity: 0.7;">👇 Haz click en las carpetas para subir</p>
        <p style="font-size: 0.9rem; color: var(--primary); font-weight: 600; margin-top: 1rem;">
          🤖 La IA detectará automáticamente
        </p>
      </div>
    `;
    setTimeout(() => setupClosetFolderUploads(), 300);
    return;
  }
  
  const subcategories = getSubcategoriesList(items);
  const subcatText = subcategories.length > 0 ? ` (${subcategories.join(', ')})` : '';
  
  let html = `
    <div style="background: rgba(59, 130, 246, 0.1); border-radius: 10px; padding: 1rem; margin-bottom: 1rem; text-align: center; border: 2px solid rgba(59, 130, 246, 0.2);">
      <div style="font-weight: 600; color: var(--primary); margin-bottom: 0.5rem;">
        ${typeNames[type]}: ${items.length} prendas${subcatText}
      </div>
      <div style="font-size: 0.9rem; color: #666;">
        ${remaining} espacios restantes (${total}/${CONFIG.TOTAL_CLOSET_LIMIT})
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1rem">
  `;
  
  items.forEach((item, idx) => {
    const img = item.imageUrl || item;
    const name = item.item_detected || `${typeNames[type]} ${idx + 1}`;
    const date = item.timestamp ? new Date(item.timestamp).toLocaleDateString() : '';
    
    html += `
      <div style="position:relative;background:white;border-radius:15px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,.1);transition:all .3s">
        <img src="${img}" style="width:100%;height:200px;object-fit:cover" alt="${name}">
        <div style="position:absolute;top:10px;right:10px;background:#ef4444;color:white;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-size:.8rem;cursor:pointer" onclick="removeClosetItem('${type}',${idx})">×</div>
        <div style="padding:1rem">
          <div style="font-weight:600;color:#000;margin-bottom:.5rem">${name}</div>
          <div style="font-size:.8rem;color:#666">${date}</div>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  tabContent.innerHTML = html;
}

function getSubcategoriesList(items) {
  const subs = [...new Set(items.map(i => i.item_detected).filter(i => i && i !== 'unknown'))];
  return subs.slice(0, 3);
}

function removeClosetItem(type, index) {
  if (!confirm('¿Eliminar esta prenda?')) return;
  
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
    if (currentType) renderClosetTab(tabId, currentType);
  }
  
  showNotification('Prenda eliminada', 'success');
}

function updateClosetUI() {
  const total = getTotalClosetItems();
  const remaining = getRemainingClosetSlots();
  
  const header = document.querySelector('.closet-header h2');
  if (header) {
    header.innerHTML = `Mi Closet Inteligente <span style="font-size:.8rem;opacity:.8">(${total}/${CONFIG.TOTAL_CLOSET_LIMIT} prendas, ${remaining} restantes)</span>`;
  }
  
  const stats = ['closetVisits', 'closetRecommendations', 'closetOutfits'];
  const values = [userStats.visits, userStats.recommendations, userStats.savedOutfits];
  
  stats.forEach((id, i) => {
    const el = document.getElementById(id);
    if (el) el.textContent = values[i];
  });
}

function updateTabCounters() {
  // Puedes agregar badges en las pestañas si quieres
  console.log('📊 Contadores actualizados');
}

// ========================================
// UPLOAD UI (MODO DIRECTO)
// ========================================
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
      label.textContent = `${typeNames[type]}: ${files.length}/${maxFiles}`;
    }
  }
  
  if (preview) {
    preview.innerHTML = '';
    uploadedImages[type].forEach((img, idx) => {
      const div = document.createElement('div');
      div.style.position = 'relative';
      div.style.display = 'inline-block';
      div.innerHTML = `
        <img src="${img}" class="preview-image">
        <button onclick="removeImage('${type}',${idx})" style="position:absolute;top:-8px;right:-8px;background:#ef4444;color:white;border:none;border-radius:50%;width:24px;height:24px;cursor:pointer;font-size:14px">×</button>
      `;
      preview.appendChild(div);
    });
  }
}

function removeImage(type, index) {
  uploadedFiles[type].splice(index, 1);
  uploadedImages[type].splice(index, 1);
  closetItems[type].splice(index, 1);
  
  updateUploadUI(type);
  saveUserData();
  updateGenerateButton();
  showNotification('Imagen eliminada', 'success');
}

// ========================================
// AUTENTICACIÓN
// ========================================
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
    showNotification('Error en login', 'error');
  }
}

async function processLogin(userData) {
  console.log('🔐 Login:', userData.name);
  isLoggedIn = true;
  currentUser = userData;
  
  localStorage.setItem('noshopia_auth', JSON.stringify(userData));
  localStorage.setItem('noshopia_logged_in', 'true');
  
  updateUserUI();
  loadUserData();
  
  showNotification(`Bienvenido ${userData.name}!`, 'success');
  setTimeout(() => showProfileForm(), 1000);
}

function updateUserUI() {
  const userInfo = document.getElementById('userInfo');
  const userName = document.getElementById('userName');
  const userAvatar = document.getElementById('userAvatar');
  
  if (userInfo) userInfo.style.display = 'flex';
  if (userName) userName.textContent = currentUser.name;
  if (userAvatar) {
    userAvatar.src = currentUser.picture;
    userAvatar.alt = currentUser.name;
  }
}

function logout() {
  console.log('👋 Logout');
  isLoggedIn = false;
  currentUser = null;
  
  localStorage.clear();
  showNotification('Sesión cerrada', 'success');
  setTimeout(() => window.location.reload(), 1000);
}

// ========================================
// PERFIL
// ========================================
function showProfileForm() {
  const form = document.getElementById('profileForm');
  if (form) {
    form.style.display = 'block';
    setTimeout(() => form.scrollIntoView({ behavior: 'smooth' }), 500);
  }
}

function handleProfileSelection(field, value) {
  userProfile[field] = value;
  
  // Remover selected de todos
  document.querySelectorAll(`.profile-option[data-field="${field}"]`).forEach(opt => {
    opt.classList.remove('selected');
  });
  
  // Agregar selected al clickeado
  const clicked = document.querySelector(`.profile-option[data-field="${field}"][data-value="${value}"]`);
  if (clicked) clicked.classList.add('selected');
  
  const isComplete = userProfile.skin_color && userProfile.age_range && userProfile.gender;
  const btn = document.getElementById('createProfileBtn');
  
  if (btn) {
    if (isComplete) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-user-plus"></i> Crear Mi Perfil';
      btn.style.opacity = '1';
    } else {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-user-plus"></i> Selecciona todas las opciones';
      btn.style.opacity = '0.6';
    }
  }
}

async function submitUserProfile() {
  if (!userProfile.skin_color || !userProfile.age_range || !userProfile.gender) {
    showNotification('Completa todos los campos', 'error');
    return;
  }
  
  localStorage.setItem(`noshopia_profile_${currentUser.email}`, JSON.stringify(userProfile));
  
  const form = document.getElementById('profileForm');
  if (form) form.style.display = 'none';
  
  setTimeout(() => {
    showClosetQuestion();
    setTimeout(() => {
      document.getElementById('closetQuestion')?.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  }, 1000);
  
  showNotification('Perfil completo!', 'success');
}

// ========================================
// MODOS
// ========================================
function showClosetQuestion() {
  const q = document.getElementById('closetQuestion');
  if (q) q.style.display = 'block';
}

function enableCloset() {
  console.log('✨ CLOSET INTELIGENTE');
  
  if (!isLoggedIn) {
    showNotification('Inicia sesión primero', 'error');
    return;
  }
  
  closetMode = true;
  uploadedFiles = { tops: [], bottoms: [], shoes: [] };
  uploadedImages = { tops: [], bottoms: [], shoes: [] };
  selectedOccasion = null;
  
  const q = document.getElementById('closetQuestion');
  if (q) q.style.display = 'none';
  
  const container = document.getElementById('closetContainer');
  const occasions = document.getElementById('occasionSelector');
  const upload = document.getElementById('uploadArea');
  
  if (upload) upload.style.display = 'none';
  if (container) container.style.display = 'block';
  if (occasions) occasions.style.display = 'block';
  
  setTimeout(() => {
    if (container) container.scrollIntoView({ behavior: 'smooth' });
    showClosetTab('superiores');
  }, 500);
  
  showNotification('Closet Inteligente activado', 'success');
}

function useDirectMode() {
  console.log('⚡ MODO DIRECTO');
  
  closetMode = false;
  uploadedFiles = { tops: [], bottoms: [], shoes: [] };
  uploadedImages = { tops: [], bottoms: [], shoes: [] };
  selectedOccasion = null;
  
  const q = document.getElementById('closetQuestion');
  if (q) q.style.display = 'none';
  
  const container = document.getElementById('closetContainer');
  if (container) container.style.display = 'none';
  
  const occasions = document.getElementById('occasionSelector');
  const upload = document.getElementById('uploadArea');
  
  if (occasions) occasions.style.display = 'block';
  if (upload) upload.style.display = 'block';
  
  showNotification('Modo Directo activado', 'success');
}

// ========================================
// OCASIONES
// ========================================
function selectOccasion(occasion) {
  console.log('📅 Ocasión:', occasion);
  selectedOccasion = occasion;
  
  document.querySelectorAll('.occasion-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  
  const btn = document.querySelector(`.occasion-btn[data-occasion="${occasion}"]`);
  if (btn) btn.classList.add('selected');
  
  showNotification(`Ocasión: ${OCCASION_NAMES[occasion]}`, 'success');
  updateGenerateButton();
}

function updateGenerateButton() {
  const btn = document.getElementById('generateBtn');
  if (!btn) return;
  
  const hasOccasion = selectedOccasion !== null;
  const hasFiles = uploadedFiles.tops.length > 0 && uploadedFiles.bottoms.length > 0 && uploadedFiles.shoes.length > 0;
  
  if (hasOccasion && hasFiles) {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-magic"></i> Generar Recomendaciones';
    btn.style.opacity = '1';
  } else if (!hasOccasion) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-calendar"></i> Selecciona ocasión';
    btn.style.opacity = '0.6';
  } else {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-upload"></i> Sube fotos de cada categoría';
    btn.style.opacity = '0.6';
  }
}

// ========================================
// RECOMENDACIONES
// ========================================
async function getRecommendation() {
  if (!selectedOccasion || !isLoggedIn) {
    showNotification('Completa todos los requisitos', 'error');
    return;
  }
  
  if (uploadedFiles.tops.length === 0 || uploadedFiles.bottoms.length === 0 || uploadedFiles.shoes.length === 0) {
    showNotification('Sube al menos 1 imagen de cada categoría', 'error');
    return;
  }
  
  const btn = document.getElementById('generateBtn');
  const timer = document.getElementById('processingTimer');
  const timerDisplay = document.getElementById('timerDisplay');
  
  processingStartTime = Date.now();
  if (timer) timer.style.display = 'block';
  
  let timerInterval = setInterval(() => {
    const elapsed = (Date.now() - processingStartTime) / 1000;
    if (timerDisplay) timerDisplay.textContent = elapsed.toFixed(1) + 's';
  }, 100);
  
  if (btn) {
    btn.innerHTML = '<span class="loading"></span> Generando...';
    btn.disabled = true;
  }
  
  try {
    const formData = new FormData();
    formData.append('user_email', currentUser.email);
    formData.append('occasion', selectedOccasion);
    
    uploadedFiles.tops.forEach((f, i) => formData.append('tops', f, f.name || `top_${i}.jpg`));
    uploadedFiles.bottoms.forEach((f, i) => formData.append('bottoms', f, f.name || `bottom_${i}.jpg`));
    uploadedFiles.shoes.forEach((f, i) => formData.append('shoes', f, f.name || `shoe_${i}.jpg`));
    
    const response = await fetch(`${CONFIG.API_BASE}/api/recommend`, {
      method: 'POST',
      body: formData
    });
    
    clearInterval(timerInterval);
    const finalTime = (Date.now() - processingStartTime) / 1000;
    if (timerDisplay) timerDisplay.textContent = finalTime.toFixed(1) + 's';
    
    if (!response.ok) throw new Error(`Error ${response.status}`);
    
    const data = await response.json();
    
    if (data.success) {
      userStats.recommendations++;
      renderRecommendations(data);
      showNotification(`✅ Listo en ${finalTime.toFixed(1)}s`, 'success');
    } else {
      throw new Error(data.message || 'Error');
    }
    
  } catch (error) {
    clearInterval(timerInterval);
    console.error('❌ Error:', error);
    showNotification(`Error: ${error.message}`, 'error');
  } finally {
    setTimeout(() => {
      if (timer) timer.style.display = 'none';
    }, 2000);
    
    if (btn) {
      btn.innerHTML = '<i class="fas fa-magic"></i> Generar Nuevas';
      btn.disabled = false;
    }
  }
}

function getImage(type, item) {
  const images = uploadedImages[type];
  if (!images?.length) return null;
  const idx = type === 'tops' ? item.top?.index : type === 'bottoms' ? item.bottom?.index : item.shoe?.index;
  return images[idx] || images[0];
}

function renderRecommendations(data) {
  const result = document.getElementById('result');
  if (!result) return;
  
  const results = data.results || [];
  if (!results.length) {
    result.innerHTML = '<div style="text-align:center;padding:3rem">Sin recomendaciones</div>';
    result.style.display = 'block';
    return;
  }
  
  const bestIdx = results.reduce((best, item, idx) => 
    (item.final_score || 0) > (results[best].final_score || 0) ? idx : best, 0);
  const best = results[bestIdx];
  const occasion = OCCASION_NAMES[selectedOccasion];
  
  result.innerHTML = `
    <div style="text-align:center;margin-bottom:2rem">
      <h2>Mejor para ${occasion}</h2>
    </div>
    ${renderCard(best, occasion)}
  `;
  
  result.style.display = 'block';
  setTimeout(() => result.scrollIntoView({ behavior: 'smooth' }), 100);
}

function renderCard(item, occasion) {
  const score = Math.round((item.final_score || 0) * 100);
  
  return `
    <div style="background:white;border:2px solid var(--gold);border-radius:20px;padding:2rem;box-shadow:0 0 30px rgba(251,191,36,.3);position:relative">
      <div style="position:absolute;top:-15px;left:50%;transform:translateX(-50%);background:var(--gold);color:#000;padding:.5rem 1.5rem;border-radius:20px;font-weight:800">
        ⭐ MEJOR PARA ${occasion.toUpperCase()}
      </div>
      <div style="display:flex;justify-content:space-between;margin:2rem 0 1rem">
        <h3>Combinación Perfecta</h3>
        <span style="background:var(--gold);color:#000;padding:.5rem 1rem;border-radius:15px;font-weight:700">${score}%</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem">
        ${renderItem('SUPERIOR', getImage('tops', item), item.top?.detected_item)}
        ${renderItem('INFERIOR', getImage('bottoms', item), item.bottom?.detected_item)}
        ${renderItem('CALZADO', getImage('shoes', item), item.shoe?.detected_item)}
      </div>
      <div style="background:rgba(59,130,246,.1);border-radius:10px;padding:1rem;text-align:center;margin-top:1rem">
        <div style="font-weight:600;margin-bottom:.5rem">${item.harmony_type || 'Equilibrada'}</div>
        <div style="font-size:.9rem;opacity:.8">${item.harmony_description || 'Combinación balanceada'}</div>
      </div>
    </div>
  `;
}

function renderItem(title, img, name) {
  return `
    <div style="text-align:center">
      <div style="font-size:.8rem;font-weight:600;margin-bottom:.5rem">${title}</div>
      <div style="border:1px dashed rgba(59,130,246,.3);border-radius:20px;padding:1.5rem;min-height:240px;display:flex;align-items:center;justify-content:center">
        ${img ? `<img src="${img}" style="max-width:200px;max-height:200px;object-fit:contain;border-radius:15px;box-shadow:0 4px 12px rgba(0,0,0,.15)">` : `<div style="color:#666;font-size:2rem">${title[0]}</div>`}
      </div>
      <div style="font-size:.9rem;margin-top:.5rem;opacity:.8">${name || title}</div>
    </div>
  `;
}

// ========================================
// PERSISTENCIA
// ========================================
function saveUserData() {
  if (!currentUser?.email) return;
  
  const data = {
    email: currentUser.email,
    uploadedFiles,
    uploadedImages,
    closetItems,
    userStats,
    lastUpdated: new Date().toISOString()
  };
  
  localStorage.setItem(`noshopia_user_data_${currentUser.email}`, JSON.stringify(data));
}

function loadUserData() {
  if (!currentUser?.email) return;
  
  try {
    const stored = localStorage.getItem(`noshopia_user_data_${currentUser.email}`);
    if (stored) {
      const data = JSON.parse(stored);
      uploadedFiles = data.uploadedFiles || { tops: [], bottoms: [], shoes: [] };
      uploadedImages = data.uploadedImages || { tops: [], bottoms: [], shoes: [] };
      closetItems = data.closetItems || { tops: [], bottoms: [], shoes: [] };
      userStats = data.userStats || { visits: 1, recommendations: 0, savedOutfits: 0 };
    }
  } catch (error) {
    console.error('Error cargando datos:', error);
  }
}

// ========================================
// INICIALIZACIÓN
// ========================================
function initializeGoogleLogin() {
  if (typeof google === 'undefined') {
    setTimeout(initializeGoogleLogin, 1000);
    return;
  }
  
  google.accounts.id.initialize({
    client_id: CONFIG.GOOGLE_CLIENT_ID,
    callback: handleGoogleCredentialResponse,
    auto_select: false
  });
  
  console.log('✅ Google Login ready');
}

function initializeEventListeners() {
  // Profile options
  document.querySelectorAll('.profile-option').forEach(opt => {
    opt.addEventListener('click', function() {
      const field = this.dataset.field;
      const value = this.dataset.value;
      handleProfileSelection(field, value);
    });
  });
  
  // Occasion buttons
  document.querySelectorAll('.occasion-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const occasion = this.dataset.occasion;
      selectOccasion(occasion);
    });
  });
}

function initializeApp() {
  console.log('🚀 Iniciando NoShopiA v3.3');
  setTimeout(initializeGoogleLogin, 2000);
  setTimeout(initializeEventListeners, 1000);
}

// ========================================
// EXPORTAR A WINDOW
// ========================================
window.handleFileUpload = handleFileUpload;
window.handleGoogleCredentialResponse = handleGoogleCredentialResponse;
window.logout = logout;
window.enableCloset = enableCloset;
window.useDirectMode = useDirectMode;
window.showClosetTab = showClosetTab;
window.removeClosetItem = removeClosetItem;
window.removeImage = removeImage;
window.scrollToSection = scrollToSection;
window.handleProfileSelection = handleProfileSelection;
window.submitUserProfile = submitUserProfile;
window.selectOccasion = selectOccasion;
window.getRecommendation = getRecommendation;
window.startFreePlan = function() {
  showNotification('Plan gratuito activado', 'success');
  setTimeout(() => scrollToSection('upload'), 1000);
};
window.upgradeToPremium = function() {
  showNotification('Premium próximamente', 'info');
};

// Auto-inicio
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  setTimeout(initializeApp, 100);
}

console.log('✅ NoShopiA v3.3 DEFINITIVO cargado');
