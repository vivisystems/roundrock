CREATE TABLE "inventory_commitments" ("id" VARCHAR PRIMARY KEY  NOT NULL ,"type" VARCHAR,"memo" VARCHAR,"created" INTEGER,"modified" INTEGER, "supplier" VARCHAR, "clerk" VARCHAR);
CREATE TABLE "inventory_records" ("id" VARCHAR PRIMARY KEY  NOT NULL ,"commitment_id" VARCHAR,"product_no" VARCHAR,"barcode" VARCHAR,"warehouse" VARCHAR,"value" FLOAT,"price" FLOAT,"memo" VARCHAR,"created" INTEGER,"modified" INTEGER);
CREATE TABLE "stock_records" (
	"id" VARCHAR PRIMARY KEY  NOT NULL ,
	"barcode" VARCHAR,
	"warehouse" VARCHAR, 
	"quantity" FLOAT,
	"created" INTEGER, "modified" INTEGER,
	UNIQUE ( id, warehouse )
);
CREATE TABLE "sync_remote_machines" ("id" INTEGER PRIMARY KEY NOT NULL, "machine_id" varchar(36) NOT NULL, "last_synced" int DEFAULT -1);
CREATE TABLE "syncs" ("id" INTEGER PRIMARY KEY NOT NULL ,"crud" varchar(255) NOT NULL ,"machine_id" varchar(36) ,"from_machine_id" varchar(36) ,"method_id" varchar(36) NOT NULL ,"method_type" varchar(45) NOT NULL ,"method_table" varchar(45) NOT NULL ,"created" INTEGER NOT NULL ,"modified" INTEGER NOT NULL);
CREATE INDEX "inventory_commitments_created" ON "inventory_commitments" ("created" ASC);
CREATE INDEX "inventory_commitments_created_type_id" ON "inventory_commitments" ("created" DESC, "type" ASC, "id" ASC);
CREATE INDEX "inventory_commitments_supplier" ON "inventory_commitments" ("supplier" ASC);
CREATE INDEX "inventory_records_commitment_id" on "inventory_records" ("commitment_id");
CREATE INDEX "stock_records_modified" ON "stock_records" ("modified" ASC);
CREATE UNIQUE INDEX "sync_remote_machines_machine_id" on "sync_remote_machines" ("machine_id");
CREATE INDEX "syncs_from_machine_id" on "syncs" ("from_machine_id");
