"${head.store.name}"
"${head.store.branch}"
"Telphone:","'${head.store.telephone1}"
"Terminal:","'${head.store.terminal_no}"
"Clerk:","'${head.clerk_displayname}"
"Printed Time:","${foot.gen_time}"

"User Name","Display Name","Access Group"
{for user in body}
"${user.username}","${user.displayname}","${user.group}"
{/for}
