import { apiFetch } from './api';

/**
 * Downloads a genuine Tax Invoice PDF for an order from the backend.
 * Streams the PDF to the browser and initiates a physical file download.
 * Returns { success: true } only after download has been initiated, or { success: false, error } on failure.
 */
export async function downloadOrderTaxInvoice(orderNumber: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await apiFetch(`/api/orders/${orderNumber}/invoice`);

    if (!res.ok) {
      let errorMsg = 'Failed to download tax invoice.';
      try {
        const data = await res.json();
        if (data.error) errorMsg = data.error;
      } catch { }
      return { success: false, error: errorMsg };
    }

    const contentType = res.headers.get('content-type');
    if (contentType && !contentType.includes('application/pdf') && !contentType.includes('octet-stream')) {
      return { success: false, error: 'Unexpected server response format.' };
    }

    const blob = await res.blob();
    if (blob.size === 0) {
      return { success: false, error: 'Generated invoice file is empty.' };
    }

    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `ZIMOR-Invoice-${orderNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);

    return { success: true };
  } catch (err: any) {
    console.error('[Invoice Download]', err);
    return { success: false, error: err.message || 'Network error while downloading invoice.' };
  }
}
