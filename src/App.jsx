
import React, { useState, useEffect } from 'react';

// --- ROLES Configuration ---
const ROLES = {
  'BUSINESS_USER': {
    canViewDashboard: true,
    canCreateRFQ: true,
    canViewRFQs: true,
    canEditOwnRFQs: true,
    canViewPO: true,
    canViewSuppliers: true,
    canViewAuditLogs: false,
    canApproveRFQ: false,
    canManageSuppliers: false,
    canManagePOs: false,
  },
  'PROCUREMENT_OFFICER': {
    canViewDashboard: true,
    canCreateRFQ: true,
    canViewRFQs: true,
    canEditRFQs: true, // Can edit all RFQs
    canViewPO: true,
    canCreatePO: true,
    canViewSuppliers: true,
    canManageSuppliers: true, // Can create/edit suppliers
    canViewAuditLogs: true,
    canApproveRFQ: true,
    canManagePOs: true, // Can approve/issue POs
  },
  'SUPPLIER': {
    canViewDashboard: false,
    canCreateRFQ: false,
    canViewRFQs: false, // Only RFQs they are invited to
    canRespondToRFQs: true,
    canViewOwnPO: true, // POs issued to them
    canViewSuppliers: false, // View self-details only
    canManageOwnCatalog: true,
    canViewAuditLogs: false,
    canApproveRFQ: false,
    canManageSuppliers: false,
    canManagePOs: false,
  },
};

// --- Standardized Status Keys and UI Mapping ---
const STATUS_MAP = {
  'APPROVED': { label: 'Approved', color: 'var(--status-approved)' },
  'PENDING': { label: 'Pending Approval', color: 'var(--status-pending)' },
  'REJECTED': { label: 'Rejected', color: 'var(--status-rejected)' },
  'IN_PROGRESS': { label: 'In Progress', color: 'var(--status-in-progress)' },
  'DRAFT': { label: 'Draft', color: 'var(--status-draft)' },
  'SUBMITTED': { label: 'Submitted', color: 'var(--status-in-progress)' },
  'OPEN': { label: 'Open', color: 'var(--status-in-progress)' },
  'CLOSED': { label: 'Closed', color: 'var(--status-approved)' },
  'COMPLETED': { label: 'Completed', color: 'var(--status-completed)' },
  'AWAITING_RESPONSE': { label: 'Awaiting Response', color: 'var(--status-pending)' },
  'ONBOARDING': { label: 'Onboarding', color: 'var(--status-pending)' },
  'ACTIVE': { label: 'Active', color: 'var(--status-approved)' },
  'INACTIVE': { label: 'Inactive', color: 'var(--status-rejected)' },
};

// --- Dummy Data ---
const dummyUsers = [
  { id: 'u1', name: 'Alice Business', role: 'BUSINESS_USER' },
  { id: 'u2', name: 'Bob Procurement', role: 'PROCUREMENT_OFFICER' },
  { id: 'u3', name: 'Charlie Supplier', role: 'SUPPLIER' },
];

const dummySuppliers = [
  { id: 's1', name: 'Office Supplies Inc.', contact: 'info@office.com', status: 'ACTIVE', registrationDate: '2022-01-15' },
  { id: 's2', name: 'IT Solutions Ltd.', contact: 'sales@itsol.com', status: 'ACTIVE', registrationDate: '2021-09-01' },
  { id: 's3', name: 'Cleaning Services Co.', contact: 'clean@service.com', status: 'ONBOARDING', registrationDate: '2023-03-20' },
  { id: 's4', name: 'Logistics Partners', contact: 'ops@logistics.com', status: 'INACTIVE', registrationDate: '2020-05-10' },
  { id: 's5', name: 'Marketing Group', contact: 'hello@marketing.com', status: 'ACTIVE', registrationDate: '2022-11-01' },
];

const dummyRFQs = [
  {
    id: 'RFQ-001',
    title: 'New Office Chairs',
    description: 'Request for quotation for 20 ergonomic office chairs.',
    status: 'APPROVED',
    requestorId: 'u1',
    requestorName: 'Alice Business',
    assignedToId: 'u2',
    assignedToName: 'Bob Procurement',
    supplierId: 's1',
    supplierName: 'Office Supplies Inc.',
    amount: 15000,
    dateCreated: '2023-10-26',
    dateDue: '2023-11-10',
    workflowStage: 'Quotation Received',
    milestones: [
      { name: 'Drafted', date: '2023-10-26', status: 'completed' },
      { name: 'Submitted', date: '2023-10-27', status: 'completed' },
      { name: 'Reviewed by Procurement', date: '2023-10-28', status: 'completed' },
      { name: 'Sent to Supplier', date: '2023-10-29', status: 'completed' },
      { name: 'Quotation Received', date: '2023-11-03', status: 'current', slaBreach: false },
      { name: 'Evaluation', date: null, status: 'pending' },
      { name: 'Approved', date: null, status: 'pending' },
    ],
    slaStatus: 'On Track', // Example: On Track, Warning, Breached
    documents: [{ name: 'Chair_Specs.pdf', url: '#', type: 'pdf' }],
    relatedRecords: [{ type: 'Supplier', id: 's1', name: 'Office Supplies Inc.' }],
    items: [{ name: 'Ergonomic Chair', quantity: 20, unitPrice: 750 }],
  },
  {
    id: 'RFQ-002',
    title: 'Server Rack Upgrade',
    description: 'Upgrade request for data center server racks.',
    status: 'PENDING',
    requestorId: 'u1',
    requestorName: 'Alice Business',
    assignedToId: 'u2',
    assignedToName: 'Bob Procurement',
    supplierId: 's2',
    supplierName: 'IT Solutions Ltd.',
    amount: 50000,
    dateCreated: '2023-11-01',
    dateDue: '2023-11-15',
    workflowStage: 'Sent to Supplier',
    milestones: [
      { name: 'Drafted', date: '2023-11-01', status: 'completed' },
      { name: 'Submitted', date: '2023-11-02', status: 'completed' },
      { name: 'Reviewed by Procurement', date: '2023-11-03', status: 'completed' },
      { name: 'Sent to Supplier', date: '2023-11-04', status: 'current', slaBreach: true },
      { name: 'Quotation Received', date: null, status: 'pending' },
      { name: 'Evaluation', date: null, status: 'pending' },
      { name: 'Approved', date: null, status: 'pending' },
    ],
    slaStatus: 'Breached',
    documents: [{ name: 'Server_Reqs.docx', url: '#', type: 'doc' }],
    relatedRecords: [{ type: 'Supplier', id: 's2', name: 'IT Solutions Ltd.' }],
    items: [{ name: 'Server Rack', quantity: 5, unitPrice: 10000 }],
  },
  {
    id: 'RFQ-003',
    title: 'Facility Cleaning Contract',
    description: 'Annual contract for facility cleaning services.',
    status: 'IN_PROGRESS',
    requestorId: 'u1',
    requestorName: 'Alice Business',
    assignedToId: 'u2',
    assignedToName: 'Bob Procurement',
    supplierId: 's3',
    supplierName: 'Cleaning Services Co.',
    amount: 120000,
    dateCreated: '2023-10-15',
    dateDue: '2023-11-30',
    workflowStage: 'Evaluation',
    milestones: [
      { name: 'Drafted', date: '2023-10-15', status: 'completed' },
      { name: 'Submitted', date: '2023-10-16', status: 'completed' },
      { name: 'Reviewed by Procurement', date: '2023-10-17', status: 'completed' },
      { name: 'Sent to Supplier', date: '2023-10-18', status: 'completed' },
      { name: 'Quotation Received', date: '2023-10-25', status: 'completed' },
      { name: 'Evaluation', date: null, status: 'current', slaBreach: false },
      { name: 'Approved', date: null, status: 'pending' },
    ],
    slaStatus: 'On Track',
    documents: [{ name: 'Cleaning_SOW.pdf', url: '#', type: 'pdf' }],
    relatedRecords: [{ type: 'Supplier', id: 's3', name: 'Cleaning Services Co.' }],
    items: [{ name: 'Monthly Cleaning Service', quantity: 12, unitPrice: 10000 }],
  },
  {
    id: 'RFQ-004',
    title: 'Marketing Campaign Materials',
    description: 'Printing and distribution for Q1 marketing campaign.',
    status: 'DRAFT',
    requestorId: 'u1',
    requestorName: 'Alice Business',
    assignedToId: null,
    assignedToName: null,
    supplierId: null,
    supplierName: null,
    amount: 25000,
    dateCreated: '2023-11-05',
    dateDue: '2023-12-01',
    workflowStage: 'Drafted',
    milestones: [
      { name: 'Drafted', date: '2023-11-05', status: 'current', slaBreach: false },
      { name: 'Submitted', date: null, status: 'pending' },
      { name: 'Reviewed by Procurement', date: null, status: 'pending' },
      { name: 'Sent to Supplier', date: null, status: 'pending' },
      { name: 'Quotation Received', date: null, status: 'pending' },
      { name: 'Evaluation', date: null, status: 'pending' },
      { name: 'Approved', date: null, status: 'pending' },
    ],
    slaStatus: 'On Track',
    documents: [],
    relatedRecords: [],
    items: [{ name: 'Flyers (A5)', quantity: 5000, unitPrice: 2 }, { name: 'Posters (A3)', quantity: 500, unitPrice: 10 }],
  },
  {
    id: 'RFQ-005',
    title: 'Cloud Software License',
    description: 'Renewal of annual cloud software subscription.',
    status: 'REJECTED',
    requestorId: 'u1',
    requestorName: 'Alice Business',
    assignedToId: 'u2',
    assignedToName: 'Bob Procurement',
    supplierId: 's2',
    supplierName: 'IT Solutions Ltd.',
    amount: 7000,
    dateCreated: '2023-10-01',
    dateDue: '2023-10-15',
    workflowStage: 'Rejected',
    milestones: [
      { name: 'Drafted', date: '2023-10-01', status: 'completed' },
      { name: 'Submitted', date: '2023-10-02', status: 'completed' },
      { name: 'Reviewed by Procurement', date: '2023-10-03', status: 'completed' },
      { name: 'Rejected', date: '2023-10-05', status: 'current', slaBreach: false },
    ],
    slaStatus: 'On Track',
    documents: [],
    relatedRecords: [],
    items: [{ name: 'Software License', quantity: 1, unitPrice: 7000 }],
  },
  {
    id: 'RFQ-006',
    title: 'Training Workshop',
    description: 'External vendor for management training workshop.',
    status: 'SUBMITTED',
    requestorId: 'u1',
    requestorName: 'Alice Business',
    assignedToId: 'u2',
    assignedToName: 'Bob Procurement',
    supplierId: null,
    supplierName: null,
    amount: 10000,
    dateCreated: '2023-11-08',
    dateDue: '2023-11-22',
    workflowStage: 'Submitted',
    milestones: [
      { name: 'Drafted', date: '2023-11-08', status: 'completed' },
      { name: 'Submitted', date: '2023-11-09', status: 'current', slaBreach: false },
      { name: 'Reviewed by Procurement', date: null, status: 'pending' },
      { name: 'Sent to Supplier', date: null, status: 'pending' },
    ],
    slaStatus: 'On Track',
    documents: [],
    relatedRecords: [],
    items: [{ name: 'Management Training', quantity: 1, unitPrice: 10000 }],
  },
];

