import { useState } from 'react';
import {
  Button,
  Card,
  Input,
  Badge,
  Modal,
  Alert,
  Skeleton,
  Spinner,
  LoadingPage,
} from '../components/ui';
import { Mail, Heart, ShoppingCart } from 'lucide-react';

/**
 * Component Showcase Page
 * Shows all available UI components and their variants
 * Visit: /showcase to view this page
 * 
 * This page serves as:
 * - Developer documentation
 * - Design system reference
 * - Component testing ground
 */

export default function ComponentShowcase() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600">
            Shoplix Components
          </h1>
          <p className="text-xl text-neutral-600">
            A complete UI component showcase and documentation
          </p>
        </div>

        {/* Buttons Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-neutral-900">Buttons</h2>

          <Card>
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-neutral-900">Variants</h3>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="danger">Danger</Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-neutral-900">Sizes</h3>
                <div className="flex flex-wrap gap-3 items-center">
                  <Button size="xs">Extra Small</Button>
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-neutral-900">With Icons</h3>
                <div className="flex flex-wrap gap-3">
                  <Button icon={Mail} iconPosition="left">
                    Email
                  </Button>
                  <Button icon={Heart} iconPosition="right">
                    Favorite
                  </Button>
                  <Button icon={ShoppingCart}>Cart</Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-neutral-900">States</h3>
                <div className="flex flex-wrap gap-3">
                  <Button>Normal</Button>
                  <Button loading>Loading...</Button>
                  <Button disabled>Disabled</Button>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Cards Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-neutral-900">Cards</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <p className="text-neutral-600">
                Standard card with padding and subtle shadow
              </p>
            </Card>

            <Card hoverable>
              <p className="text-neutral-600">
                Hoverable card scales up and shadow increases on hover
              </p>
            </Card>

            <Card glass>
              <p className="text-neutral-600">
                Glass morphism effect with backdrop blur
              </p>
            </Card>

            <Card
              header={<h3 className="font-bold">Card Header</h3>}
              footer={
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Cancel
                  </Button>
                  <Button size="sm">Save</Button>
                </div>
              }
            >
              <p className="text-neutral-600">
                Card with header and footer sections
              </p>
            </Card>
          </div>
        </section>

        {/* Input Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-neutral-900">Inputs</h2>

          <Card className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              hint="We'll never share your email"
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              hint="Min. 8 characters"
            />

            <Input
              label="With Error"
              error="This field is required"
              placeholder="Try me..."
            />

            <Input
              label="Disabled Input"
              disabled
              value="You cannot edit this"
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="+1 (555) 000-0000"
            />

            <Input
              label="Number Input"
              type="number"
              placeholder="Enter a number"
            />
          </Card>
        </section>

        {/* Badges Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-neutral-900">Badges</h2>

          <Card className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-neutral-900">Variants</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="primary">Primary</Badge>
                <Badge variant="success">In Stock</Badge>
                <Badge variant="warning">Low Stock</Badge>
                <Badge variant="error">Out of Stock</Badge>
                <Badge variant="info">Information</Badge>
                <Badge variant="outline">Outlined</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-neutral-900">Sizes</h3>
              <div className="flex flex-wrap gap-2">
                <Badge size="xs">Extra Small</Badge>
                <Badge size="sm">Small</Badge>
                <Badge size="md">Medium</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-neutral-900">With Icons</h3>
              <div className="flex flex-wrap gap-2">
                <Badge icon={Heart}>Favorite</Badge>
                <Badge icon={ShoppingCart}>Cart</Badge>
              </div>
            </div>
          </Card>
        </section>

        {/* Alert Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-neutral-900">Alerts</h2>

          <Card className="space-y-4">
            <Alert
              variant="info"
              title="Information"
              message="This is an informational message"
            />

            <Alert
              variant="success"
              title="Success!"
              message="Operation completed successfully"
            />

            <Alert
              variant="warning"
              title="Warning"
              message="Please check your input before proceeding"
            />

            <Alert
              variant="error"
              title="Error"
              message="Something went wrong. Please try again"
            />

            {!isDismissed && (
              <Alert
                variant="info"
                title="Dismissible Alert"
                message="Click the X button to close this alert"
                dismissible
                onClose={() => setIsDismissed(true)}
              />
            )}
          </Card>
        </section>

        {/* Loading States */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-neutral-900">Loading States</h2>

          <Card className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-neutral-900">Spinner</h3>
              <div className="flex gap-6">
                <Spinner size="sm" />
                <Spinner size="md" />
                <Spinner size="lg" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-neutral-900">Skeleton Loaders</h3>
              <Skeleton width="100%" height="1.5rem" count={3} />
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-neutral-900">Button Loading</h3>
              <Button loading>Processing...</Button>
            </div>
          </Card>
        </section>

        {/* Modal Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-neutral-900">Modal</h2>

          <Card>
            <Button onClick={() => setIsModalOpen(true)}>
              Open Modal
            </Button>

            <Modal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              title="Welcome to Shoplix"
              footer={
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="ghost"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={() => setIsModalOpen(false)}>
                    Confirm
                  </Button>
                </div>
              }
            >
              <p className="text-neutral-600 space-y-3">
                <span>This is a modal dialog component.</span>
                <br />
                <span>
                  It supports custom headers, content, and footer sections. Click outside
                  or the X button to close.
                </span>
              </p>
            </Modal>
          </Card>
        </section>

        {/* Colors Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-neutral-900">Color System</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Primary', colors: ['50', '100', '500', '700', '900'] },
              { name: 'Secondary', colors: ['50', '100', '500', '700', '900'] },
              { name: 'Neutral', colors: ['50', '100', '500', '700', '900'] },
              { name: 'Status', colors: ['success', 'warning', 'error'] },
            ].map((colorGroup) => (
              <Card key={colorGroup.name}>
                <h3 className="font-semibold mb-3">{colorGroup.name}</h3>
                <div className="space-y-2">
                  {colorGroup.colors.map((color) => (
                    <div
                      key={color}
                      className={`h-8 rounded text-xs flex items-center px-2 text-white font-mono bg-${colorGroup.name.toLowerCase()}-${color}`}
                    >
                      {color}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Tips Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-neutral-900">💡 Tips</h2>

          <Card className="bg-gradient-to-r from-primary-50 to-accent-50">
            <ul className="space-y-2 text-neutral-700">
              <li>✅ Import components from <code className="text-sm bg-white px-2 py-1 rounded">../Shared/components/ui</code></li>
              <li>✅ Use hooks from <code className="text-sm bg-white px-2 py-1 rounded">../Shared/hooks</code></li>
              <li>✅ Check QUICK_START.md for common patterns</li>
              <li>✅ Review FRONTEND_RESTRUCTURING.md for detailed docs</li>
              <li>✅ Use Tailwind classes for additional styling</li>
              <li>✅ All components support custom className prop</li>
            </ul>
          </Card>
        </section>
      </div>
    </div>
  );
}
