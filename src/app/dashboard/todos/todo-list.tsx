"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createTodo, updateTodo, deleteTodo } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Loader2, Pencil, Trash2, Plus, Search, Check, X } from "lucide-react";

export type TodoItem = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type Filter = "all" | "pending" | "completed";

type TodoListProps = {
  initialTodos: TodoItem[];
};

export function TodoList({ initialTodos }: TodoListProps) {
  const router = useRouter();
  const [todos, setTodos] = useState<TodoItem[]>(initialTodos);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    setTodos(initialTodos);
  }, [initialTodos]);

  const pending = todos.filter((t) => !t.completed).length;
  const completed = todos.filter((t) => t.completed).length;

  const filteredTodos = todos.filter((t) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "pending" && !t.completed) ||
      (filter === "completed" && t.completed);
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      t.title.toLowerCase().includes(q) ||
      (t.description ?? "").toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) {
      toast.error("Title is required.");
      return;
    }
    setIsAdding(true);
    try {
      const formData = new FormData();
      formData.set("title", title);
      if (newDesc.trim()) formData.set("description", newDesc.trim());
      const result = await createTodo(formData);
      if (result.success) {
        toast.success("Task added.");
        setNewTitle("");
        setNewDesc("");
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to add task.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleComplete = async (todo: TodoItem) => {
    // Optimistic update — no await before state change
    setTodos((prev) =>
      prev.map((t) => (t.id === todo.id ? { ...t, completed: !t.completed } : t))
    );
    try {
      const result = await updateTodo(todo.id, { completed: !todo.completed });
      if (!result.success) {
        setTodos((prev) =>
          prev.map((t) => (t.id === todo.id ? { ...t, completed: todo.completed } : t))
        );
        toast.error(result.error ?? "Failed to update.");
      }
    } catch {
      setTodos((prev) =>
        prev.map((t) => (t.id === todo.id ? { ...t, completed: todo.completed } : t))
      );
      toast.error("Failed to update.");
    }
  };

  const startEdit = (todo: TodoItem) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
    setEditDesc(todo.description ?? "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDesc("");
  };

  const handleInlineSave = async (todo: TodoItem) => {
    const title = editTitle.trim();
    if (!title) {
      toast.error("Title cannot be empty.");
      return;
    }
    const desc = editDesc.trim() || null;

    // Optimistic update
    setTodos((prev) =>
      prev.map((t) => (t.id === todo.id ? { ...t, title, description: desc } : t))
    );
    setEditingId(null);
    setSavingId(todo.id);

    try {
      const result = await updateTodo(todo.id, { title, description: desc });
      if (!result.success) {
        setTodos((prev) =>
          prev.map((t) =>
            t.id === todo.id ? { ...t, title: todo.title, description: todo.description } : t
          )
        );
        toast.error(result.error ?? "Failed to update.");
      } else {
        toast.success("Task updated.");
      }
    } catch {
      setTodos((prev) =>
        prev.map((t) =>
          t.id === todo.id ? { ...t, title: todo.title, description: todo.description } : t
        )
      );
      toast.error("Failed to update.");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (todoId: string) => {
    const deleted = todos.find((t) => t.id === todoId);
    // Optimistic remove
    setTodos((prev) => prev.filter((t) => t.id !== todoId));
    setDeletingId(null);
    toast.success("Task deleted.");

    try {
      const result = await deleteTodo(todoId);
      if (!result.success) {
        if (deleted) {
          setTodos((prev) =>
            [...prev, deleted].sort(
              (a, b) =>
                Number(a.completed) - Number(b.completed) ||
                new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            )
          );
        }
        toast.error(result.error ?? "Failed to delete.");
      }
    } catch {
      if (deleted) {
        setTodos((prev) =>
          [...prev, deleted].sort(
            (a, b) =>
              Number(a.completed) - Number(b.completed) ||
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
        );
      }
      toast.error("Failed to delete.");
    }
  };

  const filterLabels: Record<Filter, string> = {
    all: `All (${todos.length})`,
    pending: `Pending (${pending})`,
    completed: `Done (${completed})`,
  };

  return (
    <div className="mx-auto max-w-2xl space-y-7">
      {/* Page header */}
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">
          Tasks
        </p>
        <h2 className="font-display text-3xl font-semibold tracking-tight">My Tasks</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {todos.length === 0
            ? "Nothing here yet — add your first task below."
            : `${pending} pending · ${completed} completed`}
        </p>
      </div>

      {/* Add task form */}
      <form
        onSubmit={handleCreate}
        className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3"
      >
        <h3 className="text-sm font-semibold text-foreground">Add a task</h3>
        <Input
          placeholder="What needs to be done?"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          disabled={isAdding}
          maxLength={500}
          className="h-10"
        />
        <Input
          placeholder="Details (optional)"
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          disabled={isAdding}
          maxLength={1000}
          className="h-9 text-sm"
        />
        <Button type="submit" disabled={isAdding} className="w-full h-9 font-medium">
          {isAdding ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding…
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </>
          )}
        </Button>
      </form>

      {/* Search + filter (only when there are tasks) */}
      {todos.length > 0 && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search tasks…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "pending", "completed"] as Filter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-full px-3.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                {filterLabels[f]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Task cards */}
      {filteredTodos.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground">
            {search
              ? "No tasks match your search."
              : filter !== "all"
              ? `No ${filter} tasks.`
              : "Add your first task above."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filteredTodos.map((todo) => {
            const isEditing = editingId === todo.id;
            const isSaving = savingId === todo.id;

            return (
              <li key={todo.id}>
                <div
                  className={`group rounded-2xl border border-border bg-card p-4 shadow-sm transition-opacity ${
                    todo.completed ? "opacity-60" : ""
                  } ${isSaving ? "animate-pulse" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <Checkbox
                      id={`check-${todo.id}`}
                      checked={todo.completed}
                      onCheckedChange={() => !isEditing && handleToggleComplete(todo)}
                      disabled={isEditing || isSaving}
                      className="mt-1 shrink-0"
                    />

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            autoFocus
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleInlineSave(todo);
                              if (e.key === "Escape") cancelEdit();
                            }}
                            className="h-8 text-sm font-medium"
                            maxLength={500}
                          />
                          <Input
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Escape") cancelEdit();
                            }}
                            placeholder="Details (optional)"
                            className="h-8 text-sm"
                            maxLength={1000}
                          />
                          <div className="flex gap-2 pt-0.5">
                            <Button
                              type="button"
                              size="sm"
                              className="h-7 px-3 text-xs"
                              onClick={() => handleInlineSave(todo)}
                              disabled={!editTitle.trim()}
                            >
                              <Check className="mr-1 h-3 w-3" />
                              Save
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-7 px-3 text-xs"
                              onClick={cancelEdit}
                            >
                              <X className="mr-1 h-3 w-3" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`${!todo.completed ? "cursor-pointer" : ""}`}
                          onClick={() => !todo.completed && !isSaving && startEdit(todo)}
                          title={!todo.completed ? "Click to edit" : undefined}
                        >
                          <p
                            className={`font-medium leading-snug transition-colors ${
                              todo.completed
                                ? "text-muted-foreground line-through"
                                : "text-foreground group-hover:text-primary"
                            }`}
                          >
                            {todo.title}
                            {!todo.completed && (
                              <Pencil className="ml-2 inline h-3 w-3 opacity-0 group-hover:opacity-30 transition-opacity" />
                            )}
                          </p>
                          {todo.description && (
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                              {todo.description}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    {!isEditing && (
                      <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => startEdit(todo)}
                          disabled={isSaving || todo.completed}
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeletingId(todo.id)}
                          disabled={isSaving}
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={deletingId !== null} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;
              {todos.find((t) => t.id === deletingId)?.title ?? "this task"}&rdquo;? This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && handleDelete(deletingId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
