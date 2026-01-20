"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Select,
  Modal,
  ToastContainer,
  useToast,
  Spinner,
  EmptyState,
  PageHeader,
} from "@/components/ui";

export default function UIKitPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-16">
      <PageHeader
        title="UI Kit"
        description="A showcase of all available UI components and their states"
      />

      {/* Buttons */}
      <section>
        <h2 className="text-headline mb-6">Buttons</h2>
        <div className="space-y-6">
          <Card>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button isLoading>Loading</Button>
                <Button disabled>Disabled</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Cards */}
      <section>
        <h2 className="text-headline mb-6">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Card with Header</CardTitle>
              <CardDescription>This is a card description</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-body text-gray-600 dark:text-gray-400">
                Card content goes here. This is where you put the main information.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="primary">Action</Button>
              <Button variant="ghost">Cancel</Button>
            </CardFooter>
          </Card>
          <Card padding="lg">
            <CardContent>
              <p className="text-body">Card with large padding</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Inputs */}
      <section>
        <h2 className="text-headline mb-6">Inputs</h2>
        <div className="space-y-6">
          <Card>
            <CardContent>
              <div className="space-y-6">
                <Input label="Default Input" placeholder="Enter text..." />
                <Input label="With Helper Text" placeholder="Enter text..." helperText="This is helper text" />
                <Input label="With Error" placeholder="Enter text..." error="This field is required" />
                <Input label="Disabled" placeholder="Enter text..." disabled />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Select */}
      <section>
        <h2 className="text-headline mb-6">Select</h2>
        <Card>
          <CardContent>
            <div className="space-y-6">
              <Select
                label="Choose an option"
                options={[
                  { value: "1", label: "Option 1" },
                  { value: "2", label: "Option 2" },
                  { value: "3", label: "Option 3" },
                ]}
              />
              <Select
                label="With Error"
                error="Please select an option"
                options={[
                  { value: "1", label: "Option 1" },
                  { value: "2", label: "Option 2" },
                ]}
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Modal */}
      <section>
        <h2 className="text-headline mb-6">Modal</h2>
        <Card>
          <CardContent>
            <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Example Modal">
              <p className="text-body text-gray-600 dark:text-gray-400 mb-6">
                This is a modal dialog. You can put any content here.
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                  Confirm
                </Button>
              </div>
            </Modal>
          </CardContent>
        </Card>
      </section>

      {/* Toast */}
      <section>
        <h2 className="text-headline mb-6">Toast Notifications</h2>
        <Card>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" onClick={() => showToast("Success message!", "success")}>
                Success Toast
              </Button>
              <Button variant="danger" onClick={() => showToast("Error message!", "error")}>
                Error Toast
              </Button>
              <Button variant="secondary" onClick={() => showToast("Info message!", "info")}>
                Info Toast
              </Button>
              <Button variant="ghost" onClick={() => showToast("Warning message!", "warning")}>
                Warning Toast
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Spinner */}
      <section>
        <h2 className="text-headline mb-6">Spinner</h2>
        <Card>
          <CardContent>
            <div className="flex items-center gap-8">
              <div className="flex flex-col items-center gap-2">
                <Spinner size="sm" />
                <span className="text-caption">Small</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Spinner size="md" />
                <span className="text-caption">Medium</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Spinner size="lg" />
                <span className="text-caption">Large</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Empty State */}
      <section>
        <h2 className="text-headline mb-6">Empty State</h2>
        <Card>
          <CardContent>
            <EmptyState
              title="No items found"
              description="There are no items to display at this time. Check back later or create a new item."
              icon={
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              }
              action={<Button variant="primary">Create Item</Button>}
            />
          </CardContent>
        </Card>
      </section>

      {/* Typography */}
      <section>
        <h2 className="text-headline mb-6">Typography</h2>
        <Card>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h1 className="text-display mb-2">Display Text</h1>
                <p className="text-caption">Used for hero sections and large headings</p>
              </div>
              <div>
                <h2 className="text-title mb-2">Title Text</h2>
                <p className="text-caption">Used for page titles</p>
              </div>
              <div>
                <h3 className="text-headline mb-2">Headline Text</h3>
                <p className="text-caption">Used for section headings</p>
              </div>
              <div>
                <p className="text-body mb-2">Body text is used for regular content and paragraphs.</p>
                <p className="text-caption">Caption text is used for secondary information and metadata.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
