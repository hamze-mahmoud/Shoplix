# GreenLight Frontend Restructuring - Complete Guide

## 🎯 Overview

This document outlines the comprehensive restructuring of the GreenLight e-commerce frontend for **high performance**, **better UX**, and **modern styling**.

---

## 📦 New Component System

### UI Components Library (`src/Shared/components/ui/`)

All components are built with:
- ✅ **Tailwind CSS** with custom design tokens
- ✅ **Reusability** - Props-based customization
- ✅ **Accessibility** - ARIA labels and keyboard navigation
- ✅ **Animations** - Smooth transitions and GSAP integration
- ✅ **Type-safe** - JSDoc documentation

#### Available Components:

1. **Button.jsx**
   ```jsx
   <Button 
     variant="primary" // primary | secondary | outline | ghost | danger
     size="md" // xs | sm | md | lg
     loading={isLoading}
     icon={CheckCircle}
     iconPosition="left" // left | right
   >
     Click me
   </Button>
   ```

2. **Card.jsx**
   ```jsx
   <Card 
     hoverable={true}
     glass={false}
     header={<h3>Header</h3>}
     footer={<p>Footer</p>}
   >
     Card content
   </Card>
   ```

3. **Input.jsx**
   ```jsx
   <Input 
     label="Email"
     type="email"
     error={emailError}
     hint="We'll never share your email"
     icon={Mail}
   />
   ```

4. **Badge.jsx**
   ```jsx
   <Badge variant="success" size="sm">
     In Stock
   </Badge>
   ```

5. **Modal.jsx**
   ```jsx
   <Modal 
     isOpen={isOpen}
     onClose={handleClose}
     title="Confirm Action"
   >
     Modal content
   </Modal>
   ```

6. **Alert.jsx**
   ```jsx
   <Alert 
     variant="error"
     title="Error!"
     message="Something went wrong"
     dismissible={true}
   />
   ```

7. **Skeleton.jsx** & **Loading.jsx**
   ```jsx
   <Skeleton width="100%" height="1rem" count={3} />
   <CardSkeleton />
   <ProductCardSkeleton />
   <Spinner size="lg" />
   <LoadingPage />
   ```

---

## 🎨 Tailwind Design System

### Enhanced Configuration (`tailwind.config.js`)

**Custom Colors:**
- `primary` - Green gradient (500-900 shades)
- `secondary` - Purple gradient
- `accent` - Yellow/gold
- `success`, `warning`, `error` - Status colors
- `neutral` - Black/white spectrum

**Custom Animations:**
- `fade-in/fade-out` - Opacity transitions
- `slide-up/slide-down` - Vertical movement
- `scale-in` - Zoom effect
- `pulse-soft` - Subtle pulsing
- `shimmer` - Skeleton loading effect
- `wave-animation` - Wave motion

**Utilities:**
- `backdrop-filter` - Glass morphism effects
- `box-shadow` variations - From `shadow-xs` to `shadow-2xl`
- `shadow-glass` & `shadow-glow` - Special effects

---

## 🪝 Custom Hooks

### Data Fetching Hooks (`src/Shared/hooks/`)

#### useProducts.js
```jsx
const { products, loading, error, refetch } = useProducts({ 
  category: 'electronics', 
  sort: 'newest' 
});
```

#### useCategories.js
```jsx
const { categories, loading, error } = useRootCategories();
const { category } = useCategory(categoryId);
const { children } = useCategoryChildren(categoryId);
```

#### useOrders.js
```jsx
const { orders, loading, error } = useOrders();
const { order } = useOrder(orderId);
```

**Features:**
- ✅ Automatic error handling
- ✅ Loading states
- ✅ Refetch capability
- ✅ Clean, reusable logic

---

## 🔔 Toast Notification Service

Centralized toast system with consistent styling:

```jsx
import { useToast } from '../Shared/services/toastService';

export function MyComponent() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success('Operation completed!');
  };

  const handleError = () => {
    toast.error('Something went wrong');
  };

  const handleWarning = () => {
    toast.warning('Please check your input');
  };

  return (
    <>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handleWarning}>Show Warning</button>
    </>
  );
}
```

---

## ❌ Error Handling

### ErrorBoundary Component
```jsx
import ErrorBoundary from '../Shared/components/ErrorBoundary';

<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

### Error Pages
- `NotFound.jsx` (404)
- `ServerError.jsx` (500)

Add to routes:
```jsx
const NotFound = lazy(() => import('../Shared/pages/NotFound'));
const ServerError = lazy(() => import('../Shared/pages/ServerError'));

// In routes array:
{ path: "*", element: <NotFound /> },
```

---

## 🚀 Performance Optimizations

### 1. Code Splitting
Use `React.lazy()` for route components:
```jsx
const ProductsPage = lazy(() => import('../pages/products/ProductsPage'));
const AdminDashboard = lazy(() => import('../admin/pages/dashboard/Dashboard'));
```

### 2. Memoization
```jsx
import { memo, useMemo, useCallback } from 'react';

