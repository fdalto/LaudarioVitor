// Carregamento dinâmico de frases e substituições a partir de arquivos JSON
Promise.all([
  fetch('frasesOriginais.json').then(res => res.json()),
  fetch('substituicoes.json').then(res => res.json())
]).then(([frasesOriginaisArray, substituicoesArray]) => {

  // Objetos que serão preenchidos dinamicamente com os dados dos JSONs
  const frasesOriginais = {};            // Frases normais numeradas
  const substituicoes = {};              // Frases alternativas agrupadas por número
  const rotulosAlternativos = {};        // Rótulo resumido de cada alternativa patologica

  // Preenche frasesOriginais a partir do JSON
  frasesOriginaisArray.forEach(({ numero, frase }) => {
    frasesOriginais[numero] = frase;
  });

  // Preenche substituicoes e rotulosAlternativos a partir do JSON
  substituicoesArray.forEach(({ numero, codigo, resumo, frase }) => {
    if (!substituicoes[numero]) substituicoes[numero] = [];
    substituicoes[numero].push(frase);              // Lista de alternativas
    rotulosAlternativos[codigo] = resumo;           // Código -> Rotulo
  });

  // Monta dinamicamente o menu lateral
  montarMenu(frasesOriginais, substituicoes, rotulosAlternativos);
});

// Gera os botões no menu lateral a partir das frases e substituições
function montarMenu(frasesOriginais, substituicoes, rotulosAlternativos) {
  const menuDiv = document.getElementById('menu');

  Object.entries(frasesOriginais).forEach(([numero, fraseNormal]) => {
    const grupo = document.createElement('div');
    grupo.classList.add('grupo');

    // Cria botão de restaurar para a frase original
    const normal = document.createElement('span');
    normal.className = 'normal';
    normal.innerHTML = `<span class="numero-verde">${numero}</span> Normal`;
    normal.style.cursor = 'pointer';
    normal.onclick = () => restaurarFrase(numero, frasesOriginais);
    grupo.appendChild(normal);

    // Cria os botões das substituições, com texto resumido
    if (substituicoes[numero]) {
      substituicoes[numero].forEach((frase, idx) => {
        const chave = `${numero}${String.fromCharCode(97 + idx)}`;  // Ex: "4d"
        const resumo = rotulosAlternativos[chave] || frase.substring(0, 40) + "...";

        const botao = document.createElement('button');
        botao.className = 'frase';
        botao.innerText = resumo;
        botao.onclick = () => substituirFrase(numero, frase);
        grupo.appendChild(botao);
      });
    }

    // Adiciona o grupo ao menu
    menuDiv.appendChild(grupo);
  });
}

// Substitui o conteúdo da linha do relatório por uma nova frase
function substituirFrase(numero, novaFrase) {
  const p = document.querySelector(`p[data-linha='${numero}']`);
  if (p) {
    p.innerText = `- ${novaFrase}`;
    p.style.display = 'block';
  }
}

// Restaura a frase original da linha com base em frasesOriginais
function restaurarFrase(numero, frasesOriginais) {
  const p = document.querySelector(`p[data-linha='${numero}']`);
  if (p && frasesOriginais[numero]) {
    p.innerText = frasesOriginais[numero];
    p.style.display = 'block';
  }
}
