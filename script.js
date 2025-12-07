let extras = [];

window.onload = () => {
  const hoje = new Date().toLocaleDateString('fr-CA');
  document.getElementById("data").value = hoje;

  document.getElementById("valorBase").addEventListener("input", calcularTotal);

  ["garantia3m","garantia6m","garantia1a"].forEach(id=>{
    document.getElementById(id).addEventListener("change", e=>{
      if(e.target.checked)
        ["garantia3m","garantia6m","garantia1a"]
          .filter(g=>g!==id)
          .forEach(g=>document.getElementById(g).checked=false);
    });
  });
};

function formatar(valor){
  const n = parseFloat(valor);
  return isNaN(n) ? "0,00" : n.toFixed(2).replace('.', ',');
}

function addServicoExtra(){
  const nome = document.getElementById("nomeExtra").value.trim().toUpperCase();
  const valor = parseFloat(document.getElementById("valorExtra").value.replace(',', '.'));

  if(!nome || isNaN(valor)) return;

  extras.push({ nome, valor });
  document.getElementById("nomeExtra").value = "";
  document.getElementById("valorExtra").value = "";
  renderExtras();
  calcularTotal();
}

function renderExtras(){
  const lista = document.getElementById("listaExtras");
  lista.innerHTML = "";

  extras.forEach((e, i) => {
    const li = document.createElement("li");
    li.innerHTML = `${e.nome} (R$ ${formatar(e.valor)})`;

    const btn = document.createElement("button");
    btn.textContent = "x";
    btn.onclick = () => {
      extras.splice(i, 1);
      renderExtras();
      calcularTotal();
    };

    li.appendChild(btn);
    lista.appendChild(li);
  });
}

function calcularTotal(){
  const base = parseFloat(document.getElementById("valorBase").value.replace(',', '.')) || 0;
  const totalExtras = extras.reduce((s, e) => s + e.valor, 0);
  const total = base + totalExtras;

  document.getElementById("totalCalculado").value =
    total > 0 ? `R$ ${formatar(total)}` : "";

  return formatar(total);
}

function gerarTextoGarantia(){
  const veiculo = document.getElementById("veiculo").value.trim().toUpperCase();
  const placa = document.getElementById("placa").value.trim().toUpperCase();
  const data = document.getElementById("data").value || "-";
  const base = parseFloat(document.getElementById("valorBase").value.replace(',', '.')) || 0;
  const total = calcularTotal();

  const dianteiro = [];
  const traseiro = [];

  if(dianteiroDir.checked) dianteiro.push("Direito");
  if(dianteiroEsq.checked) dianteiro.push("Esquerdo");
  if(dianteiroPar.checked) dianteiro.push("Par");
  if(traseiroDir.checked) traseiro.push("Direito");
  if(traseiroEsq.checked) traseiro.push("Esquerdo");
  if(traseiroPar.checked) traseiro.push("Par");

  const central = amortecedorCentral.checked ? "Sim" : null;

  let garantia = null;
  if(garantia3m.checked) garantia = "3 meses";
  if(garantia6m.checked) garantia = "6 meses";
  if(garantia1a.checked) garantia = "1 ano";

  let validade = "-";
  if(data !== "-" && garantia){
    const d = new Date(data);
    if(garantia === "3 meses") d.setMonth(d.getMonth() + 3);
    if(garantia === "6 meses") d.setMonth(d.getMonth() + 6);
    if(garantia === "1 ano") d.setFullYear(d.getFullYear() + 1);
    validade = d.toLocaleDateString('pt-BR');
  }

  const agora = new Date();
  const dataHora = agora.toLocaleDateString('pt-BR') + 
                   " às " +
                   agora.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});

  const listaServicos = extras.length
    ? extras.map(e=>`- ${e.nome} (R$ ${formatar(e.valor)})`).join("\n")
    : "";

  let texto = "---------------------------------\n";
  texto+="Real Car Amortecedores\n";
  texto+="Recondicionamos amortecedores\npara carros nacionais e importados\ncom garantia.\n";
  texto+="Rua Sargento Lauro Pereira da Silva, S/N - Box 15\n";
  texto+="Fone: (83) 99860-5077 - João Pessoa - PB\n";
  texto+="---------------------------------\n\n";

  if(veiculo) texto+=`Veículo: ${veiculo}\n`;
  if(placa) texto+=`Placa: ${placa}\n`;
  if(dianteiro.length) texto+=`Amortecedor Dianteiro: ${dianteiro.join(", ")}\n`;
  if(traseiro.length) texto+=`Amortecedor Traseiro: ${traseiro.join(", ")}\n`;
  if(central) texto+=`Amortecedor Central: ${central}\n`;

  if(garantia) texto+=`Garantia: ${garantia}\n`;

  texto+=`Data da Venda: ${data}\nValidade até: ${validade}\n\n`;
  if(base>0) texto+=`Valor Base: R$ ${formatar(base)}\n`;

  if(listaServicos) texto+=`Serviços Extras:\n${listaServicos}\n`;

  texto+=`\nTotal: R$ ${total}\n\n`;
  texto+="Assinatura: ______________________\n\n";
  texto+=`Emitido em: ${dataHora}\n`;
  texto+="---------------------------------";

  return texto;
}

function imprimir(){
  document.getElementById("printArea").innerText = gerarTextoGarantia();
  setTimeout(() => window.print(), 100);
}

function enviarWhatsApp(){
  let numero = document.getElementById("telefoneCliente").value.trim();
  if(!numero){
    alert("Informe o número do cliente com DDD.");
    return;
  }

  numero = numero.replace(/\D/g, "");
  if(numero.length < 10){
    alert("Número inválido.");
    return;
  }

  const mensagem = encodeURIComponent(
    "Olá! Aqui é da Real Car Amortecedores.\n\nSegue abaixo a garantia referente ao serviço realizado no seu veículo.\n\nReal Car Amortecedores\nDistrito Mecânico - Box 15\nJoão Pessoa - PB\n(83) 99860-5077\n\nQualquer dúvida, estamos à disposição!"
  );

  window.open(`https://wa.me/55${numero}?text=${mensagem}`, "_blank");
}
