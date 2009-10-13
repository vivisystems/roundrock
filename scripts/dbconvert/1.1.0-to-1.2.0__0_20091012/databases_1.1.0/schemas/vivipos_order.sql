CREATE TABLE "cashdrawer_records" ("id" VARCHAR PRIMARY KEY  NOT NULL ,"terminal_no" VARCHAR,"drawer_no" INTEGER,"clerk" VARCHAR,"clerk_displayname" VARCHAR,"event_type" VARCHAR,"status" INTEGER,"created" INTEGER,"modified" INTEGER,"payment_type" VARCHAR,"amount" FLOAT,"sequence" INTEGER);
CREATE TABLE "clock_stamps" ("id" VARCHAR PRIMARY KEY  NOT NULL ,"username" VARCHAR,"clockin" BOOL,"job" VARCHAR,"clockout" BOOL,"clockin_time" VARCHAR,"created" INTEGER,"modified" INTEGER,"clockout_time" VARCHAR,"displayname" VARCHAR);
CREATE TABLE "ledger_receipts" ("id" VARCHAR NOT NULL , "ledger_id" VARCHAR NOT NULL , "printer" VARCHAR, "created" INTEGER, "modified" INTEGER, PRIMARY KEY ("id", "ledger_id"));
CREATE TABLE "ledger_records" ("id" VARCHAR,"type" VARCHAR,"description" VARCHAR,"mode" VARCHAR,"amount" FLOAT,"created" INTEGER,"modified" INTEGER,"terminal_no" VARCHAR,"sale_period" INTEGER,"shift_number" INTEGER,"service_clerk" VARCHAR,"service_clerk_displayname" VARCAHR);
CREATE TABLE "order_additions" (
	"id" VARCHAR PRIMARY KEY  NOT NULL ,
	"order_id" VARCHAR, 
	"tax_name" VARCHAR,
	"tax_rate" FLOAT,
	"tax_type" VARCHAR,
	"current_tax" FLOAT,
	"discount_name" VARCHAR,
	"discount_rate" FLOAT,
	"discount_type" VARCHAR,
	"current_discount" FLOAT,
	"surcharge_name" VARCHAR,
	"surcharge_rate" FLOAT,
	"surcharge_type" VARCHAR,
	"current_surcharge" FLOAT,
	"has_discount" BOOL,
	"has_surcharge" BOOL,
	"created" INTEGER, 
	"modified" INTEGER
);
CREATE TABLE "order_annotations" ("id" VARCHAR PRIMARY KEY  NOT NULL , "type" VARCHAR NOT NULL , "text" VARCHAR NOT NULL , "created" INTEGER, "modified" INTEGER, "order_id" VARCHAR);
CREATE TABLE "order_item_condiments" ("id" VARCHAR NOT NULL , "order_id" VARCHAR NOT NULL , "item_id" VARCHAR NOT NULL , "name" VARCHAR, "price" FLOAT, "created" INTEGER, "modified" INTEGER, PRIMARY KEY ("id", "order_id", "item_id"));
CREATE TABLE "order_items" ("id" VARCHAR PRIMARY KEY  NOT NULL ,"order_id" VARCHAR,"cate_no" VARCHAR,"included_tax" FLOAT, "cate_name" VARCHAR ,"product_no" VARCHAR,"product_barcode" VARCHAR,"product_name" VARCHAR,"current_qty" FLOAT,"current_price" FLOAT,"current_subtotal" FLOAT,"tax_name" VARCHAR,"tax_rate" FLOAT,"tax_type" VARCHAR,"current_tax" FLOAT,"discount_name" VARCHAR,"discount_rate" FLOAT,"discount_type" VARCHAR,"current_discount" FLOAT,"surcharge_name" VARCHAR,"surcharge_rate" FLOAT,"surcharge_type" VARCHAR,"current_surcharge" FLOAT,"condiments" VARCHAR,"current_condiment" FLOAT,"memo" TEXT,"has_discount" BOOL,"has_surcharge" BOOL,"has_marker" BOOL,"created" INTEGER,"modified" INTEGER, "destination" VARCHAR, "parent_no" VARCHAR);
CREATE TABLE "order_objects" (
	"id" VARCHAR PRIMARY KEY  NOT NULL ,
	"order_id" VARCHAR, 
	"object" TEXT,
	"created" INTEGER, 
	"modified" INTEGER
);
CREATE TABLE "order_payments" ("id" VARCHAR PRIMARY KEY  NOT NULL ,"order_id" VARCHAR,"order_items_count" INTEGER,"order_total" FLOAT,"name" VARCHAR,"amount" FLOAT,"memo1" TEXT,"memo2" TEXT,"created" INTEGER,"modified" INTEGER,"origin_amount" FLOAT,"service_clerk" VARCHAR,"proceeds_clerk" VARCHAR,"service_clerk_displayname" VARCHAR,"proceeds_clerk_displayname" VARCHAR,"change" FLOAT, "sale_period" INTEGER, "shift_number" INTEGER, "terminal_no" VARCHAR);
CREATE TABLE "order_promotions" ("id" VARCHAR PRIMARY KEY  NOT NULL ,"order_id" VARCHAR,"promotion_id" VARCHAR,"name" VARCHAR,"code" VARCHAR,"alt_name1" VARCHAR,"alt_name2" VARCHAR,"trigger" VARCHAR,"trigger_name" VARCHAR,"trigger_label" VARCHAR,"type" VARCHAR,"type_name" VARCHAR,"type_label" VARCHAR,"matched_amount" INTEGER,"matched_items_qty" INTEGER,"matched_items_subtotal" FLOAT,"discount_subtotal" FLOAT,"tax_name" VARCHAR,"current_tax" FLOAT,"tax_type" VARCHAR, "created" INTEGER, "modified" INTEGER);
CREATE TABLE "order_receipts" ("id" VARCHAR PRIMARY KEY  NOT NULL ,"order_id" VARCHAR,"sequence" INTEGER,"device" INTEGER,"created" INTEGER,"modified" INTEGER,"batch" INTEGER);
CREATE TABLE "orders" ("id" VARCHAR PRIMARY KEY  NOT NULL ,"sequence" INTEGER,"items_count" INTEGER,"total" FLOAT,"change" FLOAT,"tax_subtotal" FLOAT,"surcharge_subtotal" FLOAT,"discount_subtotal" FLOAT,"payment_subtotal" FLOAT,"rounding_prices" VARCHAR,"precision_prices" VARCHAR,"rounding_taxes" VARCHAR,"precision_taxes" VARCHAR,"status" INTEGER,"service_clerk" VARCHAR,"service_clerk_displayname" VARCHAR,"proceeds_clerk" VARCHAR,"proceeds_clerk_displayname" VARCHAR,"member" VARCHAR,"member_displayname" VARCHAR,"member_email" VARCHAR,"member_cellphone" VARCHAR,"invoice_type" VARCHAR,"invoice_title" VARCHAR,"invoice_no" VARCHAR,"invoice_count" INTEGER,"destination" VARCHAR,"table_no" VARCHAR,"check_no" VARCHAR,"no_of_customers" INTEGER,"terminal_no" VARCHAR,"transaction_created" INTEGER,"transaction_submitted" INTEGER,"created" INTEGER,"modified" INTEGER,"included_tax_subtotal" FLOAT,"item_subtotal" FLOAT,"sale_period" INTEGER,"shift_number" INTEGER,"branch_id" VARCHAR,"branch" VARCHAR,"transaction_voided" INTEGER,"promotion_subtotal" FLOAT,"void_clerk" VARCHAR,"void_clerk_displayname" VARCHAR,"void_sale_period" INTEGER,"void_shift_number" INTEGER,"revalue_subtotal" FLOAT DEFAULT 0 , "qty_subtotal" INTEGER DEFAULT 0);
CREATE TABLE "shift_change_details" ("id" VARCHAR,"shift_change_id" VARCHAR,"type" VARCHAR,"amount" FLOAT, "name" VARCHAR, "change" FLOAT, "excess_amount" FLOAT, "count" INTEGER, "created" INTEGER, "modified" INTEGER);
CREATE TABLE "shift_changes" ("id" VARCHAR,"starttime" INTEGER,"endtime" INTEGER,"balance" FLOAT,"note" VARCHAR,"created" INTEGER,"modified" INTEGER,"terminal_no" VARCHAR,"sale_period" INTEGER,"shift_number" INTEGER,"cash" FLOAT,"sales" FLOAT,"excess" FLOAT,"ledger_in" FLOAT, "ledger_out" FLOAT, "deposit" FLOAT, "refund" FLOAT, "credit" FLOAT);
CREATE TABLE "shift_markers" ("id" VARCHAR PRIMARY KEY  NOT NULL ,"sale_period" INTEGER,"shift_number" INTEGER,"end_of_period" BOOL,"created" INTEGER,"modified" INTEGER, "terminal_no" VARCHAR, "end_of_shift" BOOL);
CREATE TABLE "sync_remote_machines" ("id" INTEGER PRIMARY KEY NOT NULL, "machine_id" varchar(36) NOT NULL, "last_synced" int DEFAULT -1);
CREATE TABLE "syncs" ("id" INTEGER PRIMARY KEY NOT NULL ,"crud" varchar(255) NOT NULL ,"machine_id" varchar(36) ,"from_machine_id" varchar(36) ,"method_id" varchar(36) NOT NULL ,"method_type" varchar(45) NOT NULL ,"method_table" varchar(45) NOT NULL ,"created" int NOT NULL ,"modified" int NOT NULL);
CREATE TABLE "uniform_invoice_markers" ("id" VARCHAR PRIMARY KEY  NOT NULL , "code" VARCHAR NOT NULL , "seq" VARCHAR NOT NULL , "terminal_no" VARCHAR , "created" INTEGER , "modified" INTEGER, "reset_time" INTEGER);
CREATE TABLE "uniform_invoices" ( "id" VARCHAR PRIMARY KEY  NOT NULL , "order_id" VARCHAR NOT NULL , "code" VARCHAR NOT NULL , "start_seq" VARCHAR NOT NULL , "end_seq" VARCHAR NOT NULL , "terminal_no" VARCHAR NOT NULL , "uniform_business_number" VARCHAR , "status" INTEGER , "sale_period" INTEGER , "shift_number" INTEGER ,"created" INTEGER ,"modified" INTEGER, "memo" VARCHAR, "reset_time" INTEGER);
CREATE INDEX "cashdrawer_records_created" ON "cashdrawer_records" ("created" ASC);
CREATE INDEX "cashdrawer_records_terminalno_created" ON "cashdrawer_records" ("terminal_no", "created" ASC);
CREATE INDEX "clock_stamps_records_created" ON "clock_stamps" ("created" ASC);
CREATE INDEX "order_additions_order_id" ON "order_additions" ("order_id" ASC);
CREATE INDEX "order_annotations_order_id" ON "order_annotations" ("order_id" ASC);
CREATE INDEX "order_items_cate_no" ON "order_items" ("cate_no" ASC);
CREATE INDEX "order_items_order_id" ON "order_items" ("order_id" ASC);
CREATE INDEX "order_items_product_no" ON "order_items" ("product_no" ASC);
CREATE INDEX "order_objects_order_id" ON "order_objects" ("order_id" ASC);
CREATE INDEX "order_payments_oid" ON "order_payments" ("order_id" ASC);
CREATE INDEX "order_promotions_oid" ON "order_promotions" ("order_id" ASC);
CREATE INDEX "order_receipts_order_id" ON "order_receipts" ("order_id" ASC);
CREATE INDEX "orders_created" ON "orders" ("transaction_created" ASC);
CREATE INDEX "orders_sale_period" ON "orders" ("sale_period" ASC);
CREATE INDEX "orders_sequence" ON "orders" ("sequence" ASC);
CREATE INDEX "orders_status_created" ON "orders" ("status" ASC, "created" ASC);
CREATE INDEX "orders_status_sale_period" ON "orders" ("status" ASC, "sale_period" ASC);
CREATE INDEX "orders_status_transaction_created" ON "orders" ("status" ASC, "transaction_created" ASC);
CREATE INDEX "orders_status_transaction_submittedd" ON "orders" ("status" ASC, "transaction_submitted" ASC);
CREATE INDEX "orders_status_transaction_voided" ON "orders" ("status" ASC, "transaction_voided" ASC);
CREATE INDEX "orders_submitted" ON "orders" ("transaction_submitted" ASC);
CREATE INDEX "orders_terminal_no" ON "orders" ("terminal_no" ASC);
CREATE INDEX "shift_changes_sale_period" ON "shift_changes" ("sale_period" ASC);
CREATE INDEX "sync_remote_machines_machine_id" on "sync_remote_machines" ("machine_id");
CREATE INDEX "syncs_from_machine_id" on "syncs" ("from_machine_id");
CREATE INDEX "uniform_invoice_markers_created" ON "uniform_invoice_markers" ("created" ASC);
CREATE INDEX "uniform_invoice_markers_terminal_no" ON "uniform_invoice_markers" ("terminal_no" ASC);
CREATE INDEX "uniform_invoices_created" ON "uniform_invoices" ("created" ASC);
