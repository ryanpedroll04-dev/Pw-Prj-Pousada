const areas = document.getElementById("areas");
const praia = document.getElementById("praia");
const dias = document.getElementById("dias");
const pessoas = document.getElementById("pessoas");
const cupom = document.getElementById("cupom");

let cupomAtivo = false;

function moeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function esconderResultado() {
  document
    .querySelectorAll(".resultado")
    .forEach((item) => item.classList.remove("mostrar"));
  document.getElementById("mensagemFinal").textContent = "";
}

function mostrarResultado() {
  document
    .querySelectorAll(".resultado")
    .forEach((item) => item.classList.add("mostrar"));
}

function calcular() {
  const qtdAreas = Number(areas.value);
  const qtdDias = Math.max(1, Number(dias.value) || 1);
  const qtdPessoas = Math.max(1, Number(pessoas.value) || 1);

  const precos = { 2: 220, 3: 300, 4: 390 };
  const pessoasIncluidas = { 2: 2, 3: 4, 4: 6, 6: 9 };

  let diaria = precos[qtdAreas];
  if (praia.value === "sim") diaria *= 1.2;

  const extras = Math.max(0, qtdPessoas - pessoasIncluidas[qtdAreas]) * 45;
  const subtotal = (diaria + extras) * qtdDias;

  let percentualEstadia = 0;
  if (qtdDias >= 7) percentualEstadia = 0.15;
  else if (qtdDias >= 4) percentualEstadia = 0.08;

  const descontoEstadia = subtotal * percentualEstadia;
  const depoisEstadia = subtotal - descontoEstadia;
  const descontoCupom = cupomAtivo ? depoisEstadia * 0.1 : 0;
  const total = depoisEstadia - descontoCupom;

  document.getElementById("subtotal").textContent = moeda(subtotal);
  document.getElementById("descontoEstadia").textContent =
    "- " + moeda(descontoEstadia);
  document.getElementById("descontoCupom").textContent =
    "- " + moeda(descontoCupom);
  document.getElementById("total").textContent = moeda(total);
  document.getElementById("descricaoReserva").innerHTML =
    `<strong>Detalhes:</strong><br>${qtdAreas} áreas • ${qtdDias} diária(s) • ${qtdPessoas} pessoa(s)<br>` +
    `${praia.value === "sim" ? "Próxima à praia" : "Localização padrão"}<br>` +
    `Valor por diária com hóspedes: ${moeda(diaria + extras)}`;

  return total;
}

[areas, praia, dias, pessoas].forEach((campo) =>
  campo.addEventListener("input", () => {
    esconderResultado();
    document.getElementById("folhaPagamento").style.display = "none";
    document.getElementById("botaoPagamento").textContent = "Concluir compra";
    document.getElementById("botaoPagamento").disabled = false;
    document.getElementById("botaoPagamento").style.opacity = "1";
    calcular();
  }),
);

document.getElementById("aplicarCupom").addEventListener("click", () => {
  const mensagem = document.getElementById("mensagemCupom");
  if (cupom.value.trim().toUpperCase() === "DIA100") {
    cupomAtivo = true;
    mensagem.textContent = "Cupom aplicado! Você ganhou mais 10% de desconto.";
    mensagem.style.color = "#19453c";
  } else {
    cupomAtivo = false;
    mensagem.textContent = "Cupom inválido. Confira o código digitado.";
    mensagem.style.color = "#a33";
  }
  esconderResultado();
  document.getElementById("folhaPagamento").style.display = "none";
  document.getElementById("botaoPagamento").textContent = "Concluir compra";
  document.getElementById("botaoPagamento").disabled = false;
  document.getElementById("botaoPagamento").style.opacity = "1";
  calcular();
});

