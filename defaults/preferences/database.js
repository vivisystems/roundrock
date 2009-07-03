/* vivipos database setting */
pref("DATABASE_CONFIG.table.classname", "SQLite");
pref("DATABASE_CONFIG.table.path", "/data/databases");
pref("DATABASE_CONFIG.table.database", "vivipos_table.sqlite");

pref("DATABASE_CONFIG.training_order.classname", "SQLite");
pref("DATABASE_CONFIG.training_order.path", "/data/training");
pref("DATABASE_CONFIG.training_order.database", "vivipos_order.sqlite");
pref("DATABASE_CONFIG.training_order.timeout", "15");

pref("DATABASE_CONFIG.empty_training_order.classname", "SQLite");
pref("DATABASE_CONFIG.empty_training_order.path", "/data/training");
pref("DATABASE_CONFIG.empty_training_order.database", "empty_vivipos_order.sqlite");
pref("DATABASE_CONFIG.empty_training_order.timeout", "15");

pref("DATABASE_CONFIG.default_training_order.classname", "SQLite");
pref("DATABASE_CONFIG.default_training_order.path", "/data/training");
pref("DATABASE_CONFIG.default_training_order.database", "default_vivipos_order.sqlite");
pref("DATABASE_CONFIG.default_training_order.timeout", "15");

pref("DATABASE_CONFIG.journal.classname", "SQLite");
pref("DATABASE_CONFIG.journal.path", "/data/databases");
pref("DATABASE_CONFIG.journal.database", "vivipos_journal.sqlite");