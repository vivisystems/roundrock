[&QSON]${head.store.name|center:21}[&QSOFF]
[&DWON]${head.store.branch|center:21}[&DWOFF]
${head.store.telephone1|center:42}
Terminal: ${head.store.terminal_no|left:10} Clerk: ${head.clerk_displayname|left:14}
------------------------------------------
${head.title}
------------------------------------------
{for category in body}
${category.no|left:14}  ${category.name|26}
--------------  --------------------------
{for plu in category.plu}
    ${plu.no|left:14}      ${plu.name|left:22}
    Barcode:${plu.barcode|left:14}  Tax:${plu.rate|16}
    Min.Stock:${plu.min_stock|right:4}      Stock:${plu.stock|right:10}
{/for}
------------------------------------------
{/for}
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]