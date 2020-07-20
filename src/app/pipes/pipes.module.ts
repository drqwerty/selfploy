import { NgModule } from '@angular/core';
import { ObjectToArrayPipe } from './object-to-array.pipe';
import { FilterByRequestIdPipe } from './filter-by-request-id.pipe';
import { ConversationFromThisRequestPipe } from './conversation-from-this-request.pipe';
import { ImageMessagesPipe } from './image-messages.pipe';

@NgModule({
  declarations: [
    ObjectToArrayPipe,
    FilterByRequestIdPipe,
    ConversationFromThisRequestPipe,
    ImageMessagesPipe,
  ],
  exports: [
    ObjectToArrayPipe,
    FilterByRequestIdPipe,
    ConversationFromThisRequestPipe,
    ImageMessagesPipe,
  ]
})
export class PipesModule { }
