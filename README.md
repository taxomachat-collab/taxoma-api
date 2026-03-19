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

How it works
	1.	The frontend reads order_key from the URL.
	2.	It calls /api/get-checkout-url?order_key=....
	3.	The request is forwarded to Make.com.
	4.	Make retrieves the order from the Data Store using order_key.
	5.	If the checkout_url is already available, it is returned immediately.
	6.	If not, the frontend keeps calling the endpoint repeatedly (polling).
	7.	Once the checkout_url is available, the frontend redirects the user to Stripe.

⸻

Response
	•	checkout_url – Stripe payment URL (may be empty if not ready yet)

⸻

Purpose

The main goal is to:
	•	safely retrieve the payment URL
	•	handle asynchronous creation of Stripe checkout sessions
	•	avoid creating duplicate Stripe sessions
	•	ensure a smooth user experience with delayed processing

⸻

Notes
	•	Checkout session is created earlier (in the main processing flow)
	•	The endpoint does not create a new session, only retrieves existing data
	•	checkout_url may not be immediately available due to async processing
	•	Frontend handles this by polling until the URL is ready
