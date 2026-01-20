"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  PageHeader,
  Card,
  CardContent,
  Button,
  Modal,
  Input,
  EmptyState,
  Spinner,
  useToast,
  ToastContainer,
} from "@/components/ui";
import { apiGet, apiPost, apiDelete, datetimeLocalToISO, FetchError } from "@/lib/fetcher";

interface Hall {
  _id: string;
  name: string;
  isActive: boolean;
}

interface Block {
  _id: string;
  hallId: string;
  startAt: string;
  endAt: string;
  reason: string;
  createdAt: string;
}

export default function HallBlocksPage() {
  const params = useParams();
  const router = useRouter();
  const hallId = params.id as string;
  const { toasts, showToast, removeToast } = useToast();

  const [hall, setHall] = useState<Hall | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deletingBlockId, setDeletingBlockId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createForm, setCreateForm] = useState({
    startAt: "",
    endAt: "",
    reason: "",
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [hallData, blocksData] = await Promise.all([
        apiGet<Hall>(`/api/halls/${hallId}`),
        apiGet<Block[]>(`/api/halls/${hallId}/blocks`),
      ]);

      setHall(hallData);
      setBlocks(blocksData);
    } catch (err) {
      const error = err as FetchError;
      setError(error.message || "Failed to load data");
      showToast(error.message || "Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  }, [hallId, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async () => {
    if (!createForm.startAt || !createForm.endAt || !createForm.reason.trim()) {
      showToast("All fields are required", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const newBlock = await apiPost<Block>(`/api/halls/${hallId}/blocks`, {
        startAt: datetimeLocalToISO(createForm.startAt),
        endAt: datetimeLocalToISO(createForm.endAt),
        reason: createForm.reason.trim(),
      });
      setBlocks([...blocks, newBlock].sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()));
      setIsCreateModalOpen(false);
      setCreateForm({ startAt: "", endAt: "", reason: "" });
      showToast("Block created successfully", "success");
    } catch (err) {
      const error = err as FetchError;
      showToast(error.message || "Failed to create block", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (blockId: string) => {
    if (!confirm("Are you sure you want to delete this block?")) {
      return;
    }

    try {
      setDeletingBlockId(blockId);
      await apiDelete(`/api/blocks/${blockId}`);
      setBlocks(blocks.filter((b) => b._id !== blockId));
      showToast("Block deleted successfully", "success");
    } catch (err) {
      const error = err as FetchError;
      showToast(error.message || "Failed to delete block", "error");
    } finally {
      setDeletingBlockId(null);
    }
  };

  const groupBlocksByDate = (blocks: Block[]) => {
    const grouped: Record<string, Block[]> = {};
    blocks.forEach((block) => {
      const date = new Date(block.startAt).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(block);
    });
    return grouped;
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <PageHeader title="Hall Blocks" description="Manage time blocks for this hall" />
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  const groupedBlocks = groupBlocksByDate(blocks);

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title={hall ? `Blocks: ${hall.name}` : "Hall Blocks"}
        description="Manage time blocks when this hall is unavailable"
        action={
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => router.push("/admin/halls")}>
              Back to Halls
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)} variant="primary">
              Block Time
            </Button>
          </div>
        }
      />

      {error && !loading && (
        <Card className="mb-6">
          <CardContent>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {blocks.length === 0 ? (
        <Card>
          <CardContent padding="lg">
            <EmptyState
              title="No blocks yet"
              description="Create a time block to mark when this hall is unavailable"
              action={
                <Button onClick={() => setIsCreateModalOpen(true)} variant="primary">
                  Block Time
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedBlocks).map(([date, dateBlocks]) => (
            <Card key={date}>
              <CardContent>
                <h3 className="text-headline text-gray-900 dark:text-gray-100 mb-4">{date}</h3>
                <div className="space-y-3">
                  {dateBlocks.map((block) => (
                    <div
                      key={block._id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {formatTime(block.startAt)} - {formatTime(block.endAt)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{block.reason}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(block._id)}
                        isLoading={deletingBlockId === block._id}
                      >
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setCreateForm({ startAt: "", endAt: "", reason: "" });
        }}
        title="Block Time"
      >
        <div className="space-y-4">
          <Input
            type="datetime-local"
            label="Start Time"
            value={createForm.startAt}
            onChange={(e) => setCreateForm({ ...createForm, startAt: e.target.value })}
            required
            disabled={isSubmitting}
          />
          <Input
            type="datetime-local"
            label="End Time"
            value={createForm.endAt}
            onChange={(e) => setCreateForm({ ...createForm, endAt: e.target.value })}
            required
            disabled={isSubmitting}
          />
          <Input
            label="Reason"
            placeholder="Maintenance, Event, etc."
            value={createForm.reason}
            onChange={(e) => setCreateForm({ ...createForm, reason: e.target.value })}
            required
            disabled={isSubmitting}
          />
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setIsCreateModalOpen(false);
                setCreateForm({ startAt: "", endAt: "", reason: "" });
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreate} isLoading={isSubmitting}>
              Create Block
            </Button>
          </div>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
