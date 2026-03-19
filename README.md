# Taxoma API

## order-status endpoint

This endpoint is used by the `/finished` page to check the current state of an order in real time.

### How it works

1. The frontend page `/finished` reads `order_key` from the URL.
2. It calls the Vercel API endpoint:
   `/api/order-status?order_key=...`
3. The Vercel function sends the `order_key` to a Make.com webhook.
4. Make.com looks up the matching record in Data Store.
5. Make.com returns the current order state back to Vercel.
6. Vercel returns JSON to the frontend.
7. The frontend can repeat this request (polling) until the document is ready.

### Returned data

The endpoint returns:

- `order_key` – unique order identifier
- `status` – current processing state
- `tax_amount` – calculated tax amount
- `download_url` – download link for the generated XML file

### Main purpose

This endpoint allows the `/finished` page to:

- show current processing status
- display the tax amount
- wait until the XML is ready
- show the download link when available