const dummyPOs = [
  {
    id: 'PO-001',
    rfqId: 'RFQ-001',
    title: 'PO for New Office Chairs',
    status: 'ISSUED',
    supplierId: 's1',
    supplierName: 'Office Supplies Inc.',
    requestorId: 'u1',
    requestorName: 'Alice Business',
    amount: 15000,
    dateIssued: '2023-11-05',
    dateDue: '2023-11-20',
    items: [{ name: 'Ergonomic Chair', quantity: 20, unitPrice: 750 }],
  },
  {
    id: 'PO-002',
    rfqId: 'RFQ-003',
    title: 'PO for Facility Cleaning Contract',
    status: 'PENDING',
    supplierId: 's3',
    supplierName: 'Cleaning Services Co.',
    requestorId: 'u1',
    requestorName: 'Alice Business',
    amount: 120000,
    dateIssued: '2023-11-10',
    dateDue: '2023-12-01',
    items: [{ name: 'Monthly Cleaning Service', quantity: 12, unitPrice: 10000 }],
  },
  {
    id: 'PO-003',
    rfqId: null, // Could be direct PO
    title: 'PO for Emergency Maintenance',
    status: 'COMPLETED',
    supplierId: 's2',
    supplierName: 'IT Solutions Ltd.',
    requestorId: 'u1',
    requestorName: 'Alice Business',
    amount: 2500,
    dateIssued: '2023-09-15',
    dateDue: '2023-09-20',
    items: [{ name: 'Emergency Server Repair', quantity: 1, unitPrice: 2500 }],
  },
];

const dummyAuditLogs = [
  { id: 'log1', entity: 'RFQ-001', action: 'Created', user: 'Alice Business', date: '2023-10-26T10:00:00Z', details: 'RFQ-001 created' },
  { id: 'log2', entity: 'RFQ-001', action: 'Status Update', user: 'Bob Procurement', date: '2023-10-28T11:30:00Z', details: 'Status changed to "Reviewed by Procurement"' },
  { id: 'log3', entity: 'RFQ-002', action: 'SLA Breached', user: 'System', date: '2023-11-04T09:00:00Z', details: 'SLA for "Sent to Supplier" stage breached' },
  { id: 'log4', entity: 'PO-001', action: 'Issued', user: 'Bob Procurement', date: '2023-11-05T14:15:00Z', details: 'PO-001 issued to Office Supplies Inc.' },
  { id: 'log5', entity: 'Supplier-s3', action: 'Status Update', user: 'Bob Procurement', date: '2023-11-01T16:00:00Z', details: 'Supplier Cleaning Services Co. status changed to Onboarding' },
];

