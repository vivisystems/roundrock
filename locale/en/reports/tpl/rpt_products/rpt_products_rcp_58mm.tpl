[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:14}[&DWOFF]
${head.store.telephone1|center:24}

Terminal: ${head.store.terminal_no}
Clerk: ${head.clerk_displayname}

${head.title|center:24}
{for category in body}
------------------------
Department No.:
${category.no|right:24}
Department Name:
${category.name|right:24}
{for plu in category.plu}
------------------------
Product No.:
${plu.no|right:24}
Product:
${plu.name|right:24}
Barcode:
${plu.barcode|right:24}
Tax:
${plu.rate|right:24}
Stock:
${plu.stock|right:24}
Safe Stock:
${plu.min_stock|right:24}
{/for}
{/for}
------------------------
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
