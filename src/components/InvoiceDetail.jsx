import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Printer, CheckCircle } from 'lucide-react';
import {
  getInvoiceById,
  calculateStatus,
  formatDate,
  formatCurrency,
  calculateTotals,
  deleteInvoice,
  getInvoices,
  saveInvoices,
} from '../utils/invoiceUtils';
import { getStatusColor } from '../utils/statusColors';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    const inv = getInvoiceById(id);
    if (inv) {
      setInvoice(inv);
    } else {
      navigate('/');
    }
  }, [id, navigate]);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      deleteInvoice(id);
      navigate('/');
    }
  };

  const handleTogglePaid = () => {
    const updatedInvoice = {
      ...invoice,
      status: invoice.status === 'Paid' ? 'Pending' : 'Paid',
    };
    const invoices = getInvoices();
    const index = invoices.findIndex(inv => inv.id === invoice.id);
    if (index >= 0) {
      invoices[index] = updatedInvoice;
      saveInvoices(invoices);
      setInvoice(updatedInvoice);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const status = calculateStatus(invoice);
  const totals = calculateTotals(
    invoice.lineItems || [],
    invoice.taxPercent || 0,
    invoice.discountPercent || 0
  );

  return (
    <>
      {/* Action Bar - Hidden on Print */}
      <div className="min-h-screen bg-gray-50 print:hidden">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
              Back to Invoices
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleTogglePaid}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  invoice.status === 'Paid'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <CheckCircle size={18} />
                {invoice.status === 'Paid' ? 'Mark as Unpaid' : 'Mark as Paid'}
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Printer size={18} />
                Print
              </button>
              <button
                onClick={() => navigate(`/invoice/${id}/edit`)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                <Edit size={18} />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <Trash2 size={18} />
                Delete
              </button>
            </div>
          </div>

          {/* Invoice Display */}
          <div className="bg-white rounded-lg shadow-md p-8 print:shadow-none print:p-0">
            <InvoiceContent invoice={invoice} status={status} totals={totals} />
          </div>
        </div>
      </div>

      {/* Print View */}
      <div className="hidden print:block">
        <InvoiceContent invoice={invoice} status={status} totals={totals} />
      </div>
    </>
  );
};

const InvoiceContent = ({ invoice, status, totals }) => {
  return (
    <div className="max-w-4xl mx-auto invoice-print">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 pb-6 border-b-2 border-gray-200 invoice-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Genesis Invoice</h1>
          <p className="text-sm text-gray-600 font-medium">Your Company Name</p>
          <p className="text-xs text-gray-500">Invoice Management System</p>
        </div>
        <div className="text-right">
          <div className="mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
              {status}
            </span>
          </div>
          <div className="text-xs text-gray-600">
            <p className="font-semibold text-gray-900 text-base mb-1">Invoice #{invoice.invoiceNumber}</p>
          </div>
        </div>
      </div>

      {/* Invoice Info & Client Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 invoice-section">
        <div>
          <h3 className="text-xs font-semibold text-gray-700 uppercase mb-2">Bill From</h3>
          <div className="text-sm text-gray-600">
            <p className="font-semibold text-gray-900">Your Company Name</p>
            <p>Genesis Invoice</p>
            <p>Your Address</p>
            <p>Your City, Country</p>
          </div>
        </div>
        <div>
          <h3 className="text-xs font-semibold text-gray-700 uppercase mb-2">Bill To</h3>
          <div className="text-sm text-gray-600">
            <p className="font-semibold text-gray-900">{invoice.clientName}</p>
            <p>{invoice.clientEmail}</p>
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 invoice-dates">
        <div>
          <p className="text-xs text-gray-600 mb-1">Issue Date</p>
          <p className="text-sm font-medium text-gray-900">{formatDate(invoice.issueDate)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Due Date</p>
          <p className="text-sm font-medium text-gray-900">{formatDate(invoice.dueDate)}</p>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b-2 border-gray-200">
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 uppercase">Description</th>
              <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700 uppercase">Quantity</th>
              <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700 uppercase">Price</th>
              <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700 uppercase">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems && invoice.lineItems.length > 0 ? (
              invoice.lineItems.map((item, index) => {
                const amount = parseFloat(item.quantity || 0) * parseFloat(item.price || 0);
                return (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-2 px-3 text-sm text-gray-900">{item.description || '-'}</td>
                    <td className="py-2 px-3 text-sm text-right text-gray-600">{item.quantity || '0'}</td>
                    <td className="py-2 px-3 text-sm text-right text-gray-600">{formatCurrency(item.price || 0)}</td>
                    <td className="py-2 px-3 text-sm text-right font-medium text-gray-900">{formatCurrency(amount)}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" className="py-2 px-3 text-sm text-center text-gray-500">No line items</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-6 invoice-totals">
        <div className="w-full md:w-1/2">
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium text-gray-900">{formatCurrency(totals.subtotal)}</span>
            </div>
            {parseFloat(invoice.discountPercent || 0) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount ({invoice.discountPercent}%):</span>
                <span className="font-medium text-gray-900">-{formatCurrency(totals.discountAmount)}</span>
              </div>
            )}
            {parseFloat(invoice.taxPercent || 0) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax ({invoice.taxPercent}%):</span>
                <span className="font-medium text-gray-900">{formatCurrency(totals.taxAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t-2 border-gray-200 pt-2 mt-2">
              <span>Total:</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="mt-6 pt-6 border-t border-gray-200 invoice-notes">
          <h3 className="text-xs font-semibold text-gray-700 uppercase mb-2">Notes / Terms</h3>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-gray-200 text-center text-xs text-gray-500 invoice-footer">
        <p>Thank you for your business!</p>
        <p className="mt-1">Generated by Genesis Invoice</p>
      </div>
    </div>
  );
};

export default InvoiceDetail;

