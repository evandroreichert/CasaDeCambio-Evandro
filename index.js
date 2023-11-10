var dataAtual = new Date();
var dia = String(dataAtual.getDate()).padStart(2, '0');
var mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
var ano = dataAtual.getFullYear();

var dataFormatada = mes + '-' + dia + '-' + ano;

(async function () {
    let moedas = await buscarMoedasFETCH()
    carregarSelectMoedas(moedas)
})()

async function buscarMoedasFETCH() {
    var resposta = await fetch("https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/Moedas?$top=100&$format=json&$select=simbolo,nomeFormatado,tipoMoeda")
    return resposta.json();
}

function carregarSelectMoedas(moedas) {
    let listaMoedas = document.querySelectorAll('.selectMoedas')
    for (let i = 0; i < moedas.value.length; i++) {
        let optionMoeda = document.createElement("option")
        optionMoeda.value = moedas.value[i].simbolo
        optionMoeda.innerText = moedas.value[i].nomeFormatado

        listaMoedas.forEach(select => {
            select.appendChild(optionMoeda.cloneNode(true))
        })
    }
}

selectDe.addEventListener('change', async () => {
    let resposta = await fetch("https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaDia(moeda=@moeda,dataCotacao=@dataCotacao)?@moeda='" + selectDe.value + "'&@dataCotacao='" + dataFormatada + "'&$top=100&$format=json&$select=cotacaoCompra,cotacaoVenda,tipoBoletim");
    let enderecoOBJ = await resposta.json();

    let indiceAbertura = enderecoOBJ.value[0];
    cotacaoCompraEntrada = indiceAbertura.cotacaoCompra;
    cotacaoVendaEntrada = indiceAbertura.cotacaoVenda;
});

selectPara.addEventListener('change', async () => {
    let resposta = await fetch("https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaDia(moeda=@moeda,dataCotacao=@dataCotacao)?@moeda='" + selectPara.value + "'&@dataCotacao='" + dataFormatada + "'&$top=100&$format=json&$select=cotacaoCompra,cotacaoVenda,tipoBoletim");
    let enderecoOBJ = await resposta.json();

    let indiceAbertura = enderecoOBJ.value[0];
    cotacaoCompraSaida = indiceAbertura.cotacaoCompra;
    cotacaoVendaSaida = indiceAbertura.cotacaoVenda;
});

async function buscarCotacaoFETCH(moeda) {
    let resposta = await fetch("https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaDia(moeda=@moeda,dataCotacao=@dataCotacao)?@moeda='" + moeda + "'&@dataCotacao='" + dataFormatada + "'&$top=100&$format=json&$select=cotacaoCompra,cotacaoVenda,tipoBoletim");
    let enderecoOBJ = await resposta.json();

    let indiceAbertura = enderecoOBJ.value[0];
    return indiceAbertura;
}

document.getElementById('converter').addEventListener('click', async function () {
    let moedaDe = document.getElementById('selectDe').value;
    let moedaPara = document.getElementById('selectPara').value;
    let valor = Number(document.getElementById('valorInput').value);
    let operacao = document.querySelector('input[name="operacao"]:checked').value;

    let cotacaoDe
    let cotacaoPara

    if (moedaDe == 'BRL') {
        cotacaoDe = 1;
    } else{
        let cotacoesSelectDe = await buscarCotacaoFETCH(moedaDe);
        cotacaoDe = operacao === 'comprar' ? cotacoesSelectDe.cotacaoVenda : cotacoesSelectDe.cotacaoCompra;
    }

    if (moedaPara == 'BRL') {
        cotacaoPara = 1;
    } else{
        let cotacoesSelectPara = await buscarCotacaoFETCH(moedaPara);
        cotacaoPara = operacao === 'comprar' ? cotacoesSelectPara.cotacaoCompra : cotacoesSelectPara.cotacaoVenda;
    }

    let cotacaoFinal = cotacaoDe * valor / cotacaoPara;

    document.querySelector('#iOut').innerText = `Valor convertido: ${moedaPara} ${cotacaoFinal.toFixed(2)}`;

    let toast = new bootstrap.Toast(document.querySelector('.toast'));
    toast.show();
});

document.getElementById('inverter').addEventListener('click', function () {
    let moedaDe = document.getElementById('selectDe').value;
    let moedaPara = document.getElementById('selectPara').value;

    document.getElementById('selectDe').value = moedaPara;
    document.getElementById('selectPara').value = moedaDe;
});

