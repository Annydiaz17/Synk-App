import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Task, Category, Priority } from '../models/task.model';

const TASKS_KEY = 'synk_tasks';
const CATEGORIES_KEY = 'synk_categories';

/** Default categories seeded on first launch */
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Personal', color: '#00D4C8' },
  { id: 'cat-2', name: 'Trabajo', color: '#6366F1' },
  { id: 'cat-3', name: 'Estudio', color: '#A855F7' },
  { id: 'cat-4', name: 'Hogar', color: '#FACC15' },
];

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly tasksSubject = new BehaviorSubject<Task[]>([]);
  private readonly categoriesSubject = new BehaviorSubject<Category[]>([]);

  /** Observable stream of all tasks */
  readonly tasks$ = this.tasksSubject.asObservable();
  /** Observable stream of all categories */
  readonly categories$ = this.categoriesSubject.asObservable();

  constructor() {
    this.loadFromStorage();
  }

  // ── Task Operations ─────────────────────────────────────────────────

  /** Add a new task */
  addTask(title: string, categoryId: string, priority: Priority, description?: string): void {
    const tasks = this.tasksSubject.getValue();
    const newTask: Task = {
      id: this.generateId(),
      title: title.trim(),
      description: description?.trim(),
      categoryId,
      completed: false,
      priority,
      createdAt: Date.now(),
    };
    const updated = [newTask, ...tasks];
    this.tasksSubject.next(updated);
    this.persistTasks(updated);
  }

  /** Toggle task completion */
  toggleTask(taskId: string): void {
    const tasks = this.tasksSubject.getValue().map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    this.tasksSubject.next(tasks);
    this.persistTasks(tasks);
  }

  /** Delete a task by ID */
  deleteTask(taskId: string): void {
    const tasks = this.tasksSubject.getValue().filter(t => t.id !== taskId);
    this.tasksSubject.next(tasks);
    this.persistTasks(tasks);
  }

  /** Update an existing task */
  updateTask(taskId: string, updates: Partial<Pick<Task, 'title' | 'description' | 'categoryId' | 'priority'>>): void {
    const tasks = this.tasksSubject.getValue().map(t =>
      t.id === taskId ? { ...t, ...updates } : t
    );
    this.tasksSubject.next(tasks);
    this.persistTasks(tasks);
  }

  /** Save the full tasks array (used after reorder) */
  saveTasks(tasks: Task[]): void {
    this.tasksSubject.next(tasks);
    this.persistTasks(tasks);
  }

  /** Get current tasks snapshot */
  getAllTasks(): Task[] {
    return this.tasksSubject.getValue();
  }

  // ── Category Operations ─────────────────────────────────────────────

  /** Add a new category */
  addCategory(name: string, color: string): void {
    const categories = this.categoriesSubject.getValue();
    const newCategory: Category = {
      id: this.generateId(),
      name: name.trim(),
      color,
    };
    const updated = [...categories, newCategory];
    this.categoriesSubject.next(updated);
    this.persistCategories(updated);
  }

  /** Delete a category by ID */
  deleteCategory(categoryId: string): void {
    const categories = this.categoriesSubject.getValue().filter(c => c.id !== categoryId);
    this.categoriesSubject.next(categories);
    this.persistCategories(categories);
  }

  /** Update an existing category */
  updateCategory(categoryId: string, updates: Partial<Pick<Category, 'name' | 'color'>>): void {
    const categories = this.categoriesSubject.getValue().map(c =>
      c.id === categoryId ? { ...c, ...updates } : c
    );
    this.categoriesSubject.next(categories);
    this.persistCategories(categories);
  }

  /** Get the number of tasks in a category */
  getTaskCountByCategory(categoryId: string): number {
    return this.tasksSubject.getValue().filter(t => t.categoryId === categoryId).length;
  }

  /** Get category name by ID */
  getCategoryName(categoryId: string): string {
    const cat = this.categoriesSubject.getValue().find(c => c.id === categoryId);
    return cat ? cat.name : 'Sin categoría';
  }

  /** Get category color by ID */
  getCategoryColor(categoryId: string): string {
    const cat = this.categoriesSubject.getValue().find(c => c.id === categoryId);
    return cat ? cat.color : '#94A3B8';
  }

  // ── Private Helpers ─────────────────────────────────────────────────

  private loadFromStorage(): void {
    try {
      const tasksJson = localStorage.getItem(TASKS_KEY);
      const categoriesJson = localStorage.getItem(CATEGORIES_KEY);

      const tasks: Task[] = tasksJson ? JSON.parse(tasksJson) : [];
      const categories: Category[] = categoriesJson
        ? JSON.parse(categoriesJson)
        : DEFAULT_CATEGORIES;

      this.tasksSubject.next(tasks);
      this.categoriesSubject.next(categories);

      // Persist defaults on first launch
      if (!categoriesJson) {
        this.persistCategories(categories);
      }
    } catch (e) {
      console.error('[TaskService] Error loading from localStorage:', e);
      this.tasksSubject.next([]);
      this.categoriesSubject.next(DEFAULT_CATEGORIES);
    }
  }

  private persistTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('[TaskService] Error persisting tasks:', e);
    }
  }

  private persistCategories(categories: Category[]): void {
    try {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    } catch (e) {
      console.error('[TaskService] Error persisting categories:', e);
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
