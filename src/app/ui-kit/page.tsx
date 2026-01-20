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
  EmptyState,
  PageHeader,
  Badge,
  Skeleton,
  SkeletonList,
  SkeletonText,
  SkeletonCard,
  ProgressBar,
  FAB,
  SegmentedControl,
  CollapsibleCard,
} from "@/components/ui";

export default function UIKitPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [segmentValue, setSegmentValue] = useState("option1");
  const { toasts, showToast, removeToast } = useToast();

  return (
    <div className="w-full space-y-8 pb-8">
      <PageHeader
        title="UI Kit"
        description="A showcase of all available UI components and their states"
      />

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Buttons</h2>
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-3">
                <Button isLoading>Loading</Button>
                <Button disabled>Disabled</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Cards */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Card with Header</CardTitle>
              <CardDescription>This is a card description</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-secondary">
                Card content goes here. This is where you put the main information.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="primary" size="sm">Action</Button>
              <Button variant="ghost" size="sm">Cancel</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-text-secondary">Card with large padding</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Badges */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Badges</h2>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3">
              <Badge variant="default">Default</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="default" size="sm">Small</Badge>
              <Badge variant="success" size="md">Medium</Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Inputs */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Inputs</h2>
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <Input label="Default Input" placeholder="Enter text..." />
              <Input label="With Helper Text" placeholder="Enter text..." helperText="This is helper text" />
              <Input label="With Error" placeholder="Enter text..." error="This field is required" />
              <Input label="Disabled" placeholder="Enter text..." disabled />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Select */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Select</h2>
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
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

      {/* Segmented Control */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Segmented Control</h2>
        <Card>
          <CardContent className="p-4">
            <SegmentedControl
              options={[
                { value: "option1", label: "Option 1" },
                { value: "option2", label: "Option 2" },
                { value: "option3", label: "Option 3" },
              ]}
              value={segmentValue}
              onChange={setSegmentValue}
              className="w-full"
            />
          </CardContent>
        </Card>
      </section>

      {/* Progress Bar */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Progress Bar</h2>
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-text-secondary mb-2">Default (50%)</p>
                <ProgressBar value={50} />
              </div>
              <div>
                <p className="text-sm text-text-secondary mb-2">Success (75%)</p>
                <ProgressBar value={75} variant="success" />
              </div>
              <div>
                <p className="text-sm text-text-secondary mb-2">With Label (60%)</p>
                <ProgressBar value={60} showLabel />
              </div>
              <div>
                <p className="text-sm text-text-secondary mb-2">Large (80%)</p>
                <ProgressBar value={80} size="lg" />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Skeletons */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Skeletons</h2>
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-text-secondary mb-2">Text Skeleton</p>
                <SkeletonText lines={3} />
              </div>
              <div>
                <p className="text-sm text-text-secondary mb-2">Card Skeleton</p>
                <SkeletonCard />
              </div>
              <div>
                <p className="text-sm text-text-secondary mb-2">List Skeleton</p>
                <SkeletonList items={3} />
              </div>
              <div>
                <p className="text-sm text-text-secondary mb-2">Custom Skeleton</p>
                <Skeleton variant="rectangular" width="100%" height={100} />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Collapsible Card */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Collapsible Card</h2>
        <CollapsibleCard title="Filters" defaultOpen={false}>
          <div className="space-y-4">
            <Input label="Search" placeholder="Type to search..." />
            <Select
              label="Filter by"
              options={[
                { value: "1", label: "Option 1" },
                { value: "2", label: "Option 2" },
              ]}
            />
          </div>
        </CollapsibleCard>
      </section>

      {/* Modal */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Modal</h2>
        <Card>
          <CardContent className="p-4">
            <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Example Modal" size="md">
              <p className="text-sm text-text-secondary mb-6">
                This is a modal dialog. You can put any content here.
              </p>
              <div className="flex gap-3 pt-2">
                <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button variant="primary" onClick={() => setIsModalOpen(false)} className="flex-1">
                  Confirm
                </Button>
              </div>
            </Modal>
          </CardContent>
        </Card>
      </section>

      {/* Toast */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Toast Notifications</h2>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" size="sm" onClick={() => showToast("Success message!", "success")}>
                Success Toast
              </Button>
              <Button variant="secondary" size="sm" onClick={() => showToast("Error message!", "error")}>
                Error Toast
              </Button>
              <Button variant="ghost" size="sm" onClick={() => showToast("Info message!", "info")}>
                Info Toast
              </Button>
              <Button variant="ghost" size="sm" onClick={() => showToast("Warning message!", "warning")}>
                Warning Toast
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Empty State */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Empty State</h2>
        <Card>
          <CardContent className="p-4">
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
              action={<Button variant="primary" size="sm">Create Item</Button>}
            />
          </CardContent>
        </Card>
      </section>

      {/* FAB */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">FAB (Floating Action Button)</h2>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-text-secondary mb-4">
              FAB appears in the bottom-right corner. Check the bottom-right of this page.
            </p>
            <p className="text-xs text-text-secondary">
              Note: FAB is positioned fixed and will appear above other content.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Typography */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Typography</h2>
        <Card>
          <CardContent className="p-4">
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-text-primary mb-2">Display Text</h1>
                <p className="text-xs text-text-secondary">Used for hero sections and large headings</p>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-text-primary mb-2">Title Text</h2>
                <p className="text-xs text-text-secondary">Used for page titles</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Headline Text</h3>
                <p className="text-xs text-text-secondary">Used for section headings</p>
              </div>
              <div>
                <p className="text-sm text-text-primary mb-2">Body text is used for regular content and paragraphs.</p>
                <p className="text-xs text-text-secondary">Caption text is used for secondary information and metadata.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Colors */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Colors</h2>
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="w-full h-16 bg-background rounded-card border border-gray-200 mb-2"></div>
                <p className="text-xs text-text-secondary">Background</p>
              </div>
              <div>
                <div className="w-full h-16 bg-surface rounded-card shadow-soft mb-2"></div>
                <p className="text-xs text-text-secondary">Surface</p>
              </div>
              <div>
                <div className="w-full h-16 bg-accent rounded-card mb-2"></div>
                <p className="text-xs text-text-secondary">Accent</p>
              </div>
              <div>
                <div className="w-full h-16 bg-accent-secondary rounded-card mb-2"></div>
                <p className="text-xs text-text-secondary">Accent Secondary</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* FAB Demo */}
      <FAB
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        }
        label="Demo FAB"
        onClick={() => showToast("FAB clicked!", "info")}
        position="bottom-right"
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
