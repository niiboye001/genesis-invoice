# Genesis Invoice

A modern, responsive invoice management web application built with React and Tailwind CSS.

## Features

- ✅ Add new invoices
- ✅ View all invoices (table view on desktop, card view on mobile)
- ✅ Edit existing invoices
- ✅ Delete invoices
- ✅ Print invoices
- ✅ Filter invoices by status (Draft, Pending, Paid, Overdue)
- ✅ Search invoices
- ✅ Sort invoices by date or amount
- ✅ Automatic status calculation based on due date
- ✅ Support for line items, tax, and discount
- ✅ Currency: GHS (Ghana Cedis)
- ✅ Date format: DD/MM/YYYY

## Tech Stack

- React 18
- React Router DOM
- Tailwind CSS
- Vite
- Lucide React (icons)
- LocalStorage (data persistence)

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## Invoice Status

The invoice status is automatically calculated:
- **Draft**: Newly created invoices
- **Pending**: Invoices with due date in the future
- **Paid**: Manually marked as paid
- **Overdue**: Invoices with due date in the past (and not paid)

## Project Structure

```
src/
├── components/
│   ├── InvoiceList.jsx      # Main invoice list with filters and search
│   ├── InvoiceForm.jsx       # Form for creating/editing invoices
│   └── InvoiceDetail.jsx    # Invoice detail view with print functionality
├── utils/
│   ├── invoiceUtils.js      # Invoice utilities and localStorage functions
│   └── statusColors.js      # Status color helpers
├── App.jsx                  # Main app component with routing
├── main.jsx                 # React entry point
└── index.css                # Global styles and Tailwind imports
```

## Usage

1. **Create Invoice**: Click "New Invoice" button to create a new invoice
2. **View Invoice**: Click "View" on any invoice to see details
3. **Edit Invoice**: Click "Edit" to modify an invoice
4. **Delete Invoice**: Click "Delete" to remove an invoice
5. **Print Invoice**: Click "Print" on the invoice detail page
6. **Filter**: Use the filter dropdown to filter by status
7. **Search**: Use the search bar to find invoices by number, client name, or email
8. **Sort**: Use the sort dropdown to sort by date or amount

## Data Storage

All invoice data is stored in the browser's localStorage under the key `genesis-invoices`.

