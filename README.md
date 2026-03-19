## order-status endpoint

This endpoint is used by the `/finished` page to allow the user to download their final XML file once the processing is complete.

### How it works

1. The frontend reads `order_key` from the URL.
2. It calls `/api/order-status?order_key=...`
3. The request is forwarded to Make.com.
4. Make retrieves the order from Data Store.
5. The current status and data are returned back to the frontend.

### Response

- `order_key` – unique identifier
- `status` – processing state
- `tax_amount` – calculated tax
- `download_url` – link to the final XML file

### Purpose

The main goal is to:
- track processing status
- wait until the XML is generated
- allow the user to download the file at the end of the process
