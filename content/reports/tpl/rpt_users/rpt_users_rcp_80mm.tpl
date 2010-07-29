[&INIT]
[&QSON]${head.store.name|center:21}[&QSOFF]
[&DWON]${head.store.branch|center:21}[&DWOFF]
${head.store.telephone1|center:42}
${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no + ' '|left:1}${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname|left:14}

${_('(rpt)Condition') + ' - '}
${queryFormLabel.sortby_label}${queryFormLabel.sortby}

${head.title|center:42}
------------------------------------------
${_( '(rpt)User Name' )|left:11} ${_( '(rpt)Display Name' )|left:17} ${_( '(rpt)Access Group' )|left:12}
----------  ----------------  ------------
{for user in body}
${user.username|default:''|left:11} ${user.displayname|default:''|left:17} ${user.group|default:''|left:12}
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
