"User Name","Display Name","Access Group"
{for user in body}
"${user.username}","${user.displayname}","${user.group}"
{/for}