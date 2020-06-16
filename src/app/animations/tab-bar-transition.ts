import { createAnimation } from '@ionic/core';
import { DataService } from 'src/app/providers/data.service';

export enum TabBarState {
  visible,
  hidden,
}

function createSlideAnimation() {
  const elements = document.querySelectorAll('fiv-app-bar > div');

  const animationsElements = Array.from(elements).map(element =>
    createAnimation()
      .addElement(element)
      .fromTo('transform', 'translateY(0)', `translateY(90px)`)
  );

  return createAnimation()
    .duration(300)
    .addAnimation(animationsElements)
}

export function tabBarAnimateOut() {
  if (DataService.tabBarState === TabBarState.hidden) return;
  DataService.tabBarState = TabBarState.hidden;
  return createSlideAnimation().easing('ease-out').direction('normal').play()
}

export function tabBarAnimateIn() {
  if (DataService.tabBarState === TabBarState.visible) return;
  DataService.tabBarState = TabBarState.visible;
  return createSlideAnimation().easing('ease-in').direction('reverse').play()
}