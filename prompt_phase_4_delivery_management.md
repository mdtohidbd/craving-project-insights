# Phase: Deliveryman Management and Order Fulfillment

## Objective
Build a separate Deliveryman management module and integrate it with the main Delivery module for seamless order assignment and status tracking.

## Context & Requirements
- **Deliveryman Management Module**:
  - A distinct module specifically for viewing, approving, and managing Deliverymen.
  - Display Deliveryman details in an organized Card layout.
  - The "Create Deliveryman" button MUST be located here (moved out of the main Delivery module).
- **Delivery Module (For Deliverymen)**:
  - Once assigned, a deliveryman should log in and only see their assigned delivery orders in this module.
  - Deliverymen must have controls to update the status of their assigned deliveries (e.g., Pending -> Assigned -> Delivered).

## Codebase Alignment & Improvement Strategies
- Segregate the UI components: one for HR/Admin to manage delivery staff (`DeliverymanManagement`), and one operational view for the deliveryman to process orders (`DeliveryDashboard`).
- Ensure the Order schema supports tracking `deliveryman_id` and `delivery_status`.
- Implement robust row-level security/filtering on the backend so a deliveryman API request only returns orders assigned to their specific `deliveryman_id`.

## Expected Output
Please provide the React components for the Deliveryman Management grid (Card views and Create button) and the specific Delivery Order view tailored for the deliveryman role, along with backend query logic.
