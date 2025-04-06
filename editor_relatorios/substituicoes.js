// recebe do site anterior o modelo selecionado
const selectedReport = sessionStorage.getItem("selectedReport");
if (!selectedReport) { //se nao tem report
  // Se não encontrar, redireciona para a página index
  window.location.href = "index.html";
} else {
  console.log("Tipo de relatório:", selectedReport);
}

// Carregamento dinâmico de frases e substituições a partir de arquivos JSON
Promise.all([
  fetch(`json/${selectedReport}/frasesOriginais.json`).then(res => res.json()),
  fetch(`json/${selectedReport}/substituicoes.json`).then(res => res.json())
]).then(([frasesOriginaisArray, substituicoesArray]) => {

  const frasesOriginais = {};            // Frases normais numeradas
  const frasesOriginaisInfo = {};        // Inclui também os rótulos
  const substituicoes = {};              // Frases alternativas agrupadas por número
  const rotulosAlternativos = {};        // Rótulo resumido de cada alternativa

  frasesOriginaisArray.forEach(({ numero, frase, rotulo }) => {
    frasesOriginais[numero] = frase;
    frasesOriginaisInfo[numero] = { frase, rotulo };
  });

  substituicoesArray.forEach((item) => {
    const { numero, codigo, resumo, frase, conclusao, tipo, script } = item;
    if (!substituicoes[numero]) substituicoes[numero] = [];
    substituicoes[numero].push({ codigo, frase, conclusao, tipo, script });
    rotulosAlternativos[codigo] = resumo;
  });

  gerarCampoRelatorio(frasesOriginaisArray);
  montarMenu(frasesOriginais, frasesOriginaisInfo, substituicoes, rotulosAlternativos);
});

const frasesConclusaoAtivas = new Map();

function getConclusaoDiv() {
  return document.getElementById('conclusao-dinamica');
}

function atualizarConclusao(numero, texto) {
  frasesConclusaoAtivas.set(numero, texto);
  renderizarConclusao();
}

function removerConclusao(numero) {
  frasesConclusaoAtivas.delete(numero);
  renderizarConclusao();
}

function renderizarConclusao() {
  const div = getConclusaoDiv();
  if (!div) return;

  div.innerHTML = "";
  frasesConclusaoAtivas.forEach((texto) => {
    const p = document.createElement("p");
    p.innerText = `- ${texto}`;
    div.appendChild(p);
  });
}

function gerarCampoRelatorio(frasesOriginaisArray) {
  const campo = document.getElementById('campoRelatorio');
  
  // Renderiza apenas os itens que possuem "numero"
  frasesOriginaisArray.forEach(item => {
    if (item.numero) {
      const { numero, frase } = item;
      const p = document.createElement('p');
      p.dataset.linha = numero;
      p.innerText = frase;
      campo.appendChild(p);
      const espaco = document.createElement('p');
      espaco.innerHTML = '&nbsp;';
      campo.appendChild(espaco);
    }
  });

  // Bloco de conclusão
  const blocoConclusaoTitulo = document.createElement('p');
  blocoConclusaoTitulo.innerHTML = '<strong>Impressão radiológica:</strong>';
  campo.appendChild(blocoConclusaoTitulo);

  const conclusaoDinamica = document.createElement('div');
  conclusaoDinamica.id = 'conclusao-dinamica';

  // Procura o item com "conclusao": 99
  const conclusaoObj = frasesOriginaisArray.find(item => item.conclusao === 99);
  const p1 = document.createElement('p');
  if (conclusaoObj && conclusaoObj.frase) {
    p1.innerText = conclusaoObj.frase;
  } else {
    p1.innerText = 'Exame sem evidênias de alterações patológicas.';
  }
  conclusaoDinamica.appendChild(p1);
  campo.appendChild(conclusaoDinamica);
}

function montarMenu(frasesOriginais, frasesOriginaisInfo, substituicoes, rotulosAlternativos) {
  const menuDiv = document.getElementById('menu');

  Object.entries(frasesOriginais).forEach(([numero, fraseNormal]) => {
    const grupo = document.createElement('div');
    grupo.classList.add('grupo');
    grupo.id = numero;
    const normal = document.createElement('span');
    normal.className = 'normal';
    const rotulo = frasesOriginaisInfo[numero]?.rotulo || "_";
    normal.innerHTML = `<span class="numero-verde">${numero}</span> ${rotulo}`;
    normal.style.cursor = 'pointer';
    normal.onclick = () => {
      restaurarFrase(numero, frasesOriginais);
      removerConclusao(parseInt(numero));
    };
    grupo.appendChild(normal);

    if (substituicoes[numero]) {
      substituicoes[numero].forEach((item) => {
        const { frase, conclusao, tipo = 'substituicao', codigo, script } = item;
        const resumo = rotulosAlternativos[codigo] || frase.substring(0, 40) + "...";

        if (tipo === 'complementar') {
          const label = document.createElement('label');
          label.style.display = 'block';
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.onchange = () => {
            const p = document.querySelector(`p[data-linha='${numero}']`);
            let span = document.getElementById(`comp-${codigo}`);
            if (checkbox.checked) {
              if (!span) {
                span = document.createElement('span');
                span.id = `comp-${codigo}`;
                span.innerText = ' ' + frase;
                p.appendChild(span);
              }
              if (conclusao) atualizarConclusao(parseInt(numero), conclusao);
            } else {
              if (span) span.remove();
              if (conclusao) removerConclusao(parseInt(numero));
            }
          };
          label.appendChild(checkbox);
          label.appendChild(document.createTextNode(resumo));
          grupo.appendChild(label);
        } else if (tipo === 'matematica') {
          const label = document.createElement('label');
          label.style.display = 'block';
          label.innerText = resumo;
          grupo.appendChild(label);

          const p = document.querySelector(`p[data-linha='${numero}']`);
          const novaLinha = document.createElement('p');
          novaLinha.id = `mat-${codigo}`;
          p.insertAdjacentElement('afterend', novaLinha);

          if (script) {
            const s = document.createElement('script');
            s.src = script;
            document.body.appendChild(s);
          }
        } else {
          const botao = document.createElement('button');
          botao.className = 'frase';
          botao.innerText = resumo;
          botao.onclick = () => {
            substituirFrase(numero, frase);
            if (conclusao) atualizarConclusao(parseInt(numero), conclusao);
          };
          grupo.appendChild(botao);
        }
      });
    }

    menuDiv.appendChild(grupo);
  });
}

function substituirFrase(numero, novaFrase) {
  const p = document.querySelector(`p[data-linha='${numero}']`);
  if (p) {
    const complementares = Array.from(p.querySelectorAll("span[id^='comp-']"));
    p.innerHTML = `- ${novaFrase}`;
    complementares.forEach(span => p.appendChild(span));
    p.style.display = 'block';
  }
}

function restaurarFrase(numero, frasesOriginais) {
  const p = document.querySelector(`p[data-linha='${numero}']`);
  if (p && frasesOriginais[numero]) {
    const complementares = Array.from(p.querySelectorAll("span[id^='comp-']"));
    p.innerHTML = frasesOriginais[numero];
    complementares.forEach(span => p.appendChild(span));
    p.style.display = 'block';
  }
}
