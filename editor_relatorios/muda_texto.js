const campo = document.getElementById('campoRelatorio');

document.getElementById('fonte').addEventListener('change', function () {
    campo.style.fontFamily = this.value;
});

document.getElementById('tamanho').addEventListener('input', function () {
    campo.style.fontSize = this.value + 'px';
});

document.getElementById('cor').addEventListener('input', function () {
    campo.style.color = this.value;
});

