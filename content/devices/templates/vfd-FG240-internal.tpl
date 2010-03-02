{if type == 'afterAddItem'}
[&US][&ESC QE]${item.current_qty + ' X'|left:6} ${item.name|right:22}[&CR]
[&ESC QF]TAL: ${txn.formatPrice(order.total)|right:24}[&CR]
{elseif type == 'afterVoidItem'}
{if item == null}
[&US][&ESC QE]VOIDED ${itemDisplay.name|right:23}[&CR]
{else}
[&US][&ESC QE]VOIDED ${item.name|right:13}[&CR]
{/if}
[&ESC QF]TAL: ${txn.formatPrice(order.total)|right:24}[&CR]
{elseif type == 'afterModifyItem'}
{if itemDisplay.type == 'condiment'}
[&US][&ESC QE]MOD ${itemDisplay.name|right:15}[&CR]
{else}
[&US][&ESC QE]MOD ${item.name|right:25}[&CR]
{/if}
[&ESC QF]TAL: ${txn.formatPrice(order.total)|right:24}[&CR]
{elseif type == 'afterAddPayment'}
[&US][&ESC QE]PAY: ${txn.formatPrice(item.amount)|right:24}[&CR]
[&ESC QF]TAL: ${txn.formatPrice(order.total)|right:24}[&CR]
{elseif type == 'afterSubmit'}
[&US][&ESC QE]PAY: ${txn.formatPrice(order.payment_subtotal)|right:24}[&CR]
[&ESC QF]CHG: ${txn.formatPrice(0-order.remain)|right:24}[&CR]
{elseif type == 'afterAddDiscount'}
[&US][&ESC QE]${item.discount_name|left:9} ${txn.formatPrice(item.current_discount)|right:20}[&CR]
[&ESC QF]TAL: ${txn.formatPrice(order.total)|right:15}[&CR]
{elseif type == 'afterAddSurcharge'}
[&US][&ESC QE]${item.surcharge_name|left:9} ${txn.formatPrice(item.current_surcharge)|right:20}[&CR]
[&ESC QF]TAL: ${txn.formatPrice(order.total)|right:24}[&CR]
{elseif type == 'afterAddCondiment'}
[&US][&ESC QE]Add: ${'Condiment'|right:24}[&CR]
[&ESC QF]TAL: ${txn.formatPrice(order.total)|right:24}[&CR]
{elseif type == 'onQueue'}
[&US][&ESC QE]QUEUED: ${order.seq|right:12}[&CR]
[&ESC QF]TAL: ${txn.formatPrice(order.total)|right:24}[&CR]
{elseif type == 'onPullQueue'}
[&US][&ESC QE]RECALL: ${order.seq|right:12}[&CR]
[&ESC QF]TAL: ${txn.formatPrice(order.total)|right:24}[&CR]
{elseif type == 'afterCancel'}
[&US][&ESC QE]${' '|left:29}[&CR]
[&ESC QF]CANCEL: ${order.seq|right:21}[&CR]
{elseif type == 'onMessage'}
[&US][&ESC QE]${item.line1|left:29}[&CR]
[&ESC QF]${item.line2|left:29}[&CR]
{elseif type == 'onRecovery'}
[&US][&ESC QF]TAL: ${txn.formatPrice(order.total)|right:24}[&CR]
{else}
[&US][&ESC QE]${(store.name == null)?'VIVIPOS':store.name|center:29}[&CR]
[&ESC QF][&SO]${'Welcome!'|center:27}[DC4][&CR]
{/if}