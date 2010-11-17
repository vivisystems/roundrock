{if type == 'afterAddItem'}
[&US][&ESC QE] ${item.current_qty + ' '|left:5}X ${item.name|right:21}[&CR]
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
[&US][&ESC QE] ${itemDisplay.name|left:23} ${itemDisplay.current_price|default:0|right:5}[&CR]
{else}
[&US][&ESC QE] ${item.current_qty + 'X '|left:8}${item.name|right:21}[&CR]
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
{elseif type == 'afterAddDiscount'}
[&US][&ESC QE] ${item.discount_name|left:17} ${txn.formatPrice(item.current_discount)|right:10}[&CR]
[&ESC QF] TAL: ${txn.formatPrice(order.total)|right:23}[&CR]
{elseif type == 'afterAddSurcharge'}
[&US][&ESC QE] ${item.surcharge_name|left:17} ${txn.formatPrice(item.current_surcharge)|right:10}[&CR]
[&ESC QF] TAL: ${txn.formatPrice(order.total)|right:23}[&CR]
{elseif type == 'afterAddCondiment'}
[&US][&ESC QE] ${itemDisplay.name|left:22} ${itemDisplay.current_price|default:0|right:5}[&CR]
[&ESC QF] TAL: ${txn.formatPrice(order.total)|right:23}[&CR]
{elseif type == 'onQueue'}
[&US][&ESC QE] QUEUED: ${order.seq|right:20}[&CR]
[&ESC QF] TAL: ${txn.formatPrice(order.total)|right:23}[&CR]
{elseif type == 'afterPullQueue' || type == 'afterRecallOrder'}
[&US][&ESC QE] PULLED: ${order.seq|right:20}[&CR]
[&ESC QF] TAL: ${txn.formatPrice(order.total)|right:23}[&CR]
{elseif type == 'afterCancel'}
[&US][&ESC QF] CANCEL: ${order.seq|right:20}[&CR]
{elseif type == 'onMessage'}
[&US][&ESC QE] ${item.line1|left:28}[&CR]
[&ESC QF] ${item.line2|left:28}[&CR]
{elseif type == 'onRecovery'}
[&US][&ESC QE] RECOVERED: ${order.seq|right:17}[&CR]
[&ESC QF] TAL: ${txn.formatPrice(order.total)|right:23}[&CR]
{elseif type == 'onVoidSaleSuccess'}
[&US][&ESC QE] ${'ORDER VOIDED'|left:28}[&CR]
[&ESC QF] SEQ: ${order.seq|right:23}[&CR]
{else}
[&US][&ESC QE]${(store.name == null)?'VIVIPOS':store.branch_id|center:30}[&CR]
[&ESC QF]${'Welcome!'|center:30}[&CR]
{/if}
