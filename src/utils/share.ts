import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";

type Company = {
  emp_codigo?: number;
  emp_nome?: string;
  emp_cidade?: string;
};

type Driver = {
  mot_nome?: string;
};

type Vehicle = {
  moto_modelo?: string;
  moto_placa?: string;
};

type TravelPdfData = {
  via_codigo?: number | string;
  via_data_inicio?: string;
  via_data_fim?: string;

  sol_origem?: string;
  sol_destino?: string;
  sol_distancia_km?: number | string;
  sol_valor_estimado?: number | string;
  sol_forma_pagamento?: string;

  empresa?: Company;
  mototaxista?: Driver;
  motocicleta?: Vehicle;
};

function formatCurrency(value?: number | string) {
  const numericValue = Number(value ?? 0);

  return numericValue.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDistance(value?: number | string) {
  const numericValue = Number(value ?? 0);

  return `${numericValue.toFixed(2)} km`;
}

function formatDate(value?: string) {
  if (!value) return "Não informado";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Não informado";
  }

  return date.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function normalizeText(value?: string) {
  return value?.trim() || "Não informado";
}

function buildTravelPdfHtml(travel: TravelPdfData) {
  const companyName = normalizeText(travel.empresa?.emp_nome);
  const companyCity = normalizeText(travel.empresa?.emp_cidade);
  const origin = normalizeText(travel.sol_origem);
  const destination = normalizeText(travel.sol_destino);
  const paymentMethod = normalizeText(travel.sol_forma_pagamento);
  const driverName = normalizeText(travel.mototaxista?.mot_nome);
  const vehicleModel = normalizeText(travel.motocicleta?.moto_modelo);
  const vehiclePlate = normalizeText(travel.motocicleta?.moto_placa);

  const distance = formatDistance(travel.sol_distancia_km);
  const estimatedValue = formatCurrency(travel.sol_valor_estimado);

  const travelCode = travel.via_codigo ?? "Não informado";
  const startedAt = formatDate(travel.via_data_inicio);
  const finishedAt = formatDate(travel.via_data_fim);

  return `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              font-family: Arial, Helvetica, sans-serif;
            }

            body {
              background: #f4f4f5;
              color: #111827;
              padding: 32px;
            }

            .page {
              background: #ffffff;
              border-radius: 18px;
              overflow: hidden;
              border: 1px solid #e5e7eb;
            }

            .header {
              background: linear-gradient(135deg, #111111 0%, #262626 100%);
              color: #ffffff;
              padding: 28px 32px;
            }

            .eyebrow {
              font-size: 12px;
              letter-spacing: 1.4px;
              text-transform: uppercase;
              opacity: 0.72;
              margin-bottom: 8px;
            }

            .title {
              font-size: 28px;
              font-weight: 700;
              margin-bottom: 8px;
            }

            .subtitle {
              font-size: 14px;
              opacity: 0.84;
              line-height: 1.5;
            }

            .content {
              padding: 28px 32px 32px 32px;
            }

            .section {
              margin-bottom: 24px;
            }

            .section-title {
              font-size: 13px;
              font-weight: 700;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 14px;
            }

            .grid {
              display: table;
              width: 100%;
              border-spacing: 12px;
              margin: -12px;
            }

            .row {
              display: table-row;
            }

            .card {
              display: table-cell;
              width: 50%;
              background: #fafafa;
              border: 1px solid #ededed;
              border-radius: 14px;
              padding: 16px;
              vertical-align: top;
            }

            .card.full {
              width: 100%;
              display: block;
              margin-bottom: 12px;
            }

            .label {
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.8px;
              color: #6b7280;
              margin-bottom: 8px;
            }

            .value {
              font-size: 15px;
              font-weight: 600;
              color: #111827;
              line-height: 1.5;
              word-break: break-word;
            }

            .route-box {
              background: #ffffff;
              border: 1px solid #e5e7eb;
              border-radius: 14px;
              padding: 18px;
            }

            .route-step {
              margin-bottom: 14px;
            }

            .route-step:last-child {
              margin-bottom: 0;
            }

            .route-title {
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.8px;
              color: #6b7280;
              margin-bottom: 6px;
            }

            .route-value {
              font-size: 15px;
              font-weight: 600;
              line-height: 1.5;
              color: #111827;
            }

            .footer {
              margin-top: 28px;
              padding-top: 18px;
              border-top: 1px solid #e5e7eb;
              font-size: 12px;
              color: #6b7280;
              line-height: 1.6;
            }

            .highlight {
              color: #111111;
              font-weight: 700;
            }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="header">
              <div class="eyebrow">Comprovante de viagem</div>
              <div class="title">Resumo da corrida</div>
              <div class="subtitle">
                Documento gerado pelo aplicativo com as principais informações da viagem realizada.
              </div>
            </div>

            <div class="content">
              <div class="section">
                <div class="section-title">Informações gerais</div>
                <div class="grid">
                  <div class="row">
                    <div class="card">
                      <div class="label">Código da viagem</div>
                      <div class="value">#${travelCode}</div>
                    </div>
                    <div class="card">
                      <div class="label">Empresa</div>
                      <div class="value">${companyName}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="section">
                <div class="section-title">Trajeto</div>
                <div class="route-box">
                  <div class="route-step">
                    <div class="route-title">Origem</div>
                    <div class="route-value">${origin}</div>
                  </div>

                  <div class="route-step">
                    <div class="route-title">Destino</div>
                    <div class="route-value">${destination}</div>
                  </div>
                </div>
              </div>

              <div class="section">
                <div class="section-title">Detalhes da corrida</div>
                <div class="grid">
                  <div class="row">
                    <div class="card">
                      <div class="label">Distância</div>
                      <div class="value">${distance}</div>
                    </div>
                    <div class="card">
                      <div class="label">Valor estimado</div>
                      <div class="value">${estimatedValue}</div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="card">
                      <div class="label">Forma de pagamento</div>
                      <div class="value">${paymentMethod}</div>
                    </div>
                    <div class="card">
                      <div class="label">Cidade da empresa</div>
                      <div class="value">${companyCity}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="section">
                <div class="section-title">Motorista e veículo</div>
                <div class="grid">
                  <div class="row">
                    <div class="card">
                      <div class="label">Mototaxista</div>
                      <div class="value">${driverName}</div>
                    </div>
                    <div class="card">
                      <div class="label">Motocicleta</div>
                      <div class="value">${vehicleModel}</div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="card">
                      <div class="label">Placa</div>
                      <div class="value">${vehiclePlate}</div>
                    </div>
                    <div class="card">
                      <div class="label">Início da viagem</div>
                      <div class="value">${startedAt}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="section">
                <div class="section-title">Finalização</div>
                <div class="grid">
                  <div class="row">
                    <div class="card">
                      <div class="label">Encerramento</div>
                      <div class="value">${finishedAt}</div>
                    </div>
                    <div class="card">
                      <div class="label">Status do documento</div>
                      <div class="value">Gerado com sucesso</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="footer">
                Este PDF foi emitido automaticamente pelo aplicativo para fins de
                <span class="highlight"> registro, consulta e compartilhamento </span>
                das informações da corrida.
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
}

export async function shareTravelPdf(travel: TravelPdfData) {
  try {
    const isAvailable = await Sharing.isAvailableAsync();

    if (!isAvailable) {
      throw new Error("O compartilhamento não está disponível neste dispositivo.");
    }

    const html = buildTravelPdfHtml(travel);

    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    const fileName = `comprovante_${travel.via_codigo ?? "viagem"}_${Date.now()}.pdf`;

    const newPath = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.moveAsync({
      from: uri,
      to: newPath,
    });

    // 4️⃣ Compartilha o novo arquivo
    await Sharing.shareAsync(newPath, {
      mimeType: "application/pdf",
      dialogTitle: "Compartilhar comprovante da viagem",
      UTI: ".pdf",
    });
  } catch (error) {
    console.log("Erro ao gerar ou compartilhar PDF da viagem:", error);
    throw error;
  }
}