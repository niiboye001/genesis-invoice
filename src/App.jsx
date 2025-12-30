import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InvoiceList from './components/InvoiceList';
import InvoiceForm from './components/InvoiceForm';
import InvoiceDetail from './components/InvoiceDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<InvoiceList />} />
        <Route path="/invoice/new" element={<InvoiceForm />} />
        <Route path="/invoice/:id" element={<InvoiceDetail />} />
        <Route path="/invoice/:id/edit" element={<InvoiceForm />} />
      </Routes>
    </Router>
  );
}

export default App;

