"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  PageHeader,
  Card,
  CardContent,
  Button,
  Modal,
  Input,
  EmptyState,
  useToast,
  ToastContainer,
  SkeletonList,
  FAB,
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
      const [hallData, blocksData] = await Promise.all([
        apiGet<Hall>(`/api/halls/${hallId}`),
        apiGet<Block[]>(`/api/halls/${hallId}/blocks`),
      ]);
      setHall(hallData);
      setBlocks(blocksData);
    } catch (err) {
      const error = err as FetchError;
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

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    if (dateOnly.getTime() === today.getTime()) {
      return "Today";
    }

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (dateOnly.getTime() === tomorrow.getTime()) {
      return "Tomorrow";
    }

    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const groupedBlocks = useMemo(() => {
    const grouped: Record<string, Block[]> = {};
    blocks.forEach((block) => {
      const dateKey = new Date(block.startAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(block);
    });
    
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
    });
    
    return grouped;
  }, [blocks]);

  return (
    <div className="w-full space-y-4 pb-20">
      <PageHeader
        title={hall ? hall.name : "Hall Blocks"}
        description="Manage time blocks when this hall is unavailable"
        action={
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin/halls")}>
            ← Back
          </Button>
        }
      />

      {/* Loading State */}
      {loading && <SkeletonList items={3} />}

      {/* Empty State */}
      {!loading && blocks.length === 0 && (
        <EmptyState
          title="No blocks yet"
          description="Create a time block to mark when this hall is unavailable"
          icon={
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      )}

      {/* Day Grouped Blocks */}
      {!loading && blocks.length > 0 && (
        <div className="space-y-4">
          {Object.entries(groupedBlocks).map(([dateKey, dateBlocks]) => {
            const dateBlocksArray = dateBlocks as Block[];
            const firstBlock = dateBlocksArray[0];
            const displayDate = formatDate(firstBlock.startAt);
            
            return (
              <Card key={dateKey}>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-text-primary mb-3">{displayDate}</h3>
                  <div className="space-y-3">
                    {dateBlocksArray.map((block: Block) => (
                      <Card key={block._id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <p className="text-2xl font-bold text-text-primary mb-1">
                                {formatTime(block.startAt)}
                              </p>
                              <p className="text-sm text-text-secondary mb-2">
                                {formatTime(block.endAt)}
                              </p>
                              <p className="text-sm text-text-secondary">{block.reason}</p>
                            </div>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleDelete(block._id)}
                              isLoading={deletingBlockId === block._id}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Modal (Bottom Sheet) */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setCreateForm({ startAt: "", endAt: "", reason: "" });
        }}
        title="Block Time"
        size="md"
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
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => {
                setIsCreateModalOpen(false);
                setCreateForm({ startAt: "", endAt: "", reason: "" });
              }}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreate} isLoading={isSubmitting} className="flex-1">
              Create Block
            </Button>
          </div>
        </div>
      </Modal>

      {/* FAB */}
      <FAB
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        }
        label="Block time"
        onClick={() => setIsCreateModalOpen(true)}
        position="bottom-right"
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
