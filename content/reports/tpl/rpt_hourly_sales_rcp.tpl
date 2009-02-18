[&QSON]${head.store.name|center:21}[&QSOFF]
[&DWON]${head.store.branch|center:21}[&DWOFF]
${head.store.telephone1|center:42}
Terminal: ${head.store.terminal_no|left:10} Clerk: ${head.clerk_displayname|left:14}
------------------------------------------
Time        Total      Orders Guests Items
----------  ---------- ------ ------ -----
{for category in body}
${detail.Hour:10}  ${detail.HourTotal:10} ${detail.OrderNum} ${detail.Guests} ${detail.ItemsCount}
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