function App() {
  const [view, setView] = useState({ screen: 'LOGIN', params: {} });
  const [currentUser, setCurrentUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [rfqs, setRFQs] = useState(dummyRFQs); // State to allow updates

  // Simulate global search functionality
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');

  const navigate = (screen, params = {}) => {
    setView({ screen, params });
    window.scrollTo(0, 0); // Scroll to top on navigation
  };

  const login = (role) => {
    const user = dummyUsers.find(u => u.role === role);
    setCurrentUser(user);
    setLoggedIn(true);
    navigate('DASHBOARD');
  };

  const logout = () => {
    setCurrentUser(null);
    setLoggedIn(false);
    navigate('LOGIN');
  };

  const hasPermission = (permissionKey) => {
    return (currentUser?.role && ROLES[currentUser.role]?.[permissionKey]) || false;
  };

  const getBreadcrumbs = () => {
    const crumbs = [];
    crumbs.push({ label: 'Home', screen: 'DASHBOARD' });

    switch (view.screen) {
      case 'DASHBOARD':
        // No additional crumbs needed
        break;
      case 'RFQ_LIST':
        crumbs.push({ label: 'RFQs', screen: 'RFQ_LIST' });
        break;
      case 'RFQ_DETAIL':
        crumbs.push({ label: 'RFQs', screen: 'RFQ_LIST' });
        crumbs.push({ label: `RFQ ${view.params?.id}`, screen: 'RFQ_DETAIL', params: view.params });
        break;
      case 'RFQ_FORM':
        crumbs.push({ label: 'RFQs', screen: 'RFQ_LIST' });
        if (view.params?.id) {
          crumbs.push({ label: `RFQ ${view.params?.id}`, screen: 'RFQ_DETAIL', params: { id: view.params?.id } });
          crumbs.push({ label: 'Edit', screen: 'RFQ_FORM', params: view.params });
        } else {
          crumbs.push({ label: 'Create New', screen: 'RFQ_FORM' });
        }
        break;
      case 'PO_LIST':
        crumbs.push({ label: 'Purchase Orders', screen: 'PO_LIST' });
        break;
      case 'PO_DETAIL':
        crumbs.push({ label: 'Purchase Orders', screen: 'PO_LIST' });
        crumbs.push({ label: `PO ${view.params?.id}`, screen: 'PO_DETAIL', params: view.params });
        break;
      case 'SUPPLIER_LIST':
        crumbs.push({ label: 'Suppliers', screen: 'SUPPLIER_LIST' });
        break;
      case 'SUPPLIER_DETAIL':
        crumbs.push({ label: 'Suppliers', screen: 'SUPPLIER_LIST' });
        crumbs.push({ label: `${view.params?.name}`, screen: 'SUPPLIER_DETAIL', params: view.params });
        break;
      case 'AUDIT_LOGS':
        crumbs.push({ label: 'Audit Logs', screen: 'AUDIT_LOGS' });
        break;
      default:
        break;
    }
    return crumbs;
  };

  // --- Form Handlers ---
  const handleRFQUpload = (file) => {
    console.log('File uploaded:', file?.name);
    // In a real app, this would involve API calls
  };

  const handleRFQSubmit = (formData) => {
    if (formData.id) {
      // Edit existing RFQ
      setRFQs(prevRFQs => prevRFQs.map(rfq => rfq.id === formData.id ? { ...rfq, ...formData } : rfq));
      console.log('RFQ Updated:', formData);
      navigate('RFQ_DETAIL', { id: formData.id });
    } else {
      // Create new RFQ
      const newId = `RFQ-${String(rfqs.length + 1).padStart(3, '0')}`;
      const newRFQ = {
        ...formData,
        id: newId,
        dateCreated: new Date().toISOString().slice(0, 10),
        status: 'DRAFT',
        requestorId: currentUser?.id,
        requestorName: currentUser?.name,
        workflowStage: 'Drafted',
        milestones: [{ name: 'Drafted', date: new Date().toISOString().slice(0, 10), status: 'current', slaBreach: false }],
        slaStatus: 'On Track',
        documents: [],
        relatedRecords: [],
        amount: formData.items?.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) || 0,
      };
      setRFQs(prevRFQs => [...prevRFQs, newRFQ]);
      console.log('New RFQ Created:', newRFQ);
      navigate('RFQ_DETAIL', { id: newId });
    }
  };

  // --- Screens ---
  const LoginScreen = () => (
    <div className="login-panel">
      <h2>Welcome to Tailspend Management</h2>
      <p>Please select your role to log in:</p>
      <div className="login-options">
        {dummyUsers.map(user => (
          <button key={user.id} onClick={() => login(user.role)}>
            Log in as {user.role.replace('_', ' ')} ({user.name})
          </button>
        ))}
      </div>
    </div>
  );

  const DashboardScreen = () => {
    const totalSpend = rfqs.filter(r => r.status === 'APPROVED' || r.status === 'COMPLETED' || r.status === 'ISSUED').reduce((sum, r) => sum + r.amount, 0);
    const pendingRFQs = rfqs.filter(r => r.status === 'PENDING' || r.status === 'SUBMITTED').length;
    const activeSuppliers = dummySuppliers.filter(s => s.status === 'ACTIVE').length;
    const breachedSLAs = rfqs.filter(r => r.slaStatus === 'Breached').length;

    const recentActivities = dummyAuditLogs.slice(0, 5).map(log => ({
      ...log,
      description: `${log.user} ${log.action} on ${log.entity}${log.details ? `: ${log.details}` : ''}`,
      date: new Date(log.date).toLocaleString(),
    }));

    return (
      <div className="dashboard-content">
        <h2>Dashboard</h2>
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <span className="dashboard-kpi-label">Total Spend (YTD)</span>
            </div>
            <div className="dashboard-kpi-value">${totalSpend.toLocaleString()}</div>
          </div>
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <span className="dashboard-kpi-label">Pending RFQs</span>
            </div>
            <div className="dashboard-kpi-value">{pendingRFQs}</div>
          </div>
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <span className="dashboard-kpi-label">Active Suppliers</span>
            </div>
            <div className="dashboard-kpi-value">{activeSuppliers}</div>
          </div>
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <span className="dashboard-kpi-label">SLA Breaches</span>
            </div>
            <div className="dashboard-kpi-value" style={{ color: breachedSLAs > 0 ? 'var(--status-breached)' : 'inherit' }}>{breachedSLAs}</div>
          </div>
        </div>

        <div className="dashboard-section">
          <h3>Spend Analytics</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
            <div className="chart-placeholder">Bar Chart Placeholder (Spend by Category)</div>
            <div className="chart-placeholder">Line Chart Placeholder (Spend Trend)</div>
            <div className="chart-placeholder">Donut Chart Placeholder (Spend by Supplier)</div>
            <div className="chart-placeholder">Gauge Chart Placeholder (Budget Utilization)</div>
          </div>
        </div>

        <div className="dashboard-section recent-activities">
          <h3>Recent Activities <span className="pulse-animation" style={{ position: 'relative', top: '2px', left: '5px' }}></span></h3>
          <ul>
            {recentActivities.map(activity => (
              <li key={activity.id}>
                <span className="activity-description">{activity.description}</span>
                <span className="activity-date">{activity.date}</span>
              </li>
            ))}
          </ul>
        </div>
        {hasPermission('canCreateRFQ') && (
          <button
            onClick={() => navigate('RFQ_FORM')}
            className="form-actions submit-button"
            style={{ width: 'auto', marginTop: 'var(--spacing-lg)' }}
          >
            Create New RFQ
          </button>
        )}
      </div>
    );
  };

  const RFQListScreen = () => {
    const filteredRFQs = rfqs.filter(rfq =>
      rfq.title.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
      rfq.id.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
      rfq.requestorName?.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
      STATUS_MAP[rfq.status]?.label.toLowerCase().includes(globalSearchTerm.toLowerCase())
    );

    const hasCreatePermission = hasPermission('canCreateRFQ');
    const hasViewPermission = hasPermission('canViewRFQs');

    if (!hasViewPermission && !hasCreatePermission) {
      return <div>You do not have permission to view RFQs.</div>;
    }

    if (filteredRFQs.length === 0 && !globalSearchTerm) {
      return (
        <div className="grid-empty-state">
          <h4>No RFQs found</h4>
          <p>Start by creating a new Request for Quotation.</p>
          {hasCreatePermission && (
            <button onClick={() => navigate('RFQ_FORM')}>
              Create New RFQ
            </button>
          )}
        </div>
      );
    }

    return (
      <div>
        <div className="data-grid-header">
          <h2>Requests for Quotation</h2>
          <div className="data-grid-actions">
            {hasCreatePermission && (
              <button className="grid-action-button" onClick={() => navigate('RFQ_FORM')}>Create RFQ</button>
            )}
            <button className="grid-action-button">Filter</button>
            <button className="grid-action-button">Sort</button>
            <button className="grid-action-button">Export</button>
          </div>
        </div>
        <div className="card-grid">
          {filteredRFQs.map(rfq => (
            <div
              key={rfq.id}
              className={`card status-${rfq.status}`}
              onClick={() => navigate('RFQ_DETAIL', { id: rfq.id })}
            >
              <div className="card-header">
                <h3 className="card-title">{rfq.title}</h3>
                <span className={`card-status status-${rfq.status}`}>{STATUS_MAP[rfq.status]?.label}</span>
              </div>
              <div className="card-body">
                <p><strong>ID:</strong> {rfq.id}</p>
                <p><strong>Requestor:</strong> {rfq.requestorName}</p>
                <p><strong>Status:</strong> {STATUS_MAP[rfq.status]?.label}</p>
                <p><strong>Due Date:</strong> {rfq.dateDue}</p>
                <p><strong>Current Stage:</strong> {rfq.workflowStage}</p>
              </div>
              <div className="card-footer">
                <span>Amount: ${rfq.amount?.toLocaleString()}</span>
                <span>Created: {rfq.dateCreated}</span>
              </div>
              <div className="card-actions">
                {(hasPermission('canEditRFQs') || (hasPermission('canEditOwnRFQs') && rfq.requestorId === currentUser?.id)) && (
                  <button className="card-action-button" onClick={(e) => { e.stopPropagation(); navigate('RFQ_FORM', { id: rfq.id }); }}>Edit</button>
                )}
                {hasPermission('canApproveRFQ') && rfq.status === 'PENDING' && (
                  <button className="card-action-button" onClick={(e) => { e.stopPropagation(); alert(`Approving RFQ ${rfq.id}`); }}>Approve</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const RFQDetailScreen = () => {
    const rfq = rfqs.find(r => r.id === view.params?.id);
    if (!rfq) return <div>RFQ not found.</div>;

    const hasEditPermission = hasPermission('canEditRFQs') || (hasPermission('canEditOwnRFQs') && rfq.requestorId === currentUser?.id);
    const hasApprovePermission = hasPermission('canApproveRFQ');
    const isPendingApproval = rfq.status === 'PENDING' || rfq.status === 'SUBMITTED';

    const handleApprove = () => {
      if (window.confirm(`Are you sure you want to approve RFQ ${rfq.id}?`)) {
        setRFQs(prev => prev.map(r => r.id === rfq.id ? { ...r, status: 'APPROVED', workflowStage: 'Approved', milestones: [...(r.milestones?.slice(0, -1) || []), { name: 'Approved', date: new Date().toISOString().slice(0, 10), status: 'completed' }] } : r));
        navigate('RFQ_DETAIL', { id: rfq.id }); // Re-render with new status
      }
    };

    const handleReject = () => {
      if (window.confirm(`Are you sure you want to reject RFQ ${rfq.id}?`)) {
        setRFQs(prev => prev.map(r => r.id === rfq.id ? { ...r, status: 'REJECTED', workflowStage: 'Rejected', milestones: [...(r.milestones?.slice(0, -1) || []), { name: 'Rejected', date: new Date().toISOString().slice(0, 10), status: 'completed' }] } : r));
        navigate('RFQ_DETAIL', { id: rfq.id }); // Re-render with new status
      }
    };

    const handleConvertToPO = () => {
      if (!hasPermission('canCreatePO')) {
        alert('You do not have permission to create Purchase Orders.');
        return;
      }
      if (window.confirm(`Convert RFQ ${rfq.id} to Purchase Order?`)) {
        const newPOId = `PO-${String(dummyPOs.length + 1).padStart(3, '0')}`;
        const newPO = {
          id: newPOId,
          rfqId: rfq.id,
          title: `PO for ${rfq.title}`,
          status: 'PENDING',
          supplierId: rfq.supplierId,
          supplierName: rfq.supplierName,
          requestorId: rfq.requestorId,
          requestorName: rfq.requestorName,
          amount: rfq.amount,
          dateIssued: new Date().toISOString().slice(0, 10),
          dateDue: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().slice(0, 10), // 30 days from now
          items: rfq.items,
        };
        dummyPOs.push(newPO); // Mutating dummy data, in real app would use state/API
        alert(`PO ${newPOId} created from RFQ ${rfq.id}.`);
        navigate('PO_DETAIL', { id: newPOId });
      }
    };

    const rfqAuditLogs = dummyAuditLogs.filter(log => log.entity === rfq.id);

    return (
      <div className="detail-view">
        <div className="detail-main">
          <div className="detail-header">
            <div>
              <h2 className="detail-title">{rfq.title}</h2>
              <span className={`card-status status-${rfq.status}`} style={{ marginTop: 'var(--spacing-xs)', display: 'inline-block' }}>
                {STATUS_MAP[rfq.status]?.label}
              </span>
              <p style={{ marginTop: 'var(--spacing-sm)', color: 'var(--color-secondary)' }}>
                RFQ ID: {rfq.id}
              </p>
            </div>
            <div className="detail-actions">
              {hasEditPermission && (
                <button className="secondary-button" onClick={() => navigate('RFQ_FORM', { id: rfq.id })}>Edit RFQ</button>
              )}
              {(hasApprovePermission && isPendingApproval) && (
                <>
                  <button className="primary-button" onClick={handleApprove}>Approve</button>
                  <button className="secondary-button" onClick={handleReject} style={{ color: 'var(--status-rejected)', borderColor: 'var(--status-rejected)' }}>Reject</button>
                </>
              )}
              {(hasPermission('canCreatePO') && rfq.status === 'APPROVED') && (
                <button className="primary-button" onClick={handleConvertToPO}>Convert to PO</button>
              )}
            </div>
          </div>

          <h3>RFQ Details</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Description</span>
              <span className="detail-value">{rfq.description}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Requestor</span>
              <span className="detail-value">{rfq.requestorName}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Assigned To</span>
              <span className="detail-value">{rfq.assignedToName || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Supplier</span>
              <span className="detail-value">{rfq.supplierName || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Amount</span>
              <span className="detail-value">${rfq.amount?.toLocaleString()}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Date Created</span>
              <span className="detail-value">{rfq.dateCreated}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Due Date</span>
              <span className="detail-value">{rfq.dateDue}</span>
            </div>
          </div>

          <h3 style={{ marginTop: 'var(--spacing-lg)' }}>Items</h3>
          {rfq.items && rfq.items.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 'var(--spacing-lg)' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: 'var(--spacing-sm)', borderBottom: '1px solid var(--color-border)' }}>Item</th>
                  <th style={{ textAlign: 'right', padding: 'var(--spacing-sm)', borderBottom: '1px solid var(--color-border)' }}>Quantity</th>
                  <th style={{ textAlign: 'right', padding: 'var(--spacing-sm)', borderBottom: '1px solid var(--color-border)' }}>Unit Price</th>
                  <th style={{ textAlign: 'right', padding: 'var(--spacing-sm)', borderBottom: '1px solid var(--color-border)' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {rfq.items.map((item, index) => (
                  <tr key={index}>
                    <td style={{ textAlign: 'left', padding: 'var(--spacing-sm)', borderBottom: '1px solid var(--color-background-light)' }}>{item.name}</td>
                    <td style={{ textAlign: 'right', padding: 'var(--spacing-sm)', borderBottom: '1px solid var(--color-background-light)' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right', padding: 'var(--spacing-sm)', borderBottom: '1px solid var(--color-background-light)' }}>${item.unitPrice?.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', padding: 'var(--spacing-sm)', borderBottom: '1px solid var(--color-background-light)' }}>${(item.quantity * item.unitPrice)?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p>No items defined.</p>}
        </div>

        <div className="detail-sidebar">
          <div className="detail-sidebar-block workflow-tracker">
            <h4>Workflow Progress</h4>
            <ol>
              {rfq.milestones?.map((milestone, index) => (
                <li key={index} className={`workflow-stage ${milestone.status} ${milestone.slaBreach ? 'breached' : ''}`}>
                  <div className="workflow-stage-name">{milestone.name}</div>
                  {milestone.date && <div className="workflow-stage-date">{milestone.date}</div>}
                  {milestone.status === 'current' && <div className={`workflow-stage-sla ${rfq.slaStatus === 'Breached' ? 'breached' : ''}`}>SLA Status: {rfq.slaStatus}</div>}
                </li>
              ))}
            </ol>
          </div>

          <div className="detail-sidebar-block">
            <h4>Related Records</h4>
            {rfq.relatedRecords && rfq.relatedRecords.length > 0 ? (
              <ul>
                {rfq.relatedRecords.map((record, index) => (
                  <li key={index} style={{ marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)' }}>
                    {record.type}: <a href="#" onClick={(e) => { e.preventDefault(); navigate(`${record.type.toUpperCase()}_DETAIL`, { id: record.id, name: record.name }); }}>{record.name}</a>
                  </li>
                ))}
                {dummyPOs.find(po => po.rfqId === rfq.id) && ( // Show linked PO if exists
                  <li key="linked-po" style={{ marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)' }}>
                    Purchase Order: <a href="#" onClick={(e) => { e.preventDefault(); navigate('PO_DETAIL', { id: dummyPOs.find(po => po.rfqId === rfq.id)?.id }); }}>{dummyPOs.find(po => po.rfqId === rfq.id)?.id}</a>
                  </li>
                )}
              </ul>
            ) : <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-secondary)' }}>No related records.</p>}
          </div>

          <div className="detail-sidebar-block">
            <h4>Documents</h4>
            {rfq.documents && rfq.documents.length > 0 ? (
              <ul>
                {rfq.documents.map((doc, index) => (
                  <li key={index} style={{ marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)' }}>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">{doc.name} ({doc.type?.toUpperCase()})</a>
                    {/* Placeholder for document preview */}
                    <button style={{ marginLeft: 'var(--spacing-xs)', padding: 'var(--spacing-xxs) var(--spacing-xs)', fontSize: 'var(--font-size-xs)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--color-border)', background: 'none', cursor: 'pointer' }}
                      onClick={() => alert(`Previewing ${doc.name}`)}>Preview</button>
                  </li>
                ))}
              </ul>
            ) : <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-secondary)' }}>No documents attached.</p>}
          </div>

          {hasPermission('canViewAuditLogs') && (
            <div className="detail-sidebar-block">
              <h4>Audit Logs</h4>
              {rfqAuditLogs.length > 0 ? (
                <ul>
                  {rfqAuditLogs.map(log => (
                    <li key={log.id} style={{ marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)', borderBottom: '1px dotted var(--color-background-light)', paddingBottom: 'var(--spacing-xs)' }}>
                      <strong>{new Date(log.date).toLocaleDateString()} {new Date(log.date).toLocaleTimeString()}</strong>
                      <br />
                      {log.details || log.action} by {log.user}
                    </li>
                  ))}
                </ul>
              ) : <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-secondary)' }}>No audit logs for this record.</p>}
            </div>
          )}
        </div>
      </div>
    );
  };

  const RFQFormScreen = () => {
    const rfqId = view.params?.id;
    const existingRFQ = rfqId ? rfqs.find(r => r.id === rfqId) : null;

    const [formData, setFormData] = useState({
      title: existingRFQ?.title || '',
      description: existingRFQ?.description || '',
      dateDue: existingRFQ?.dateDue || '',
      supplierId: existingRFQ?.supplierId || '',
      items: existingRFQ?.items || [{ name: '', quantity: 0, unitPrice: 0 }],
      files: [],
      // Auto-populated fields (non-editable in form, set on creation)
      requestorId: currentUser?.id,
      requestorName: currentUser?.name,
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
      // Auto-populate assignedTo for Procurement Officers
      if (!existingRFQ && hasPermission('canApproveRFQ') && !formData.assignedToId) {
        setFormData(prev => ({
          ...prev,
          assignedToId: currentUser?.id,
          assignedToName: currentUser?.name,
        }));
      }
    }, [existingRFQ, currentUser, hasPermission, formData.assignedToId]);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      setErrors(prev => ({ ...prev, [name]: '' })); // Clear error on change
    };

    const handleItemChange = (index, field, value) => {
      setFormData(prev => {
        const newItems = prev.items.slice(); // Use slice for immutability
        newItems[index] = {
          ...newItems[index],
          [field]: field === 'quantity' || field === 'unitPrice' ? Number(value) : value,
        };
        return { ...prev, items: newItems };
      });
    };

    const handleAddItem = () => {
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, { name: '', quantity: 0, unitPrice: 0 }],
      }));
    };

    const handleRemoveItem = (index) => {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    };

    const handleFileChange = (e) => {
      setFormData(prev => ({
        ...prev,
        files: [...prev.files, ...Array.from(e.target.files)],
      }));
    };

    const validateForm = () => {
      const newErrors = {};
      if (!formData.title.trim()) newErrors.title = 'Title is mandatory.';
      if (!formData.description.trim()) newErrors.description = 'Description is mandatory.';
      if (!formData.dateDue) newErrors.dateDue = 'Due Date is mandatory.';
      if (formData.items.length === 0) {
        newErrors.items = 'At least one item is required.';
      } else {
        formData.items.forEach((item, index) => {
          if (!item.name.trim()) newErrors[`itemName${index}`] = 'Item name is mandatory.';
          if (item.quantity <= 0) newErrors[`itemQuantity${index}`] = 'Quantity must be positive.';
          if (item.unitPrice <= 0) newErrors[`itemUnitPrice${index}`] = 'Unit price must be positive.';
        });
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (validateForm()) {
        const submitData = {
          ...existingRFQ, // Merge with existing data if editing
          ...formData,
          id: rfqId, // Keep original ID if editing
          supplierName: dummySuppliers.find(s => s.id === formData.supplierId)?.name || '',
          requestorId: existingRFQ?.requestorId || currentUser?.id,
          requestorName: existingRFQ?.requestorName || currentUser?.name,
          assignedToId: existingRFQ?.assignedToId || (hasPermission('canApproveRFQ') ? currentUser?.id : null),
          assignedToName: existingRFQ?.assignedToName || (hasPermission('canApproveRFQ') ? currentUser?.name : null),
        };
        handleRFQSubmit(submitData);
      } else {
        alert('Please correct the errors in the form.');
      }
    };

    if (!(hasPermission('canCreateRFQ') || (rfqId && (hasPermission('canEditRFQs') || (hasPermission('canEditOwnRFQs') && existingRFQ?.requestorId === currentUser?.id))))) {
      return <div>You do not have permission to create or edit RFQs.</div>;
    }

    return (
      <div className="form-container">
        <h2>{rfqId ? `Edit RFQ: ${existingRFQ?.title}` : 'Create New RFQ'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title <span style={{ color: 'var(--status-rejected)' }}>*</span></label>
            <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="description">Description <span style={{ color: 'var(--status-rejected)' }}>*</span></label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} required></textarea>
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="dateDue">Due Date <span style={{ color: 'var(--status-rejected)' }}>*</span></label>
            <input type="date" id="dateDue" name="dateDue" value={formData.dateDue} onChange={handleChange} required />
            {errors.dateDue && <span className="error-message">{errors.dateDue}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="supplierId">Preferred Supplier</label>
            <select id="supplierId" name="supplierId" value={formData.supplierId} onChange={handleChange}>
              <option value="">Select a supplier (optional)</option>
              {dummySuppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <h3>Items <span style={{ color: 'var(--status-rejected)' }}>*</span></h3>
          {formData.items.map((item, index) => (
            <div key={index} style={{ border: '1px dashed var(--color-border)', padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)', borderRadius: 'var(--border-radius-sm)' }}>
              <div className="form-group">
                <label htmlFor={`itemName${index}`}>Item Name</label>
                <input type="text" id={`itemName${index}`} value={item.name} onChange={(e) => handleItemChange(index, 'name', e.target.value)} required />
                {errors[`itemName${index}`] && <span className="error-message">{errors[`itemName${index}`]}</span>}
              </div>
              <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor={`itemQuantity${index}`}>Quantity</label>
                  <input type="number" id={`itemQuantity${index}`} value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} min="1" required />
                  {errors[`itemQuantity${index}`] && <span className="error-message">{errors[`itemQuantity${index}`]}</span>}
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor={`itemUnitPrice${index}`}>Unit Price</label>
                  <input type="number" id={`itemUnitPrice${index}`} value={item.unitPrice} onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)} min="0.01" step="0.01" required />
                  {errors[`itemUnitPrice${index}`] && <span className="error-message">{errors[`itemUnitPrice${index}`]}</span>}
                </div>
              </div>
              {formData.items.length > 1 && (
                <button type="button" onClick={() => handleRemoveItem(index)} className="cancel-button" style={{ marginTop: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)', padding: 'var(--spacing-xs) var(--spacing-sm)' }}>
                  Remove Item
                </button>
              )}
            </div>
          ))}
          {errors.items && <span className="error-message">{errors.items}</span>}
          <button type="button" onClick={handleAddItem} className="secondary-button" style={{ marginBottom: 'var(--spacing-md)' }}>Add Item</button>

          <div className="form-group">
            <label htmlFor="fileUpload">Attach Documents (File Upload)</label>
            <input type="file" id="fileUpload" multiple onChange={handleFileChange} className="file-upload-input" />
            {formData.files.length > 0 && (
              <div style={{ marginTop: 'var(--spacing-sm)' }}>
                <strong>Attached:</strong>
                <ul>
                  {formData.files.map((file, index) => (
                    <li key={index} style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-secondary)' }}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => (rfqId ? navigate('RFQ_DETAIL', { id: rfqId }) : navigate('RFQ_LIST'))} className="cancel-button">Cancel</button>
            <button type="submit" className="submit-button">{rfqId ? 'Save Changes' : 'Create RFQ'}</button>
          </div>
        </form>
      </div>
    );
  };

  const POListScreen = () => {
    const relevantPOs = hasPermission('canViewPO')
      ? dummyPOs
      : dummyPOs.filter(po => po.requestorId === currentUser?.id || po.supplierId === currentUser?.id); // Supplier can view their POs

    const filteredPOs = relevantPOs.filter(po =>
      po.title.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
      po.id.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
      po.supplierName?.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
      STATUS_MAP[po.status]?.label.toLowerCase().includes(globalSearchTerm.toLowerCase())
    );

    if (filteredPOs.length === 0) {
      return (
        <div className="grid-empty-state">
          <h4>No Purchase Orders found</h4>
          <p>There are no purchase orders to display at this time.</p>
        </div>
      );
    }

    return (
      <div>
        <div className="data-grid-header">
          <h2>Purchase Orders</h2>
          <div className="data-grid-actions">
            {hasPermission('canCreatePO') && (
              <button className="grid-action-button" onClick={() => alert('Navigate to PO creation form')}>Create PO</button>
            )}
            <button className="grid-action-button">Filter</button>
            <button className="grid-action-button">Sort</button>
            <button className="grid-action-button">Export</button>
          </div>
        </div>
        <div className="card-grid">
          {filteredPOs.map(po => (
            <div
              key={po.id}
              className={`card status-${po.status}`}
              onClick={() => navigate('PO_DETAIL', { id: po.id })}
            >
              <div className="card-header">
                <h3 className="card-title">{po.title}</h3>
                <span className={`card-status status-${po.status}`}>{STATUS_MAP[po.status]?.label}</span>
              </div>
              <div className="card-body">
                <p><strong>ID:</strong> {po.id}</p>
                <p><strong>Supplier:</strong> {po.supplierName}</p>
                <p><strong>Requestor:</strong> {po.requestorName}</p>
                <p><strong>Amount:</strong> ${po.amount?.toLocaleString()}</p>
              </div>
              <div className="card-footer">
                <span>Issued: {po.dateIssued}</span>
                <span>Due: {po.dateDue}</span>
              </div>
              <div className="card-actions">
                {hasPermission('canManagePOs') && (po.status === 'PENDING') && (
                  <button className="card-action-button" onClick={(e) => { e.stopPropagation(); alert(`Issue PO ${po.id}`); }}>Issue</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const PODetailScreen = () => {
    const po = dummyPOs.find(p => p.id === view.params?.id);
    if (!po) return <div>Purchase Order not found.</div>;

    const isAuthorized = hasPermission('canViewPO') || po.requestorId === currentUser?.id || po.supplierId === currentUser?.id;
    if (!isAuthorized) {
      return <div>You do not have permission to view this Purchase Order.</div>;
    }

    return (
      <div className="detail-view">
        <div className="detail-main">
          <div className="detail-header">
            <div>
              <h2 className="detail-title">{po.title}</h2>
              <span className={`card-status status-${po.status}`} style={{ marginTop: 'var(--spacing-xs)', display: 'inline-block' }}>
                {STATUS_MAP[po.status]?.label}
              </span>
              <p style={{ marginTop: 'var(--spacing-sm)', color: 'var(--color-secondary)' }}>
                PO ID: {po.id}
              </p>
            </div>
            <div className="detail-actions">
              {hasPermission('canManagePOs') && po.status === 'PENDING' && (
                <button className="primary-button" onClick={() => alert(`Issuing PO ${po.id}`)}>Issue PO</button>
              )}
              {hasPermission('canManagePOs') && po.status === 'ISSUED' && (
                <button className="secondary-button" onClick={() => alert(`Marking PO ${po.id} as Completed`)}>Mark Completed</button>
              )}
            </div>
          </div>

          <h3>Purchase Order Details</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Supplier</span>
              <span className="detail-value">{po.supplierName}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Requestor</span>
              <span className="detail-value">{po.requestorName}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Amount</span>
              <span className="detail-value">${po.amount?.toLocaleString()}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Date Issued</span>
              <span className="detail-value">{po.dateIssued}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Due Date</span>
              <span className="detail-value">{po.dateDue}</span>
            </div>
            {po.rfqId && (
              <div className="detail-item">
                <span className="detail-label">Related RFQ</span>
                <span className="detail-value">
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate('RFQ_DETAIL', { id: po.rfqId }); }}>{po.rfqId}</a>
                </span>
              </div>
            )}
          </div>

          <h3 style={{ marginTop: 'var(--spacing-lg)' }}>Items</h3>
          {po.items && po.items.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 'var(--spacing-lg)' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: 'var(--spacing-sm)', borderBottom: '1px solid var(--color-border)' }}>Item</th>
                  <th style={{ textAlign: 'right', padding: 'var(--spacing-sm)', borderBottom: '1px solid var(--color-border)' }}>Quantity</th>
                  <th style={{ textAlign: 'right', padding: 'var(--spacing-sm)', borderBottom: '1px solid var(--color-border)' }}>Unit Price</th>
                  <th style={{ textAlign: 'right', padding: 'var(--spacing-sm)', borderBottom: '1px solid var(--color-border)' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {po.items.map((item, index) => (
                  <tr key={index}>
                    <td style={{ textAlign: 'left', padding: 'var(--spacing-sm)', borderBottom: '1px solid var(--color-background-light)' }}>{item.name}</td>
                    <td style={{ textAlign: 'right', padding: 'var(--spacing-sm)', borderBottom: '1px solid var(--color-background-light)' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right', padding: 'var(--spacing-sm)', borderBottom: '1px solid var(--color-background-light)' }}>${item.unitPrice?.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', padding: 'var(--spacing-sm)', borderBottom: '1px solid var(--color-background-light)' }}>${(item.quantity * item.unitPrice)?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p>No items defined.</p>}
        </div>

        <div className="detail-sidebar">
          <div className="detail-sidebar-block">
            <h4>Documents</h4>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-secondary)' }}>No documents attached.</p>
          </div>
          {hasPermission('canViewAuditLogs') && (
            <div className="detail-sidebar-block">
              <h4>Audit Logs</h4>
              {dummyAuditLogs.filter(log => log.entity === po.id).length > 0 ? (
                <ul>
                  {dummyAuditLogs.filter(log => log.entity === po.id).map(log => (
                    <li key={log.id} style={{ marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)', borderBottom: '1px dotted var(--color-background-light)', paddingBottom: 'var(--spacing-xs)' }}>
                      <strong>{new Date(log.date).toLocaleDateString()} {new Date(log.date).toLocaleTimeString()}</strong>
                      <br />
                      {log.details || log.action} by {log.user}
                    </li>
                  ))}
                </ul>
              ) : <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-secondary)' }}>No audit logs for this record.</p>}
            </div>
          )}
        </div>
      </div>
    );
  };

  const SupplierListScreen = () => {
    const filteredSuppliers = dummySuppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
      supplier.contact.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
      STATUS_MAP[supplier.status]?.label.toLowerCase().includes(globalSearchTerm.toLowerCase())
    );

    if (!hasPermission('canViewSuppliers')) {
      return <div>You do not have permission to view suppliers.</div>;
    }

    if (filteredSuppliers.length === 0) {
      return (
        <div className="grid-empty-state">
          <h4>No Suppliers found</h4>
          <p>There are no suppliers to display.</p>
          {hasPermission('canManageSuppliers') && (
            <button onClick={() => navigate('SUPPLIER_FORM')}>
              Onboard New Supplier
            </button>
          )}
        </div>
      );
    }

    return (
      <div>
        <div className="data-grid-header">
          <h2>Suppliers</h2>
          <div className="data-grid-actions">
            {hasPermission('canManageSuppliers') && (
              <button className="grid-action-button" onClick={() => navigate('SUPPLIER_FORM')}>Onboard Supplier</button>
            )}
            <button className="grid-action-button">Filter</button>
            <button className="grid-action-button">Sort</button>
            <button className="grid-action-button">Export</button>
          </div>
        </div>
        <div className="card-grid">
          {filteredSuppliers.map(supplier => (
            <div
              key={supplier.id}
              className={`card status-${supplier.status}`}
              onClick={() => navigate('SUPPLIER_DETAIL', { id: supplier.id, name: supplier.name })}
            >
              <div className="card-header">
                <h3 className="card-title">{supplier.name}</h3>
                <span className={`card-status status-${supplier.status}`}>{STATUS_MAP[supplier.status]?.label}</span>
              </div>
              <div className="card-body">
                <p><strong>Contact:</strong> {supplier.contact}</p>
                <p><strong>Status:</strong> {STATUS_MAP[supplier.status]?.label}</p>
                <p><strong>Registration Date:</strong> {supplier.registrationDate}</p>
              </div>
              <div className="card-actions">
                {hasPermission('canManageSuppliers') && (
                  <button className="card-action-button" onClick={(e) => { e.stopPropagation(); navigate('SUPPLIER_FORM', { id: supplier.id }); }}>Edit</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const SupplierDetailScreen = () => {
    const supplier = dummySuppliers.find(s => s.id === view.params?.id);
    if (!supplier) return <div>Supplier not found.</div>;

    if (!(hasPermission('canViewSuppliers') || (currentUser?.role === 'SUPPLIER' && currentUser?.name === supplier.name))) { // Simple check for supplier role viewing self
      return <div>You do not have permission to view this supplier's details.</div>;
    }

    const supplierRFQs = dummyRFQs.filter(rfq => rfq.supplierId === supplier.id);
    const supplierPOs = dummyPOs.filter(po => po.supplierId === supplier.id);
    const supplierAuditLogs = dummyAuditLogs.filter(log => log.entity === `Supplier-${supplier.id}`);


    return (
      <div className="detail-view">
        <div className="detail-main">
          <div className="detail-header">
            <div>
              <h2 className="detail-title">{supplier.name}</h2>
              <span className={`card-status status-${supplier.status}`} style={{ marginTop: 'var(--spacing-xs)', display: 'inline-block' }}>
                {STATUS_MAP[supplier.status]?.label}
              </span>
            </div>
            <div className="detail-actions">
              {hasPermission('canManageSuppliers') && (
                <button className="secondary-button" onClick={() => navigate('SUPPLIER_FORM', { id: supplier.id })}>Edit Supplier</button>
              )}
            </div>
          </div>

          <h3>Supplier Details</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Contact Email</span>
              <span className="detail-value">{supplier.contact}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Status</span>
              <span className="detail-value">{STATUS_MAP[supplier.status]?.label}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Registration Date</span>
              <span className="detail-value">{supplier.registrationDate}</span>
            </div>
            {/* Additional supplier details could go here */}
          </div>

          <h3 style={{ marginTop: 'var(--spacing-lg)' }}>Associated RFQs</h3>
          {supplierRFQs.length > 0 ? (
            <div className="card-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              {supplierRFQs.map(rfq => (
                <div key={rfq.id} className={`card status-${rfq.status}`} onClick={() => navigate('RFQ_DETAIL', { id: rfq.id })}>
                  <div className="card-header">
                    <h4 className="card-title">{rfq.title}</h4>
                    <span className={`card-status status-${rfq.status}`} style={{ fontSize: 'var(--font-size-xs)' }}>{STATUS_MAP[rfq.status]?.label}</span>
                  </div>
                  <div className="card-body" style={{ fontSize: 'var(--font-size-sm)' }}>
                    <p>ID: {rfq.id}</p>
                    <p>Requestor: {rfq.requestorName}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-secondary)' }}>No RFQs associated with this supplier.</p>}

          <h3 style={{ marginTop: 'var(--spacing-lg)' }}>Associated POs</h3>
          {supplierPOs.length > 0 ? (
            <div className="card-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              {supplierPOs.map(po => (
                <div key={po.id} className={`card status-${po.status}`} onClick={() => navigate('PO_DETAIL', { id: po.id })}>
                  <div className="card-header">
                    <h4 className="card-title">{po.title}</h4>
                    <span className={`card-status status-${po.status}`} style={{ fontSize: 'var(--font-size-xs)' }}>{STATUS_MAP[po.status]?.label}</span>
                  </div>
                  <div className="card-body" style={{ fontSize: 'var(--font-size-sm)' }}>
                    <p>ID: {po.id}</p>
                    <p>Amount: ${po.amount?.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-secondary)' }}>No Purchase Orders associated with this supplier.</p>}

        </div>
        <div className="detail-sidebar">
          {hasPermission('canViewAuditLogs') && (
            <div className="detail-sidebar-block">
              <h4>Audit Logs</h4>
              {supplierAuditLogs.length > 0 ? (
                <ul>
                  {supplierAuditLogs.map(log => (
                    <li key={log.id} style={{ marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)', borderBottom: '1px dotted var(--color-background-light)', paddingBottom: 'var(--spacing-xs)' }}>
                      <strong>{new Date(log.date).toLocaleDateString()} {new Date(log.date).toLocaleTimeString()}</strong>
                      <br />
                      {log.details || log.action} by {log.user}
                    </li>
                  ))}
                </ul>
              ) : <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-secondary)' }}>No audit logs for this record.</p>}
            </div>
          )}
        </div>
      </div>
    );
  };

  const SupplierFormScreen = () => {
    const supplierId = view.params?.id;
    const existingSupplier = supplierId ? dummySuppliers.find(s => s.id === supplierId) : null;

    const [formData, setFormData] = useState({
      name: existingSupplier?.name || '',
      contact: existingSupplier?.contact || '',
      status: existingSupplier?.status || 'ONBOARDING',
      registrationDate: existingSupplier?.registrationDate || new Date().toISOString().slice(0, 10),
      files: [], // Placeholder for supplier documents
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleFileChange = (e) => {
      setFormData(prev => ({
        ...prev,
        files: [...prev.files, ...Array.from(e.target.files)],
      }));
    };

    const validateForm = () => {
      const newErrors = {};
      if (!formData.name.trim()) newErrors.name = 'Supplier Name is mandatory.';
      if (!formData.contact.trim()) newErrors.contact = 'Contact Email is mandatory.';
      else if (!/\S+@\S+\.\S+/.test(formData.contact)) newErrors.contact = 'Invalid email format.';
      if (!formData.status) newErrors.status = 'Status is mandatory.';
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (validateForm()) {
        const submitData = {
          ...existingSupplier, // Merge with existing data if editing
          ...formData,
          id: supplierId || `s${dummySuppliers.length + 1}`, // Generate new ID if creating
        };
        if (supplierId) {
          // Update existing supplier (mutating for demo, in real app, update state/API)
          const index = dummySuppliers.findIndex(s => s.id === supplierId);
          if (index !== -1) {
            dummySuppliers[index] = submitData;
          }
        } else {
          dummySuppliers.push(submitData); // Add new supplier
        }
        console.log('Supplier Saved:', submitData);
        navigate('SUPPLIER_DETAIL', { id: submitData.id, name: submitData.name });
      } else {
        alert('Please correct the errors in the form.');
      }
    };

    if (!hasPermission('canManageSuppliers')) {
      return <div>You do not have permission to manage suppliers.</div>;
    }

    return (
      <div className="form-container">
        <h2>{supplierId ? `Edit Supplier: ${existingSupplier?.name}` : 'Onboard New Supplier'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Supplier Name <span style={{ color: 'var(--status-rejected)' }}>*</span></label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="contact">Contact Email <span style={{ color: 'var(--status-rejected)' }}>*</span></label>
            <input type="text" id="contact" name="contact" value={formData.contact} onChange={handleChange} required />
            {errors.contact && <span className="error-message">{errors.contact}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="status">Status <span style={{ color: 'var(--status-rejected)' }}>*</span></label>
            <select id="status" name="status" value={formData.status} onChange={handleChange} required>
              {Object.keys(STATUS_MAP).filter(key => key.startsWith('ACTIVE') || key.startsWith('INACTIVE') || key.startsWith('ONBOARDING')).map(key => (
                <option key={key} value={key}>{STATUS_MAP[key].label}</option>
              ))}
            </select>
            {errors.status && <span className="error-message">{errors.status}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="registrationDate">Registration Date</label>
            <input type="date" id="registrationDate" name="registrationDate" value={formData.registrationDate} onChange={handleChange} disabled={!!existingSupplier} />
          </div>

          <div className="form-group">
            <label htmlFor="fileUpload">Supplier Documents (e.g., W-9, NDA)</label>
            <input type="file" id="fileUpload" multiple onChange={handleFileChange} className="file-upload-input" />
            {formData.files.length > 0 && (
              <div style={{ marginTop: 'var(--spacing-sm)' }}>
                <strong>Attached:</strong>
                <ul>
                  {formData.files.map((file, index) => (
                    <li key={index} style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-secondary)' }}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => (supplierId ? navigate('SUPPLIER_DETAIL', { id: supplierId, name: existingSupplier?.name }) : navigate('SUPPLIER_LIST'))} className="cancel-button">Cancel</button>
            <button type="submit" className="submit-button">{supplierId ? 'Save Changes' : 'Onboard Supplier'}</button>
          </div>
        </form>
      </div>
    );
  };

  const AuditLogScreen = () => {
    if (!hasPermission('canViewAuditLogs')) {
      return <div>You do not have permission to view audit logs.</div>;
    }

    const filteredLogs = dummyAuditLogs.filter(log =>
      log.details?.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
      log.entity.toLowerCase().includes(globalSearchTerm.toLowerCase())
    );

    return (
      <div>
        <div className="data-grid-header">
          <h2>Audit Logs</h2>
          <div className="data-grid-actions">
            <button className="grid-action-button">Filter</button>
            <button className="grid-action-button">Export</button>
          </div>
        </div>
        <div className="card-grid" style={{ gridTemplateColumns: '1fr' }}>
          {filteredLogs.map(log => (
            <div key={log.id} className="card">
              <div className="card-header">
                <h3 className="card-title">{log.action} on {log.entity}</h3>
                <span className="card-meta">by {log.user} on {new Date(log.date).toLocaleString()}</span>
              </div>
              <div className="card-body">
                <p>{log.details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderScreen = () => {
    switch (view.screen) {
      case 'LOGIN':
        return <LoginScreen />;
      case 'DASHBOARD':
        return <DashboardScreen />;
      case 'RFQ_LIST':
        return <RFQListScreen />;
      case 'RFQ_DETAIL':
        return <RFQDetailScreen />;
      case 'RFQ_FORM':
        return <RFQFormScreen />;
      case 'PO_LIST':
        return <POListScreen />;
      case 'PO_DETAIL':
        return <PODetailScreen />;
      case 'SUPPLIER_LIST':
        return <SupplierListScreen />;
      case 'SUPPLIER_DETAIL':
        return <SupplierDetailScreen />;
      case 'SUPPLIER_FORM':
        return <SupplierFormScreen />;
      case 'AUDIT_LOGS':
        return <AuditLogScreen />;
      default:
        return <div>Screen not found.</div>;
    }
  };

  return (
    <div className={loggedIn ? 'app-container' : 'app-container login-view'}>
      {loggedIn && (
        <header className="header">
          <div className="header-left">
            <span className="app-title">Tailspend Management</span>
            <div className="global-search">
              <input
                type="text"
                placeholder="Global Search..."
                value={globalSearchTerm}
                onChange={(e) => setGlobalSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="header-right">
            {currentUser && (
              <div className="user-info">
                <span className="user-name">{currentUser.name}</span>
                <span className="user-role">{currentUser.role?.replace('_', ' ')}</span>
              </div>
            )}
            <button className="logout-button" onClick={logout}>Logout</button>
          </div>
        </header>
      )}

      {loggedIn && (
        <nav className="sidebar">
          <ul className="sidebar-nav">
            {hasPermission('canViewDashboard') && (
              <li className="sidebar-nav-item">
                <button
                  className={view.screen === 'DASHBOARD' ? 'active' : ''}
                  onClick={() => navigate('DASHBOARD')}
                >
                  Dashboard
                </button>
              </li>
            )}
            {hasPermission('canViewRFQs') && (
              <li className="sidebar-nav-item">
                <button
                  className={view.screen.startsWith('RFQ') ? 'active' : ''}
                  onClick={() => navigate('RFQ_LIST')}
                >
                  RFQs
                </button>
              </li>
            )}
            {hasPermission('canViewPO') && (
              <li className="sidebar-nav-item">
                <button
                  className={view.screen.startsWith('PO') ? 'active' : ''}
                  onClick={() => navigate('PO_LIST')}
                >
                  Purchase Orders
                </button>
              </li>
            )}
            {hasPermission('canViewSuppliers') && (
              <li className="sidebar-nav-item">
                <button
                  className={view.screen.startsWith('SUPPLIER') ? 'active' : ''}
                  onClick={() => navigate('SUPPLIER_LIST')}
                >
                  Suppliers
                </button>
              </li>
            )}
            {hasPermission('canViewAuditLogs') && (
              <li className="sidebar-nav-item">
                <button
                  className={view.screen === 'AUDIT_LOGS' ? 'active' : ''}
                  onClick={() => navigate('AUDIT_LOGS')}
                >
                  Audit Logs
                </button>
              </li>
            )}
          </ul>
        </nav>
      )}

      <main className="main-content">
        {loggedIn && (
          <div className="breadcrumbs">
            {getBreadcrumbs().map((crumb, index, arr) => (
              <React.Fragment key={crumb.label}>
                {index > 0 && <span>/</span>}
                {index < arr.length - 1 ? (
                  <a href="#" onClick={() => navigate(crumb.screen, crumb.params)}>{crumb.label}</a>
                ) : (
                  <span className="current">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
        {renderScreen()}
      </main>
    </div>
  );
}

export default App;