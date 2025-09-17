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

async function calcularFrete() {
  const itens = Array.from(document.querySelectorAll('input[name="itens"]:checked')).map(input => input.value);
  const outroCheckbox = document.getElementById('outroCheckbox').checked;
  const outros = outroCheckbox ? document.getElementById('outrosItens').value : '';
  const cepOrigem = document.getElementById('cepOrigem').value.replace(/\D/g, '');
  const ruaOrigem = document.getElementById('ruaOrigem').value;
  const numeroOrigem = document.getElementById('numeroOrigem').value;
  const complementoOrigem = document.getElementById('complementoOrigem').value;
  const bairroOrigem = document.getElementById('bairroOrigem').value;
  const cepDestino = document.getElementById('cepDestino').value.replace(/\D/g, '');
  const ruaDestino = document.getElementById('ruaDestino').value;
  const numeroDestino = document.getElementById('numeroDestino').value;
  const complementoDestino = document.getElementById('complementoDestino').value;
  const bairroDestino = document.getElementById('bairroDestino').value;
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
    const mensagem = `Solicitação de Frete:
- Itens: ${itens.join(', ')}${outros ? `, Outros: ${outros}` : ''}
- Origem: ${ruaOrigem}, ${numeroOrigem}${complementoOrigem ? `, ${complementoOrigem}` : ''}, ${bairroOrigem}, CEP ${cepOrigem}
- Destino: ${ruaDestino}, ${numeroDestino}${complementoDestino ? `, ${complementoDestino}` : ''}, ${bairroDestino}, CEP ${cepDestino}
- Data: ${data}
- Horário: ${horario}
- Nome: ${nome}
- Telefone: ${telefone}`;

    console.log('Mensagem gerada:', mensagem); // Para debug
    const numeroWhatsapp = '5512974042344'; // Número de teste
    const url = `https://api.whatsapp.com/send?phone=${numeroWhatsapp}&text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');

    document.getElementById('resultado').textContent = 'Mensagem enviada para o WhatsApp!';
  } catch (error) {
    console.error('Erro ao enviar para WhatsApp:', error);
    alert('Erro ao enviar para WhatsApp: ' + error.message);
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
