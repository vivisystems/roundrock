CREATE  TABLE IF NOT EXISTS "main"."promotion_actives" (
"id" VARCHAR PRIMARY KEY,
"name" VARCHAR, 
"code" VARCHAR,
"alt_name1" VARCHAR,
"alt_name2" VARCHAR,
"trigger" VARCHAR,
"trigger_name" VARCHAR,
"trigger_label" VARCHAR,
"type" VARCHAR,
"type_name" VARCHAR,
"type_label" VARCHAR
);


CREATE  TABLE IF NOT EXISTS "main"."promotion_cart_items" (
"id" VARCHAR PRIMARY KEY,
"name" VARCHAR,
"no" VARCHAR,
"barcode" VARCHAR,
"cate_no" VARCHAR,
"index" VARCHAR,
"org_qty" FLOAT DEFAULT 0,
"current_qty" FLOAT,
"current_price" FLOAT,
"current_subtotal" FLOAT,
"current_tax" FLOAT,
"current_discount" FLOAT,
"current_surcharge" FLOAT,
"condiments" VARCHAR,
"current_condiment" FLOAT
);


