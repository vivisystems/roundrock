{if type == 'afterAddItem'}
[&US][&ESC QE]${' ' + item.current_qty + 'X '|left:8}${item.name|right:21}[&CR]
[&ESC QF] TAL: ${txn.formatPrice(order.total)|right:23}[&CR]
{elseif type == 'afterVoidItem'}
{if item == null}
[&US][&ESC QE] VOIDED: ${itemDisplay.name|right:20}[&CR]
{else}
[&US][&ESC QE] VOIDED: ${item.name|right:20}[&CR]
{/if}
[&ESC QF] TAL: ${txn.formatPrice(order.total)|right:23}[&CR]
{elseif type == 'afterModifyItem'}
{if itemDisplay.type == 'condiment'}
[&US][&ESC QE]${itemDisplay.name|left:24} ${itemDisplay.current_price|default:0|right:5}[&CR]
{else}
[&US][&ESC QE]${' ' + item.current_qty + 'X '|left:8}${item.name|right:21}[&CR]
{/if}
[&ESC QF] TAL: ${txn.formatPrice(order.total)|right:23}[&CR]
{elseif type == 'afterAddPayment'}
[&US][&ESC QE] PAY: ${txn.formatPrice(item.amount)|right:23}[&CR]
[&ESC QF] TAL: ${txn.formatPrice(order.total)|right:23}[&CR]
{elseif type == 'afterSubmit'}
{if txn.data.status == 1}
[&US][&ESC QE] PAY: ${txn.formatPrice(order.payment_subtotal)|right:23}[&CR]
[&ESC QF] CHG: ${txn.formatPrice(0-order.remain)|right:23}[&CR]
{elseif txn.data.status == 2}
[&US][&ESC QE] STORED: ${order.seq|right:20}[&CR]
[&ESC QF] TAL: ${txn.formatPrice(order.total)|right:23}[&CR]
{/if}
{else}
[&US][&ESC QE]${(store.name == null)?'VIVIPOS':store.name|center:30}[&CR]
[&ESC QF]${'Welcome!'|center:30}[&CR]
{/if}
