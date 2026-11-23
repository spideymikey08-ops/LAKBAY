/**
 * Lakbay | Component: Confirmation Dialog
 * Accessible replacement for window.confirm.
 */
'use strict';

/* ==========================================================================
   CONFIRMATION DIALOG (Accessible replacement for window.confirm)
   ========================================================================== */
let confirmDialogCallback = null;
let confirmLastFocusedElement = null;

function setupConfirmDialog() {
  const modal = document.getElementById('confirm-modal');
  const cancelBtn = document.getElementById('confirm-cancel-btn');
  const okBtn = document.getElementById('confirm-ok-btn');
  const backdrop = document.getElementById('confirm-modal-backdrop');

  const closeDialog = () => {
    if (modal) {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
    confirmDialogCallback = null;
    if (confirmLastFocusedElement && typeof confirmLastFocusedElement.focus === 'function') {
      confirmLastFocusedElement.focus();
    }
  };

  if (cancelBtn) cancelBtn.addEventListener('click', closeDialog);
  if (backdrop) backdrop.addEventListener('click', closeDialog);

  if (okBtn) {
    okBtn.addEventListener('click', () => {
      const cb = confirmDialogCallback;
      closeDialog();
      if (typeof cb === 'function') {
        cb();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (modal && modal.style.display !== 'none') {
      if (e.key === 'Escape') {
        closeDialog();
      } else if (e.key === 'Tab') {
        trapFocusInDialog(modal, e);
      }
    }
  });
}

function openConfirmDialog(title, message, onConfirm) {
  confirmLastFocusedElement = document.activeElement;
  confirmDialogCallback = onConfirm;

  const modal = document.getElementById('confirm-modal');
  const titleEl = document.getElementById('confirm-modal-title');
  const msgEl = document.getElementById('confirm-modal-msg');
  const okBtn = document.getElementById('confirm-ok-btn');

  if (titleEl) titleEl.textContent = title;
  if (msgEl) msgEl.textContent = message;

  if (modal) {
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (okBtn) okBtn.focus();
  }
}
