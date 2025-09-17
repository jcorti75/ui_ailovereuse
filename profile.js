// profile.js - Funciones de Perfil de Usuario

// Configurar listeners de perfil
function setupProfileListeners() {
  console.log('🎯 Configurando listeners de perfil...');
  
  document.querySelectorAll('.profile-option').forEach(btn => {
    btn.addEventListener('click', function() {
      const field = this.dataset.field;
      const value = this.dataset.value;
      
      // Deseleccionar otros botones del mismo campo
      document.querySelectorAll(`[data-field="${field}"]`).forEach(b => {
        b.classList.remove('selected');
      });
      
      // Seleccionar este botón
      this.classList.add('selected');
      userProfile[field] = value;
      
      console.log('Perfil actualizado:', userProfile);
      updateCreateProfileButton();
    });
  });
}

// Actualizar botón de crear perfil
function updateCreateProfileButton() {
  const btn = document.getElementById('createProfileBtn');
  const isComplete = userProfile.skin_color && userProfile.age_range && userProfile.gender;
  
  btn.disabled = !isComplete;
  
  if (isComplete) {
    btn.innerHTML = '<i class="fas fa-user-plus"></i> Completar Perfil';
    btn.style.opacity = '1';
  } else {
    btn.innerHTML = '<i class="fas fa-user-plus"></i> Selecciona todas las opciones';
    btn.style.opacity = '0.6';
  }
}

// Enviar perfil de usuario
async function submitUserProfile() {
  if (!currentUser || !userProfile.skin_color || !userProfile.age_range || !userProfile.gender) {
    showNotification('Por favor completa todos los campos', 'error');
    return;
  }
  
  const btn = document.getElementById('createProfileBtn');
  btn.innerHTML = '<span class="loading"></span> Creando perfil...';
  btn.disabled = true;
  
  try {
    console.log('=== ENVIANDO PERFIL ===');
    console.log('Usuario:', currentUser.email);
    console.log('Perfil:', userProfile);
    
    const formData = new FormData();
    formData.append('email', currentUser.email);
    formData.append('skin_color', userProfile.skin_color);
    formData.append('age_range', userProfile.age_range);
    formData.append('gender', userProfile.gender);
    
    const response = await fetch(`${CONFIG.API_BASE}/api/profile/create`, {
      method: 'POST',
      body: formData
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Perfil creado:', data);
    
    if (data.success) {
      showNotification('¡Perfil creado exitosamente!', 'success');
      
      // Ocultar perfil y mostrar siguiente paso
      document.getElementById('profileForm').style.display = 'none';
      document.getElementById('closetQuestion').style.display = 'block';
      
    } else {
      throw new Error(data.message || 'Error desconocido');
    }
    
  } catch (e) {
    console.error('❌ Error creando perfil:', e);
    showNotification('Error creando perfil: ' + e.message, 'error');
  } finally {
    btn.innerHTML = '<i class="fas fa-user-plus"></i> Completar Perfil';
    btn.disabled = false;
  }
}