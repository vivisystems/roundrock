[&STX]KI70
[&STX]c0000
[&STX]f320
{eval}
total = 0;
for (id in order.items_summary) {
   total += order.items_summary[id].qty_subtotal;
}
counter = 1;
{/eval}
{for item in order.items}
{eval}
  conds = GeckoJS.BaseObject.getKeys(item.condiments);
  condLimit = 3;
  if (item.memo == null || item.memo.length == 0) {
    condLimit = 4;
  }
  if (conds.length > condLimit) conds.length = condLimit;
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
Q${GeckoJS.String.padLeft(item.current_qty, 4, '0')}
191100200100010${counter}
+01
191100200100016/${total}
E
{eval}
counter += item.current_qty;
{/eval}
{/for}
