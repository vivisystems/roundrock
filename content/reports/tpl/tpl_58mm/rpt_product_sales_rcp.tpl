[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:14}[&DWOFF]
${head.store.telephone1|center:24}

Terminal: ${head.store.terminal_no}
Clerk: ${head.clerk_displayname}
${head.start_time} ~
${head.end_time}

${head.title|center:24}
{for item in body}
------------------------
No.:
${item.product_no|right:24}
Name:
${item.product_name|right:24}
Avg. Price:
${item.avg_price|right:24}
Qty.:
${item.qty|right:24}
Total:
${item.total|right:24}
{/for}
------------------------
Summary
Qty.:
${foot.qty|right:24}
Total:
${foot.summary|right:24}
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
