[&INIT]
{eval}
  memo = '';
{/eval}
[&DWON]${'Transfer Table Notice'|center:21}[&DWOFF]
[&CR]
[&RESET]${'Printed:'|left:10} ${(new Date()).toLocaleFormat('%Y-%m-%d %H:%M:%S')}
${'Terminal:'|left:10} ${order.terminal_no|left:9} ${'Clerk:'|left:6} ${order.service_clerk_displayname|default:''|left:14}
${'Check:'|left:10} ${order.check_no|default:''|left:9} ${'Seq:'|left:6} ${order.seq|tail:3}
[&CR]
${'Table:'|left:10} [&DWON] ${order.org_table_no}(${order.org_table_name}) to ${order.table_no}(${order.table_name}) [&DWOFF]
------------------------------------------
{for item in order.display_sequences}
{if item.type == 'item' && order.items[item.index] != null && order.items[item.index].linked}
${item.current_qty|right:4} ${item.name|left:37}
{elseif item.type == 'setitem' && order.items[item.index] != null && order.items[item.index].linked}
  ${item.current_qty|right:4} ${item.name|left:35}
{elseif item.type == 'condiment' && (item.index == null || order.items[item.index].linked)}
    ${item.name|left:38}
{elseif item.type == 'memo' && (item.index == null || order.items[item.index] == null || order.items[item.index].linked)}
{if item.index == null || order.items[item.index] == null}
{eval}
if (memo.length == 0)
    memo += ((memo.length == 0) ? '' : '\n') + item.name
{/eval}
{else}
        ${item.name|left:34}
{/if}
{/if}
{/for}
------------------------------------------
{if memo.length > 0}
${memo|left:42}
{/if}
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
[&CR]
[&CR]
[&CR]
