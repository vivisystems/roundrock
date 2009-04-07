CREATE  TABLE IF NOT EXISTS "main"."promotion_items" (
"id" VARCHAR , 
"name" VARCHAR, 
"no" VARCHAR, 
"barcode" VARCHAR,
"cate_no" VARCHAR,
"index" VARCHAR,
"current_qty" FLOAT,
"current_price" FLOAT,
"current_subtotal" FLOAT,
"current_tax" FLOAT,
"current_discount" FLOAT,
"current_surcharge" FLOAT,
"condiments" VARCHAR,
"current_condiment" FLOAT
);


CREATE  TABLE IF NOT EXISTS "main"."promotion_cart_items" (
"id" VARCHAR ,
"name" VARCHAR,
"no" VARCHAR,
"barcode" VARCHAR,
"cate_no" VARCHAR,
"index" VARCHAR,
"reserved_qty" FLOAT DEFAULT 0,
"current_qty" FLOAT,
"current_price" FLOAT,
"current_subtotal" FLOAT,
"reserved_subtotal" FLOAT DEFAULT 0,
"current_tax" FLOAT,
"current_discount" FLOAT,
"current_surcharge" FLOAT,
"condiments" VARCHAR,
"current_condiment" FLOAT
);


