/* vivipos database setting */
pref("DATABASE_CONFIG.useDbConfig", "default");

pref("DATABASE_CONFIG.backup.classname", 'JsonFile');
pref("DATABASE_CONFIG.backup.path", '/data/databases/backup');

pref("DATABASE_CONFIG.default.classname", 'SQLite');
pref("DATABASE_CONFIG.default.path", '/data/databases');
pref("DATABASE_CONFIG.default.database", 'vivipos.sqlite');
pref("DATABASE_CONFIG.default.timeout", '30');
pref("DATABASE_CONFIG.default.synchronous", 'NORMAL');
pref("DATABASE_CONFIG.default.journal_mode", 'TRUNCATE');

pref("DATABASE_CONFIG.memory.classname", 'SQLite');
pref("DATABASE_CONFIG.memory.path", '');
pref("DATABASE_CONFIG.memory.database", ':in-memory');

