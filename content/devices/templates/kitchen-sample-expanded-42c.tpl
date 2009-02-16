{eval}
  memo = '';
{/eval}
[&QSON]${store.name|center:21}[&QSOFF]
[&DWON]${store.branch|center:21}[&DWOFF]
Submitted:${(new Date()).toLocaleFormat('%Y-%m-%d %H:%M:%S')}
Terminal: ${order.terminal_no|left:10} Clerk:    ${order.proceeds_clerk_displayname|left:14}
Check:    ${order.check_no|left:10} Sequence: ${order.seq|left:14}
------------------------------------------
{for item in order.display_sequences}
{if item.type == 'item' && order.items[item.index] != null && order.items[item.index].doPrint}
${item.current_qty|right:4} ${item.name|left:37}
{elseif item.type == 'condiment' && (item.index == null || order.items[item.index].doPrint)}
    ${item.name|left:38}
{elseif item.type == 'memo' && (item.index == null || order.items[item.index] == null || order.items[item.index].doPrint)}
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
[&CR]
[&PC]
