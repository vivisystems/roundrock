[&QSON]${head.store.name|center:21}[&QSOFF]
[&DWON]${head.store.branch|center:21}[&DWOFF]
${head.store.telephone1|center:42}
Terminal: ${head.store.terminal_no|left:10} Clerk: ${head.clerk_displayname|left:14}
------------------------------------------
User Name   Display Name      Access Group
----------  ----------------  ------------
{for user in body}
${user.username|left:10}  ${user.displayname|left:16}  ${user.group|left:12}
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