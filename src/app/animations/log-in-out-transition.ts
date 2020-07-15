import { createAnimation } from '@ionic/core';


function createSlideAnimation(platformHeight: number, login: boolean) {
  const a = document.querySelector('.background-animation-wrapper > .background');
  const b = document.querySelector('.background-animation-wrapper > .backgroundImage');
  if (!a || !b) return;
  const totalHeight = b.getBoundingClientRect().height + platformHeight;
  const elements = [a, b];

  const animationsElements = elements.map(element =>
    createAnimation()
      .addElement(element)
      .beforeRemoveClass('ion-invisible')
      .afterAddClass(login ? 'ion-invisible' : 'dismissing')
      .fromTo('transform', 'translateY(0)', `translateY(-${totalHeight}px)`)
  );

  return createAnimation()
    .duration(600)
    .addAnimation(animationsElements)
}


export function playLoginAnimation(platformHeight: number) {
  return createSlideAnimation(platformHeight, true)?.easing('ease-out').direction('normal').play()
}


export function playLogoutAnimation(platformHeight: number) {
  return createSlideAnimation(platformHeight, false)?.easing('ease-in').direction('reverse').play()
}