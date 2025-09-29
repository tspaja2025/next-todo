export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

export interface TodoItemProps {
  todo: Todo;
  editingId: string | null;
  editValue: string;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onStartEdit: (id: string, text: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditChange: (val: string) => void;
}

export interface TodoListProps {
  todos: Todo[];
  filter: FilterType;
  editingId: string | null;
  editValue: string;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onStartEdit: (id: string, text: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditChange: (val: string) => void;
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
}

export type FilterType = "all" | "active" | "completed";

export interface TodoInputProps {
  value: string;
  onChange: (val: string) => void;
  onAdd: () => void;
}

export interface TodoStatsProps {
  active: number;
  completed: number;
  total: number;
}

export interface TodoFiltersProps {
  filter: FilterType;
  onChange: (f: FilterType) => void;
  onClearCompleted: () => void;
  completed: number;
}
