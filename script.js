const ADMIN_SENHA = 'venancio123';
let faixas = [
  { min: 0, max: 5, preco: 150 },
  { min: 5, max: 10, preco: 250 },
  { min: 10, max: 20, preco: 350 },
  { min: 20, max: Infinity, preco: 500 }
];

if (localStorage.getItem('faixasPreco')) {
  faixas = JSON.parse(localStorage.getItem('faixasPreco'));
}

document.addEventListener('DOMContentLoaded', () => {
  const outroCheckbox = document.getElementById('outroCheckbox');
  const outrosItens = document.getElementById('outrosItens');
  if (outroCheckbox && outrosItens) {
    outroCheckbox.addEventListener('change', () => {
      outrosItens.classList.toggle('hidden', !outroCheckbox.checked);
    });
  }
});

async function getCoordenadas(cep) {
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();
    if (data.erro) throw new Error('CEP inválido');
    
    // Simulação de coordenadas (ViaCEP não fornece lat/lng, usamos valores fictícios baseados em CEPs reais)
    // Para precisão, você precisaria de uma API de geocodificação, mas usamos estimativas
    const coords = {
      '12345-678': { lat: -23.5505, lng: -46.6333 }, // Exemplo: São Paulo
      '98765-432': { lat: -23.6000, lng: -46.7000 }, // Exemplo: Outra área de SP
      // Adicione mais CEPs reais e suas coordenadas aqui se necessário
    };
    return coords[cep] || { lat: -23.5505, lng: -46.6333 }; // Fallback para São Paulo
  } catch (error) {
    throw new Error('Erro ao buscar CEP: ' + error.message);
  }
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

async function calcularFrete() {
  const itens = Array.from(document.querySelectorAll('input[name="itens"]:checked')).map(input => input.value);
  const outroCheckbox = document.getElementById('outroCheckbox').checked;
  const outros = outroCheckbox ? document.getElementById('outrosItens').value : '';
  const origem = document.getElementById('origem').value.replace(/\D/g, '');
  const destino = document.getElementById('destino').value.replace(/\D/g, '');
  const data = document.getElementById('data').value;
  const horario = document.getElementById('horario').value;
  const nome = document.getElementById('nome').value;
  const telefone = document.getElementById('telefone').value;

  if (!itens.length && !outros) {
    alert('Selecione pelo menos um item ou descreva outros!');
    return;
  }
  if (!origem || !destino || !data || !horario || !nome || !telefone) {
    alert('Preencha todos os campos!');
    return;
  }

  try {
    const origemCoords = await getCoordenadas(origem);
    const destinoCoords = await getCoordenadas(destino);
    const km = haversineDistance(origemCoords.lat, origemCoords.lng, destinoCoords.lat, destinoCoords.lng);
    const preco = getPreco(km);
    const mensagem = `Solicitação de Frete:
- Itens: ${itens.join(', ')}${outros ? `, Outros: ${outros}` : ''}
- CEP Origem: ${origem}
- CEP Destino: ${destino}
- Data: ${data}
- Horário: ${horario}
- Nome: ${nome}
- Telefone: ${telefone}
- Distância estimada: ${km.toFixed(2)} km
- Preço estimado: R$${preco}`;

    const numeroWhatsapp = '5511999999999'; // SUBSTITUA PELO NÚMERO REAL DO VENANCIO
    const url = `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');

    document.getElementById('resultado').textContent = `Preço: R$${preco} | Mensagem enviada!`;
  } catch (error) {
    alert(error.message);
  }
}

function getPreco(km) {
  for (let faixa of faixas) {
    if (km >= faixa.min && km < faixa.max) {
      return faixa.preco;
    }
  }
  return 0;
}

function loginAdmin() {
  const senha = document.getElementById('senha').value;
  if (senha === ADMIN_SENHA) {
    document.getElementById('adminPanel').classList.remove('hidden');
    const faixasText = faixas.map(f => `${f.min}-${f.max}:${f.preco}`).join('\n');
    document.getElementById('faixasPreco').value = faixasText;
  } else {
    alert('Senha incorreta!');
  }
}

function salvarFaixas() {
  const texto = document.getElementById('faixasPreco').value;
  const novasFaixas = texto.split('\n').map(linha => {
    const [range, preco] = linha.split(':');
    const [min, max] = range.split('-').map(Number);
    return { min, max: max || Infinity, preco: Number(preco) };
  });
  faixas = novasFaixas;
  localStorage.setItem('faixasPreco', JSON.stringify(faixas));
  alert('Faixas salvas!');
}
