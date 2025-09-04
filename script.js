const doseTab = document.getElementById("doseTab");
const variacaoTab = document.getElementById("variacaoTab");
const doseSection = document.getElementById("doseSection");
const variacaoSection = document.getElementById("variacaoSection");
const resultadoDose = document.getElementById("resultadoDose");
const variacoesBox = document.getElementById("variacoes");
const variacoesTexto = document.getElementById("variacoesTexto");
const tabela = document.querySelector("#tabelaResultados tbody");
let historico = [];

// Alternar abas
doseTab.onclick = () => {
  doseTab.classList.add("active");
  variacaoTab.classList.remove("active");
  doseSection.classList.remove("hidden");
  variacaoSection.classList.add("hidden");
};

variacaoTab.onclick = () => {
  variacaoTab.classList.add("active");
  doseTab.classList.remove("active");
  doseSection.classList.add("hidden");
  variacaoSection.classList.remove("hidden");
  document.getElementById("recomendado").value = resultadoDose.textContent.replace(" kg", "") || "";
};

// Cálculo de dose
document.getElementById("doseForm").oninput = () => {
  const doseVal = document.getElementById("dose").value;
  const espacamentoVal = document.getElementById("espacamento").value;
  const velocidadeVal = document.getElementById("velocidade").value;
  if (!doseVal || !espacamentoVal || !velocidadeVal) {
    resultadoDose.textContent = '';
    return;
  }

  const dose = parseFloat(doseVal);
  const espacamento = parseFloat(espacamentoVal);
  const velocidade = parseFloat(velocidadeVal);
  const resultado = (dose * espacamento * velocidade) / 600 / 2;
  resultadoDose.textContent = resultado.toFixed(2) + " kg";
};

// Alternar inputs 2 ou 3 linhas
document.getElementById("linhas").onchange = (e) => {
  const val = e.target.value;
  document.getElementById("inputs2").classList.toggle("hidden", val !== "2");
  document.getElementById("inputs3").classList.toggle("hidden", val !== "3");
};

// Estilo verde/vermelho
function aplicarEstiloResultado(element, valor) {
  if (valor >= -8 && valor <= 8) {
    element.className = "resultado-box resultado-verde";
  } else {
    element.className = "resultado-box resultado-vermelha";
  }
}

// Calcular variações
function calcularVariações() {
  const rec = parseFloat(document.getElementById("recomendado").value) || 0;
  let esq, meio, dir;

  if (document.getElementById("linhas").value === "2") {
    esq = parseFloat(document.getElementById("esquerdo").value) || 0;
    dir = parseFloat(document.getElementById("direito").value) || 0;
    const media = (esq + dir) / 2;
    const ve = ((esq - rec) / rec) * 100;
    const vd = ((dir - rec) / rec) * 100;
    const vm = ((media - rec) / rec) * 100;

    variacoesTexto.innerHTML = `
      <div class="resultado-container">
        <div class="resultado-individual ${Math.abs(ve) <= 8 ? 'resultado-verde' : 'resultado-vermelha'}">Esquerdo<br>${ve.toFixed(2)}%</div>
        <div class="resultado-individual ${Math.abs(vd) <= 8 ? 'resultado-verde' : 'resultado-vermelha'}">Direito<br>${vd.toFixed(2)}%</div>
      </div>
      <div class="resultado-media ${Math.abs(vm) <= 8 ? 'resultado-verde' : 'resultado-vermelha'}">Média<br>${vm.toFixed(2)}%</div>
    `;
    aplicarEstiloResultado(variacoesBox, vm);
    return { ve, vm: null, vd, media: vm };
  } else {
    esq = parseFloat(document.getElementById("esq3").value) || 0;
    meio = parseFloat(document.getElementById("meio").value) || 0;
    dir = parseFloat(document.getElementById("dir3").value) || 0;
    const media = (esq + meio + dir) / 3;
    const ve = ((esq - rec) / rec) * 100;
    const vm = ((meio - rec) / rec) * 100;
    const vd = ((dir - rec) / rec) * 100;
    const vmedia = ((media - rec) / rec) * 100;

    variacoesTexto.innerHTML = `
      <div class="resultado-container">
        <div class="resultado-individual ${Math.abs(ve) <= 8 ? 'resultado-verde' : 'resultado-vermelha'}">Esquerdo<br>${ve.toFixed(2)}%</div>
        <div class="resultado-individual ${Math.abs(vm) <= 8 ? 'resultado-verde' : 'resultado-vermelha'}">Meio<br>${vm.toFixed(2)}%</div>
        <div class="resultado-individual ${Math.abs(vd) <= 8 ? 'resultado-verde' : 'resultado-vermelha'}">Direito<br>${vd.toFixed(2)}%</div>
      </div>
      <div class="resultado-media ${Math.abs(vmedia) <= 8 ? 'resultado-verde' : 'resultado-vermelha'}">Média<br>${vmedia.toFixed(2)}%</div>
    `;
    aplicarEstiloResultado(variacoesBox, vmedia);
    return { ve, vm, vd, media: vmedia };
  }
}

document.getElementById("variacaoForm").oninput = calcularVariações;

// Função para salvar histórico no localStorage
function salvarLocalStorage() {
  const linhas = [];
  tabela.querySelectorAll("tr").forEach(tr => {
    const cols = [...tr.children].map(td => td.outerHTML);
    linhas.push(cols);
  });
  localStorage.setItem("historicoResultados", JSON.stringify(linhas));
}

// Carregar histórico ao iniciar
window.onload = () => {
  const salvo = JSON.parse(localStorage.getItem("historicoResultados") || "[]");
  salvo.forEach(cols => {
    const linha = document.createElement("tr");
    linha.innerHTML = cols.join("");
    tabela.appendChild(linha);
    historico.push(linha);
  });
};

// Salvar na tabela
document.getElementById("salvarBtn").onclick = () => {
  const { ve, vm, vd, media } = calcularVariações();
  const hoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  const linha = document.createElement("tr");
  const estilo = (v) => (v >= -8 && v <= 8 ? "resultado-verde" : "resultado-vermelha");

  linha.innerHTML = `
    <td>${hoje}</td>
    <td class="${estilo(ve)}">${ve.toFixed(2)}%</td>
    <td class="${vm !== null ? estilo(vm) : ''}">${vm !== null ? vm.toFixed(2) + "%" : "-"}</td>
    <td class="${estilo(vd)}">${vd.toFixed(2)}%</td>
    <td class="${estilo(media)}">${media.toFixed(2)}%</td>
  `;
  tabela.prepend(linha);
  historico.unshift(linha);

  if (historico.length > 10) {
    tabela.removeChild(historico.pop());
  }

  salvarLocalStorage();
};

// Botão limpar tabela
const limparBtn = document.createElement("button");
limparBtn.innerHTML = "🗑️ Limpar Tabela";
limparBtn.className = "btn-limpar";
limparBtn.onclick = () => {
  tabela.innerHTML = "";
  historico = [];
  localStorage.removeItem("historicoResultados");
};
document.querySelector("#tabelaResultados").parentElement.appendChild(limparBtn);
