[&INIT]
[&DWON]${'Return Cart Item'|center:21}[&DWOFF]
[&CR]
[&RESET]${'Printed:'|left:10} ${(new Date()).toLocaleFormat('%Y-%m-%d %H:%M:%S')}
${'Terminal:'|left:10} ${order.terminal_no|left:9} ${'Clerk:'|left:6} ${order.service_clerk_displayname|default:''|left:14}
${'Check:'|left:10} ${order.check_no|default:''|left:9} ${'Seq:'|left:6} ${order.seq|tail:3}
[&CR]
------------------------------------------
{for item in order.return_cart_items}
${item.current_qty|right:4} ${item.name|left:37}
     MEMO: ${item.memo|left:34}
{/for}
------------------------------------------
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
[&CR]
[&CR]
[&CR]
