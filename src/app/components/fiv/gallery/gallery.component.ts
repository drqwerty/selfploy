import { Component, ViewChild, ElementRef, ViewChildren, QueryList, Input, Output, EventEmitter } from '@angular/core';
import { FivGallery, FivGalleryImage } from '@fivethree/core';
import { IonImg, ModalController } from '@ionic/angular';
import { takeUntil } from 'rxjs/operators';
import { DeleteConfirmBottomSheetComponent } from '../../bottom-sheets/delete-confirm-bottom-sheet/delete-confirm-bottom-sheet.component';

@Component({
  selector: 'gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
})
export class GalleryComponent {

  @Input() images: string[] = [];
  @Input() showRemoveButton = false;

  @Output() imageDeleted = new EventEmitter


  @ViewChild('bottomToolbar') bottomToolbar: ElementRef;
  @ViewChild(FivGallery) fivGallery: FivGallery;
  @ViewChildren(FivGalleryImage) fivGalleryImage: QueryList<FivGalleryImage>;
  @ViewChildren(IonImg) ionImg: QueryList<any>;

  image: HTMLImageElement = null;
  bottomIntersectionObserver: IntersectionObserver;

  constructor(
    private modalController: ModalController,
  ) { }

  didOpen() {
    this.setBackGroundColor();

    // bug with ionic 5 or angular 9! default config fires click event twice
    this.fivGallery.swiper.nativeElement.swiper.off('click');
    let timerId;
    this.fivGallery.swiper.nativeElement.swiper.on('click', () => {
      clearTimeout(timerId);
      timerId = setTimeout(() => {
        if (this.fivGallery.controlsVisible) this.fivGallery.hideControls();
        else this.fivGallery.showControls();
      }, 300);
    });

    let scrollLeft;

    this.toggleImageVisibility(true)
    this.footerImgScroll();

    this.fivGallery.slides.ionSlideDidChange
      .pipe(takeUntil(this.fivGallery.$onDestroy))
      .subscribe(() => this.footerImgScroll(true));

    this.bottomIntersectionObserver = new IntersectionObserver(() => {
      if (scrollLeft != null) this.bottomToolbar.nativeElement.scrollTo(scrollLeft, 0);
    }, { threshold: 0 });
    this.bottomIntersectionObserver.observe(this.bottomToolbar.nativeElement);

    this.bottomToolbar.nativeElement.addEventListener('scroll', () => scrollLeft = this.bottomToolbar.nativeElement.scrollLeft);
  }

  setBackGroundColor(color = '#000000') {
    this.fivGallery.backdropColor = color;
    this.fivGallery.updateBackdrop = () => null;
  }

  footerImgScroll(smooth = false) {
    this.ionImg.toArray()[this.fivGallery.activeIndex].el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }

  willClose() {
    this.updateInitialImage();
    this.fivGallery.calculateImagePosition();
    this.toggleImageVisibility(false);
    this.bottomIntersectionObserver.disconnect();
  }

  toggleImageVisibility(visible: boolean, delay = 0) {
    if (delay)
      setTimeout(() => {
        this.image = this.fivGallery.initialImage.thumbnail.nativeElement;
        this.image.style.visibility = visible ? 'visible' : 'hidden';
      }, delay);
    else
      this.image.style.visibility = visible ? 'visible' : 'hidden';
  }

  updateImages() {
    setTimeout(() => this.fivGallery.ngAfterContentInit());
  }

  goTo(index) {
    this.fivGallery.slides.slideTo(index);
  }

  async remove() {
    const modal = await this.modalController.create({
      component: DeleteConfirmBottomSheetComponent,
      cssClass: 'action-sheet border-top-radius',
    })

    modal.onWillDismiss().then(({ data }) => {
      if (data) {
        if (this.images.length > 1) { this.images.splice(this.fivGallery.activeIndex, 1); }
        else { this.fivGallery.close(); this.images.shift() }
        this.imageDeleted.emit();
        setTimeout(() => this.fivGallery.updateImagesIndex(), 300);
      }
    })

    document.body.append(modal);

    modal.present();
  }

  updateInitialImage() {
    if (this.fivGallery.activeIndex == this.fivGalleryImage.toArray().length)
      this.fivGallery.activeIndex--;

    this.fivGallery.initialImage = this.fivGalleryImage.toArray()[this.fivGallery.activeIndex];
    this.image = this.fivGallery.initialImage.thumbnail.nativeElement;
  }

}
