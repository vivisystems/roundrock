CREATE  TABLE IF NOT EXISTS "main"."promotion_applies" (
"sn" INTEGER PRIMARY KEY,
"id" VARCHAR,
"name" VARCHAR, 
"code" VARCHAR,
"alt_name1" VARCHAR,
"alt_name2" VARCHAR,
"trigger" VARCHAR,
"trigger_name" VARCHAR,
"trigger_label" VARCHAR,
"type" VARCHAR,
"type_name" VARCHAR,
"type_label" VARCHAR,
"matched_amount" INTEGER,
"matched_items_qty" INTEGER,
"matched_items_subtotal" FLOAT,
"discount_subtotal" FLOAT,
"tax_name" VARCHAR,
"current_tax" FLOAT,
"included_tax" FLOAT,
"tax_details" VARCHAR
);

CREATE  TABLE IF NOT EXISTS "main"."promotion_cart_items" (
"index" VARCHAR PRIMARY KEY,
"id" VARCHAR,
"name" VARCHAR,
"no" VARCHAR,
"barcode" VARCHAR,
"cate_no" VARCHAR,
"link_group" VARCHAR,
"org_qty" FLOAT DEFAULT 0,
"current_qty" FLOAT,
"current_price" FLOAT,
"org_subtotal" FLOAT DEFAULT 0,
"current_subtotal" FLOAT,
"current_tax" FLOAT,
"current_discount" FLOAT,
"current_surcharge" FLOAT,
"condiments" VARCHAR,
"current_condiment" FLOAT,
"destination" VARCHAR
);


CREATE  TABLE IF NOT EXISTS "main"."promotion_cart_additions" (
"id" VARCHAR PRIMARY KEY,
"current_tax" FLOAT,
"discount_name" VARCHAR,
"current_discount" FLOAT,
"surcharge_name" VARCHAR,
"current_surcharge" FLOAT
);


CREATE  INDEX "main"."idx_promotion_cart_items_id" ON "promotion_cart_items" ("id");
CREATE  INDEX "main"."idx_promotion_cart_items_no" ON "promotion_cart_items" ("no");
CREATE  INDEX "main"."idx_promotion_cart_items_cate_no" ON "promotion_cart_items" ("cate_no");
CREATE  INDEX "main"."idx_promotion_cart_items_link_group" ON "promotion_cart_items" ("link_group");
