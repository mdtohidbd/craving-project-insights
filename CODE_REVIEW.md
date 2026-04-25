# Code Review Report

**Date**: April 24, 2026  
**Reviewed Files**:
- `src/components/home/MenuSection.tsx`
- `src/pages/Menu.tsx`
- `src/pages/MenuDetail.tsx`
- `src/context/CartContext.tsx`

---

## Critical Bugs

### 1. Null/Undefined Reference on Price Parsing

**Severity**: Critical  
**Location**: 
- `MenuSection.tsx:46`
- `Menu.tsx:378`
- `MenuDetail.tsx:230`

**Issue**: The code calls `.replace()` on `item.price` without checking if it exists:

```typescript
const numericPrice = parseFloat(item.price.replace(/[^0-9.]/g, ''));
```

If `item.price` is `undefined` or `null`, this will throw: `Cannot read properties of undefined/null`.

**Recommended Fix**:
```typescript
const numericPrice = parseFloat((item.price || '0').replace(/[^0-9.]/g, ''));
```

---

### 2. Inconsistent ID Type Conversion

**Severity**: Critical  
**Location**: Multiple files

**Issue**: The `CartContext` expects `id: number`, but different components handle this inconsistently:

- `MenuSection.tsx:48` - passes `item.id` directly (no conversion)
- `Menu.tsx:380` - passes `item.id` directly (no conversion)  
- `MenuDetail.tsx:232` - converts with `Number(item.id)`
- `MenuDetail.tsx:365` - converts with `Number(item.id)`

This causes cart lookup failures in `getCartItem` which uses string comparison:
```typescript
const getCartItem = (itemId: string) => cart.find(c => String(c.id) === String(itemId));
```

**Recommended Fix**: Standardize ID handling by always converting to number when adding to cart, or change the cart context to use string IDs consistently.

---

### 3. Memory Leak: setTimeout Without Cleanup

**Severity**: High  
**Location**: 
- `MenuSection.tsx:55-57`
- `Menu.tsx:387`
- `MenuDetail.tsx:372`

**Issue**: Timeouts are set but never cleaned up on component unmount:

```typescript
setTimeout(() => {
  setAddedItems(prev => ({ ...prev, [item.id]: false }));
}, 2000);
```

If the user navigates away before the timeout fires, React will attempt state update on an unmounted component, causing memory leaks and console warnings.

**Recommended Fix**: Store timeout IDs and clear them in useEffect cleanup:

```typescript
useEffect(() => {
  const timeouts: NodeJS.Timeout[] = [];
  
  // ... existing code ...
  
  return () => {
    timeouts.forEach(clearTimeout);
  };
}, []);
```

---

## Pre-existing Bugs

### 4. GSAP ScrollTrigger Global Cleanup

**Severity**: Medium  
**Location**: `Menu.tsx:166`

**Issue**: 
```typescript
return () => {
  clearTimeout(timeout);
  ScrollTrigger.getAll().forEach(t => t.kill());
};
```

This kills ALL ScrollTriggers globally, not just those created by this component. If other components use ScrollTrigger, they will break.

**Recommended Fix**: Store created ScrollTrigger instances and only kill those specific to this component:

```typescript
const triggers: ScrollTrigger[] = [];

// ... when creating triggers ...
triggers.push(scrollTrigger);

// ... in cleanup ...
return () => {
  clearTimeout(timeout);
  triggers.forEach(t => t.kill());
};
```

---

### 5. Missing Type Definitions

**Severity**: Medium  
**Location**: All three reviewed files

**Issue**: Using `any[]` and `any` types instead of proper TypeScript interfaces for menu items:

```typescript
const [menuItems, setMenuItems] = useState<any[]>([]);
```

This reduces type safety and makes the codebase harder to maintain.

**Recommended Fix**: Create a proper `MenuItem` interface based on the backend schema:

```typescript
interface MenuItem {
  id: number;
  title: string;
  price: string;
  category: string;
  description?: string;
  image: string;
  tags?: string[];
}
```

---

## Code Quality Issues

### 6. Duplicate Image Mapping Logic

**Severity**: Low  
**Location**: 
- `MenuSection.tsx:29-34`
- `Menu.tsx:119-124`
- `MenuDetail.tsx:80-85`

**Issue**: The image override logic is duplicated across three files:

```typescript
data.forEach((m: any) => { 
  if (m.title === "Guacamole") m.image = "guacamoleCustom";
  if (m.title === "Original Falafel Wrap") m.image = "originalFalafelWrapCustom";
  if (m.title === "Beyond Kebab") m.image = "beyondKebabCustom";
  if (m.title === "Desi Falafel Plate") m.image = "desiFalafelPlateCustom";
});
```

**Recommended Fix**: Extract to a shared utility function:

```typescript
// utils/menuUtils.ts
export const applyCustomImages = (menuItems: MenuItem[]) => {
  const imageOverrides: Record<string, string> = {
    "Guacamole": "guacamoleCustom",
    "Original Falafel Wrap": "originalFalafelWrapCustom",
    "Beyond Kebab": "beyondKebabCustom",
    "Desi Falafel Plate": "desiFalafelPlateCustom",
  };
  
  return menuItems.map(item => ({
    ...item,
    image: imageOverrides[item.title] || item.image
  }));
};
```

---

### 7. Hardcoded Image Names

**Severity**: Low  
**Location**: Same as Issue #6

**Issue**: The image override checks for specific titles with hardcoded custom image names. This is fragile and should be data-driven from the backend.

**Recommended Fix**: Move image mapping to the backend database as part of the MenuItem schema, or create a configuration file that can be easily maintained.

---

## Positive Changes in Recent Commits

The recent changes added proper error handling for API responses:

1. **Response status checking** - Added `if (!res.ok)` checks before parsing JSON
2. **Type validation** - Added array type checks before processing data
3. **Loading state management** - Properly set `setLoading(false)` in error cases

These are good defensive programming practices that improve robustness.

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 2 |
| High     | 1 |
| Medium   | 2 |
| Low      | 2 |

**Total Issues Found**: 7

**Priority Actions**:
1. Fix null/undefined price parsing (Critical)
2. Standardize ID type handling (Critical)
3. Add timeout cleanup (High)
4. Fix GSAP ScrollTrigger cleanup (Medium)
5. Add proper TypeScript types (Medium)
