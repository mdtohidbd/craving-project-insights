# Prompt: Menu Add-ons Feature Implementation

## Role
You are an Expert Full-Stack Developer and Database Architect. 

## Context & Objective
We are enhancing our restaurant ordering system. The objective is to introduce an "Add-ons" feature (e.g., extra cheese, special toppings) for menu items. These add-ons must be optional and fully integrated across the entire system, from the admin panel to the customer-facing cart.

## Key Requirements

1. **Database & Migration:**
   - Update the database schema to support optional add-ons for menu items.
   - Write a secure and robust data migration script to ensure backward compatibility for existing menu items that currently lack add-ons.

2. **Admin Panel:**
   - Modify the menu item creation/editing interface to allow administrators to define and attach optional add-ons to specific menu items.

3. **Customer Frontend (Menu Details & Cart):**
   - Update the Menu Details page to display available add-ons.
   - Allow users to tick/select optional add-ons before adding the item to the cart.
   - Ensure the cart accurately reflects the selected add-ons and updates pricing accordingly.

4. **Point of Sale (POS) & Order Management:**
   - Integrate add-on visibility into the Admin POS system.
   - Ensure add-ons are clearly listed in Order Details.
   - Display add-ons accurately on printed Bills and Kitchen Order Tickets (KOT).

## Execution Guidelines
- Begin by presenting a structured implementation plan.
- Ensure all database queries and migration scripts include error handling.
- Follow best practices for state management when updating the frontend cart.
- Provide the modified code snippets for the schema, backend controllers, and frontend React components.
