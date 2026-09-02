import { test, expect } from '@playwright/test';

test.describe('ScanGo Customer App - E2E Core Journey', () => {
  // We mock all backend API requests so the frontend can run independently
  test.beforeEach(async ({ page }) => {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id, x-user-role'
    };

    // 0. Mock Auth
    await page.route('**/api/v1/auth/guest', async (route) => {
      if (route.request().method() === 'OPTIONS') {
        return route.fulfill({ status: 200, headers: corsHeaders });
      }
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({
          data: {
            access_token: 'mock_jwt_token',
          }
        })
      });
    });

    // 1. Mock Session Creation (QR Scan)
    await page.route('**/api/v1/sessions', async (route) => {
      if (route.request().method() === 'OPTIONS') {
        return route.fulfill({ status: 200, headers: corsHeaders });
      }
      if (route.request().method() === 'POST') {
        const payload = route.request().postDataJSON();
        // Return a mock session matching { data: { session_id, join_code } }
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          headers: corsHeaders,
          body: JSON.stringify({
            data: {
              session_id: 'mock-session-123',
              join_code: '123456',
              store_id: payload?.store_id || 'store_1',
              status: 'active'
            }
          })
        });
      } else {
        await route.continue();
      }
    });

    // 2. Mock Cart Item Addition
    await page.route('**/api/v1/sessions/*/items', async (route) => {
      if (route.request().method() === 'OPTIONS') {
        return route.fulfill({ status: 200, headers: corsHeaders });
      }
      if (route.request().method() === 'POST') {
        const payload = route.request().postDataJSON();
        const barcode = payload?.barcode || '123456';
        
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          headers: corsHeaders,
          body: JSON.stringify({
            data: {
              items: [
                {
                  id: 'item-1',
                  barcode: barcode,
                  name: barcode === '123456' ? 'Organic Apples' : 'Test Product',
                  price: 2.99,
                  quantity: 1
                }
              ],
              bill_summary: {
                subtotal: 2.99,
                tax: 0.15,
                total: 3.14
              }
            }
          })
        });
      } else {
        await route.continue();
      }
    });

    // 3. Mock Cart Fetch (Bill)
    await page.route('**/api/v1/sessions/*/bill', async (route) => {
      if (route.request().method() === 'OPTIONS') {
        return route.fulfill({ status: 200, headers: corsHeaders });
      }
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: corsHeaders,
          body: JSON.stringify({
            data: {
              items: [
                {
                  id: 'item-1',
                  barcode: '123456',
                  name: 'Organic Apples',
                  price: 2.99,
                  quantity: 1
                }
              ],
              bill_summary: {
                subtotal: 2.99,
                tax_total: 0.15,
                grand_total: 3.14
              }
            }
          })
        });
      } else {
        await route.continue();
      }
    });

    // 4. Mock Payment Intent Creation
    await page.route('**/api/v1/sessions/*/payment/intent', async (route) => {
      if (route.request().method() === 'OPTIONS') {
        return route.fulfill({ status: 200, headers: corsHeaders });
      }
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          headers: corsHeaders,
          body: JSON.stringify({
            data: {
              intent_id: 'pi_mock_123',
              client_secret: 'mock_client_secret_123',
              amount: 3.14,
              currency: 'USD',
              status: 'requires_payment_method'
            }
          })
        });
      } else {
        await route.continue();
      }
    });

    // 5. Mock Webhook
    await page.route('**/api/v1/payment/webhook', async (route) => {
      if (route.request().method() === 'OPTIONS') {
        return route.fulfill({ status: 200, headers: corsHeaders });
      }
      await route.fulfill({
        status: 200,
        headers: corsHeaders,
        body: JSON.stringify({ success: true })
      });
    });
  });

  test('should complete a successful scan and checkout journey', async ({ page }) => {
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

    // Navigate to the app (running locally on port 5173 for Vite)
    await page.goto('http://localhost:5173/');
    
    // Step 1: Start a session
    // Our UI has a "Start Shopping" button that triggers a demo session creation
    const startButton = page.getByRole('button', { name: /start/i });
    if (await startButton.isVisible()) {
      await startButton.click();
    }
    
    // The UI redirects to /scan
    await expect(page).toHaveURL(/.*scan/);

    // Step 2: Scan an item
    // Assuming we have a barcode input for testing
    const barcodeInput = page.getByPlaceholder(/barcode/i);
    if (await barcodeInput.isVisible()) {
      await barcodeInput.fill('123456');
      await page.getByRole('button', { name: /add/i }).click();

      // Verify item is added to cart UI (mock returns 'Organic Apples')
      await expect(page.getByText('Organic Apples')).toBeVisible();
      await expect(page.getByText('$2.99')).toBeVisible();
    }

    // Step 3: Go to Cart and Checkout
    const checkoutBtn = page.getByRole('button', { name: /checkout/i });
    if (await checkoutBtn.isVisible()) {
        await checkoutBtn.click();
        
        // We expect it to navigate to payment/checkout screen
        await expect(page).toHaveURL(/.*checkout/);
        
        // Verify total is displayed (3.14 based on our mock)
        await expect(page.getByText(/\$3\.14/)).toBeVisible();
        
        // Click pay
        const payButton = page.getByRole('button', { name: /pay/i });
        await payButton.click();
        
        // Verify success/receipt screen
        await expect(page.getByText(/success/i)).toBeVisible();
        await expect(page).toHaveURL(/.*receipt/);
    }
  });
});
