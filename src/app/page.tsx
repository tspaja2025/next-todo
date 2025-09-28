"use client";

import { closestCenter, DndContext, type DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckIcon,
  CheckSquareIcon,
  Edit3Icon,
  GripVerticalIcon,
  PlusIcon,
  SquareIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

type FilterType = "all" | "active" | "completed";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // Load todos from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("todos");
    if (saved) {
      setTodos(
        JSON.parse(saved).map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
        })),
      );
    }
  }, []);

  // Save todos to localStorage
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = useCallback(() => {
    if (!inputValue.trim()) return;
    setTodos((prev) => [
      {
        id: crypto.randomUUID(),
        text: inputValue.trim(),
        completed: false,
        createdAt: new Date(),
      },
      ...prev,
    ]);
    setInputValue("");
  }, [inputValue]);

  const deleteTodo = useCallback(
    (id: string) => setTodos((prev) => prev.filter((todo) => todo.id !== id)),
    [],
  );

  const toggleTodo = useCallback(
    (id: string) =>
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo,
        ),
      ),
    [],
  );

  const startEditing = useCallback((id: string, text: string) => {
    setEditingId(id);
    setEditValue(text);
  }, []);

  const saveEdit = useCallback(() => {
    if (!editValue.trim()) {
      setEditingId(null);
      return;
    }
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === editingId ? { ...todo, text: editValue.trim() } : todo,
      ),
    );
    setEditingId(null);
    setEditValue("");
  }, [editValue, editingId]);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditValue("");
  }, []);

  const clearCompleted = useCallback(
    () => setTodos((prev) => prev.filter((todo) => !todo.completed)),
    [],
  );

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") addTodo();
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") saveEdit();
    if (e.key === "Escape") cancelEdit();
  };

  // Derived values
  const { active, completed } = useMemo(
    () =>
      todos.reduce(
        (acc, t) => {
          t.completed ? acc.completed++ : acc.active++;
          return acc;
        },
        { active: 0, completed: 0 },
      ),
    [todos],
  );

  const filteredTodos = useMemo(
    () =>
      todos.filter((todo) => {
        if (filter === "active") return !todo.completed;
        if (filter === "completed") return todo.completed;
        return true;
      }),
    [todos, filter],
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setTodos((prev) => {
        const oldIndex = prev.findIndex((t) => t.id === active.id);
        const newIndex = prev.findIndex((t) => t.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="font-sans min-h-screen w-full">
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-4">
        {/* Add Todo */}
        <Card>
          <CardContent>
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="What needs to be done?"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleInputKeyDown}
              />
              <Button onClick={addTodo} disabled={!inputValue.trim()}>
                <PlusIcon />
                Add Task
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-2 text-sm">
            <Badge>
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              {active} Active
            </Badge>
            <Badge>
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              {completed} Completed
            </Badge>
            <Badge>
              <span className="w-3 h-3 rounded-full bg-gray-400"></span>
              {todos.length} Total
            </Badge>
          </div>

          <div className="flex gap-2">
            {(["all", "active", "completed"] as FilterType[]).map((type) => (
              <Button
                key={type}
                variant={filter === type ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(type)}
                className="capitalize"
              >
                {type}
              </Button>
            ))}
            {completed > 0 && (
              <Button variant="outline" size="sm" onClick={clearCompleted}>
                <Trash2Icon className="w-4 h-4 mr-1" />
                Clear Completed
              </Button>
            )}
          </div>
        </div>

        {/* Todo List with animations */}
        <div className="space-y-3">
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredTodos.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <AnimatePresence>
                {filteredTodos.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Card>
                      <CardContent className="text-center">
                        <div className="text-lg mb-2">
                          {filter === "active" && todos.some((t) => t.completed)
                            ? "All tasks completed!"
                            : filter === "completed"
                              ? "No completed tasks yet"
                              : "No tasks yet. Add your first task above!"}
                        </div>
                        {filter === "all" && todos.length === 0 && (
                          <p className="text-gray-500 text-sm">
                            Start by adding a task to get organized
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  filteredTodos.map((todo) => (
                    <SortableTodo key={todo.id} todo={todo}>
                      <motion.div
                        key={todo.id}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1" // Add this
                      >
                        <Card>
                          <CardContent>
                            <div className="flex items-center gap-3">
                              {/* Remove the duplicate flex container from here */}
                              <motion.div
                                whileTap={{ scale: 0.9 }}
                                transition={{ duration: 0.1 }}
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleTodo(todo.id)}
                                  aria-label={
                                    todo.completed
                                      ? "Mark as active"
                                      : "Mark as completed"
                                  }
                                >
                                  {todo.completed ? (
                                    <CheckSquareIcon />
                                  ) : (
                                    <SquareIcon />
                                  )}
                                </Button>
                              </motion.div>

                              <div className="flex-1">
                                {editingId === todo.id ? (
                                  <Input
                                    value={editValue}
                                    onChange={(e) =>
                                      setEditValue(e.target.value)
                                    }
                                    onKeyDown={handleEditKeyDown}
                                    onBlur={saveEdit}
                                    autoFocus
                                  />
                                ) : (
                                  <span
                                    onClick={() =>
                                      !todo.completed &&
                                      startEditing(todo.id, todo.text)
                                    }
                                    className={
                                      todo.completed
                                        ? "line-through text-gray-500"
                                        : "cursor-text"
                                    }
                                  >
                                    {todo.text}
                                  </span>
                                )}
                                <div className="text-xs text-gray-400 mt-1">
                                  Created {todo.createdAt.toLocaleDateString()}{" "}
                                  at {todo.createdAt.toLocaleTimeString()}
                                </div>
                              </div>

                              <div className="flex gap-1">
                                {editingId === todo.id ? (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={saveEdit}
                                    >
                                      <CheckIcon />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={cancelEdit}
                                    >
                                      <XIcon />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        startEditing(todo.id, todo.text)
                                      }
                                    >
                                      <Edit3Icon />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => deleteTodo(todo.id)}
                                    >
                                      <Trash2Icon />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </SortableTodo>
                  ))
                )}
              </AnimatePresence>
            </SortableContext>
          </DndContext>
        </div>

        {/* Footer */}
        {todos.length > 0 && (
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>
              Click on a task to edit it • Press <kbd>Enter</kbd> to save •{" "}
              <kbd>Esc</kbd> to cancel
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function SortableTodo({
  todo,
  children,
}: {
  todo: Todo;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="flex items-center gap-3">
        {/* Drag handle - only this area is draggable */}
        <div {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVerticalIcon />
        </div>
        {children}
      </div>
    </div>
  );
}
