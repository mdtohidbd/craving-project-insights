# Phase: Staff Onboarding and Approval Workflow

## Objective
Create a dedicated "Staff" module to handle new user sign-ups, administrative notifications, and the approval/role-assignment pipeline.

## Context & Requirements
- **Sign-Up Notification**: When a new user registers (intending to be staff), trigger a notification to the Superadmin.
- **Staff Module UI**:
  - A new module specifically called "Staff" (or "Staff Management").
  - Displays a queue of pending users waiting for approval.
- **Approval Workflow**:
  - Superadmin can Approve or Reject pending users.
  - Upon approval, the Superadmin **must** assign a specific staff role (e.g., Cashier, Manager, Chef, Waiter).
  - Integrates with the Module Access feature to define what the new staff member can see.

## Codebase Alignment & Improvement Strategies
- Create a `UserStatus` enum (Pending, Approved, Rejected) in the database.
- Build a real-time or polling-based notification badge in the Admin Panel header for new sign-ups.
- Implement a seamless modal or multi-step form for the "Approve User" action, combining Role selection and Module assignment in one smooth UX flow.

## Expected Output
Please implement the "Staff Management" pending list component, the Role Assignment approval modal, and the corresponding backend endpoints to process user status changes.
