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

----------------------------------------------------------------------------------------------------------------------------------------------

## order-from-submission endpoint

This endpoint is used by the /processing page to translate a form submission into an internal order.

It allows the system to check whether an order has already been created for a given submission.

### How it works

1. The frontend reads `submission_id` from the URL.
2. It calls `/api/order-from-submission?submission_id=...`
3. The request is forwarded to Make.com.
4. Make searches the Data Store for a record with the given `submission_id`.
5. If found, the corresponding `order_key` is returned.
6. If not found, a waiting status is returned.

### Response

- `status` – current state of the lookup  
  - `waiting` → order not yet created  
  - `ready_for_payment` → order found  

- `order_key` – internal identifier (only when ready)

### Purpose

The main goal is to:

- bridge external form systems with internal logic  
- wait until the order is created  
- provide the frontend with `order_key` for further steps (payment, status, etc.)
- 
------------------------------------------------------------------------------------------------------------------------------------------------

## get-checkout-url endpoint

This endpoint is used by the /payment page to retrieve the Stripe checkout URL for a given order.

It does not create a new checkout session. Instead, it returns an already existing session that was created earlier in the flow.

### How it works

1. The frontend reads `order_key` from the URL.
2. It calls `/api/get-checkout-url?order_key=...`
3. The request is forwarded to Make.com.
4. Make retrieves the order from the Data Store using `order_key`.
5. The stored `checkout_url` is returned.

### Response

- `checkout_url` – Stripe payment URL

### Purpose

The main goal is to:

- safely retrieve the payment URL  
- avoid creating duplicate Stripe sessions  
- keep payment logic centralized in the backend  

### Notes

- Checkout session is created earlier (in the main processing flow)  
- This endpoint only returns existing data  
- `order_key` is the primary identifier used across the system
