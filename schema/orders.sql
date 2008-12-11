CREATE TABLE "orders" (
	"id" VARCHAR PRIMARY KEY  NOT NULL ,
	"sequence" VARCHAR,
	"items_count" INTEGER,
	"total" FLOAT,
	"change" FLOAT,
	"tax_subtotal" FLOAT,
	"surcharge_subtotal" FLOAT,
	"discount_subtotal" FLOAT,
	"payment_subtotal" FLOAT,
	"rounding_prices" VARCHAR,
	"precision_prices" VARCHAR,
	"rounding_taxes" VARCHAR,
	"precision_taxes" VARCHAR,
	"status" INTEGER,
	"service_clerk" VARCHAR,
	"service_clerk_displayname" VARCHAR,
	"proceeds_clerk" VARCHAR,
	"proceeds_clerk_displayname" VARCHAR,
	"member" VARCHAR,
	"member_displayname" VARCHAR,
	"member_email" VARCHAR,
	"member_cellphone" VARCHAR,
	"invoice_type" VARCHAR,
	"invoice_title" VARCHAR,
	"invoice_no" VARCHAR,
	"invoice_count" INTEGER,
	"destination" VARCHAR,
	"table_no" VARCHAR,
	"check_no" VARCHAR,
	"no_of_customers" INTEGER,
	"terminal_no" VARCHAR,
	"transaction_created" INTEGER,
	"transaction_created_format" VARCHAR,
	"transaction_submited" INTEGER,
	"transaction_submited_format" VARCHAR,
	"created" INTEGER,
	"modified" INTEGER

)


CREATE TABLE "order_items" (
	"id" VARCHAR PRIMARY KEY  NOT NULL ,
	"order_id" VARCHAR, 
	"product_id" VARCHAR,
	"product_no" VARCHAR,
	"product_barcode" VARCHAR,
	"product_name" VARCHAR,
	"current_qty" FLOAT,
	"current_price" FLOAT,
	"current_subtotal" FLOAT,
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
	"condiments" VARCHAR,
	"current_condiment" FLOAT,
	"memo" TEXT,
	"has_discount" BOOL,
	"has_surcharge" BOOL,
	"has_marker" BOOL,
	"created" INTEGER, 
	"modified" INTEGER
)

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
)

CREATE TABLE "order_payments" (
	"id" VARCHAR PRIMARY KEY  NOT NULL ,
	"order_id" VARCHAR, 
	"order_items_count" INTEGER,
	"order_total" FLOAT,
        "name" VARCHAR,
        "amount" FLOAT,
        "memo1" TEXT,
        "memo2" TEXT,
	"created" INTEGER, 
	"modified" INTEGER
)


CREATE TABLE "order_objects" (
	"id" VARCHAR PRIMARY KEY  NOT NULL ,
	"order_id" VARCHAR, 
	"object" TEXT,
	"created" INTEGER, 
	"modified" INTEGER
)

