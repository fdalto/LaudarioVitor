// editor_relatorios/copia_epacs.js
(() => {
  const btn = document.getElementById('copyEpacsButton');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const campo = document.getElementById('campoRelatorio');
    if (!campo) return;

    // 1) Coleta só <p> com texto útil (ignora <p>&nbsp;</p>, <p><br></p>, etc.)
    const linhas = Array.from(campo.querySelectorAll('p'))
      .map(p => p.textContent.trim())
      .filter(t => t.length);

    /* 2) Cria bloco de texto sem linhas extras.
          Se precisar manter linha em branco simples (por ex. entre descrição e impressão),
          substitua '\n' por '\n\n' onde quiser. */
    const texto = linhas.join('\n');

    // 3) Copia para a área de transferência
    navigator.clipboard.writeText(texto)
      .then(() => alert('Conteúdo copiado!'))
      .catch(err => alert('Falha ao copiar: ' + err));
  });
})();
