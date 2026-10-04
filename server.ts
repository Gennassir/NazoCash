import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory store for webhook events and transactions
const transactionsStore = new Map<string, any>();

// OptimaPay Global Collecto API configuration
const COLLECTO_BASE_URL =
  process.env.OPTIMAPAY_COLLECTO_URL ||
  'https://global.optimapaybridge.co.ke/api/v2/collecto';

// Gateway configuration endpoint
app.get('/api/gateway/config', (req: Request, res: Response) => {
  const isConfigured = Boolean(
    process.env.OPTIMAPAY_API_KEY && process.env.OPTIMAPAY_API_SECRET
  );

  const host = req.get('host');
  const proto = req.protocol === 'http' && host && !host.includes('localhost') ? 'https' : req.protocol;
  const appBaseUrl = host ? `${proto}://${host}` : (process.env.APP_URL || '');
  const callbackUrl = `${appBaseUrl}/api/stk-push/webhook`;

  res.json({
    gateway: 'OptimaPay Global Collecto API',
    endpoint: `${COLLECTO_BASE_URL}/stk-push`,
    baseUrl: COLLECTO_BASE_URL,
    callback_url: callbackUrl,
    configured: isConfigured,
    mode: isConfigured ? 'live' : 'sandbox',
    requires_payment_account_id: false,
    settlement: 'Direct OptimaPay Account Balance',
    documentation: 'https://global.optimapaybridge.co.ke/docs',
  });
});

// Helper to make requests to OptimaPay Global Collecto API
async function postToCollecto(endpointUrl: string, payload: any, apiKey: string, apiSecret: string) {
  const response = await fetch(endpointUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey,
      'X-API-SECRET': apiSecret,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'Referer': 'https://global.optimapaybridge.co.ke/',
    },
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();
  let responseData: any = null;

  try {
    responseData = JSON.parse(responseText);
  } catch {
    // If upstream returned HTML or plain error string
    responseData = {
      success: false,
      message: `Upstream HTTP ${response.status}: ${responseText.slice(0, 200).replace(/\s+/g, ' ')}`,
      raw: responseText.slice(0, 200),
    };
  }

  return {
    status: response.status,
    ok: response.ok,
    data: responseData,
  };
}

const OPTIMAPAY_GLOBAL_BASE_URL = 'https://global.optimapaybridge.co.ke/api/v2/collecto';

