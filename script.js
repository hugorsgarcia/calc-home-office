let dataReferenciaUsuario;
let tipoSemanaReferenciaUsuario;

const TIPO_PRESENCIAL = 'presencial';
const TIPO_HOME = 'home';
const MS_POR_DIA = 1000 * 60 * 60 * 24;

const seletorData = document.getElementById('seletor-data');
const botaoVerificar = document.getElementById('botao-verificar');
const areaResultado = document.getElementById('area-resultado');
const textoResultado = document.getElementById('texto-resultado');
const mesAnoCalendario = document.getElementById('mes-ano-calendario');
const gradeCalendario = document.getElementById('grade-calendario');

const seletorTipoSemanaAtual = document.getElementById('tipo-semana-atual');

function obterSegundaFeira(data) {
    const d = new Date(data);
    const dia = d.getDay();
    const diferenca = d.getDate() - dia + (dia === 0 ? -6 : 1); 
    const segundaFeira = new Date(d.setDate(diferenca));
    segundaFeira.setHours(0, 0, 0, 0);
    return segundaFeira;
}

function obterTipoSemana(data) {
    if (!dataReferenciaUsuario || !tipoSemanaReferenciaUsuario) {
        return 'desconhecido'; 
    }

    const segundaDaSemanaSelecionada = obterSegundaFeira(data);
    
    const diferencaDias = (segundaDaSemanaSelecionada - dataReferenciaUsuario) / MS_POR_DIA;
    
    const diferencaSemanas = Math.round(diferencaDias / 7);

    const semanaPar = diferencaSemanas % 2 === 0;

    if (semanaPar) {
        return tipoSemanaReferenciaUsuario;
    } else {
        return tipoSemanaReferenciaUsuario === TIPO_PRESENCIAL ? TIPO_HOME : TIPO_PRESENCIAL; 
    }
}

function gerarCalendario(ano, mes, dataSelecionada) {
    gradeCalendario.innerHTML = '';

    const nomeMes = new Date(ano, mes).toLocaleString('pt-BR', { month: 'long' });
    mesAnoCalendario.textContent = `${nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)} de ${ano}`;
    
    const primeiroDiaMes = new Date(ano, mes, 1).getDay();
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();

    for (let i = 0; i < primeiroDiaMes; i++) {
        const celulaVazia = document.createElement('div');
        gradeCalendario.appendChild(celulaVazia);
    }

    for (let dia = 1; dia <= diasNoMes; dia++) {
        const celula = document.createElement('div');
        const dataAtual = new Date(ano, mes, dia);
        const diaSemana = dataAtual.getDay();
        const tipoSemana = obterTipoSemana(dataAtual);

        celula.textContent = dia;
        
        let classesCelula = 'aspect-square flex items-center justify-center rounded-full text-xs sm:text-sm transition-all';
        
        if (diaSemana >= 1 && diaSemana <= 5) {
            if (tipoSemana === TIPO_PRESENCIAL) {
                classesCelula += ' bg-red-100 text-red-800';
            } else if (tipoSemana === TIPO_HOME) {
                classesCelula += ' bg-green-100 text-green-800';
            }
        } else {
            classesCelula += ' text-gray-500'; 
        }

        if (dia === dataSelecionada.getDate()) {
            classesCelula += ' ring-2 ring-blue-500 font-bold scale-110';
            if (diaSemana >= 1 && diaSemana <= 5) {
                 if (tipoSemana === TIPO_PRESENCIAL) {
                    classesCelula += ' text-red-800';
                } else if (tipoSemana === TIPO_HOME) {
                    classesCelula += ' text-green-800';
                }
            } else {
                classesCelula += ' text-gray-500';
            }
        }

        celula.className = classesCelula;
        gradeCalendario.appendChild(celula);
    }
}

function definirDataMinima() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = (hoje.getMonth() + 1).toString().padStart(2, '0');
    const dia = hoje.getDate().toString().padStart(2, '0');
    seletorData.setAttribute('min', `${ano}-${mes}-${dia}`);
}

botaoVerificar.addEventListener('click', () => {
    const textoDataSelecionada = seletorData.value;

    const tipoSemanaAtual = seletorTipoSemanaAtual.value;
    
    dataReferenciaUsuario = obterSegundaFeira(new Date());
    tipoSemanaReferenciaUsuario = tipoSemanaAtual;

    if (!textoDataSelecionada) {
        textoResultado.textContent = "Por favor, selecione uma data.";
        textoResultado.className = 'text-xl font-semibold text-center mb-5 text-yellow-600';
        areaResultado.classList.remove('hidden');
        mesAnoCalendario.textContent = '';
        gradeCalendario.innerHTML = '';
        return;
    }

    if (!tipoSemanaReferenciaUsuario || tipoSemanaReferenciaUsuario === "") {
        textoResultado.textContent = "Por favor, selecione o regime da sua semana atual.";
        textoResultado.className = 'text-xl font-semibold text-center mb-5 text-yellow-600';
        areaResultado.classList.remove('hidden');
        mesAnoCalendario.textContent = '';
        gradeCalendario.innerHTML = '';
        return;
    }

    const dataSelecionada = new Date(textoDataSelecionada + 'T00:00:00');
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    if (dataSelecionada < hoje) {
        textoResultado.textContent = "Data inválida. Selecione a partir de hoje.";
        textoResultado.className = 'text-xl font-semibold text-center mb-5 text-red-600';
        areaResultado.classList.remove('hidden');
        mesAnoCalendario.textContent = '';
        gradeCalendario.innerHTML = '';
        return;
    }

    const tipoSemana = obterTipoSemana(dataSelecionada);
    const dataFormatada = dataSelecionada.toLocaleDateString('pt-BR'); 
    const nomeTipo = tipoSemana === TIPO_PRESENCIAL ? 'Presencial' : 'Home Office';
    const corTipo = tipoSemana === TIPO_PRESENCIAL ? 'text-red-600' : 'text-green-600';

    textoResultado.innerHTML = `A semana de <span class="font-bold">${dataFormatada}</span> é: <span class="font-bold ${corTipo}">${nomeTipo}</span>`;
    textoResultado.className = 'text-xl font-semibold text-center mb-5 text-gray-800';

    gerarCalendario(dataSelecionada.getFullYear(), dataSelecionada.getMonth(), dataSelecionada);

    areaResultado.classList.remove('hidden');
});

function inicializarAplicacao() {
    definirDataMinima();
}

window.onload = inicializarAplicacao;
