[&STX]KI70
[&STX]c0000
[&STX]f320
{for item in order.items}
{eval}
  loop = [];
  for (i = 0; i < item.current_qty; i++) loop.push(i);
  conds = GeckoJS.BaseObject.getKeys(item.condiments);
  condLimit = 3;
  if (item.memo == null || item.memo.length == 0) {
    condLimit = 4;
  }
  if (conds.length > condLimit) conds.length = condLimit;
{/eval}
{for index in loop}
{eval}
  y = 50
  lineHeight = 14;
{/eval}
[&STX]L
D11
H20
191100200820010#${order.seq + (order.check_no != null && order.check_no.length > 0 ? ' (' + order.check_no + ')' : '')}[&CR]
1;0000100680010${item.name|wleft:10}[&CR]
{for cond in conds}
1;0000100${y}0010${'-' + cond|wleft:10}[&CR]
{eval}
y -= lineHeight;
{/eval}
{/for}
{if item.memo != null && item.memo.length > 0}
1;0000100${GeckoJS.String.padLeft(y, 2, '0')}0010${'*' + item.memo|wleft:10}[&CR]
{/if}
E
{/for}
{/for}
