/* vivipos database setting */
pref("DATABASE_CONFIG.useDbConfig", "default");

pref("DATABASE_CONFIG.backup.classname", 'JsonFile');
pref("DATABASE_CONFIG.backup.path", '/data/databases/backup');

pref("DATABASE_CONFIG.default.classname", 'SQLite');
pref("DATABASE_CONFIG.default.path", '/data/databases');
pref("DATABASE_CONFIG.default.database", 'vivipos.sqlite');
pref("DATABASE_CONFIG.default.timeout", '30');

pref("DATABASE_CONFIG.acl.classname", 'SQLite');
pref("DATABASE_CONFIG.acl.path", '/data/databases');
pref("DATABASE_CONFIG.acl.database", 'vivipos_acl.sqlite');
pref("DATABASE_CONFIG.acl.timeout", '30');

pref("DATABASE_CONFIG.order.classname", 'SQLite');
pref("DATABASE_CONFIG.order.path", '/data/databases');
pref("DATABASE_CONFIG.order.database", 'vivipos_order.sqlite');
pref("DATABASE_CONFIG.order.timeout", '15');

pref("DATABASE_CONFIG.extension.classname", 'SQLite');
pref("DATABASE_CONFIG.extension.path", '/data/databases');
pref("DATABASE_CONFIG.extension.database", 'vivipos_extension.sqlite');
pref("DATABASE_CONFIG.extension.timeout", '30');

pref("DATABASE_CONFIG.memory.classname", 'SQLite');
pref("DATABASE_CONFIG.memory.path", '');
pref("DATABASE_CONFIG.memory.database", ':in-memory');
