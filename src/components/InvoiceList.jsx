import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Filter, ArrowUpDown, Eye, Edit, Trash2 } from 'lucide-react';
import { getInvoices, calculateStatus, formatDate, formatCurrency, deleteInvoice, calculateTotals } from '../utils/invoiceUtils';
import { getStatusColor } from '../utils/statusColors';
import { useNavigate } from 'react-router-dom';

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState(() => {
    // Default to card view on mobile, table on desktop
    return window.innerWidth < 768 ? 'card' : 'table';
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = () => {
    const allInvoices = getInvoices();
    setInvoices(allInvoices);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      deleteInvoice(id);
      loadInvoices();
    }
  };

  const handleTogglePaid = (invoice) => {
    const updatedInvoice = {
      ...invoice,
      status: invoice.status === 'Paid' ? 'Pending' : 'Paid',
    };
    const invoices = getInvoices();
    const index = invoices.findIndex(inv => inv.id === invoice.id);
    if (index >= 0) {
      invoices[index] = updatedInvoice;
      localStorage.setItem('genesis-invoices', JSON.stringify(invoices));
      loadInvoices();
    }
  };

  const filteredAndSortedInvoices = useMemo(() => {
    let filtered = invoices.map(inv => ({
      ...inv,
      calculatedStatus: calculateStatus(inv),
    }));

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(inv => inv.calculatedStatus === filterStatus);
    }

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(inv =>
        inv.invoiceNumber.toLowerCase().includes(term) ||
        inv.clientName.toLowerCase().includes(term) ||
        inv.clientEmail?.toLowerCase().includes(term)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'date') {
        const dateA = new Date(a.dueDate);
        const dateB = new Date(b.dueDate);
        comparison = dateA - dateB;
      } else if (sortBy === 'amount') {
        const totalA = parseFloat(calculateTotals(a.lineItems || [], a.taxPercent || 0, a.discountPercent || 0).total);
        const totalB = parseFloat(calculateTotals(b.lineItems || [], b.taxPercent || 0, b.discountPercent || 0).total);
        comparison = totalA - totalB;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [invoices, searchTerm, filterStatus, sortBy, sortOrder]);

  const InvoiceCard = ({ invoice }) => {
    const totals = calculateTotals(invoice.lineItems || [], invoice.taxPercent || 0, invoice.discountPercent || 0);
    const status = invoice.calculatedStatus;

    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{invoice.invoiceNumber}</h3>
            <p className="text-sm text-gray-600 mt-1">{invoice.clientName}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
            {status}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <p className="text-gray-500">Issue Date</p>
            <p className="font-medium">{formatDate(invoice.issueDate)}</p>
          </div>
          <div>
            <p className="text-gray-500">Due Date</p>
            <p className="font-medium">{formatDate(invoice.dueDate)}</p>
          </div>
        </div>

        <div className="border-t pt-4 mb-4">
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.total)}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/invoice/${invoice.id}`)}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            title="View"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => navigate(`/invoice/${invoice.id}/edit`)}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            title="Edit"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDelete(invoice.id)}
            className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
            <p className="text-gray-600 mt-1">{filteredAndSortedInvoices.length} invoice(s)</p>
          </div>
          <button
            onClick={() => navigate('/invoice/new')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <Plus size={20} />
            New Invoice
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="Draft">Draft</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <ArrowUpDown size={20} className="text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>

            {/* View Toggle (Mobile/Desktop) */}
            <div className="hidden md:flex gap-2">
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-lg transition ${
                  viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`px-4 py-2 rounded-lg transition ${
                  viewMode === 'card' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                Card
              </button>
            </div>
          </div>
        </div>

        {/* Invoice List */}
        {filteredAndSortedInvoices.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">No invoices found</p>
            <button
              onClick={() => navigate('/invoice/new')}
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Create Your First Invoice
            </button>
          </div>
        ) : (
          <>
            {/* Table View - Desktop only */}
            {viewMode === 'table' && (
              <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAndSortedInvoices.map((invoice) => {
                        const totals = calculateTotals(invoice.lineItems || [], invoice.taxPercent || 0, invoice.discountPercent || 0);
                        const status = invoice.calculatedStatus;

                        return (
                          <tr key={invoice.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{invoice.clientName}</div>
                              <div className="text-sm text-gray-500">{invoice.clientEmail}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(invoice.issueDate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(invoice.dueDate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                                {status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatCurrency(totals.total)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => navigate(`/invoice/${invoice.id}`)}
                                  className="flex items-center justify-center p-2 text-blue-600 hover:text-blue-900 transition rounded-lg hover:bg-blue-50"
                                  title="View"
                                >
                                  <Eye size={18} />
                                </button>
                                <button
                                  onClick={() => navigate(`/invoice/${invoice.id}/edit`)}
                                  className="flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 transition rounded-lg hover:bg-gray-100"
                                  title="Edit"
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  onClick={() => handleDelete(invoice.id)}
                                  className="flex items-center justify-center p-2 text-red-600 hover:text-red-900 transition rounded-lg hover:bg-red-50"
                                  title="Delete"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {/* Card View - Always on mobile, on desktop when viewMode is card */}
            <div className={`grid grid-cols-1 gap-6 ${viewMode === 'table' ? 'md:hidden' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
              {filteredAndSortedInvoices.map((invoice) => (
                <InvoiceCard key={invoice.id} invoice={invoice} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InvoiceList;

