## 🚀 Quick Start - Using New Components

### Import Components

```jsx
// Easy way - import from index
import { Button, Card, Input, Badge, Spinner } from '../Shared/components/ui';
import { useProducts, useCategories } from '../Shared/hooks';
import { useToast } from '../Shared/services/toastService';
```

---

## 📝 Common Patterns

### Pattern 1: Product List Page

**Before:**
```jsx
export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    productService.getAllProducts({ category, sort })
      .then(res => setProducts(res.data.products || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [category, sort]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      {products.map(p => (
        <div key={p.id} className="border p-4">
          {p.name}
        </div>
      ))}
    </div>
  );
}
```

**After (Clean & Reusable):**
```jsx
import { useProducts } from '../Shared/hooks';
import { Card, Spinner, CardSkeleton } from '../Shared/components/ui';

export default function ProductsPage() {
  const { products, loading, error } = useProducts({ category, sort });

  // Show skeleton loaders while loading
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  // Show error alert
  if (error) {
    return (
      <Alert 
        variant="error" 
        title="Error" 
        message={error}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map(product => (
        <Card key={product.id} hoverable>
          <img src={product.image} alt={product.name} />
          <h3 className="font-bold mt-2">{product.name}</h3>
          <p className="text-gray-600">${product.price}</p>
          <Button className="w-full mt-4">Add to Cart</Button>
        </Card>
      ))}
    </div>
  );
}
```

---

### Pattern 2: Form with Validation

**Before:**
```jsx
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [emailError, setEmailError] = useState('');

const handleSubmit = (e) => {
  e.preventDefault();
  if (!email.includes('@')) {
    setEmailError('Invalid email');
    return;
  }
  // ...
};

return (
  <form onSubmit={handleSubmit}>
    <div className="mb-4">
      <label>Email</label>
      <input 
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="border rounded p-2"
      />
      {emailError && <p className="text-red-500">{emailError}</p>}
    </div>
  </form>
);
```

**After (Clean & Accessible):**
```jsx
import { Input, Button, useToast } from '../Shared';

export default function LoginForm() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.login(formData);
      toast.success('Login successful!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input 
        label="Email Address"
        type="email"
        value={formData.email}
        onChange={e => setFormData({...formData, email: e.target.value})}
        hint="We'll never share your email"
      />
      <Input 
        label="Password"
        type="password"
        value={formData.password}
        onChange={e => setFormData({...formData, password: e.target.value})}
      />
      <Button 
        type="submit" 
        variant="primary" 
        loading={loading}
        className="w-full"
      >
        Sign In
      </Button>
    </form>
  );
}
```

---

### Pattern 3: Data Display with Actions

**Before:**
```jsx
const [isDeleting, setIsDeleting] = useState(false);

const handleDelete = async (id) => {
  if (!confirm('Are you sure?')) return;
  setIsDeleting(true);
  try {
    await productService.deleteProduct(id);
    alert('Deleted successfully');
    // refetch
  } catch (err) {
    alert('Delete failed');
  } finally {
    setIsDeleting(false);
  }
};

return (
  <table>
    <tr>
      <td>{product.name}</td>
      <td>
        <button disabled={isDeleting} onClick={() => handleDelete(product.id)}>
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </td>
    </tr>
  </table>
);
```

**After (Modal Confirmation):**
```jsx
import { Button, Modal, Card } from '../Shared/components/ui';
import { useToast } from '../Shared/services/toastService';

export default function ProductRow({ product, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleConfirmDelete = async () => {
    setIsLoading(true);
    try {
      await productService.deleteProduct(product.id);
      toast.success('Product deleted');
      onDelete(product.id);
      setIsOpen(false);
    } catch (err) {
      toast.error('Failed to delete product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card>
        <div className="flex justify-between items-center">
          <span>{product.name}</span>
          <Button 
            variant="danger" 
            onClick={() => setIsOpen(true)}
          >
            Delete
          </Button>
        </div>
      </Card>

      <Modal 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirm Delete"
        footer={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="danger" 
              loading={isLoading}
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </div>
        }
      >
        <p>Are you sure you want to delete "{product.name}"?</p>
      </Modal>
    </>
  );
}
```

---

### Pattern 4: Loading Skeleton States

```jsx
import { CardSkeleton, ProductCardSkeleton } from '../Shared/components/ui';

// Generic placeholder
{loading && <Skeleton width="100%" height="1rem" count={5} />}

// Card loading
{loading && <CardSkeleton />}

// Product grid loading
{loading && (
  <div className="grid grid-cols-3 gap-4">
    {[...Array(6)].map((_, i) => <ProductCardSkeleton key={i} />)}
  </div>
)}
```

---

### Pattern 5: Error Handling with Toast

```jsx
import { useToast } from '../Shared/services/toastService';

export default function DataTable() {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    const toastId = toast.loading('Fetching data...');
    
    try {
      const response = await API.getData();
      toast.dismiss(toastId);
      toast.success('Data loaded successfully!');
      // Use data
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(error.message || 'Failed to load data');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return <Button onClick={loadData} loading={isLoading}>Load Data</Button>;
}
```

---

### Pattern 6: Responsive Grid Layout

```jsx
// Automatically responsive: 1 col mobile → 2 cols tablet → 3 cols desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => (
    <Card key={item.id} hoverable>
      {/* Content */}
    </Card>
  ))}
</div>

// Sidebar + Content
<div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6">
  <aside className="bg-white p-4 rounded-lg">
    {/* Sidebar */}
  </aside>
  <main>
    {/* Main content */}
  </main>
</div>
```

---

## 🎨 Color Usage Examples

```jsx
// Background colors
<div className="bg-primary-50">Light green background</div>
<div className="bg-secondary-500">Purple</div>
<div className="bg-neutral-100">Light gray</div>

// Text colors
<p className="text-primary-700">Primary text</p>
<p className="text-error">Error text</p>
<p className="text-neutral-500">Secondary text</p>

// Border colors
<div className="border-2 border-primary-300">Bordered</div>

// Gradient backgrounds
<div className="bg-gradient-to-r from-primary-500 to-secondary-500">
  Gradient background
</div>
```

---

## 🔄 Migration Timeline

1. **Week 1:** Update all Button components
2. **Week 2:** Convert Card/Layout components
3. **Week 3:** Implement hooks + remove scattered fetch logic
4. **Week 4:** Add toast service + error boundaries
5. **Week 5:** Performance optimization + testing

---

## 📞 Support

If you have questions about any component:
1. Check `FRONTEND_RESTRUCTURING.md` for detailed docs
2. Look at component JSDoc comments
3. Check examples in this file
4. Review Tailwind documentation for styling questions

Happy coding! 🚀
