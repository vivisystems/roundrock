/* vivipos database setting */

/**
 * DON'T INTERLEAVE ARBITRARILY. APPEND and COMMENT on entries if they are something new.
 */
 
/* default series */
/* Currently in the preference file of sdk.
pref("DATABASE_CONFIG.default.classname", "SQLite");
pref("DATABASE_CONFIG.default.path", "/data/databases");
pref("DATABASE_CONFIG.default.database", "vivipos.sqlite");
pref("DATABASE_CONFIG.default.timeout", "30");
*/

pref("DATABASE_CONFIG.training_default.classname", "SQLite");
pref("DATABASE_CONFIG.training_default.path", "/data/training");
pref("DATABASE_CONFIG.training_default.database", "vivipos.sqlite");
pref("DATABASE_CONFIG.training_default.timeout", "30");

pref("DATABASE_CONFIG.empty_training_default.classname", "SQLite");
pref("DATABASE_CONFIG.empty_training_default.path", "/data/training");
pref("DATABASE_CONFIG.empty_training_default.database", "empty_vivipos.sqlite");
pref("DATABASE_CONFIG.empty_training_default.timeout", "30");

pref("DATABASE_CONFIG.default_training_default.classname", "SQLite");
pref("DATABASE_CONFIG.default_training_default.path", "/data/training");
pref("DATABASE_CONFIG.default_training_default.database", "default_vivipos.sqlite");
pref("DATABASE_CONFIG.default_training_default.timeout", "30");

/* table series */
pref("DATABASE_CONFIG.table.classname", "SQLite");
pref("DATABASE_CONFIG.table.path", "/data/databases");
pref("DATABASE_CONFIG.table.database", "vivipos_table.sqlite");
pref("DATABASE_CONFIG.table.timeout", "30");

pref("DATABASE_CONFIG.training_table.classname", "SQLite");
pref("DATABASE_CONFIG.training_table.path", "/data/training");
pref("DATABASE_CONFIG.training_table.database", "vivipos_table.sqlite");
pref("DATABASE_CONFIG.training_table.timeout", "30");

pref("DATABASE_CONFIG.empty_training_table.classname", "SQLite");
pref("DATABASE_CONFIG.empty_training_table.path", "/data/training");
pref("DATABASE_CONFIG.empty_training_table.database", "empty_vivipos_table.sqlite");
pref("DATABASE_CONFIG.empty_training_table.timeout", "30");

pref("DATABASE_CONFIG.default_training_table.classname", "SQLite");
pref("DATABASE_CONFIG.default_training_table.path", "/data/training");
pref("DATABASE_CONFIG.default_training_table.database", "default_vivipos_table.sqlite");
pref("DATABASE_CONFIG.default_training_table.timeout", "30");

/* order series */
pref("DATABASE_CONFIG.order.classname", "SQLite");
pref("DATABASE_CONFIG.order.path", "/data/databases");
pref("DATABASE_CONFIG.order.database", "vivipos_order.sqlite");
pref("DATABASE_CONFIG.order.timeout", "30");

pref("DATABASE_CONFIG.training_order.classname", "SQLite");
pref("DATABASE_CONFIG.training_order.path", "/data/training");
pref("DATABASE_CONFIG.training_order.database", "vivipos_order.sqlite");
pref("DATABASE_CONFIG.training_order.timeout", "30");

pref("DATABASE_CONFIG.empty_training_order.classname", "SQLite");
pref("DATABASE_CONFIG.empty_training_order.path", "/data/training");
pref("DATABASE_CONFIG.empty_training_order.database", "empty_vivipos_order.sqlite");
pref("DATABASE_CONFIG.empty_training_order.timeout", "30");

pref("DATABASE_CONFIG.default_training_order.classname", "SQLite");
pref("DATABASE_CONFIG.default_training_order.path", "/data/training");
pref("DATABASE_CONFIG.default_training_order.database", "default_vivipos_order.sqlite");
pref("DATABASE_CONFIG.default_training_order.timeout", "30");

