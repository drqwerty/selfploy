import { createAnimation } from '@ionic/core';

const ToastAnimationDuration = 400;
const ToastAnimationEasing = 'cubic-bezier(.155,1.105,.295,1.12)';

export const ToastAnimationEnter = (baseEl: any, duration = ToastAnimationDuration, delay = 0) => {
  const bottom = "calc(-10px - var(--ion-safe-area-bottom, 0px))";
  const wrapperAnimation = createAnimation()
    .addElement(baseEl.querySelector('.toast-wrapper'))
    .beforeAddClass(['background-transparent', 'no-shadow'])
    .delay(delay)
    .fromTo('transform', `translateY(${bottom})`, 'translateY(-150%)')
    .fromTo('opacity', '0', '1')
    .duration(ToastAnimationDuration)
    .easing(ToastAnimationEasing)
    ;

  return createAnimation()
    .addElement(baseEl)
    .addAnimation(wrapperAnimation);
};

export const ToastAnimationLeave = (baseEl: any) => {
  return ToastAnimationEnter(baseEl, 300)
    .direction('reverse')
    .easing('cubic-bezier(.36,.66,.04,1)');
};
