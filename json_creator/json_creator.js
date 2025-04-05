// recebe do site anterior o modelo selecionado
const selectedReport = sessionStorage.getItem("selectedReport");
if (!selectedReport) {
  // Se não encontrar, redireciona para a página index
  window.location.href = "index.html";
} else {
  console.log("Tipo de relatório:", selectedReport);
}

// Função para carregar um arquivo JSON
function loadJSON(url) {
  return fetch(url).then(response => response.json());
}

// Cria o bloco para cada número com os dados originais e suas substituições
function createBlock(numero, dataOriginal, substituicoesGroup) {
  var blockDiv = document.createElement('div');
  blockDiv.className = 'block';
  // Armazena o número exatamente como recebido
  blockDiv.dataset.number = numero;
  
  // Cabeçalho: número (não editável) e rótulo (editável)
  var headerDiv = document.createElement('div');
  var numberSpan = document.createElement('span');
  numberSpan.className = 'number';
  numberSpan.textContent = numero + '.';
  headerDiv.appendChild(numberSpan);
  
  var rotuloDiv = document.createElement('span');
  rotuloDiv.className = 'rotulo';
  var rotuloInput = document.createElement('input');
  rotuloInput.type = 'text';
  rotuloInput.value = dataOriginal.rotulo || '';
  rotuloDiv.appendChild(rotuloInput);
  headerDiv.appendChild(rotuloDiv);
  blockDiv.appendChild(headerDiv);
  
  // Frase original (campo somente leitura)
  var originalDiv = document.createElement('div');
  originalDiv.className = 'original-phrase';
  var originalInput = document.createElement('input');
  originalInput.type = 'text';
  originalInput.value = dataOriginal.frase || '';
  //originalInput.readOnly = true;
  originalDiv.appendChild(originalInput);
  blockDiv.appendChild(originalDiv);
  
  // Cria os blocos de substituições (se houver)
  if (substituicoesGroup && substituicoesGroup.length > 0) {
    var subsContainer = document.createElement('div');
    subsContainer.className = 'substituicoes';
    substituicoesGroup.forEach(function(sub) {
      var subDiv = document.createElement('div');
      subDiv.className = 'substituicao';
      subDiv.dataset.codigo = sub.codigo;
      
      // Define o tipo, considerando "substituicao" caso não esteja definido
      var tipo = sub.tipo || "substituicao";
      
      // Linha com código e resumo (campo editável)
      var summaryLine = document.createElement('div');
      summaryLine.className = 'summary-line';
      var codeSpan = document.createElement('span');
      codeSpan.textContent = sub.codigo;
      summaryLine.appendChild(codeSpan);
      var resumoInput = document.createElement('input');
      resumoInput.type = 'text';
      resumoInput.value = sub.resumo || '';
      summaryLine.appendChild(resumoInput);
      subDiv.appendChild(summaryLine);
      
      // Linha com a frase alterada ou script (campo editável)
      var phraseLine = document.createElement('div');
      phraseLine.className = 'phrase-line';
      var fraseInput = document.createElement('input');
      fraseInput.type = 'text';
      if (tipo === "matematica") {
        // Se for do tipo matemática, o campo representa o script
        fraseInput.value = sub.script || '';
      } else {
        fraseInput.value = sub.frase || '';
      }
      phraseLine.appendChild(fraseInput);
      subDiv.appendChild(phraseLine);
      
      // Linha com a conclusão (campo editável)
      var conclLine = document.createElement('div');
      conclLine.className = 'conclusion-line';
      var conclInput = document.createElement('input');
      conclInput.type = 'text';
      if (tipo === "matematica") {
        conclInput.value = "";
      } else {
        conclInput.value = sub.conclusao || '';
      }
      conclLine.appendChild(conclInput);
      subDiv.appendChild(conclLine);
      
      // Linha com o seletor de tipo (dropdown)
      var typeLine = document.createElement('div');
      typeLine.className = 'type-line';
      var typeSelect = document.createElement('select');
      var option1 = document.createElement('option');
      option1.value = "substituicao";
      option1.textContent = "Substituição";
      typeSelect.appendChild(option1);
      var option2 = document.createElement('option');
      option2.value = "complementar";
      option2.textContent = "Complementar";
      typeSelect.appendChild(option2);
      var option3 = document.createElement('option');
      option3.value = "matematica";
      option3.textContent = "Matemática";
      typeSelect.appendChild(option3);
      typeSelect.value = tipo;
      typeLine.appendChild(typeSelect);
      subDiv.appendChild(typeLine);
      
      // Define o estado inicial conforme o tipo
      if (typeSelect.value === "matematica") {
          fraseInput.placeholder = "Nome do Script";
          conclInput.disabled = true;
          conclInput.value = "";
          conclInput.placeholder = "Desabilitado para Matemática";
      } else {
          fraseInput.placeholder = "Frase alterada";
          conclInput.disabled = false;
          conclInput.placeholder = "";
      }
      
      // Atualiza os campos se o usuário mudar o tipo
      typeSelect.addEventListener('change', function() {
          if (typeSelect.value === "matematica") {
              fraseInput.placeholder = "Nome do Script";
              conclInput.disabled = true;
              conclInput.value = "";
              conclInput.placeholder = "Desabilitado para Matemática";
          } else {
              fraseInput.placeholder = "Frase alterada";
              conclInput.disabled = false;
              conclInput.placeholder = "";
          }
      });
      
      subsContainer.appendChild(subDiv);
    });
    blockDiv.appendChild(subsContainer);
  }
  
  return blockDiv;
}

