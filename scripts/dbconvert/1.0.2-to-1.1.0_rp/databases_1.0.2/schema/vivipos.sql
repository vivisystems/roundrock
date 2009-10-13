CREATE TABLE "categories" ("id" VARCHAR PRIMARY KEY  NOT NULL ,"no" VARCHAR,"name" VARCHAR,"rate" VARCHAR,"button_color" VARCHAR,"font_size" VARCHAR,"visible" BOOL,"cansale" BOOL,"created" INTEGER,"modified" INTEGER,"display_order" FLOAT);
CREATE TABLE "clock_stamps" ("id" VARCHAR PRIMARY KEY  NOT NULL , "username" VARCHAR, "clockin" BOOL, "job" VARCHAR, "clockout" BOOL,
"clockin_time" VARCHAR, "clockin_date" VARCHAR, "created" INTEGER, "modified" INTEGER, "clockout_time" VARCHAR, "displayname" VARCHAR);
CREATE TABLE "combine_taxes" ("id" VARCHAR PRIMARY KEY  NOT NULL , "tax_id" VARCHAR, "combine_tax_id" VARCHAR, "created" INTEGER, "modified" INTEGER);
CREATE TABLE "condiment_groups" ("id" VARCHAR PRIMARY KEY  NOT NULL , "name" VARCHAR, "created" INTEGER, "modified" INTEGER, "seltype" VARCHAR DEFAULT 'single', "newline" BOOLEAN DEFAULT 0);
CREATE TABLE "condiments" ("id" VARCHAR PRIMARY KEY  NOT NULL , "condiment_group_id" VARCHAR, 
"name" VARCHAR, "price" FLOAT, "button_color" VARCHAR,"font_size" VARCHAR, "created" INTEGER, "modified" INTEGER, "preset" BOOLEAN);
CREATE TABLE "jobs" ("id" VARCHAR PRIMARY KEY  NOT NULL , "jobname" VARCHAR, "created" INTEGER, "modified" INTEGER);
CREATE TABLE "plugroups" ("id" VARCHAR PRIMARY KEY  NOT NULL ,"name" VARCHAR,"description" VARCHAR,"created" INTEGER,"modified" INTEGER,"button_color" VARCHAR,"font_size" VARCHAR,"visible" BOOL,"display_order" INTEGER,"routing" BOOL, "link_department" VARCHAR, "link_group" VARCHAR);
CREATE TABLE "products" (
	"id" VARCHAR PRIMARY KEY  NOT NULL ,
	"cate_no" VARCHAR,
	"no" VARCHAR,
	"name" VARCHAR, 
	"barcode" VARCHAR,
	"rate" VARCHAR,
	"cond_group" VARCHAR,
	"buy_price" FLOAT,
	"stock" FLOAT,
	"min_stock" FLOAT,
	"memo" TEXT,
	"min_sale_qty" FLOAT,
	"sale_unit" VARCHAR,
	"setmenu" VARCHAR,
	"level_enable1" BOOL,"price_level1" FLOAT,"halo1" FLOAT,"lalo1" FLOAT,
	"level_enable2" BOOL,"price_level2" FLOAT,"halo2" FLOAT,"lalo2" FLOAT,
	"level_enable3" BOOL,"price_level3" FLOAT,"halo3" FLOAT,"lalo3" FLOAT,
	"level_enable4" BOOL,"price_level4" FLOAT,"halo4" FLOAT,"lalo4" FLOAT,
	"level_enable5" BOOL,"price_level5" FLOAT,"halo5" FLOAT,"lalo5" FLOAT,
	"level_enable6" BOOL,"price_level6" FLOAT,"halo6" FLOAT,"lalo6" FLOAT,
	"level_enable7" BOOL,"price_level7" FLOAT,"halo7" FLOAT,"lalo7" FLOAT,
	"level_enable8" BOOL,"price_level8" FLOAT,"halo8" FLOAT,"lalo8" FLOAT,
	"level_enable9" BOOL,"price_level9" FLOAT,"halo9" FLOAT,"lalo9" FLOAT,
	"link_group" VARCHAR,
	"auto_maintain_stock" BOOL,
	"return_stock" BOOL,
	"force_condiment" BOOL,
	"force_memo" BOOL,
	"single" BOOL,
	"visible" BOOL,
	"button_color" VARCHAR,
	"font_size" VARCHAR,
	"age_verification" BOOL,
	"created" INTEGER, "modified" INTEGER
, "icon_only" BOOL, "alt_name1" VARCHAR, "alt_name2" VARCHAR, "manual_adjustment_only" BOOL, "append_empty_btns" INTEGER DEFAULT 0);
CREATE TABLE "promotions" ("id" VARCHAR PRIMARY KEY  NOT NULL ,"name" VARCHAR,"code" VARCHAR,"alt_name1" VARCHAR,"alt_name2" VARCHAR,"trigger" VARCHAR,"trigger_data" TEXT,"type" VARCHAR,"type_data" TEXT,"tax_no" VARCHAR,"tax_name" VARCHAR,"start_date" INTEGER,"end_date" INTEGER,"start_time" INTEGER,"end_time" INTEGER,"days_of_week" VARCHAR,"created" INTEGER,"modified" INTEGER,"active" BOOL DEFAULT 1 ,"reserve_item" BOOL DEFAULT 0 ,"rule_order" INTEGER DEFAULT 0 , "member" VARCHAR);
CREATE TABLE 'rp_affiche' ('id' VARCHAR PRIMARY KEY  NOT NULL , 'affiche_title' VARCHAR, 'affiche_context' VARCHAR, 'created_date' DATETIME, 'modified_date' DATETIME, 'affiche_end_time' DATETIME);
CREATE TABLE 'rp_affiches' ('id' VARCHAR PRIMARY KEY  NOT NULL , 'affiche_title' VARCHAR, 'affiche_context' VARCHAR, 'created_date' DATETIME, 'modified_date' DATETIME, 'affiche_end_time' DATETIME);
CREATE TABLE 'rp_materiel_types' ('id' VARCHAR PRIMARY KEY  NOT NULL ,'materieltypecode' VARCHAR,'materieltypename' VARCHAR,'updateby' VARCHAR,'updatedate' DATETIME DEFAULT CURRENT_TIME );
CREATE TABLE "rp_materiels" ("id" VARCHAR PRIMARY KEY  NOT NULL ,"materielcode" VARCHAR,"materielname" VARCHAR,"price" NUMERIC,"updateby" VARCHAR,"updatedate" DATETIME DEFAULT CURRENT_TIME ,"rp_unit_id" VARCHAR,"rp_materiel_type_id" VARCHAR,"materielStatus" INTEGER,"StatusChangeDate" DATETIME, "UnitName" VARCHAR, "productBySelf" INTEGER, "supperName" VARCHAR, "productCompany" VARCHAR, "keepPeriod" DATETIME, "invoice" VARCHAR);
CREATE TABLE "rp_sync_logs" ("id" VARCHAR PRIMARY KEY  NOT NULL ,"model_name" VARCHAR,"method" VARCHAR,"para" VARCHAR,"sync_date" DATETIME,"sync_unixtime" INTEGER,"data_length" INTEGER);
CREATE TABLE 'rp_transfer_details' ('id' VARCHAR NOT NULL ,'rp_transfer_header_id' VARCHAR NOT NULL ,'rp_materiel_id' VARCHAR,'requestdate' INTEGER,'requestusername' VARCHAR,'officeconfirmuserid' VARCHAR,'officeconfirmusername' VARCHAR,'officeconfirmdate' VARCHAR,'warehouseconfirmuserid' VARCHAR,'warehouseconfirmusername' VARCHAR,'warehouseconfirmdate' VARCHAR,'trinuserid' VARCHAR,'trinusername' VARCHAR,'trindate' VARCHAR,'ts_id' VARCHAR,'materielname' VARCHAR,'requestqty' INTEGER,'officeconfirmqty' INTEGER,'warehouseconfirmqty' INTEGER,'trinqty' INTEGER, 'syncstatusdate' INTEGER, 'unit_name' VARCHAR, 'rp_unit_id' VARCHAR, 'is_lack' INTEGER, 'reason' VARCHAR, 'is_omit' INTEGER, PRIMARY KEY ('id','rp_transfer_header_id') );
CREATE TABLE 'rp_transfer_headers' ('id' VARCHAR PRIMARY KEY  NOT NULL ,'store_code_id' INTEGER,'fromstore_code_id' VARCHAR,'createdate' DATETIME,'createuserid' VARCHAR,'createusername' VARCHAR,'reasonid' VARCHAR,'memo' VARCHAR,'status' INTEGER,'workstation' VARCHAR,'programname' VARCHAR,'username' VARCHAR,'ts_id' VARCHAR,'rowstatus' INTEGER,'syncstatus' INTEGER,'request_amount' NUMERIC,'inform_amount' NUMERIC,'send_amount' NUMERIC,'accept_amount' NUMERIC,'final_amount' NUMERIC,'upload_amount' NUMERIC,'order_type' INTEGER,'rp_materiel_type_id' VARCHAR);
CREATE TABLE 'rp_units' ('id' VARCHAR PRIMARY KEY  NOT NULL ,'unitcode' VARCHAR,'unitname' VARCHAR,'description' VARCHAR,'updateby' VARCHAR,'updatedate' VARCHAR DEFAULT CURRENT_TIME , 'syncdate' VARCHAR);
CREATE TABLE "sequences" ("id" VARCHAR PRIMARY KEY  NOT NULL , "key" VARCHAR, "value" INTEGER, "created" INTEGER, "modified" INTEGER);
CREATE TABLE "set_items" ("id" VARCHAR NOT NULL ,"pluset_no" VARCHAR NOT NULL ,"label" VARCHAR,"preset_no" VARCHAR,"quantity" INTEGER NOT NULL ,"baseprice" FLOAT,"linkgroup_id" VARCHAR,"reduction" BOOL,"created" INTEGER,"modified" INTEGER,"sequence" INTEGER, PRIMARY KEY ("id","pluset_no") );
CREATE TABLE "store_contacts" ("id" VARCHAR PRIMARY KEY  NOT NULL ,"name" VARCHAR,"branch" VARCHAR,"contact" VARCHAR,"telephone1" VARCHAR,"telephone2" VARCHAR,"address1" VARCHAR,"address2" VARCHAR,"city" VARCHAR,"county" VARCHAR,"state" VARCHAR,"zip" VARCHAR,"country" VARCHAR,"fax" VARCHAR,"email" VARCHAR,"note" VARCHAR,"terminal_no" VARCHAR,"branch_id" VARCHAR);
CREATE TABLE "sync_remote_machines" ("id" INTEGER PRIMARY KEY NOT NULL, "machine_id" varchar(36) NOT NULL, "last_synced" int DEFAULT -1);
CREATE TABLE "syncs" ("id" INTEGER PRIMARY KEY NOT NULL ,"crud" varchar(255) NOT NULL ,"machine_id" varchar(36) ,"from_machine_id" varchar(36) ,"method_id" varchar(36) NOT NULL ,"method_type" varchar(45) NOT NULL ,"method_table" varchar(45) NOT NULL ,"created" int NOT NULL ,"modified" int NOT NULL);
CREATE TABLE "table_bookings" ("id" VARCHAR,"table_id" VARCHAR,"booking" INTEGER,"contact" VARCHAR,"telephone" VARCHAR,"address" VARCHAR,"note" VARCHAR, "table_no" INTEGER);
CREATE TABLE "table_regions" ("id" VARCHAR, "name" VARCHAR, "image" VARCHAR);
CREATE TABLE "table_statuses" ("id" VARCHAR,"order_id" VARCHAR,"check_no" INTEGER,"table_no" INTEGER,"sequence" INTEGER,"guests" INTEGER,"holdby" VARCHAR,"clerk" VARCHAR,"booking" INTEGER,"lock" BOOL,"status" INTEGER,"created" INTEGER,"modified" INTEGER,"table_object" TEXT,"order_object" TEXT,"terminal_no" VARCHAR);
CREATE TABLE "tables" ("id" VARCHAR,"table_no" INTEGER,"table_name" VARCHAR,"table_region_id" VARCHAR,"seats" INTEGER,"active" BOOL,"tag" VARCHAR, "destination" VARCHAR);
CREATE TABLE "taxes" ("id" VARCHAR PRIMARY KEY  NOT NULL , "no" VARCHAR, "name" VARCHAR, "type" VARCHAR,
"rate" FLOAT, "rate_type" VARCHAR, "threshold" FLOAT, "created" INTEGER, "modified" INTEGER);
CREATE TABLE "users" ("id" VARCHAR PRIMARY KEY  NOT NULL ,"username" VARCHAR,"displayname" VARCHAR,"group" VARCHAR,"password" VARCHAR,"default_price_level" VARCHAR,"item_discount_limit" VARCHAR,"order_discount_limit" VARCHAR,"item_surcharge_limit" VARCHAR,"order_surcharge_limit" VARCHAR,"max_plu_qty" VARCHAR,"max_plu_price" VARCHAR,"item_coupon_limit" VARCHAR,"order_coupon_limit" VARCHAR,"max_cash_check" VARCHAR,"min_check" VARCHAR,"max_check" VARCHAR,"max_open_checks" VARCHAR,"created" INTEGER,"modified" INTEGER,"job_id" VARCHAR, "drawer");
CREATE INDEX "sync_remote_machines_machine_id" on "sync_remote_machines" ("machine_id");
CREATE INDEX "syncs_from_machine_id" on "syncs" ("from_machine_id");
