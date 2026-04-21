import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CategoriesRoutingModule } from './categories-routing.module';
import { CategoriesPage } from './categories.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CategoriesRoutingModule,
  ],
  declarations: [CategoriesPage],
})
export class CategoriesPageModule {}
