import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ToastController } from '@ionic/angular';
import { Task, Category, Priority } from '../models/task.model';
import { TaskService } from '../services/task.service';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class HomePage implements OnInit, OnDestroy {
  // ── State ───────────────────────────────────────────────────────────
  tasks: Task[] = [];
  categories: Category[] = [];
  filteredTasks: Task[] = [];
  selectedCategory = 'all';
  reorderMode = false;
  showPriority = false;
  showAddForm = false;

  // ── Form ────────────────────────────────────────────────────────────
  newTaskTitle = '';
  newTaskCategory = '';
  newTaskPriority: Priority = 'media';

  // ── Stats ───────────────────────────────────────────────────────────
  get completedCount(): number {
    return this.tasks.filter(t => t.completed).length;
  }

  get pendingCount(): number {
    return this.tasks.filter(t => !t.completed).length;
  }

  get progressPercent(): number {
    if (this.tasks.length === 0) { return 0; }
    return Math.round((this.completedCount / this.tasks.length) * 100);
  }

  private destroy$ = new Subject<void>();

  constructor(
    private taskService: TaskService,
    private firebaseService: FirebaseService,
    private cdr: ChangeDetectorRef,
    private toastCtrl: ToastController,
  ) {}

  ngOnInit(): void {
    // Subscribe to tasks
    this.taskService.tasks$
      .pipe(takeUntil(this.destroy$))
      .subscribe(tasks => {
        this.tasks = tasks;
        this.filterTasks();
        this.cdr.markForCheck();
      });

    // Subscribe to categories
    this.taskService.categories$
      .pipe(takeUntil(this.destroy$))
      .subscribe(cats => {
        this.categories = cats;
        // Auto-select first category for new tasks
        if (!this.newTaskCategory && cats.length > 0) {
          this.newTaskCategory = cats[0].id;
        }
        this.cdr.markForCheck();
      });

    // Subscribe to Firebase feature flag
    this.firebaseService.showPriorityFeature$
      .pipe(takeUntil(this.destroy$))
      .subscribe(show => {
        this.showPriority = show;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Track Functions ─────────────────────────────────────────────────

  trackById(_index: number, item: Task | Category): string {
    return item.id;
  }

  // ── Task Actions ────────────────────────────────────────────────────

  addTask(): void {
    const title = this.newTaskTitle.trim();
    if (!title || !this.newTaskCategory) { return; }

    this.taskService.addTask(title, this.newTaskCategory, this.newTaskPriority);
    this.newTaskTitle = '';
    this.newTaskPriority = 'media';
    this.showToast('Tarea agregada correctamente');
  }

  toggleTask(task: Task): void {
    this.taskService.toggleTask(task.id);
  }

  deleteTask(taskId: string): void {
    this.taskService.deleteTask(taskId);
    this.showToast('Tarea eliminada');
  }

  // ── Filtering ───────────────────────────────────────────────────────

  filterBy(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.filterTasks();
    // Disable reorder when changing filter to avoid confusion
    this.reorderMode = false;
    this.cdr.markForCheck();
  }

  private filterTasks(): void {
    if (this.selectedCategory === 'all') {
      this.filteredTasks = [...this.tasks];
    } else {
      this.filteredTasks = this.tasks.filter(
        t => t.categoryId === this.selectedCategory
      );
    }
  }

  // ── Reorder ─────────────────────────────────────────────────────────

  toggleReorder(): void {
    this.reorderMode = !this.reorderMode;
  }

  handleReorder(event: CustomEvent): void {
    const detail = event.detail as { from: number; to: number; complete: (data?: any[]) => any[] };

    if (this.selectedCategory === 'all') {
      // Simple case: reorder the full list
      const items = [...this.tasks];
      const movedItem = items.splice(detail.from, 1)[0];
      items.splice(detail.to, 0, movedItem);
      detail.complete();
      this.taskService.saveTasks(items);
    } else {
      // Filtered case: reorder within the category
      const filtered = [...this.filteredTasks];
      const movedItem = filtered.splice(detail.from, 1)[0];
      filtered.splice(detail.to, 0, movedItem);
      detail.complete();

      // Get original indices of filtered tasks in the full array
      const allTasks = [...this.tasks];
      const indices: number[] = [];
      allTasks.forEach((t, i) => {
        if (t.categoryId === this.selectedCategory) {
          indices.push(i);
        }
      });

      // Place reordered items back at their original slots
      indices.forEach((originalIndex, newPosition) => {
        allTasks[originalIndex] = filtered[newPosition];
      });

      this.taskService.saveTasks(allTasks);
    }
  }

  // ── Helpers ─────────────────────────────────────────────────────────

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
  }

  getCategoryName(categoryId: string): string {
    return this.taskService.getCategoryName(categoryId);
  }

  getCategoryColor(categoryId: string): string {
    return this.taskService.getCategoryColor(categoryId);
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 1800,
      position: 'bottom',
      color: 'dark',
      cssClass: 'synk-toast',
    });
    await toast.present();
  }
}
