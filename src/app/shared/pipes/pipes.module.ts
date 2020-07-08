import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NumberPipe} from './number.pipe';
import { DateagoPipe } from './dateago.pipe';
import { LettercasePipe } from './lettercase.pipe';
import { MarkdownPipe } from './markdown.pipe';

@NgModule({
  declarations: [
    NumberPipe,
    DateagoPipe,
    LettercasePipe,
    MarkdownPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    NumberPipe,
    DateagoPipe,
    LettercasePipe,
    MarkdownPipe
  ]
})
export class PipesModule { }
