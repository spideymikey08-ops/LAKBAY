/**
 * Lakbay | Component: Toast Notifications
 * Toast center capped at 1-2 items, supports Undo.
 */
'use strict';

/* ==========================================================================
   TOAST NOTIFICATION CENTER (Capped at 1–2 items, Supports Undo)
   ========================================================================== */
function showToast(message, type = 'info', enableUndo = false) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  // Capped at 2 toasts: remove oldest if count >= 2
  while (container.children.length >= 2) {
    container.removeChild(container.firstChild);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const msgSpan = document.createElement('span');
  msgSpan.className = 'toast-msg';
  msgSpan.textContent = message;
  toast.appendChild(msgSpan);

  if (enableUndo) {
    const undoBtn = document.createElement('button');
    undoBtn.type = 'button';
    undoBtn.className = 'toast-undo-btn';
    undoBtn.textContent = 'Undo';
    undoBtn.addEventListener('click', () => {
      undoDeleteStop();
      if (toast.parentElement) toast.parentElement.removeChild(toast);
    });
    toast.appendChild(undoBtn);
  }

  container.appendChild(toast);

  const duration = enableUndo ? 4500 : 2800;

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => {
      if (toast.parentElement) toast.parentElement.removeChild(toast);
    }, 250);
  }, duration);
}
