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

const OPTIMAPAY_BASE_URL = 'https://global.optimapaybridge.co.ke/api/v2';

// STK Push initiation endpoint (OptimaPay Live API)
app.post('/api/stk-push', async (req: Request, res: Response) => {
  try {
    const { phone, amount, reference } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required.',
      });
    }

    // Clean phone number: local format (07XXXXXXXX) or international
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    let formattedPhone = cleanPhone;
    if (cleanPhone.startsWith('256')) {
      formattedPhone = '0' + cleanPhone.slice(3);
    } else if (!cleanPhone.startsWith('0') && cleanPhone.length === 9) {
      formattedPhone = '0' + cleanPhone;
    }

    const transactionAmount = Number(amount) || 5600;
    const txReference = reference || `NZC-${Math.floor(100000 + Math.random() * 900000)}`;

    const apiKey = process.env.OPTIMAPAY_API_KEY;
    const apiSecret = process.env.OPTIMAPAY_API_SECRET;
    const paymentAccountId = Number(process.env.OPTIMAPAY_PAYMENT_ACCOUNT_ID) || 1;

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

    console.log('📡 Dispatching REAL STK push to OptimaPay API:', {
      url: `${OPTIMAPAY_BASE_URL}/stk-push`,
      phone: formattedPhone,
      amount: transactionAmount,
      reference: txReference,
      payment_account_id: paymentAccountId,
      callback_url: callbackUrl,
    });

    const payload = {
      payment_account_id: paymentAccountId,
      phone: formattedPhone,
      amount: transactionAmount,
      reference: txReference,
      callback_url: callbackUrl,
    };

    const response = await fetch(`${OPTIMAPAY_BASE_URL}/stk-push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
        'X-API-SECRET': apiSecret,
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 OptimaPayClient/2.0',
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

    console.log('📡 OptimaPay Response:', response.status, responseData);

    if (response.ok && responseData && (responseData.success || responseData.data?.transaction_id)) {
      const txId = responseData.data?.transaction_id || `COL-${Date.now()}`;
      transactionsStore.set(String(txId), {
        status: 'pending',
        phone: formattedPhone,
        amount: transactionAmount,
        reference: txReference,
        checkout_request_id: responseData.data?.checkout_request_id,
        created_at: Date.now(),
      });

      return res.json({
        success: true,
        mode: 'live',
        message: responseData.message || 'STK prompt dispatched to mobile handset.',
        data: {
          transaction_id: txId,
          checkout_request_id: responseData.data?.checkout_request_id,
          merchant_request_id: responseData.data?.merchant_request_id,
          phone: formattedPhone,
          amount: transactionAmount,
          reference: txReference,
        },
      });
    }

    // Return the real upstream error to the user
    const errorMsg =
      responseData?.ResultDesc ||
      responseData?.result_desc ||
      responseData?.message ||
      'Failed to dispatch STK push via OptimaPay.';

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
      message: err.message || 'Server error initiating real STK push.',
    });
  }
});

// STK Push Status Query endpoint (Strict Real-Time Server Verification)
app.get('/api/stk-push/status/:transactionId', async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;
    const apiKey = process.env.OPTIMAPAY_API_KEY;
    const apiSecret = process.env.OPTIMAPAY_API_SECRET;

    if (apiKey && apiSecret) {
      try {
        const response = await fetch(`${OPTIMAPAY_BASE_URL}/status/${transactionId}`, {
          method: 'GET',
          headers: {
            'X-API-KEY': apiKey,
            'X-API-SECRET': apiSecret,
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 OptimaPayClient/2.0',
          },
        });

        if (response.ok) {
          const text = await response.text();
          let data: any = null;
          try {
            data = JSON.parse(text);
          } catch {
            // non-json response
          }

          if (data && (data.status || typeof data.result_code !== 'undefined')) {
            const isCompleted = data.status === 'completed' || data.result_code === 0;
            const isFailed = data.status === 'failed' || (data.result_code && data.result_code !== 0);

            // Update local store with real upstream result
            const localRecord = transactionsStore.get(String(transactionId)) || {};
            localRecord.status = isCompleted ? 'completed' : (isFailed ? 'failed' : 'pending');
            if (data.mpesa_receipt_number) {
              localRecord.mpesa_receipt_number = data.mpesa_receipt_number;
            }
            localRecord.result_desc = data.result_desc;
            transactionsStore.set(String(transactionId), localRecord);

            return res.json({
              success: true,
              data: {
                transaction_id: transactionId,
                status: isCompleted ? 'completed' : (isFailed ? 'failed' : 'pending'),
                result_code: data.result_code ?? (isCompleted ? 0 : 1),
                result_desc: data.result_desc || (isCompleted ? 'Payment verified successfully by OptimaPay.' : 'Awaiting PIN authorization on handset.'),
                mpesa_receipt_number: data.mpesa_receipt_number,
              },
            });
          }
        }
      } catch (err: any) {
        console.warn('Live OptimaPay status query error:', err.message);
      }
    }

    // Check store for webhook updates
    const localRecord = transactionsStore.get(String(transactionId));
    if (localRecord && localRecord.status === 'completed') {
      return res.json({
        success: true,
        data: {
          transaction_id: transactionId,
          status: 'completed',
          result_code: 0,
          result_desc: localRecord.result_desc || 'Payment verified by payment provider callback.',
          mpesa_receipt_number: localRecord.mpesa_receipt_number,
        },
      });
    }

    if (localRecord && localRecord.status === 'failed') {
      return res.json({
        success: true,
        data: {
          transaction_id: transactionId,
          status: 'failed',
          result_code: 1032,
          result_desc: localRecord.result_desc || 'Payment was cancelled or failed.',
        },
      });
    }

    // Still pending - NO auto completion! Must be paid on phone.
    return res.json({
      success: true,
      data: {
        transaction_id: transactionId,
        status: 'pending',
        result_code: 1,
        result_desc: 'Waiting for handset PIN authorization...',
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// OptimaPay Webhook endpoint (receives payment.success / payment.failed)
app.post('/api/stk-push/webhook', (req: Request, res: Response) => {
  const payload = req.body;
  console.log('⚡ Received OptimaPay Global Collecto Webhook:', payload);

  if (payload && payload.transaction_id) {
    transactionsStore.set(String(payload.transaction_id), {
      ...payload,
      updated_at: new Date().toISOString(),
    });
  }

  res.status(200).json({ received: true });
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

startServer();
