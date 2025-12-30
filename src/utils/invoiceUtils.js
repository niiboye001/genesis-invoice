// Parse DD/MM/YYYY to Date object
const parseDate = (dateString) => {
  if (!dateString) return null;
  // Check if it's already in DD/MM/YYYY format
  if (dateString.includes('/')) {
    const [day, month, year] = dateString.split('/');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  // Otherwise try standard Date parsing
  return new Date(dateString);
};

// Invoice status calculation
export const calculateStatus = (invoice) => {
  if (invoice.status === 'Paid') {
    return 'Paid';
  }
  
  if (invoice.status === 'Draft') {
    return 'Draft';
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dueDate = parseDate(invoice.dueDate);
  if (!dueDate || isNaN(dueDate.getTime())) {
    return 'Pending';
  }
  dueDate.setHours(0, 0, 0, 0);
  
  if (dueDate < today) {
    return 'Overdue';
  }
  
  return 'Pending';
};

// Format date to DD/MM/YYYY
export const formatDate = (dateString) => {
  if (!dateString) return '';
  // If already in DD/MM/YYYY format, return as is
  if (dateString.includes('/') && dateString.split('/').length === 3) {
    return dateString;
  }
  // Otherwise parse and format
  const date = parseDate(dateString);
  if (!date || isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Parse DD/MM/YYYY to YYYY-MM-DD for input fields
export const parseDateForInput = (dateString) => {
  if (!dateString) return '';
  const [day, month, year] = dateString.split('/');
  return `${year}-${month}-${day}`;
};

// Format date from YYYY-MM-DD to DD/MM/YYYY
export const formatDateFromInput = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

// Calculate invoice totals
export const calculateTotals = (lineItems, taxPercent = 0, discountPercent = 0) => {
  const subtotal = lineItems.reduce((sum, item) => {
    return sum + (parseFloat(item.quantity || 0) * parseFloat(item.price || 0));
  }, 0);
  
  const discountAmount = (subtotal * parseFloat(discountPercent || 0)) / 100;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = (afterDiscount * parseFloat(taxPercent || 0)) / 100;
  const total = afterDiscount + taxAmount;
  
  return {
    subtotal: subtotal.toFixed(2),
    discountAmount: discountAmount.toFixed(2),
    afterDiscount: afterDiscount.toFixed(2),
    taxAmount: taxAmount.toFixed(2),
    total: total.toFixed(2),
  };
};

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
  }).format(parseFloat(amount || 0));
};

// Generate invoice number
export const generateInvoiceNumber = () => {
  const prefix = 'INV';
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}-${timestamp}-${random}`;
};

// LocalStorage utilities
export const getInvoices = () => {
  const invoices = localStorage.getItem('genesis-invoices');
  return invoices ? JSON.parse(invoices) : [];
};

export const saveInvoices = (invoices) => {
  localStorage.setItem('genesis-invoices', JSON.stringify(invoices));
};

export const getInvoiceById = (id) => {
  const invoices = getInvoices();
  return invoices.find(inv => inv.id === id);
};

export const saveInvoice = (invoice) => {
  const invoices = getInvoices();
  const existingIndex = invoices.findIndex(inv => inv.id === invoice.id);
  
  if (existingIndex >= 0) {
    invoices[existingIndex] = invoice;
  } else {
    invoices.push(invoice);
  }
  
  saveInvoices(invoices);
  return invoice;
};

export const deleteInvoice = (id) => {
  const invoices = getInvoices();
  const filtered = invoices.filter(inv => inv.id !== id);
  saveInvoices(filtered);
};

