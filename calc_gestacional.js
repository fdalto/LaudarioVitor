$(document).ready(function() {

    // 1. Configurações Iniciais
    $('.datepicker').mask('00/00/0000');
    
    $('.datepicker').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
        dayNames: ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'],
        dayNamesMin: ['D','S','T','Q','Q','S','S'],
        monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
        monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
    });

    // 2. Controle de Abas
    $('#criteriocalc').change(function() {
        var metodo = $(this).val();
        $('.input-section').hide(); 
        $('#result-container').hide();
        $('.error-msg').hide();
        $('input').val(''); // Limpa inputs

        if(metodo === 'dum') $('#section-dum').fadeIn();
        else if (metodo === 'dpp') $('#section-dpp').fadeIn();
        else if (metodo === 'usg') $('#section-usg').fadeIn();
    });

    // 3. Função de Calcular (Lógica Avançada)
    $('#btn-calcular').click(function() {
        var metodo = $('#criteriocalc').val();
        var hoje = moment(); 
        
        // Vamos normalizar tudo para encontrar a DUM (Data da Última Menstruação)
        // A partir da DUM, calculamos todo o resto.
        var dumCalculada = null; 

        $('.error-msg').hide();
        $('#result-container').hide();

        try {
            // --- CÁLCULO DA DUM BASE ---
            
            if (metodo === 'dum') {
                var inputDum = $('#input-dum').val();
                if(!isValidDate(inputDum)) throw "Data inválida.";
                dumCalculada = moment(inputDum, "DD/MM/YYYY");
            }
            
            else if (metodo === 'dpp') {
                var inputDpp = $('#input-dpp').val();
                if(!isValidDate(inputDpp)) throw "Data inválida.";
                // Se sabemos a DPP, a DUM foi 280 dias antes
                dumCalculada = moment(inputDpp, "DD/MM/YYYY").subtract(280, 'days');
            }

            else if (metodo === 'usg') {
                var inputDataUsg = $('#input-usg-data').val();
                var semanasUSG = parseInt($('#input-usg-semanas').val()) || 0;
                var diasUSG = parseInt($('#input-usg-dias').val()) || 0;

                if(!isValidDate(inputDataUsg)) throw "Data do exame inválida.";
                
                var dataExame = moment(inputDataUsg, "DD/MM/YYYY");
                
                // Calcula quantos dias de vida o feto tinha na data do exame
                var idadeNoExameEmDias = (semanasUSG * 7) + diasUSG;
                
                // A DUM teórica é: Data do Exame menos a Idade no Exame
                dumCalculada = dataExame.clone().subtract(idadeNoExameEmDias, 'days');
            } 
            else {
                throw "Selecione um método de cálculo.";
            }

            // --- CÁLCULOS FINAIS (Derivados da DUM) ---
            
            // 1. Data Provável do Parto (DUM + 280 dias)
            var dppFinal = dumCalculada.clone().add(280, 'days');
            
            // 2. Data Provável da Concepção (DUM + 14 dias - média padrão)
            var concepcaoFinal = dumCalculada.clone().add(14, 'days');
            
            // 3. Idade Gestacional Hoje (Hoje - DUM)
            var idadeEmDiasHoje = hoje.diff(dumCalculada, 'days');

            // --- VALIDAÇÕES ---
            if (idadeEmDiasHoje < 0) throw "A data informada resulta em uma gravidez futura.";
            if (idadeEmDiasHoje > 308) throw "A data informada ultrapassa 44 semanas.";

            // --- FORMATAÇÃO DO RESULTADO ---
            var semanasFinais = Math.floor(idadeEmDiasHoje / 7);
            var diasFinais = idadeEmDiasHoje % 7;

            // Monta o HTML do Relatório
            var htmlRelatorio = `
                <div class="linha-resultado">Cálculos baseados na data de <strong>${hoje.format('DD/MM/YYYY')}</strong></div>
                <div class="linha-resultado">Data estimada da última menstruação: <strong>${dumCalculada.format('DD/MM/YYYY')}</strong></div>
                <div class="linha-resultado">Data provável da concepção: <strong>${concepcaoFinal.format('DD/MM/YYYY')}</strong></div>
                <div class="linha-resultado">Data provável do parto: <strong>${dppFinal.format('DD/MM/YYYY')}</strong></div>
                <hr>
                <div class="destaque-final">Idade gestacional hoje: <span class="texto-grande">${semanasFinais} semanas e ${diasFinais} dias</span></div>
            `;

            // Injeta no HTML e mostra
            $('#result-content').html(htmlRelatorio);
            $('#result-container').fadeIn();

        } catch (erro) {
            $('.error-msg').text(erro).fadeIn();
        }
    });

    function isValidDate(dateString) {
        return moment(dateString, 'DD/MM/YYYY', true).isValid();
    }
});