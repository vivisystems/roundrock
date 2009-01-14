/* vivipos database setting */
pref("DATABASE_CONFIG.useDbConfig", "default");

pref("DATABASE_CONFIG.json.classname", 'JsonFile');
pref("DATABASE_CONFIG.json.path", '/var/tmp');

pref("DATABASE_CONFIG.default.classname", 'SQLite');
pref("DATABASE_CONFIG.default.path", '/data/databases');
pref("DATABASE_CONFIG.default.database", 'vivipos.sqlite');

pref("DATABASE_CONFIG.acl.classname", 'SQLite');
pref("DATABASE_CONFIG.acl.path", '/data/databases');
pref("DATABASE_CONFIG.acl.database", 'vivipos_acl.sqlite');

pref("DATABASE_CONFIG.order.classname", 'SQLite');
pref("DATABASE_CONFIG.order.path", '/data/databases');
pref("DATABASE_CONFIG.order.database", 'vivipos_order.sqlite');