// Função para salvar o JSON de frasesOriginais no formato desejado (array de objetos)
function saveOriginais() {
  var originaisArray = [];
  document.querySelectorAll('.block').forEach(function(block) {
    // Usa o número salvo no dataset, convertendo para número
    var numero = Number(block.dataset.number);
    var rotulo = block.querySelector('.rotulo input').value;
    var frase = block.querySelector('.original-phrase input').value;
    originaisArray.push({ numero: numero, rotulo: rotulo, frase: frase });
  });
  var dataStr = JSON.stringify(originaisArray, null, 2);
  var blob = new Blob([dataStr], { type: "application/json" });
  var url = URL.createObjectURL(blob);
  
  var a = document.createElement('a');
  a.href = url;
  a.download = "frasesOriginais_editado.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Função para salvar o JSON de substituicoes no formato desejado (array de objetos com o campo "numero")
function saveSubstituicoes() {
  var substituicoesArray = [];
  document.querySelectorAll('.substituicao').forEach(function(sub) {
    var parentBlock = sub.closest('.block');
    var numero = Number(parentBlock.dataset.number);
    var codigo = sub.dataset.codigo;
    var resumo = sub.querySelector('.summary-line input').value;
    var typeSelect = sub.querySelector('.type-line select');
    // Se o tipo não estiver definido, considera "substituicao"
    var tipo = typeSelect ? typeSelect.value : "substituicao";
    var phraseInput = sub.querySelector('.phrase-line input');
    var conclInput = sub.querySelector('.conclusion-line input');
    if (tipo === "matematica") {
      substituicoesArray.push({ 
        numero: numero, 
        codigo: codigo, 
        resumo: resumo, 
        tipo: tipo,
        script: phraseInput.value 
      });
    } else {
      substituicoesArray.push({ 
        numero: numero, 
        codigo: codigo, 
        resumo: resumo, 
        tipo: tipo,
        frase: phraseInput.value, 
        conclusao: conclInput.value 
      });
    }
  });
  var dataStr = JSON.stringify(substituicoesArray, null, 2);
  var blob = new Blob([dataStr], { type: "application/json" });
  var url = URL.createObjectURL(blob);
  
  var a = document.createElement('a');
  a.href = url;
  a.download = "substituicoes_editado.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Adiciona os event listeners aos botões de download
document.getElementById('download-originais-btn').addEventListener('click', saveOriginais);
document.getElementById('download-substituicoes-btn').addEventListener('click', saveSubstituicoes);

// Carrega os dois JSON e monta a página
Promise.all([
  loadJSON(`json/${selectedReport}/frasesOriginais.json`),
  loadJSON(`json/${selectedReport}/substituicoes.json`)
])
.then(function([originais, substituicoes]) {
  var content = document.getElementById('content');

  // Agrupa as substituições por número (extraindo a parte numérica do código, ex: "1a" -> "1")
  var subsPorNumero = {};
  if (Array.isArray(substituicoes)) {
    substituicoes.forEach(function(sub) {
      var match = sub.codigo.match(/^(\d+)/);
      if (match) {
        var num = match[1];
        if (!subsPorNumero[num]) {
          subsPorNumero[num] = [];
        }
        subsPorNumero[num].push(sub);
      }
    });
  } else {
    for (var key in substituicoes) {
      if (substituicoes.hasOwnProperty(key)) {
        var sub = substituicoes[key];
        var match = sub.codigo.match(/^(\d+)/);
        if (match) {
          var num = match[1];
          if (!subsPorNumero[num]) {
            subsPorNumero[num] = [];
          }
          subsPorNumero[num].push(sub);
        }
      }
    }
  }

  // Monta os blocos preservando o número conforme consta no arquivo
  if (Array.isArray(originais)) {
    // Se for array, utiliza o campo "numero" se existir, senão (index+1)
    originais.forEach(function(item, index) {
      var numero = (item.numero !== undefined) ? item.numero : (index + 1);
      var subsGroup = subsPorNumero[numero] || [];
      var block = createBlock(numero, item, subsGroup);
      content.appendChild(block);
    });
  } else {
    // Se for objeto, usa as chaves do próprio objeto
    var keys = Object.keys(originais);
    keys.sort(function(a, b) { return Number(a) - Number(b); });
    keys.forEach(function(key) {
      var dataOriginal = originais[key];
      var numero = key;
      var subsGroup = subsPorNumero[numero] || [];
      var block = createBlock(numero, dataOriginal, subsGroup);
      content.appendChild(block);
    });
  }
})
.catch(function(err) {
  console.error('Erro ao carregar os arquivos JSON:', err);
});
