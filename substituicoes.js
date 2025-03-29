// Carregamento dinâmico de frases e substituições a partir de arquivos JSON
Promise.all([
  fetch('frasesOriginais.json').then(res => res.json()),
  fetch('substituicoes.json').then(res => res.json())
]).then(([frasesOriginaisArray, substituicoesArray]) => {

  const frasesOriginais = {};            // Frases normais numeradas
  const substituicoes = {};              // Frases alternativas agrupadas por número
  const rotulosAlternativos = {};        // Rótulo resumido de cada alternativa

  frasesOriginaisArray.forEach(({ numero, frase }) => {
    frasesOriginais[numero] = frase;
  });

  substituicoesArray.forEach((item) => {
    const { numero, codigo, resumo, frase, conclusao } = item;
    if (!substituicoes[numero]) substituicoes[numero] = [];
    substituicoes[numero].push(item); // guarda o objeto completo
    rotulosAlternativos[codigo] = resumo;
  });

  montarMenu(frasesOriginais, substituicoes, rotulosAlternativos);
});

const conclusaoDiv = document.getElementById('conclusao-dinamica');
const frasesConclusaoAtivas = new Map();

function atualizarConclusao(numero, texto) {
  frasesConclusaoAtivas.set(numero, texto);
  renderizarConclusao();
}

function removerConclusao(numero) {
  frasesConclusaoAtivas.delete(numero);
  renderizarConclusao();
}

function renderizarConclusao() {
  conclusaoDiv.innerHTML = "";
  frasesConclusaoAtivas.forEach((texto) => {
    const p = document.createElement("p");
    p.innerText = `- ${texto}`;
    conclusaoDiv.appendChild(p);
  });
}

const rotulosMenu = {
  1: "Ossos",
  2: "Derrame",
  3: "Fossa Poplítea",
  4: "Menisco Medial",
  5: "Menisco Lateral",
  6: "Ligamento Cruzado Anterior",
  7: "Ligamentos Colaterais",
  8: "Ligamento Cruzado Posterior",
  9: "Canto Posterolateral",
  10: "Pata de Ganso",
  11: "Bursa Infrapatelar",
  12: "Tendão Quadricipital/Patelar",
  13: "Gordura de Hoffa",
  14: "Cartilagem Femoropatelar",
  15: "Cartilagem Femorotibial Medial",
  16: "Cartilagem Femorotibial Lateral",
  17: "Patela / Tróclea",
  18: "Musculatura / Vasos",
  99: "Achado Adicional"
};

function montarMenu(frasesOriginais, substituicoes, rotulosAlternativos) {
  const menuDiv = document.getElementById('menu');

  Object.entries(frasesOriginais).forEach(([numero, fraseNormal]) => {
    const grupo = document.createElement('div');
    grupo.classList.add('grupo');

    const normal = document.createElement('span');
    normal.className = 'normal';
    const rotulo = rotulosMenu[numero] || "Normal";
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
