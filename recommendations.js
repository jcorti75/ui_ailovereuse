// recommendations.js - Solo Renderizado de Resultados
console.log('Recommendations.js iniciando...');

const OCCASIONS = {
  'oficina': 'Oficina/Trabajo',
  'deportivo': 'Deportes/Gym', 
  'casual': 'Casual',
  'formal': 'Formal',
  'matrimonio': 'Matrimonio'
};

// Obtener imagen por tipo e índice del backend
function getImage(type, item) {
  const images = window.uploadedImages?.[type];
  if (!images?.length) return null;
  
  const idx = type === 'tops' ? item.top?.index : 
              type === 'bottoms' ? item.bottom?.index : 
              item.shoe?.index;
  
  return images[idx] || images[0];
}

// Renderizar recomendaciones
function renderRecommendations(data) {
  const result = document.getElementById('result');
  if (!result) return;
  
  const results = data.results || [];
  
  if (!results.length) {
    result.innerHTML = '<div style="text-align:center;padding:3rem;color:#666"><i class="fas fa-search" style="font-size:3rem;opacity:.5"></i><h3>No hay recomendaciones</h3></div>';
    result.style.display = 'block';
    return;
  }
  
  const bestIdx = results.reduce((best, item, idx) => 
    (item.final_score || 0) > (results[best].final_score || 0) ? idx : best, 0
  );
  
  const occasion = OCCASIONS[window.selectedOccasion] || window.selectedOccasion;
  
  result.innerHTML = `
    <div style="text-align:center;margin-bottom:2rem">
      <h2 style="color:#000">Recomendaciones para ${occasion}</h2>
      <div style="background:linear-gradient(135deg,var(--primary),#1d4ed8);color:white;border-radius:15px;padding:1rem;margin:1rem 0;display:inline-block">
        <strong>${occasion}</strong>
      </div>
      <p style="color:#000;opacity:.8">${data.message || results.length + ' combinaciones optimizadas'}</p>
      ${data.processing_stats?.total_time ? `<div style="background:rgba(59,130,246,.1);border-radius:10px;padding:1rem;margin:1rem 0"><strong>Procesamiento:</strong> ${data.processing_stats.total_time}</div>` : ''}
    </div>
    <div style="display:grid;gap:2rem">
      ${results.map((item, idx) => renderCard(item, idx, idx === bestIdx, occasion)).join('')}
    </div>
  `;
  
  result.style.display = 'block';
  setTimeout(() => result.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  console.log(`${results.length} recomendaciones renderizadas`);
}

// Renderizar tarjeta individual
function renderCard(item, idx, isBest, occasion) {
  const score = Math.round((item.final_score || 0) * 100);
  const border = isBest ? 'var(--gold)' : 'var(--border)';
  const shadow = isBest ? 'box-shadow:0 0 30px rgba(251,191,36,.3)' : '';
  
  return `
    <div style="background:var(--background);border:2px solid ${border};border-radius:20px;padding:2rem;position:relative;${shadow}">
      ${isBest ? `<div style="position:absolute;top:-15px;left:50%;transform:translateX(-50%);background:var(--gold);color:#000;padding:.5rem 1.5rem;border-radius:20px;font-weight:800;font-size:.9rem">MEJOR PARA ${occasion.toUpperCase()}</div>` : ''}
      
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;${isBest ? 'margin-top:1rem' : ''}">
        <h3 style="color:#000;margin:0">${isBest ? '' : ''} Combinación ${idx + 1}</h3>
        <div style="display:flex;gap:.5rem">
          <span style="background:rgba(59,130,246,.1);color:var(--primary);padding:.3rem .8rem;border-radius:10px;font-size:.8rem;font-weight:600">${occasion}</span>
          <span style="background:${isBest ? 'var(--gold)' : 'var(--primary)'};color:${isBest ? '#000' : 'white'};padding:.5rem 1rem;border-radius:15px;font-weight:700">${score}%</span>
        </div>
      </div>
      
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-bottom:1rem">
        ${renderItem('SUPERIOR', getImage('tops', item), item.top?.detected_item || 'Superior')}
        ${renderItem('INFERIOR', getImage('bottoms', item), item.bottom?.detected_item || 'Inferior')}
        ${renderItem('CALZADO', getImage('shoes', item), item.shoe?.detected_item || 'Calzado')}
      </div>
      
      <div style="background:rgba(59,130,246,.1);border-radius:10px;padding:1rem;text-align:center">
        <div style="color:#000;font-weight:600;margin-bottom:.5rem">${item.harmony_type || 'Equilibrada'}</div>
        <div style="color:#000;opacity:.8;font-size:.9rem">${item.harmony_description || 'Combinación balanceada'}</div>
      </div>
    </div>
  `;
}

// Renderizar item de ropa
function renderItem(title, img, name) {
  const content = img ? 
    `<img src="${img}" style="max-width:200px;max-height:200px;object-fit:contain;border-radius:15px;box-shadow:0 4px 12px rgba(0,0,0,.15)" alt="${title}">` :
    `<div style="color:#666;font-size:2rem">${title[0]}</div>`;
  
  return `
    <div style="text-align:center">
      <div style="font-size:.8rem;color:#000;font-weight:600;margin-bottom:.5rem">${title}</div>
      <div style="background:transparent;border-radius:20px;padding:1.5rem;min-height:240px;display:flex;align-items:center;justify-content:center;margin-bottom:.5rem;border:1px dashed rgba(59,130,246,.3)">${content}</div>
      <div style="font-size:.9rem;color:#000;opacity:.8">${name}</div>
    </div>
  `;
}

// Exponer globalmente
window.renderRecommendations = renderRecommendations;

console.log('recommendations.js cargado');
