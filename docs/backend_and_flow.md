# Backend Implementation & Website Flow

## Current Architecture

The project follows a standard client-server architecture:
- **Frontend**: Built with React (Vite, TypeScript, TailwindCSS).
- **Backend**: Built with Node.js, Express, and TypeScript.
- **Database**: MongoDB (via Mongoose), hosted on MongoDB Atlas.

## Backend Structure

The backend code is located exclusively in the `/backend` folder.

- **`src/index.ts`**: The main entry point for the Express server. It sets up CORS, connects to MongoDB, and registers the API routes.
- **`src/models/`**: Defines the Mongoose schemas used to interact with the database.
  - `MenuItem.ts`: Represents the dishes on the menu (title, price, image, description, ingredients, etc.).
  - `InventoryItem.ts`: Represents items managed in the admin inventory (name, stock, unit, price, status).
  - `Order.ts`: Represents customer orders submitted from the checkout page. (Includes customer details, cart items, limits, and totals).
- **`src/routes/`**: Handles specific API endpoints.
  - `menuRoutes.ts`: Exposes `GET /api/menu` to let the frontend retrieve the full menu.
  - `inventoryRoutes.ts`: Provides full CRUD operations (`GET`, `POST`, `PUT`, `DELETE`) on `/api/inventory` to support the Admin interface.
  - `orderRoutes.ts`: Exposes `POST /api/orders` for users to place new orders. Also triggers the external MimSMS API upon a successful order.

## Website Flow Let's Walk Through It

1. **Viewing the Menu**: 
   When a user visits the `/menu` or points to a specific item (`/menu/:id`), the React frontend makes a `GET` request to `[BACKEND_URL]/api/menu`. This translates MongoDB's `_id` and formats the menu definitions to the visual components rendered on the screen.

2. **Cart & Checkout**:
   Users can add `MenuItem` entries to their frontend-state `CartContext`. When they navigate to `/checkout`, they fill in their delivery information and select a payment method. Submitting the form triggers a `POST /api/orders` request, containing their `customerInfo` and `items`.

3. **Order Processing**:
   The backend routes the incoming order to MongoDB for persistent storage automatically. After inserting the record successfully, the server prepares to send a confirmation SMS via the MimSMS API to the provided customer phone number.

4. **Admin Inventory Management**:
   The admin navigates to the Inventory page (`/admin/inventory`) which automatically performs a `GET /api/inventory` call to fetch current stock. Creating, editing, or deleting items directly sends `POST`, `PUT`, or `DELETE` methods mapped to specific endpoints. The UI reacts dynamically once the backend responds.

## Environment configuration

Currently, environment variables are managed securely through `.env` files:
- **Frontend (`/.env`)**: Supplies the frontend with `VITE_API_URL` to easily switch backend API targets between standard environments (e.g., `http://localhost:5000/api` for dev).
- **Backend (`/backend/.env`)**: Contains the MongoDB URI, port configurations, and SMS API keys securely.