// Prevent unnecessary re-renders
export default memo(ProductCard, (prev, next) => {
  return prev.id === next.id && prev.inStock === next.inStock;
});
```

### 3. Image Optimization
```jsx
// Lazy load images
<img loading="lazy" src={imageUrl} alt="description" />

// Responsive images
<img 
  src={imageUrl}
  srcSet={`${imageUrl}?w=400 400w, ${imageUrl}?w=800 800w`}
  sizes="(max-width: 600px) 400px, 800px"
/>
```

### 4. Remove Console Logs
```bash
# Find all console statements
grep -r "console\." src/

# Use production builds to strip them out
npm run build
```

### 5. Virtual Scrolling (for long lists)
```jsx
import { FixedSizeList } from 'react-window';

<FixedSizeList height={400} itemCount={1000} itemSize={100}>
  {({ index, style }) => <ProductCard key={index} style={style} />}
</FixedSizeList>
```

---

## 📱 Mobile UX Improvements

### Responsive Design Checklist
- ✅ Mobile-first approach in Tailwind classes
- ✅ Touch-friendly button sizes (min 44px)
- ✅ Simplified navigation on mobile
- ✅ Optimized image sizes
- ✅ Readable font sizes (base 16px)

### Example Mobile Layout
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Automatically responsive */}
  {products.map(p => <ProductCard key={p.id} {...p} />)}
</div>
```

---

## 🎬 Animation System

### Micro-interactions
- Button hover effects
- Card flip/scale animations
- Smooth page transitions
- Loading spinners
- Toast notifications

### GSAP Integration (already in codebase)
```jsx
useEffect(() => {
  gsap.from(heroRef.current, {
    opacity: 0,
    y: 60,
    duration: 1,
    ease: "power3.out",
  });
}, []);
```

---

## 📋 Form Components

Create form-specific components:

```jsx
// src/Shared/components/form/FormInput.jsx
export function FormInput({ name, label, error, register, ...props }) {
  return (
    <Input 
      label={label}
      error={error?.[name]?.message}
      {...register(name)}
      {...props}
    />
  );
}

// Usage with react-hook-form
<FormInput 
  name="email"
  label="Email"
  register={register}
  error={formState.errors}
/>
```

---

## 🔄 Migration Guide

### Step 1: Update Navbar
```jsx
// OLD
import Navbar from "../layout/Navbar";

// NEW - Same import, but component updated internally
import Navbar from "../layout/Navbar";
// Now uses Button, Card components
```

### Step 2: Update Product Cards
```jsx
// OLD
<div className="bg-white p-4 rounded">
  <h3>{product.name}</h3>
</div>

// NEW
<Card hoverable>
  <h3 className="font-bold">{product.name}</h3>
</Card>
```

### Step 3: Replace Toast Calls
```jsx
// OLD
toast.success('Added to cart!');

// NEW
useToast().success('Added to cart!');
```

### Step 4: Add Error Boundary
```jsx
// In App.jsx
<ErrorBoundary>
  <Router />
</ErrorBoundary>
```

---

## 🧪 Testing Components

```jsx
import { render, screen } from '@testing-library/react';
import Button from '../Button';

test('renders button with correct text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});

test('shows loading state', () => {
  render(<Button loading>Loading</Button>);
  expect(screen.getByRole('button')).toBeDisabled();
});
```

---

## 📚 Storybook Integration (Optional)

For component documentation:

```bash
npm install -D @storybook/react
npx storybook init
```

Example story:
```jsx
// Button.stories.jsx
export default { title: 'UI/Button' };

export const Primary = () => <Button variant="primary">Click me</Button>;
export const Loading = () => <Button variant="primary" loading>Loading</Button>;
export const Disabled = () => <Button disabled>Disabled</Button>;
```

---

## 📊 Before vs After

| Aspect | Before | After |
|--------|--------|-------|
| **Component Consistency** | Ad-hoc styling | Centralized UI library |
| **Code Duplication** | High (buttons repeated) | Zero (reusable components) |
| **Loading States** | Missing or inconsistent | Skeleton loaders everywhere |
| **Error Handling** | Try/catch scattered | ErrorBoundary + error pages |
| **Toast Messages** | Inconsistent styling | Unified toast service |
| **Performance** | Large bundle | Code split + optimized |
| **Mobile UX** | Not considered | Mobile-first responsive |
| **Accessibility** | Minimal | ARIA labels + keyboard nav |

---

## ✅ Implementation Checklist

- [ ] Review tailwind.config.js enhancements
- [ ] Familiarize with all UI components
- [ ] Replace buttons in existing pages
- [ ] Update product cards with Card component
- [ ] Implement useProducts/useCategories hooks
- [ ] Add toast service to all API calls
- [ ] Add error boundaries to key pages
- [ ] Test responsive design on mobile
- [ ] Remove console logs before production
- [ ] Test all loading states with Skeleton components

---

## 🎓 Resources

- [Tailwind CSS Docs](https://tailwindcss.com)
- [React Hooks Best Practices](https://react.dev/reference/react/hooks)
- [GSAP Documentation](https://gsap.com/docs/)
- [Accessibility Guidelines](https://www.a11y-101.com/)

---

**Last Updated:** June 14, 2026
**Status:** ✅ Complete - Ready for Implementation
