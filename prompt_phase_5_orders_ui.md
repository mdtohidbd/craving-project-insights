# Phase: Orders UI Enhancements

## Objective
Enhance the Orders tab list view to display richer contextual information, improving operational efficiency for admins and managers.

## Context & Requirements
- **Order Cards Data Enhancements**:
  - Distinctly show the **Order Type** (Dine-in, Takeaway, Delivery) on the order cards in the list view.
  - For **Dine-in** and **Takeaway** orders, add a clear visual indicator showing whether the **Bill has been printed or not**.
- **Visibility/Access**:
  - Ensure that Admin and Manager staff roles see this enhanced Orders tab by default when accessing the Orders module.

## Codebase Alignment & Improvement Strategies
- Modify the `OrderCard` or `OrderListItem` component to accept and conditionally render tags/badges for "Order Type" and "Bill Printed" status.
- Ensure the backend Order schema tracks a `is_bill_printed` boolean flag, and update the print action to mutate this flag in the database.
- Utilize consistent UI badges (e.g., Tailwind CSS colored pills) to make order types instantly recognizable at a glance.

## Expected Output
Please provide the updated `OrderCard`/List view component code with the new indicators, and the backend mutation required to update the "bill printed" status.
