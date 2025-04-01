window.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startButton');
    const statusBox = document.getElementById('voiceRecognizeDiv');
    const campo = document.getElementById('campoRelatorio');
  
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
    if (!SpeechRecognition) {
      statusBox.textContent = "Reconhecimento de voz não suportado neste navegador.";
      startButton.disabled = true;
      return;
    }
  
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = true;
    recognition.continuous = false;
  
    let finalTranscript = '';
  
    recognition.onstart = () => {
      statusBox.textContent = "Ouvindo...";
      finalTranscript = '';
    };
  
    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        let texto = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          texto = tratarTextoReconhecido(texto);
          finalTranscript += texto;
        } else {
          interim += texto;
        }
      }
      statusBox.textContent = finalTranscript + interim;
    };
  
    recognition.onerror = (event) => {
      statusBox.textContent = "Erro: " + event.error;
    };
  
    recognition.onend = () => {
      statusBox.textContent = "Status: ?";
      startButton.classList.remove('ativo') // Retira borda vermelha no botão
      if (finalTranscript.trim()) {
        inserirNoCursor(finalTranscript.trim());
        finalTranscript = '';
      }
    };
  
    startButton.onclick = () => {
      recognition.start();
      startButton.classList.add('ativo')
    };
  
    function inserirNoCursor(texto) {
      const sel = window.getSelection();
      if (!sel.rangeCount) return;
    
      const range = sel.getRangeAt(0);
      const prefixo = range.startContainer.textContent?.substring(0, range.startOffset) || "";
      const charAnterior = prefixo.slice(-1);
    
      const terminaFrase = /[.!?]$/.test(prefixo.trimEnd());
      const coladoEmPonto = charAnterior === ".";
    
      if ((terminaFrase || coladoEmPonto) && texto.length > 0) {
        texto = texto[0].toUpperCase() + texto.slice(1);
        if (coladoEmPonto) texto = " " + texto;
      }
    
      range.deleteContents();
      range.insertNode(document.createTextNode(texto + " "));
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  
    const keyReplacesDefault = [
        { key: /parágrafo/ig, value: '<br/>' },
        { key: /nova linha/ig, value: '<br/>' },
    
        { key: /\n /ig, value: '<br/>' },
        { key: /\n/ig, value: '<br/>' },
    
        // Ponto e Vírgula
        { key: / ponto e virgula/ig, value: ';'},
        { key: /ponto e virgula/ig, value: ';'},
        { key: / ponto e vírgula/ig, value: ';'},
        { key: /ponto e vírgula/ig, value: ';'},
    
        // Dois Pontos
        { key: / 2 pontos/ig, value: ':'},
        { key: /2 pontos/ig, value: ':'},
        { key: / dois pontos/ig, value: ':'},
        { key: /dois pontos/ig, value: ':'},
    
        // Ponto
        { key: / pontos/ig, value: '.'},
        { key: /pontos/ig, value: '.'},
        { key: / ponto/ig, value: '.'},
        { key: /ponto/ig, value: '.'},
    
        // Virgula
        { key: / virgula/ig, value: ','},
        { key: /virgula/ig, value: ','},
        { key: / vírgula/ig, value: ','},
        { key: /vírgula/ig, value: ','},
    
        // Abre e fecha Parênteses
        { key: /abre parênteses/ig, value: '('},
        { key: /abre parenteses/ig, value: '('},
        { key: /abre parêntese/ig, value: '('},
        { key: /abre parentese/ig, value: '('},
        { key: /fecha parênteses/ig, value: ')'},
        { key: /fecha parenteses/ig, value: ')'},
        { key: /fecha parêntese/ig, value: ')'},
        { key: /fecha parentese/ig, value: ')'},
    
        // Asteristico
        { key: /asterisco/ig, value: '*'},
    
        // Traço
        //{ key: /traço/ig, value: '-'},
    
        // Barra e contra barra
        { key: /barra/ig, value: '/'},
        { key: /barra/ig, value: '/'},
        { key: /contra-barra/ig, value: '\\'},
        { key: /contra barra/ig, value: '\\'},
    
        // Palavras Médicas
        { key: /c\*\*\*\*/ig, value: 'corno'},
        { key: /cognutiva/ig, value: 'cominutiva'},
        // Adicione outras substituições conforme necessário
    ];
    
    // Substituição de palavras-chave faladas
    function replaceKeys(text) {
        keyReplacesDefault.forEach(function (item) {
            text = text.replace(item.key, item.value);
        });
        return text;
    }
  
    // Capitaliza a primeira letra após ponto final
    function capitalizeAfterPeriod(text) {
      return text.replace(/([.?!]\\s+)([a-zà-ú])/g, (_, sep, char) => sep + char.toUpperCase());
    }

    // Função para ajustar medidas no formato especificado, adicionando cálculo de volume
    function ajusteMedidas(text) {
    // Expressão regular para capturar sequências com dois números decimais seguidos de "por" e uma unidade (cm ou mm)
    const regex2Numbers = /(\d+[\.,]?\d*)\s*por\s*(\d+[\.,]?\d*)\s*(cm|mm)/ig;
    
    // Expressão regular para capturar sequências com três números decimais seguidos de "por" e uma unidade (cm ou mm)
    const regex3Numbers = /(\d+[\.,]?\d*)\s*por\s*(\d+[\.,]?\d*)\s*por\s*(\d+[\.,]?\d*)\s*(cm|mm)/ig;
    
    // Substitui as sequências com três números e adiciona o cálculo de volume
    text = text.replace(regex3Numbers, function(match, num1, num2, num3, unit) {
        // Converter as strings para números substituindo a vírgula por ponto para cálculo
        let valor1 = parseFloat(num1.replace(",", "."));
        let valor2 = parseFloat(num2.replace(",", "."));
        let valor3 = parseFloat(num3.replace(",", "."));

        // Cálculo do volume
        let volume = (valor1 * valor2 * valor3 * 0.52).toFixed(1);  // Dois decimais

        // Formatação do volume com vírgula
        volume = volume.replace(".", ",");

        return `${num1} ${unit} x ${num2} ${unit} x ${num3} ${unit} (vol.: ${volume} ${unit}³)`;
    });
    
    // Substitui as sequências com dois números
    text = text.replace(regex2Numbers, function(match, num1, num2, unit) {
        return `${num1} ${unit} x ${num2} ${unit}`;
    });

    return text;
    }
  
    // Função para aplicar todos os tratamentos ao texto reconhecido
    function tratarTextoReconhecido(texto) {
      texto = replaceKeys(texto);
      texto = ajusteMedidas(texto);
      texto = capitalizeAfterPeriod(texto);
      return texto.trim();
    }
  });
  