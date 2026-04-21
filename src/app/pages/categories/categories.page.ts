import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AlertController, ToastController } from '@ionic/angular';
import { Category } from '../../models/task.model';
import { TaskService } from '../../services/task.service';

/** Preset colors for category creation */
const PRESET_COLORS: string[] = [
  '#00D4C8', '#6366F1', '#A855F7', '#FACC15',
  '#EF4444', '#10B981', '#F97316', '#EC4899',
  '#06B6D4', '#8B5CF6', '#14B8A6', '#F43F5E',
  '#3B82F6', '#84CC16', '#D946EF', '#0EA5E9',
];

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class CategoriesPage implements OnInit, OnDestroy {
  categories: Category[] = [];
  newCategoryName = '';
  selectedColor = '#00D4C8';
  presetColors = PRESET_COLORS;

  private destroy$ = new Subject<void>();

  constructor(
    private taskService: TaskService,
    private cdr: ChangeDetectorRef,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
  ) {}

  ngOnInit(): void {
    this.taskService.categories$
      .pipe(takeUntil(this.destroy$))
      .subscribe(cats => {
        this.categories = cats;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Track function for *ngFor */
  trackById(_index: number, item: Category): string {
    return item.id;
  }

  /** Select a color from the palette */
  selectColor(color: string): void {
    this.selectedColor = color;
  }

  /** Add a new category */
  addCategory(): void {
    const name = this.newCategoryName.trim();
    if (!name) { return; }

    this.taskService.addCategory(name, this.selectedColor);
    this.newCategoryName = '';
    this.showToast('Categoria creada correctamente');
  }

  /** Confirm & delete a category */
  async confirmDelete(category: Category): Promise<void> {
    const taskCount = this.getTaskCount(category.id);
    const alert = await this.alertCtrl.create({
      header: 'Eliminar categoría',
      message: taskCount > 0
        ? `"${category.name}" tiene ${taskCount} tarea(s). ¿Eliminar de todos modos?`
        : `¿Eliminar "${category.name}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.taskService.deleteCategory(category.id);
            this.showToast('Categoría eliminada');
          },
        },
      ],
    });
    await alert.present();
  }

  /** Get task count for a category */
  getTaskCount(categoryId: string): number {
    return this.taskService.getTaskCountByCategory(categoryId);
  }

  /** Show a toast notification */
  private async showToast(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'dark',
      cssClass: 'synk-toast',
    });
    await toast.present();
  }
}
