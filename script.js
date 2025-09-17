// Senha admin (mude para algo seguro)
const ADMIN_SENHA = 'venancio123';

// Faixas de preço default (editáveis via admin)
let faixas = [
  { min: 0, max: 5, preco: 150 },
  { min: 5, max: 10, preco: 250 },
  { min: 10, max: 20, preco: 350 },
  { min: 20, max: Infinity, preco: 500 }
];

// Carregar faixas do localStorage se existirem
if (localStorage.getItem('faixasPreco')) {
  faixas = JSON.parse(localStorage.getItem('faixasPreco'));
}

// Função para calcular distância (usa Google Maps API)
async function getDistancia(origem, destino) {
  const service = new google.maps.DistanceMatrixService();
  return new Promise((resolve, reject) => {
    service.getDistanceMatrix({
      origins: [origem],
      destinations: [destino],
      travelMode: 'DRIVING',
    }, (response, status) => {
      if (status === 'OK') {
        const km = response.rows[0].elements[0].distance.value / 1000;
        resolve(km);
      } else {
        reject('Erro ao calcular distância');
      }
    });
  });
}

// Função para calcular preço baseado em km
function getPreco(km) {
  for (let faixa of faixas) {
    if (km >= faixa.min && km < faixa.max) {
      return faixa.preco;
    }
  }
  return 0;
}

// Função para calcular frete e enviar
async function calcularFrete() {
  const itens = Array.from(document.getElementById('itens').selectedOptions).map(opt => opt.value);
  const outros = document.getElementById('outrosItens').value;
  const origem = document.getElementById('origem').value;
  const destino = document.getElementById('destino').value;
  const data = document.getElementById('data').value;
  const horario = document.getElementById('horario').value;
  const nome = document.getElementById('nome').value;
  const telefone = document.getElementById('telefone').value;

  if (!origem || !destino || !data || !horario || !nome || !telefone) {
    alert('Preencha todos os campos!');
    return;
  }

  try {
    const km = await getDistancia(origem, destino);
    const preco = getPreco(km);
    const mensagem = `Solicitação de Frete:
- Itens: ${itens.join(', ')}${outros ? `, Outros: ${outros}` : ''}
- De: ${origem}
- Para: ${destino}
- Data: ${data}
- Horário: ${horario}
- Nome: ${nome}
- Telefone: ${telefone}
- Distância: ${km.toFixed(2)} km
- Preço estimado: R$${preco}`;

    const numeroWhatsapp = '5512974042344'; // Substitua pelo número real do Venancio (formato: 55DDDnumero sem espaços)
    const url = `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');

    document.getElementById('resultado').textContent = `Preço: R$${preco} | Mensagem enviada!`;
  } catch (error) {
    alert(error);
  }
}

// Funções admin
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