cupom.addEventListener("input", () => {
  cupomAtivo = false;
  esconderResultado();
  document.getElementById("folhaPagamento").style.display = "none";
  document.getElementById("botaoPagamento").textContent = "Concluir compra";
  document.getElementById("botaoPagamento").disabled = false;
  document.getElementById("botaoPagamento").style.opacity = "1";
  document.getElementById("mensagemCupom").textContent = "";
  calcular();
});

document.getElementById("finalizarCompra").addEventListener("click", () => {
  const formulario = document.getElementById("formReserva");

  // Confere os campos obrigatórios antes de montar a folha.
  if (!formulario.reportValidity()) {
    return;
  }

  const nome = document.getElementById("nome").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const cpf = document.getElementById("cpf").value.trim();
  const qtdAreas = Number(areas.value);
  const qtdDias = Math.max(1, Number(dias.value) || 1);
  const qtdPessoas = Math.max(1, Number(pessoas.value) || 1);

  const total = calcular();

  const subtotalTexto = document.getElementById("subtotal").textContent;
  const descontoEstadiaTexto =
    document.getElementById("descontoEstadia").textContent;
  const descontoCupomTexto =
    document.getElementById("descontoCupom").textContent;
  const localizacao =
    praia.value === "sim" ? "Próxima à praia" : "Localização padrão";
  const cupomTexto = cupomAtivo ? "DIA100 aplicado" : "Nenhum cupom aplicado";

  document.getElementById("dadosFolha").innerHTML = `
        <div class="grupo-folha">
          <h3>Dados do responsável</h3>
          <div class="linha"><span>Nome:</span><span>${escaparHTML(nome)}</span></div>
          <div class="linha"><span>Telefone:</span><span>${escaparHTML(telefone)}</span></div>
          <div class="linha"><span>CPF:</span><span>${escaparHTML(cpf)}</span></div>
        </div>
        <div class="grupo-folha">
          <h3>Detalhes da hospedagem</h3>
          <div class="linha"><span>Tipo:</span><span>${qtdAreas} áreas</span></div>
          <div class="linha"><span>Localização:</span><span>${localizacao}</span></div>
          <div class="linha"><span>Diárias:</span><span>${qtdDias}</span></div>
          <div class="linha"><span>Hóspedes:</span><span>${qtdPessoas}</span></div>
        </div>
        <div class="grupo-folha">
          <h3>Valores</h3>
          <div class="linha"><span>Valor da hospedagem:</span><span>${subtotalTexto}</span></div>
          <div class="linha"><span>Desconto por estadia:</span><span>${descontoEstadiaTexto}</span></div>
          <div class="linha"><span>Desconto do cupom:</span><span>${descontoCupomTexto}</span></div>
          <div class="linha"><span>Cupom:</span><span>${cupomTexto}</span></div>
          <div class="linha linha-folha-total"><span>Total a pagar:</span><span>${moeda(total)}</span></div>
        </div>
      `;

  document.getElementById("folhaPagamento").style.display = "block";
  document.getElementById("mensagemFinal").textContent =
    "Confira todos os dados da sua compra abaixo.";
  document.getElementById("mensagemFinal").style.color = "#19453c";
  document.getElementById("mensagemPagamento").textContent = "";
  document
    .getElementById("folhaPagamento")
    .scrollIntoView({ behavior: "smooth", block: "start" });
});

function escaparHTML(texto) {
  return texto.replace(
    /[&<>"']/g,
    (caractere) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[caractere],
  );
}

document.getElementById("botaoPagamento").addEventListener("click", () => {
  document.getElementById("mensagemPagamento").textContent =
    "Compra concluída com sucesso! Esta é apenas uma confirmação demonstrativa; nenhum pagamento ou reserva real foi realizado.";
  document.getElementById("mensagemPagamento").style.color = "#19453c";
  document.getElementById("botaoPagamento").textContent = "Compra concluída";
  document.getElementById("botaoPagamento").disabled = true;
  document.getElementById("botaoPagamento").style.opacity = "0.7";
});

calcular();
