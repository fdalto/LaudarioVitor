// Função para alternar a visualização das seções de botões conforme o método selecionado
function showSection(method) {
  document.getElementById("ultrassom-section").style.display = (method === "ultrassom") ? "flex" : "none";
  document.getElementById("tomografia-section").style.display = (method === "tomografia") ? "flex" : "none";
  document.getElementById("ressonancia-section").style.display = (method === "ressonancia") ? "flex" : "none";
  
  // Atualiza o estilo dos botões de método
  document.getElementById("btn-ultrassom").className = (method === "ultrassom") ? "ativo" : "inativo";
  document.getElementById("btn-tomografia").className = (method === "tomografia") ? "ativo" : "inativo";
  document.getElementById("btn-ressonancia").className = (method === "ressonancia") ? "ativo" : "inativo";
}

// Eventos dos botões de seleção de método
document.getElementById("btn-ultrassom").addEventListener("click", function() {
  showSection("ultrassom");
});
document.getElementById("btn-tomografia").addEventListener("click", function() {
  showSection("tomografia");
});
document.getElementById("btn-ressonancia").addEventListener("click", function() {
  showSection("ressonancia");
});

// Exemplo de evento para o botão "Joelho"
document.getElementById("joelho-rm").addEventListener("click", function() {
  console.log("Articulação selecionada: Joelho");
});

function monitorBottomButtons() {
    // Seleciona todos os botões dentro da seção inferior
    const bottomButtons = document.querySelectorAll('.bottom-section button');
    
    bottomButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Atualiza o sessionStorage com o ID do botão clicado
        sessionStorage.setItem("selectedReport", this.id);
        console.log("Botão clicado:", this.id);
      });
    });
  }
  
  // Chama a função quando o DOM estiver completamente carregado
  document.addEventListener('DOMContentLoaded', monitorBottomButtons);
  
  // Função que checa se o arquivo JSON existe para um determinado botão
function checkJSONFile(button) {
    const id = button.id;
    const url = `json/${id}/frasesOriginais.json`;
  
    fetch(url, { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          // Arquivo encontrado: ativa o botão
          button.disabled = false;
          // Se desejar, pode alterar também o estilo (ex.: adicionando uma classe "ativo")
          button.classList.remove('disabled-style');
        } else {
          console.log(`Arquivo não encontrado: ${url}`);
        }
      })
      .catch(error => {
        console.error(`Erro ao verificar ${url}:`, error);
      });
  }
  
  // Função que itera por todos os botões da sessão inferior e verifica seus arquivos JSON
  function checkAndActivateButtons() {
    // Seleciona todos os botões dentro de qualquer div com a classe bottom-section
    const buttons = document.querySelectorAll('.bottom-section button');
    buttons.forEach(button => {
      checkJSONFile(button);
    });
  }
  
  // Executa a função assim que o DOM for carregado
  document.addEventListener('DOMContentLoaded', checkAndActivateButtons);
  