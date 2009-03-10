[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:14}[&DWOFF]
${head.store.telephone1|center:24}

Terminal: ${head.store.terminal_no}
Clerk: ${head.clerk_displayname}
${head.start_time} ~
${head.end_time}

${head.title|center:24}
{for detail in body}
------------------------
Term_No.:
{if head.machine_id}${detail.terminal_no|right:24}{/if}
[&CR]
Time:
${detail.Hour|right:24}
Total:
${detail.HourTotal|right:24}
Orders:
${detail.OrderNum|right:24}
Guests:
${detail.Guests|right:24}
Items:
${detail.ItemsCount|right:24}
{/for}
------------------------
Summary
Total:
${foot.HourTotal|right:24}
Orders:
${foot.OrderNum|right:24}
Guests:
${foot.Guests|right:24}
Items:
${foot.ItemsCount|right:24}
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
