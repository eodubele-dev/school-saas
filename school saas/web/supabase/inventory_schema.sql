-- ZERO-LEAKAGE INVENTORY HUB SCHEMA

-- 1. Inventory Categories (Siloes)
CREATE TABLE IF NOT EXISTS inventory_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- "Academic", "Operational", "Retail"
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Vendors (Supplier Management)
CREATE TABLE IF NOT EXISTS inventory_vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5), -- Track reliability
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Inventory Items (The Stock)
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES inventory_categories(id) ON DELETE SET NULL,
    vendor_id UUID REFERENCES inventory_vendors(id) ON DELETE SET NULL, -- Preferred Vendor
    name TEXT NOT NULL,
    sku TEXT, -- Optional Code
    description TEXT,
    
    quantity_on_hand INTEGER DEFAULT 0,
    reorder_level INTEGER DEFAULT 10, -- Low stock trigger point
    
    unit_cost DECIMAL(12,2) DEFAULT 0, -- Average cost price
    selling_price DECIMAL(12,2), -- Only for Retail items (Uniforms)
    
    unit_type TEXT DEFAULT 'unit', -- "box", "ream", "liter"
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Requisitions (Staff Requests)
CREATE TABLE IF NOT EXISTS inventory_requisitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    requested_by UUID REFERENCES profiles(id), -- Staff Member
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'fulfilled')) DEFAULT 'pending',
    
    approval_date TIMESTAMPTZ,
    approved_by UUID REFERENCES profiles(id), -- Admin
    
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Requisition Items (Line Items)
CREATE TABLE IF NOT EXISTS inventory_requisition_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requisition_id UUID REFERENCES inventory_requisitions(id) ON DELETE CASCADE,
    item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    quantity_requested INTEGER NOT NULL,
    quantity_approved INTEGER, -- Admin can reduce amount
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Transactions (Audit Log)
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    
    type TEXT CHECK (type IN ('purchase', 'requisition', 'sale', 'adjustment', 'return')),
    quantity_change INTEGER NOT NULL, -- Negative for out, Positive for in
    
    cost_at_transaction DECIMAL(12,2), -- Snapshot of value
    reference_id UUID, -- Links to Requisition ID or Purchase Order ID
    note TEXT,
    
    performed_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_stock ON inventory_items(quantity_on_hand); -- For low stock filtering
CREATE INDEX IF NOT EXISTS idx_inventory_req_status ON inventory_requisitions(status);
CREATE INDEX IF NOT EXISTS idx_inventory_trans_item ON inventory_transactions(item_id);

-- RLS
ALTER TABLE inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_requisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_requisition_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Policies (Simplified)
CREATE POLICY "Tenant Access Inventory" ON inventory_items
    USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));
    
-- ... (Standard tenant isolation policies apply to all)
