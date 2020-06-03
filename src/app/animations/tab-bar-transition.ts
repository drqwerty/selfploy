import { createAnimation } from '@ionic/core';

  function createSlideAnimation() {
    const elements = document.querySelectorAll('fiv-app-bar > div');

    const animationsElements = Array.from(elements).map(element =>
      createAnimation()
        .addElement(element)
        .fromTo('transform', 'translateY(0)', `translateY(100px)`)
    );

    return createAnimation()
      .duration(200)
      .addAnimation(animationsElements)
  }

  export function tabBarAnimateOut() {
    return createSlideAnimation().easing('ease-out').direction('normal').play()
  }

  export function tabBarAnimateIn() {
    return createSlideAnimation().easing('ease-in').direction('reverse').play()
  }