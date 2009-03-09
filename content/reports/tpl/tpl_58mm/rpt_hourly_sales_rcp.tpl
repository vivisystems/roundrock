[&QSON]${head.store.name|center:15}[&QSOFF]
[&DWON]${head.store.branch|center:15}[&DWOFF]
${head.store.telephone1|center:42}
Terminal: ${head.store.terminal_no|left:10} Clerk: ${head.clerk_displayname|left:14}

${head.title|center:42}
{for detail in body}
------------------------------------------
Term_No.:   {if head.machine_id}${detail.terminal_no}{/if}
 
Time:    ${detail.Hour}
Total:   ${detail.HourTotal}
Orders:  ${detail.OrderNum}
Guests:  ${detail.Guests}
Items:   ${detail.ItemsCount}
{/for}
------------------------------------------
Summary
Total:   ${foot.HourTotal}
Orders:  ${foot.OrderNum}
Guests:  ${foot.Guests}
Items:   ${foot.ItemsCount}
------------------------------------------
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
