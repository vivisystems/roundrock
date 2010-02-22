[&INIT]
[&DWON]${'Transfer Table Notice'|center:21}[&DWOFF]
[&CR]
[&RESET]${'Printed:'|left:10} ${(new Date()).toLocaleFormat('%Y-%m-%d %H:%M:%S')}
${'Terminal:'|left:10} ${order.terminal_no|left:9} ${'Clerk:'|left:6} ${order.service_clerk_displayname|default:''|left:14}
${'Check:'|left:10} ${order.check_no|default:''|left:9} ${'Seq:'|left:6} ${order.seq|tail:3}
[&CR]
${'Table:'|left:10} [&DWON] ${order.org_table_no}(${order.org_table_name}) to ${order.table_no}(${order.table_name}) [&DWOFF]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
[&CR]
[&CR]
[&CR]
