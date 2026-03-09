# Connecting & Managing the SMS API

The application relies on **MimSMS** to send confirmation messages whenever a user places a new order. 

## Integration Points

The integration is primarily handled on the backend within `backend/src/routes/orderRoutes.ts` during the `POST /api/orders` endpoint execution.

When a customer successfully places an order, the code extracts their phone number from the `customerInfo` object and triggers a POST request to the MimSMS base URL endpoint securely on the server-side.

## Required Environment Variables

For the MimSMS integration to work, you must set the following variables within your `backend/.env` file:

```env
# MIMSMS configurations
MIMSMS_API_KEY=your_mimsms_api_key_here
MIMSMS_SENDER_ID=your_approved_sender_id
MIMSMS_BASE_URL=https://api.mimsms.com/api/sendsms/api
```

## How It Works in Code

1. **Order Acceptance**: The order details are parsed and evaluated to ensure they are complete.
2. **Database Save**: The new order document is committed to MongoDB securely.
3. **SMS Setup**: The destination phone number is retrieved (e.g., `savedOrder.customerInfo?.phone`). An appropriate message is crafted, such as:
   `"Thank you for your order! Your total is ৳[Amount]. Order ID: [ID]"`
4. **Trigger API Call**: 
   The server initiates an Axios `POST` request to `MIMSMS_BASE_URL` with a structured payload:
   ```json
   {
     "api_key": "YOUR_API_KEY",
     "senderid": "YOUR_SENDER_ID",
     "number": "CUSTOMER_PHONE_NUMBER",
     "message": "COMPOSED_MESSAGE_TEXT"
   }
   ```
5. **Handling the Response**: The MimSMS operation runs asynchronously. Any failures originating from unapproved Sender IDs or low balance errors are caught quietly as to not interrupt the frontend's success screen, while still logging errors to the server console.

## Troubleshooting

- **Messages Not Sending?**: Double-check your API Key and verify that your Sender ID has been officially approved with MimSMS documentation protocols.
- **Incorrect URL**: Make sure your `MIMSMS_BASE_URL` matches exactly what is suggested via the API documentation (https://www.mimsms.com/api-documentation/).
- **Credit Limits**: Most APIs rely on prepaid credits. Make sure your account contains an adequate balance.
