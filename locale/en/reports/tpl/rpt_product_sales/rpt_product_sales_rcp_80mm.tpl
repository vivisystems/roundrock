[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
Terminal: ${head.store.terminal_no|left:10} Clerk: ${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${head.title|center:42}
{for item in body}
------------------------------------------
No.:        ${item.product_no}
Name:       ${item.product_name}
Avg. Price: ${item.avg_price}
Qty.:       ${item.qty}
Total:      ${item.total}
{/for}
------------------------------------------
Summary
Qty.:       ${foot.qty}
Total:      ${foot.summary}
------------------------------------------
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
