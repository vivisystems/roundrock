[&INIT]
[&DWON]${'Rush Item'|center:21}[&DWOFF]
[&CR]
[&RESET]${'Printed:'|left:10} ${(new Date()).toLocaleFormat('%Y-%m-%d %H:%M:%S')}
${'Terminal:'|left:10} ${order.terminal_no|left:9} ${'Clerk:'|left:6} ${order.service_clerk_displayname|default:''|left:14}
${'Check:'|left:10} ${order.check_no|default:''|left:9} ${'Seq:'|left:6} ${order.seq|tail:3}
[&CR]
------------------------------------------
${order.rush_item.current_qty|right:4} ${order.rush_item.name|left:37}
{if order.rush_item.condiments_string}
      ${order.rush_item.condiments_string|left:40}
{/if}
{if order.rush_item.memo}
      ${order.rush_item.memo|left:40}
{/if}
------------------------------------------
{if order.rush_item.rushitem_memo}
${'Rushitem Memo:'|left: 15} ${order.rush_item.rushitem_memo|left:30}
{/if}
${'Waiting:'|left:10} ${order.rush_item.waiting|left:37}
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
[&CR]
[&CR]
[&CR]
