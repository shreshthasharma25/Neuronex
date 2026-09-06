// Utility for real device phone calling via standard tel: URI
// Sanitizes numbers and triggers the real device dialer without fake in-app screens

export function sanitizePhoneNumber(phone) {
  if (!phone) return '';
  const str = String(phone).trim();
  // Keep leading +, digits, remove spaces, dashes, brackets, dots
  const hasPlus = str.startsWith('+');
  const digits = str.replace(/[^0-9]/g, '');
  return hasPlus ? `+${digits}` : digits;
}

/**
 * Triggers native phone dialer via tel: URI
 * @param {string} rawPhone 
 * @returns {{ success: boolean, sanitized: string, error?: string }}
 */
export function triggerNativePhoneCall(rawPhone) {
  const sanitized = sanitizePhoneNumber(rawPhone);
  if (!sanitized) {
    return {
      success: false,
      sanitized: '',
      error: 'no_number'
    };
  }

  try {
    const telUri = `tel:${sanitized}`;
    // Using a temporary invisible anchor ensures native handling on mobile Safari, Chrome, and Android WebView
    const link = document.createElement('a');
    link.href = telUri;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return {
      success: true,
      sanitized
    };
  } catch (err) {
    console.warn('Native phone call failed:', err);
    return {
      success: false,
      sanitized,
      error: 'unsupported'
    };
  }
}

/**
 * Converts a phone number to international WhatsApp format
 * e.g., Indian 10-digit 9876543210 -> 919876543210
 * If already international (e.g. 919876543210 or +91...), returns clean digits without duplicating 91
 */
export function formatWhatsAppNumber(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/[^0-9]/g, '');
  if (!digits) return '';

  // 10-digit Indian mobile number
  if (digits.length === 10) {
    return `91${digits}`;
  }
  // 11-digit number starting with 0
  if (digits.length === 11 && digits.startsWith('0')) {
    return `91${digits.slice(1)}`;
  }
  // Already has country code or international format
  return digits;
}

/**
 * Opens actual WhatsApp conversation with the stored contact
 * @param {string} phone 
 * @param {string} [initialText] 
 */
export function openWhatsAppConversation(phone, initialText = '') {
  const waNumber = formatWhatsAppNumber(phone);
  if (!waNumber) return false;
  const url = initialText
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(initialText)}`
    : `https://wa.me/${waNumber}`;
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}