// STK Push initiation endpoint (OptimaPay Global Ugandan Mobile Money API)
app.post('/api/stk-push', async (req: Request, res: Response) => {
  try {
    const { phone, amount, reference, description } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required.',
      });
    }

    // Clean and normalize phone number for Uganda (e.g., 256772000000 or 0772000000)
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    let formattedPhone = cleanPhone;
    if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
      formattedPhone = '256' + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith('256') && cleanPhone.length === 9) {
      formattedPhone = '256' + cleanPhone;
    }

    const transactionAmount = Number(amount) || 5600;
    const txReference = reference || `NZC-${Date.now()}`;
    const txDescription = description || 'NazoCash Loan Processing Fee';

    const apiKey = process.env.OPTIMAPAY_API_KEY;
    const apiSecret = process.env.OPTIMAPAY_API_SECRET;

    // Construct dynamic callback URL based on current host or APP_URL
    const host = req.get('host');
    const proto = req.protocol === 'http' && host && !host.includes('localhost') ? 'https' : req.protocol;
    const appBaseUrl = host ? `${proto}://${host}` : (process.env.APP_URL || '');
    const callbackUrl = `${appBaseUrl}/api/stk-push/webhook`;

    if (!apiKey || !apiSecret) {
      return res.status(400).json({
        success: false,
        message: 'Payment provider credentials (OPTIMAPAY_API_KEY and OPTIMAPAY_API_SECRET) must be configured in environment.',
      });
    }

    console.log('📡 Dispatching Ugandan Mobile Money STK Push via OptimaPay Global API:', {
      url: `${OPTIMAPAY_GLOBAL_BASE_URL}/initiate`,
      phone: formattedPhone,
      amount: transactionAmount,
      reference: txReference,
      callback_url: callbackUrl,
    });

    const payload = {
      phone: formattedPhone,
      amount: transactionAmount,
      reference: txReference,
      description: txDescription,
      callback_url: callbackUrl,
    };

    const response = await fetch(`${OPTIMAPAY_GLOBAL_BASE_URL}/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
        'X-API-SECRET': apiSecret,
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 OptimaPayGlobalClient/2.0',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    let responseData: any = null;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { message: responseText };
    }

    console.log('📡 OptimaPay Global Response:', response.status, responseData);

    if (response.ok && responseData && responseData.success) {
      const txData = responseData.data || {};
      const txId = txData.transaction_id || `TXN-${Date.now()}`;
      const globalRef = txData.reference || txReference;

      const record = {
        status: (txData.status || 'PENDING').toLowerCase(),
        phone: formattedPhone,
        amount: transactionAmount,
        reference: globalRef,
        client_reference: txReference,
        gateway_transaction_id: txData.gateway_transaction_id,
        created_at: Date.now(),
      };

      // Store by both internal ID and OptimaPay Global reference
      transactionsStore.set(String(txId), record);
      transactionsStore.set(String(globalRef), record);
      transactionsStore.set(String(txReference), record);

      return res.json({
        success: true,
        mode: 'live',
        message: responseData.message || 'Payment prompt dispatched to customer phone.',
        data: {
          transaction_id: txId,
          reference: globalRef,
          client_reference: txReference,
          phone: formattedPhone,
          amount: transactionAmount,
          gateway_transaction_id: txData.gateway_transaction_id,
        },
      });
    }

    // Return the real upstream error message to the client
    const errorMsg =
      responseData?.message ||
      responseData?.ResultDesc ||
      responseData?.error ||
      'Failed to dispatch STK push via OptimaPay Global.';

    return res.status(response.status >= 400 ? response.status : 400).json({
      success: false,
      mode: 'live',
      message: errorMsg,
      error: responseData,
    });
  } catch (err: any) {
    console.error('❌ STK push server error:', err.message);
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error initiating Ugandan STK push.',
    });
  }
});

// STK Push Status Query endpoint (OptimaPay Global API)
app.get('/api/stk-push/status/:identifier', async (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;
    const apiKey = process.env.OPTIMAPAY_API_KEY;
    const apiSecret = process.env.OPTIMAPAY_API_SECRET;

    if (apiKey && apiSecret) {
      try {
        const response = await fetch(`${OPTIMAPAY_GLOBAL_BASE_URL}/status/${identifier}`, {
          method: 'GET',
          headers: {
            'X-API-KEY': apiKey,
            'X-API-SECRET': apiSecret,
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 OptimaPayGlobalClient/2.0',
          },
        });

        if (response.ok) {
          const text = await response.text();
          let parsed: any = null;
          try {
            parsed = JSON.parse(text);
          } catch {
            // ignore non-json
          }

          if (parsed && parsed.success && parsed.data) {
            const rawStatus = (parsed.data.status || '').toUpperCase();
            const isCompleted = rawStatus === 'SUCCESSFUL';
            const isFailed = rawStatus === 'FAILED' || rawStatus === 'CANCELLED';

            // Sync with local transactions cache
            const record = transactionsStore.get(String(identifier)) || {};
            record.status = isCompleted ? 'completed' : (isFailed ? 'failed' : 'pending');
            record.receipt = parsed.data.gateway_transaction_id || parsed.data.reference;
            transactionsStore.set(String(identifier), record);

            return res.json({
              success: true,
              data: {
                transaction_id: parsed.data.transaction_id || identifier,
                reference: parsed.data.reference,
                status: isCompleted ? 'completed' : (isFailed ? 'failed' : 'pending'),
                result_code: isCompleted ? 0 : (isFailed ? 1032 : 1),
                result_desc: isCompleted
                  ? 'Payment completed and credited to your wallet balance.'
                  : (isFailed ? 'Payment was cancelled or failed.' : 'Prompt dispatched to customer; awaiting PIN input.'),
                mpesa_receipt_number: parsed.data.gateway_transaction_id || parsed.data.reference,
              },
            });
          }
        }
      } catch (err: any) {
        console.warn('Live OptimaPay Global status query error:', err.message);
      }
    }

    // Check memory store for webhook or past records
    const localRecord = transactionsStore.get(String(identifier));
    if (localRecord && (localRecord.status === 'completed' || localRecord.status === 'successful')) {
      return res.json({
        success: true,
        data: {
          transaction_id: identifier,
          status: 'completed',
          result_code: 0,
          result_desc: 'Payment completed and verified.',
          mpesa_receipt_number: localRecord.gateway_transaction_id || localRecord.reference,
        },
      });
    }

    if (localRecord && (localRecord.status === 'failed' || localRecord.status === 'cancelled')) {
      return res.json({
        success: true,
        data: {
          transaction_id: identifier,
          status: 'failed',
          result_code: 1032,
          result_desc: 'Payment was cancelled or failed.',
        },
      });
    }

    // Default waiting state
    return res.json({
      success: true,
      data: {
        transaction_id: identifier,
        status: 'pending',
        result_code: 1,
        result_desc: 'Waiting for handset PIN entry...',
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// Webhook listener for OptimaPay Global API callbacks
app.post('/api/stk-push/webhook', (req: Request, res: Response) => {
  const payload = req.body;
  console.log('⚡ Received OptimaPay Global Webhook:', payload);

  if (payload) {
    const status = (payload.status || '').toUpperCase();
    const isSuccess = status === 'SUCCESSFUL' || payload.event === 'payment.successful';
    const isFail = status === 'FAILED' || status === 'CANCELLED';

    const record = {
      ...payload,
      status: isSuccess ? 'completed' : (isFail ? 'failed' : 'pending'),
      updated_at: new Date().toISOString(),
    };

    if (payload.transaction_id) {
      transactionsStore.set(String(payload.transaction_id), record);
    }
    if (payload.reference) {
      transactionsStore.set(String(payload.reference), record);
    }
    if (payload.client_reference) {
      transactionsStore.set(String(payload.client_reference), record);
    }
  }

  res.status(200).json({ status: 'acknowledged' });
});

// Mount Vite or Static Frontend
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`🚀 NazoCash & OptimaPay Global Collecto API running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
