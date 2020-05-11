import { createAnimation } from '@ionic/core';


export const getIonPageElement = (element: HTMLElement) => {

  if (element.classList.contains('ion-page')) {
    return element;
  }

  const ionPage = element.querySelector(
    ':scope > .ion-page, :scope > ion-nav, :scope > ion-tabs'
  );
  if (ionPage) return ionPage;
  // idk, return the original element so at least something animates and we don't have a null pointer
  return element;
};


const rootTransition = createAnimation();


export const SlideAnimation = (_: HTMLElement, opts: any) => {

  const duration = 300;

  const backDirection = opts.direction === 'back';
  const enteringEl = opts.enteringEl;
  const leavingEl = opts.leavingEl;

  const leavingTransition = createAnimation()
    .addElement(getIonPageElement(leavingEl))
    .duration(duration);

  const enterTransition = createAnimation()
    .addElement(getIonPageElement(enteringEl))
    .duration(duration)
    .beforeRemoveClass('ion-page-invisible');

  if (!backDirection) {
    enterTransition
      .easing('ease-out')
      .fromTo('transform', 'translateX(100%)', 'translateX(0)');
    leavingTransition
      .easing('ease-out')
      .fromTo('transform', 'translateX(0%)', 'translateX(-50%)')
      .fromTo('opacity', '1', '0.3');

  } else {
    leavingTransition
      .easing('ease-out')
      .fromTo('transform', 'translateX(0%)', 'translateX(100%)');
    enterTransition
      .easing('ease-out')
      .fromTo('transform', 'translateX(-50%)', 'translateX(0%)')
      .fromTo('opacity', '0.3', '1');
  }

  return rootTransition
    .addAnimation([enterTransition, leavingTransition]);

};


export const ModalAnimationSlideEnter = (baseEl: any, duration = 200, delay = 0) => {

  const wrapperAnimation = createAnimation()
    .addElement(baseEl.querySelector('.modal-wrapper'))
    .beforeAddClass(['transparent', 'no-shadow'])
    .delay(delay)
    .fromTo('transform', 'translateX(100%)', 'translateX(0)')
    .fromTo('opacity', '1', '1')
    .duration(duration)
    .easing('linear')
    ;

  return createAnimation()
    .addElement(baseEl)
    .addAnimation([wrapperAnimation]);
};



export const ModalAnimationSlideLeave = (baseEl: any) => {

  return ModalAnimationSlideEnter(baseEl, 200, 0).direction('reverse');
};