/* acl series */
pref("DATABASE_CONFIG.acl.classname", "SQLite");
pref("DATABASE_CONFIG.acl.path", "/data/databases");
pref("DATABASE_CONFIG.acl.database", "vivipos_acl.sqlite");
pref("DATABASE_CONFIG.acl.timeout", "30");

pref("DATABASE_CONFIG.training_acl.classname", "SQLite");
pref("DATABASE_CONFIG.training_acl.path", "/data/training");
pref("DATABASE_CONFIG.training_acl.database", "vivipos_acl.sqlite");
pref("DATABASE_CONFIG.training_acl.timeout", "30");

pref("DATABASE_CONFIG.empty_training_acl.classname", "SQLite");
pref("DATABASE_CONFIG.empty_training_acl.path", "/data/training");
pref("DATABASE_CONFIG.empty_training_acl.database", "empty_vivipos_acl.sqlite");
pref("DATABASE_CONFIG.empty_training_acl.timeout", "30");

pref("DATABASE_CONFIG.default_training_acl.classname", "SQLite");
pref("DATABASE_CONFIG.default_training_acl.path", "/data/training");
pref("DATABASE_CONFIG.default_training_acl.database", "default_vivipos_acl.sqlite");
pref("DATABASE_CONFIG.default_training_acl.timeout", "30");

/* extension series */
pref("DATABASE_CONFIG.extension.classname", "SQLite");
pref("DATABASE_CONFIG.extension.path", "/data/databases");
pref("DATABASE_CONFIG.extension.database", "vivipos_extension.sqlite");
pref("DATABASE_CONFIG.extension.timeout", "30");

pref("DATABASE_CONFIG.training_extension.classname", "SQLite");
pref("DATABASE_CONFIG.training_extension.path", "/data/training");
pref("DATABASE_CONFIG.training_extension.database", "vivipos_extension.sqlite");
pref("DATABASE_CONFIG.training_extension.timeout", "30");

pref("DATABASE_CONFIG.empty_training_extension.classname", "SQLite");
pref("DATABASE_CONFIG.empty_training_extension.path", "/data/training");
pref("DATABASE_CONFIG.empty_training_extension.database", "empty_vivipos_extension.sqlite");
pref("DATABASE_CONFIG.empty_training_extension.timeout", "30");

pref("DATABASE_CONFIG.default_training_extension.classname", "SQLite");
pref("DATABASE_CONFIG.default_training_extension.path", "/data/training");
pref("DATABASE_CONFIG.default_training_extension.database", "default_vivipos_extension.sqlite");
pref("DATABASE_CONFIG.default_training_extension.timeout", "30");

/* journal series */
pref("DATABASE_CONFIG.journal.classname", "SQLite");
pref("DATABASE_CONFIG.journal.path", "/data/databases");
pref("DATABASE_CONFIG.journal.database", "vivipos_journal.sqlite");
pref("DATABASE_CONFIG.journal.timeout", "30");

pref("DATABASE_CONFIG.training_journal.classname", "SQLite");
pref("DATABASE_CONFIG.training_journal.path", "/data/training");
pref("DATABASE_CONFIG.training_journal.database", "vivipos_journal.sqlite");
pref("DATABASE_CONFIG.training_journal.timeout", "30");

pref("DATABASE_CONFIG.empty_training_journal.classname", "SQLite");
pref("DATABASE_CONFIG.empty_training_journal.path", "/data/training");
pref("DATABASE_CONFIG.empty_training_journal.database", "empty_vivipos_journal.sqlite");
pref("DATABASE_CONFIG.empty_training_journal.timeout", "30");

pref("DATABASE_CONFIG.default_training_journal.classname", "SQLite");
pref("DATABASE_CONFIG.default_training_journal.path", "/data/training");
pref("DATABASE_CONFIG.default_training_journal.database", "default_vivipos_journal.sqlite");
pref("DATABASE_CONFIG.default_training_journal.timeout", "30");

/* Please comment here first on what you are going to append below, and leave this reminder in the end of this file. */
