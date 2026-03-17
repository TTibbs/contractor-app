import { getJobById, getNextInvoiceNumber } from "@/database/db";
import { getJobSignature } from "@/services/signatureService";
import { JobWithDetails } from "@/types/job";
import { calculateInvoiceTotals } from "@/utils/taxCalculator";
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";

const baseDir = (FileSystem as any).documentDirectory ?? "";
const INVOICES_DIR = `${baseDir}invoices/`;

async function ensureInvoicesDirExists() {
  const dirInfo = await FileSystem.getInfoAsync(INVOICES_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(INVOICES_DIR, { intermediates: true });
  }
}

interface InvoiceData {
  job: JobWithDetails;
  signatureUri: string | null;
  invoiceNumber: number;
  subtotal: number;
  taxAmount: number;
  total: number;
}

async function buildInvoiceData(jobId: string): Promise<InvoiceData> {
  const job = await getJobById(jobId);
  if (!job) {
    throw new Error("Job not found");
  }

  const signature = await getJobSignature(job.id);
  const invoiceNumber = await getNextInvoiceNumber();

  const { subtotal, taxAmount, total } = calculateInvoiceTotals({
    price: job.price,
    taxRate: job.taxRate,
    taxEnabled: !!job.taxRate,
  });

  return {
    job,
    signatureUri: signature?.uri ?? null,
    invoiceNumber,
    subtotal,
    taxAmount,
    total,
  };
}

async function signatureToBase64(uri: string | null): Promise<string | null> {
  if (!uri) return null;
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: "base64",
    });
    return base64;
  } catch {
    return null;
  }
}

function buildInvoiceHtml(data: InvoiceData, signatureBase64: string | null) {
  const { job, invoiceNumber, subtotal, taxAmount, total } = data;
  const date = new Date().toLocaleDateString();

  const signatureImg = signatureBase64
    ? `<img src="data:image/png;base64,${signatureBase64}" style="max-width:200px; border-bottom:1px solid #000;"/>`
    : "<div style='height:40px;border-bottom:1px solid #000;'></div>";

  return `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif; padding: 24px; color: #111827; }
          h1, h2, h3 { margin: 0; }
          .header { display:flex; justify-content:space-between; margin-bottom:24px; }
          .section { margin-bottom:16px; }
          .label { font-size:12px; color:#6b7280; text-transform:uppercase; letter-spacing:0.05em; }
          .value { font-size:14px; color:#111827; }
          table { width:100%; border-collapse:collapse; margin-top:8px; }
          th, td { text-align:left; padding:8px; font-size:14px; }
          th { background:#f3f4f6; }
          .totals td { border-top:1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>Invoice</h1>
            <p class="value">#${invoiceNumber}</p>
          </div>
          <div style="text-align:right;">
            <h3>Your Company</h3>
            <p class="value">${date}</p>
          </div>
        </div>

        <div class="section">
          <div class="label">Billed To</div>
          <div class="value">${job.clientName}</div>
          ${job.address ? `<div class="value">${job.address}</div>` : ""}
        </div>

        <div class="section">
          <div class="label">Job</div>
          <div class="value"><strong>${job.title}</strong></div>
          ${
            job.description
              ? `<div class="value" style="white-space:pre-wrap;">${job.description}</div>`
              : ""
          }
        </div>

        <div class="section">
          <div class="label">Details</div>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Job Price</td>
                <td>$${subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Tax</td>
                <td>$${taxAmount.toFixed(2)}</td>
              </tr>
            </tbody>
            <tbody class="totals">
              <tr>
                <td><strong>Total</strong></td>
                <td><strong>$${total.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="section" style="margin-top:32px;">
          <div class="label">Client Signature</div>
          <div style="margin-top:12px;">
            ${signatureImg}
          </div>
          <div class="value" style="margin-top:8px;">Signed on ${date}</div>
        </div>
      </body>
    </html>
  `;
}

export async function generateInvoiceForJob(jobId: string): Promise<{
  fileUri: string;
  invoiceNumber: number;
}> {
  const data = await buildInvoiceData(jobId);
  const signatureBase64 = await signatureToBase64(data.signatureUri);
  const html = buildInvoiceHtml(data, signatureBase64);

  const { uri } = await Print.printToFileAsync({ html });

  await ensureInvoicesDirExists();
  const destUri = `${INVOICES_DIR}invoice-${data.invoiceNumber}.pdf`;
  await FileSystem.moveAsync({ from: uri, to: destUri });

  return { fileUri: destUri, invoiceNumber: data.invoiceNumber };
}

export async function previewInvoiceHtml(jobId: string): Promise<string> {
  const data = await buildInvoiceData(jobId);
  const signatureBase64 = await signatureToBase64(data.signatureUri);
  return buildInvoiceHtml(data, signatureBase64);
}
