import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import Layout from '@/layout/Layout';
import {
  ArrowLeft,
  Plus,
  Trash2,
  FileText,
  Building,
  User,
  Mail,
  Phone,
  Calendar,
  Users,
  Percent,
  DollarSign,
  Package,
} from 'lucide-react';

interface Location {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

interface Template {
  id: number;
  name: string;
  content: any;
}

interface LineItem {
  product_id: number | null;
  name: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
}

interface Props {
  locations: Location[];
  products: Product[];
  templates: Template[];
  tenant: {
    currency: string;
    tax_rate: number;
    free_cancellation_hours: number;
  };
}

const CUSTOMER_TYPES = [
  { value: 'individual', label: 'Individual' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'travel_agent', label: 'Travel Agent' },
  { value: 'group', label: 'Group' },
  { value: 'resort', label: 'Resort/Hotel' },
  { value: 'school', label: 'School/Institution' },
];

const QuoteCreate: React.FC<Props> = ({ locations, products, templates, tenant }) => {
  const [items, setItems] = useState<LineItem[]>([
    { product_id: null, name: '', description: '', quantity: 1, unit_price: 0, discount_percent: 0 },
  ]);

  const { data, setData, post, processing, errors } = useForm({
    location_id: locations[0]?.id || '',
    customer_type: 'individual',
    company_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    title: '',
    description: '',
    valid_until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    proposed_dates: [] as string[],
    expected_participants: 1,
    discount_percent: 0,
    deposit_required: true,
    deposit_percent: 50,
    payment_terms: 'Balance due 7 days before trip date',
    terms_and_conditions: '',
    cancellation_policy: `Free cancellation up to ${tenant.free_cancellation_hours || 48} hours before the activity.`,
    notes: '',
    customer_notes: '',
    items: items,
  });

  const addItem = () => {
    const newItems = [
      ...items,
      { product_id: null, name: '', description: '', quantity: 1, unit_price: 0, discount_percent: 0 },
    ];
    setItems(newItems);
    setData('items', newItems);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    setData('items', newItems);
  };

  const updateItem = (index: number, field: keyof LineItem, value: any) => {
    const newItems = items.map((item, i) => {
      if (i !== index) return item;

      // If selecting a product, auto-fill name and price
      if (field === 'product_id' && value) {
        const product = products.find(p => p.id === parseInt(value));
        if (product) {
          return {
            ...item,
            product_id: product.id,
            name: product.name,
            description: product.description || '',
            unit_price: product.price,
          };
        }
      }

      return { ...item, [field]: value };
    });
    setItems(newItems);
    setData('items', newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unit_price;
      const itemDiscount = itemTotal * (item.discount_percent / 100);
      return sum + (itemTotal - itemDiscount);
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = subtotal * (data.discount_percent / 100);
    const taxable = subtotal - discount;
    const tax = taxable * (tenant.tax_rate / 100);
    return taxable + tax;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: tenant.currency || 'USD',
    }).format(amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/admin/quotes');
  };

  return (
    <Layout>
      <Head title="Create Quote" />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/quotes"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Quote</h1>
              <p className="text-gray-600">Create a new proposal for a customer</p>
            </div>
          </div>
          <button
            type="submit"
            disabled={processing}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            Create Quote
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Customer Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Type *
                  </label>
                  <select
                    value={data.customer_type}
                    onChange={(e) => setData('customer_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {CUSTOMER_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {['corporate', 'travel_agent', 'resort', 'school'].includes(data.customer_type) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Building className="w-4 h-4 inline mr-1" />
                      Company/Organization Name
                    </label>
                    <input
                      type="text"
                      value={data.company_name}
                      onChange={(e) => setData('company_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    value={data.contact_name}
                    onChange={(e) => setData('contact_name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.contact_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.contact_name && (
                    <p className="mt-1 text-sm text-red-500">{errors.contact_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email *
                  </label>
                  <input
                    type="email"
                    value={data.contact_email}
                    onChange={(e) => setData('contact_email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.contact_email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={data.contact_phone}
                    onChange={(e) => setData('contact_phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <select
                    value={data.location_id}
                    onChange={(e) => setData('location_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select location...</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Quote Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Quote Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quote Title *
                  </label>
                  <input
                    type="text"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    placeholder="e.g., Corporate Team Building Package"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    rows={3}
                    placeholder="Detailed description of what's included..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Valid Until *
                    </label>
                    <input
                      type="date"
                      value={data.valid_until}
                      onChange={(e) => setData('valid_until', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Users className="w-4 h-4 inline mr-1" />
                      Expected Participants
                    </label>
                    <input
                      type="number"
                      value={data.expected_participants}
                      onChange={(e) => setData('expected_participants', parseInt(e.target.value) || 1)}
                      min={1}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Percent className="w-4 h-4 inline mr-1" />
                      Overall Discount %
                    </label>
                    <input
                      type="number"
                      value={data.discount_percent}
                      onChange={(e) => setData('discount_percent', parseFloat(e.target.value) || 0)}
                      min={0}
                      max={100}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  Line Items
                </h2>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-2 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product (optional)
                        </label>
                        <select
                          value={item.product_id || ''}
                          onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          <option value="">Custom item...</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name} - {formatCurrency(product.price)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Item Name *
                        </label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItem(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Qty
                        </label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          min={1}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Unit Price
                        </label>
                        <input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          min={0}
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Item description (optional)"
                        className="flex-1 mr-4 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-600">Discount:</label>
                          <input
                            type="number"
                            value={item.discount_percent}
                            onChange={(e) => updateItem(index, 'discount_percent', parseFloat(e.target.value) || 0)}
                            min={0}
                            max={100}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <span className="text-sm text-gray-500">%</span>
                        </div>

                        <div className="text-right font-medium min-w-[100px]">
                          {formatCurrency(
                            item.quantity * item.unit_price * (1 - item.discount_percent / 100)
                          )}
                        </div>

                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Terms & Policies */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Terms & Policies
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.deposit_required}
                      onChange={(e) => setData('deposit_required', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Require Deposit</span>
                  </label>
                  {data.deposit_required && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={data.deposit_percent}
                        onChange={(e) => setData('deposit_percent', parseFloat(e.target.value) || 0)}
                        min={0}
                        max={100}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <span className="text-sm text-gray-500">% of total</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Terms
                  </label>
                  <input
                    type="text"
                    value={data.payment_terms}
                    onChange={(e) => setData('payment_terms', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cancellation Policy
                  </label>
                  <textarea
                    value={data.cancellation_policy}
                    onChange={(e) => setData('cancellation_policy', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Terms & Conditions
                  </label>
                  <textarea
                    value={data.terms_and_conditions}
                    onChange={(e) => setData('terms_and_conditions', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Internal Notes (not visible to customer)
                  </label>
                  <textarea
                    value={data.notes}
                    onChange={(e) => setData('notes', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Quote Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Quote Summary
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatCurrency(calculateSubtotal())}</span>
                </div>

                {data.discount_percent > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({data.discount_percent}%)</span>
                    <span>-{formatCurrency(calculateSubtotal() * (data.discount_percent / 100))}</span>
                  </div>
                )}

                {tenant.tax_rate > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax ({tenant.tax_rate}%)</span>
                    <span>
                      {formatCurrency(
                        (calculateSubtotal() * (1 - data.discount_percent / 100)) *
                          (tenant.tax_rate / 100)
                      )}
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>

                {data.deposit_required && data.deposit_percent > 0 && (
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Deposit Required</span>
                      <span className="font-medium">
                        {formatCurrency(calculateTotal() * (data.deposit_percent / 100))}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Balance Due</span>
                      <span>
                        {formatCurrency(calculateTotal() * (1 - data.deposit_percent / 100))}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Valid until: {new Date(data.valid_until).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  {data.expected_participants} expected participant(s)
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Layout>
  );
};

export default QuoteCreate;
