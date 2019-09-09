export function openChat() {
  if (typeof window !== 'undefined') {
    window.intergram.open();
    document.querySelector('#intergramRoot').style.pointerEvents = 'all';
  }
}
