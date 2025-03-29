// Carregamento dinâmico de frases e substituições a partir de arquivos JSON
Promise.all([
  fetch('frasesOriginais.json').then(res => res.json()),
  fetch('substituicoes.json').then(res => res.json())
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
    const { numero, codigo, resumo, frase, conclusao } = item;
    if (!substituicoes[numero]) substituicoes[numero] = [];
    substituicoes[numero].push(item); // guarda o objeto completo
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
  frasesOriginaisArray.forEach(({ numero, frase }) => {
    const p = document.createElement('p');
    p.dataset.linha = numero;
    p.innerText = frase;
    campo.appendChild(p);
  });

  const blocoConclusaoTitulo = document.createElement('p');
  blocoConclusaoTitulo.innerHTML = '<strong>Impressão radiológica:</strong>';
  campo.appendChild(blocoConclusaoTitulo);

  const conclusaoDinamica = document.createElement('div');
  conclusaoDinamica.id = 'conclusao-dinamica';

  const p1 = document.createElement('p');
  p1.innerText = '- Ressonância magnética do joelho XXX sem evidência de alterações patológicas.';
  const p2 = document.createElement('p');
  p2.innerText = '- Ligamento cruzado anterior e meniscos sem evidencias de rupturas nas imagens analisadas.';

  conclusaoDinamica.appendChild(p1);
  conclusaoDinamica.appendChild(p2);
  campo.appendChild(conclusaoDinamica);

  const fim = document.createElement('p');
  fim.innerHTML = '<em>*FIM*</em>';
  campo.appendChild(fim);
}

function montarMenu(frasesOriginais, frasesOriginaisInfo, substituicoes, rotulosAlternativos) {
  const menuDiv = document.getElementById('menu');

  Object.entries(frasesOriginais).forEach(([numero, fraseNormal]) => {
    const grupo = document.createElement('div');
    grupo.classList.add('grupo');

    const normal = document.createElement('span');
    normal.className = 'normal';
    const rotulo = frasesOriginaisInfo[numero]?.rotulo || "Normal";
    normal.innerHTML = `<span class="numero-verde">${numero}</span> ${rotulo}`;
    normal.style.cursor = 'pointer';
    normal.onclick = () => {
      restaurarFrase(numero, frasesOriginais);
      removerConclusao(parseInt(numero));
    };
    grupo.appendChild(normal);

    if (substituicoes[numero]) {
      substituicoes[numero].forEach((item, idx) => {
        const { frase, conclusao } = item;
        const chave = `${numero}${String.fromCharCode(97 + idx)}`;
        const resumo = rotulosAlternativos[chave] || frase.substring(0, 40) + "...";

        const botao = document.createElement('button');
        botao.className = 'frase';
        botao.innerText = resumo;
        botao.onclick = () => {
          substituirFrase(numero, frase);
          if (conclusao) atualizarConclusao(parseInt(numero), conclusao);
        };
        grupo.appendChild(botao);
      });
    }

    menuDiv.appendChild(grupo);
  });
}

function substituirFrase(numero, novaFrase) {
  const p = document.querySelector(`p[data-linha='${numero}']`);
  if (p) {
    p.innerText = `- ${novaFrase}`;
    p.style.display = 'block';
  }
}

function restaurarFrase(numero, frasesOriginais) {
  const p = document.querySelector(`p[data-linha='${numero}']`);
  if (p && frasesOriginais[numero]) {
    p.innerText = frasesOriginais[numero];
    p.style.display = 'block';
  }
}
