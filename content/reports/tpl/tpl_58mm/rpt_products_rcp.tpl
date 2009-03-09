[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
Terminal: ${head.store.terminal_no|left:10} Clerk: ${head.clerk_displayname|left:14}

${head.title|center:42}
{for category in body}
------------------------------------------
${category.no} - ${category.name}
{for plu in category.plu}
------------------------------------------
Product No.:  ${plu.no}
Product:      ${plu.name}
Barcode:      ${plu.barcode}
Tax:          ${plu.rate}
Stock:        ${plu.stock}
Safe Stock:   ${plu.min_stock}
{/for}
{/for}
------------------------------------------
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
