import { Page, NavigatedData, GridLayout } from '@nativescript/core';

export function navigatingTo(d: NavigatedData): void {
  (<Page>d.object).rotorGroupCallbacks.set('rating', ({ forward }) => {
    console.log('rating rotorgroup callback ', forward, 'hmm');
    incrementOrDecrementRating(d.object as any, forward);
  });
}

let rating = 0;
function incrementOrDecrementRating(page: Page, increment: boolean): void {
  rating = increment ? Math.min(rating + 1, 5) : Math.max(0, rating - 1);
  const ratingBar = page.getViewById('rating-bar') as GridLayout;
  for (let i = 0; i < ratingBar.getChildrenCount(); i++) {
    const view = ratingBar.getChildAt(i);
    view.backgroundColor = i < rating ? 'green' : 'transparent';
  }
}
