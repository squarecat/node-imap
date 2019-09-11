export function openChat() {
  if (typeof window !== 'undefined') {
    window.intergram.open();
  }
}
