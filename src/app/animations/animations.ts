class AnimationModel {
  element: HTMLElement;
  elementAnimated: HTMLElement;
}

export class Animations {

  private readonly DEFAULT_DURATION = 300;
  private readonly DEFAULT_DURATION_OPACITY = 200;
  private readonly DEFAULT_COLOR = 'primary';
  private duration = this.DEFAULT_DURATION;
  private color;

  private firstAnimation = true;  // la primera vez que anima, pone los elementos 40px más abajo
  private button: AnimationModel;
  private ionContentClientRect: {initial?: ClientRect, headerHeight?: number, footerHeight?: number} = {headerHeight: 0, footerHeight: 0};


    /**
   * Establece un elemento inicial a la animación
   * @param element Elemento inicial de la animación
   * @param name Nombre de la animación
   */
  addElement(element: HTMLElement, color = this.DEFAULT_COLOR): Animations {
    this.color = color;
    this.button = new AnimationModel();
    this.button.element = element;
    return this;
  }


    /**
   * Inicia las animaciones de los elementos
   * @duration Duración de la animación en ms
  * @param returns Promesa que indica cuando se puede cambiar la pagina sobre la que se esta haciendo la animacion
   */
  startAnimation(duration = this.DEFAULT_DURATION) {
    this.duration = duration;
    this.button.elementAnimated = this.cloneHTMLElement(this.button.element);
    const promise = this.animate(this.button, {firstAnimation: this.firstAnimation});
    this.firstAnimation = false;
    return promise;
  }


    /**
   * Inicia la animación invertida del elemento
  * @param returns Promesa que indica cuando se puede cambiar la pagina sobre la que se esta haciendo la animacion
   * @duration Duración de la animación en ms
   */
  startReverseAnimation(duration = this.duration) {
    return this.animate(this.button, { reverse: true })
  }


 /**
   * Clona el `HTMLElement`
   * @param element Elemento que se quiere clonar
   * @param duration Duración de la animación
   * @returns Elemento clonado
   */
  private cloneHTMLElement(element: HTMLElement): HTMLElement {
    const clone = document.createElement('div');
    this.copyCssStyles(element, clone);

    return clone;
  }


  /**
   * Copia el estilo aplicado de un `HTMLElement` a otro
   * @param source `HTMLElement` desde el que se quieren copiar los estilos
   * @param target `HTMLElement` al que se quieren aplicar los estilos
   * @param duration Duración de la animación
   * @param subElement Si es verdadero, no aplica la animación al elemento
   */
  private copyCssStyles(source: HTMLElement, target: HTMLElement) {
    target.style.cssText = document.defaultView.getComputedStyle(source).cssText;
    target.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue(`--ion-color-${this.color}`);
    target.style.borderRadius = '64px';

    const position   = source.getBoundingClientRect();
    const marginTop  = parseInt(target.style.marginTop, 10);
    const marginLeft = parseInt(target.style.marginLeft, 10);

    let top = position.top - marginTop,
        left = position.left - marginLeft;

    if (this.ionContentClientRect.initial != null) {
      top  -= this.ionContentClientRect.initial.top;
      left -= this.ionContentClientRect.initial.left;
    }

    target.style.position        = 'absolute';
    target.style.zIndex          = '999999';
    target.style.top             = `${top}px`;
    target.style.left            = `${left}px`;
    target.style.lineHeight      = '';
    target.style.transition      = `transform ${this.duration}ms ease-in, border-radius ${this.duration}ms ease-in, opacity ${this.DEFAULT_DURATION_OPACITY}ms ease-in`;
    target.style.transformOrigin = 'center';
  }


  /**
    * Cambia la posición y la escala de un `HTMLElement`
    * @param animation Datos de la animación que se va a aplicar
    * @param options Si se trata de la primera animación o es la animación de regreso. Ambas `false` por defecto.
    * @param returns Promesa que indica cuando se puede cambiar la pagina sobre la que se esta haciendo la animacion
    */
  private animate(animation: AnimationModel,
                   options: {firstAnimation?: boolean, reverse?: boolean} = {firstAnimation: false, reverse: false}) {

    return new Promise(resolve => {
      if (animation == null) resolve();

      if (options.reverse) {
        animation.elementAnimated.style.transition  = `transform ${this.duration}ms ease-out, border-radius ${this.duration}ms ease-out, opacity ${this.DEFAULT_DURATION_OPACITY}ms ease-out`;
        this.showElement(animation.elementAnimated)
          .then(() => {
            resolve();
            animation.elementAnimated.style.transform = '';
            animation.elementAnimated.style.borderRadius = '64px';
            setTimeout(() => 
              this.hideElement(animation.elementAnimated)
                .then(() => animation.elementAnimated.remove()),
              this.duration);
          });
        return;
      }
  
      const
        { height, width, left, top} = animation.element.getBoundingClientRect(),
        bodyDomRect = document.body.getBoundingClientRect(),
        scaleY = bodyDomRect.height / height,
        scaleX = bodyDomRect.width / width,
        posX   = -left,
        posY   = -top;
  
        
      animation.elementAnimated.style.opacity = '0';
      document.body.appendChild(animation.elementAnimated);
  
      setTimeout(() => {
        this.showElement(animation.elementAnimated)
          .then(() => {   
            animation.elementAnimated.style.transform = `scale3d(${scaleY * 2}, ${scaleY * 2}, 1)`;
            animation.elementAnimated.style.borderRadius = '0px';
            setTimeout(() => {
              resolve();
              this.hideElement(animation.elementAnimated);
          
            }, this.duration);
          
          });
      }, 50);
    });

  }


    /**
   * Oculta un elemento del DOM
   * @param element Elemento que se quiere ocultar
   */
  private hideElement(element: HTMLElement) {
    return new Promise(resolve => {
      element.style.opacity = '0';
        setTimeout(() => {
          element.style.zIndex = '-1';
          resolve();
        }, this.DEFAULT_DURATION_OPACITY);
    })
  }
  

  /**
   * Muestra un elemento del DOM
   * @param element Elemento que se quiere mostrar
   * @param front Verdadero si se quiere poner sobre el resto de elementos. `false` por defecto
   * @returns Promesa que indica cuando se ha terminado la animacion
   */
  private showElement(element: HTMLElement, remove = false) {
    return new Promise((resolve) => {
      element.style.zIndex = '999999';
      element.style.opacity = '1';
      
      setTimeout(() => {
        if (remove) element.remove();
        resolve();
      }, this.DEFAULT_DURATION_OPACITY);
    });

    
  }

}