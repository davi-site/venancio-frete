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

async function preencherEndereco(tipo) {
  const cepInput = document.getElementById(`cep${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`);
  const ruaInput = document.getElementById(`rua${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`);
  const bairroInput = document.getElementById(`bairro${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`);
  const cep = cepInput.value.replace(/\D/g, '');

  if (cep.length !== 8) {
    alert('CEP deve ter 8 dígitos');
    return;
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();
    if (data.erro) throw new Error('CEP inválido');
    if (data.localidade !== 'Guaratinguetá' || data.uf !== 'SP') {
      throw new Error('Apenas CEPs de Guaratinguetá, SP são aceitos');
    }

    ruaInput.value = data.logradouro || '';
    bairroInput.value = data.bairro || '';
  } catch (error) {
    console.error('Erro ao preencher endereço:', error);
    alert('Erro ao buscar CEP: ' + error.message + '. Preencha rua e bairro manualmente.');
  }
}

const bairrosCoords = {
  'centro': { lat: -22.8163, lng: -45.1925 },
  'campo do galvão': { lat: -22.8075, lng: -45.1938 },
  'vila paraíba': { lat: -22.8090, lng: -45.1890 },
  'jardim do vale': { lat: -22.8030, lng: -45.1850 },
  'parque do sol': { lat: -22.8050, lng: -45.1950 },
  'cohab bandeirantes': { lat: -22.8000, lng: -45.2000 },
  'portal das colinas': { lat: -22.8100, lng: -45.1800 },
  'jardim primavera': { lat: -22.8150, lng: -45.2000 },
  'vila santa rita': { lat: -22.8119, lng: -45.1871 },
  'jardim rony': { lat: -22.8050, lng: -45.1900 },
  'gomeral': { lat: -22.8500, lng: -45.1600 },
  'pedrinhas': { lat: -22.8300, lng: -45.1700 },
  'rocinha': { lat: -22.8400, lng: -45.1500 },
  'nova guará': { lat: -22.8119, lng: -45.1871 },
  'parque são francisco': { lat: -22.8020, lng: -45.1980 }
  // Adicione mais bairros conforme necessário, com coordenadas reais obtidas de mapas
};

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

function getPreco(km) {
  for (let faixa of faixas) {
    if (km >= faixa.min && km < faixa.max) {
      return faixa.preco;
    }
  }
  return 0;
}

async function calcularFrete() {
  const itens = Array.from(document.querySelectorAll('input[name="itens"]:checked')).map(input => input.value);
  const outroCheckbox = document.getElementById('outroCheckbox').checked;
  const outros = outroCheckbox ? document.getElementById('outrosItens').value : '';
  const cepOrigem = document.getElementById('cepOrigem').value.replace(/\D/g, '');
  const ruaOrigem = document.getElementById('ruaOrigem').value;
  const numeroOrigem = document.getElementById('numeroOrigem').value;
  const complementoOrigem = document.getElementById('complementoOrigem').value;
  const bairroOrigem = document.getElementById('bairroOrigem').value.trim().toLowerCase();
  const cepDestino = document.getElementById('cepDestino').value.replace(/\D/g, '');
  const ruaDestino = document.getElementById('ruaDestino').value;
  const numeroDestino = document.getElementById('numeroDestino').value;
  const complementoDestino = document.getElementById('complementoDestino').value;
  const bairroDestino = document.getElementById('bairroDestino').value.trim().toLowerCase();
  const data = document.getElementById('data').value;
  const horario = document.getElementById('horario').value;
  const nome = document.getElementById('nome').value;
  const telefone = document.getElementById('telefone').value;

  // Validação detalhada
  if (!itens.length && !outros) {
    alert('Selecione pelo menos um item ou descreva outros!');
    return;
  }
  if (!cepOrigem) {
    alert('Preencha o CEP de origem!');
    return;
  }
  if (!ruaOrigem) {
    alert('Preencha a rua de origem!');
    return;
  }
  if (!numeroOrigem) {
    alert('Preencha o número de origem!');
    return;
  }
  if (!bairroOrigem) {
    alert('Preencha o bairro de origem!');
    return;
  }
  if (!cepDestino) {
    alert('Preencha o CEP de destino!');
    return;
  }
  if (!ruaDestino) {
    alert('Preencha a rua de destino!');
    return;
  }
  if (!numeroDestino) {
    alert('Preencha o número de destino!');
    return;
  }
  if (!bairroDestino) {
    alert('Preencha o bairro de destino!');
    return;
  }
  if (!data) {
    alert('Preencha a data!');
    return;
  }
  if (!horario) {
    alert('Preencha o horário!');
    return;
  }
  if (!nome) {
    alert('Preencha o nome!');
    return;
  }
  if (!telefone) {
    alert('Preencha o telefone!');
    return;
  }

  try {
    let coordsOrigem = bairrosCoords[bairroOrigem];
    if (!coordsOrigem) {
      alert('Bairro de origem não mapeado. Usando coordenadas do Centro para estimativa.');
      coordsOrigem = bairrosCoords['centro'];
    }

    let coordsDestino = bairrosCoords[bairroDestino];
    if (!coordsDestino) {
      alert('Bairro de destino não mapeado. Usando coordenadas do Centro para estimativa.');
      coordsDestino = bairrosCoords['centro'];
    }

    const km = haversineDistance(coordsOrigem.lat, coordsOrigem.lng, coordsDestino.lat, coordsDestino.lng);
    const preco = getPreco(km);

    document.getElementById('resultado').textContent = `Distância estimada: ${km.toFixed(2)} km | Preço estimado: R$${preco}`;

    const confirmar = confirm(`O preço estimado é R$${preco}. Deseja prosseguir para o WhatsApp?`);
    if (!confirmar) {
      return;
    }

    const mensagem = `Solicitação de Frete:
- Itens: ${itens.join(', ')}${outros ? `, Outros: ${outros}` : ''}
- Origem: ${ruaOrigem}, ${numeroOrigem}${complementoOrigem ? `, ${complementoOrigem}` : ''}, ${bairroOrigem}, CEP ${cepOrigem}
- Destino: ${ruaDestino}, ${numeroDestino}${complementoDestino ? `, ${complementoDestino}` : ''}, ${bairroDestino}, CEP ${cepDestino}
- Data: ${data}
- Horário: ${horario}
- Nome: ${nome}
- Telefone: ${telefone}
- Distância estimada: ${km.toFixed(2)} km
- Preço estimado: R$${preco}`;

    console.log('Mensagem gerada:', mensagem); // Para debug
    const numeroWhatsapp = '5512974042344'; // Número de teste
    const url = `https://api.whatsapp.com/send?phone=${numeroWhatsapp}&text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');

    document.getElementById('resultado').textContent += ' | Mensagem enviada!';
  } catch (error) {
    console.error('Erro ao calcular e enviar:', error);
    alert('Erro: ' + error.message);
  }
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
