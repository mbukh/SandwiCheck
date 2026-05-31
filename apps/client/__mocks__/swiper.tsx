import { createElement, type ReactNode } from 'react';

export function Swiper({ children }: { children?: ReactNode }): React.ReactElement {
  return createElement('div', null, children);
}

export function SwiperSlide({ children }: { children?: ReactNode }): React.ReactElement {
  return createElement('div', null, children);
}
