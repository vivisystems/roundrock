{if type == 'afterAddItem'}
[&ESC @][&ESC QA]${item.current_qty + ' X'|left:6} ${item.name|right:17}[&CR]
[&ESC QB]TAL: ${txn.formatPrice(order.total)|right:19}[&CR]
{elseif type == 'afterVoidItem'}
{if item == null}
[&ESC @][&ESC QA]VOIDED ${itemDisplay.name|right:17}[&CR]
{else}
[&ESC @][&ESC QA]VOIDED ${item.name|right:17}[&CR]
{/if}
[&ESC QB]TAL: ${txn.formatPrice(order.total)|right:19}[&CR]
{elseif type == 'afterModifyItem'}
{if itemDisplay.type == 'condiment'}
[&ESC @][&ESC QA]MOD ${itemDisplay.name|right:20}[&CR]
{else}
[&ESC @][&ESC QA]MOD ${item.no|right:20}[&CR]
{/if}
[&ESC QB]TAL: ${txn.formatPrice(order.total)|right:19}[&CR]
{elseif type == 'afterAddPayment'}
[&ESC @][&ESC QA]PAY: ${txn.formatPrice(item.amount)|right:19}[&CR]
[&ESC QB]TAL: ${txn.formatPrice(order.total)|right:19}[&CR]
{elseif type == 'afterSubmit'}
[&ESC @][&ESC QA]PAY: ${txn.formatPrice(order.payment_subtotal)|right:19}[&CR]
[&ESC QB]CHG: ${txn.formatPrice(0-order.remain)|right:19}[&CR]
{elseif type == 'afterAddDiscount'}
[&ESC @][&ESC QA]${item.discount_name|left:9} ${txn.formatPrice(item.current_discount)|right:14}[&CR]
[&ESC QB]TAL: ${txn.formatPrice(order.total)|right:19}[&CR]
{elseif type == 'afterAddSurcharge'}
[&ESC @][&ESC QA]${item.surcharge_name|left:9} ${txn.formatPrice(item.current_surcharge)|right:14}[&CR]
[&ESC QB]TAL: ${txn.formatPrice(order.total)|right:19}[&CR]
{elseif type == 'afterAddCondiment'}
[&ESC @][&ESC QA]Add: ${'Condiment'|right:19}[&CR]
[&ESC QB]TAL: ${txn.formatPrice(order.total)|right:19}[&CR]
{elseif type == 'onQueue'}
[&ESC @][&ESC QA]QUEUED: ${order.seq|right:16}[&CR]
[&ESC QB]TAL: ${txn.formatPrice(order.total)|right:19}[&CR]
{elseif type == 'afterPullQueue'}
[&ESC @][&ESC QA]RECALL: ${order.seq|right:16}[&CR]
[&ESC QB]TAL: ${txn.formatPrice(order.total)|right:19}[&CR]
{elseif type == 'afterCancel'}
[&ESC @][&ESC QA]${' '|left:24}[&CR]
[&ESC QB]CANCEL: ${order.seq|right:16}[&CR]
{elseif type == 'onMessage'}
[&ESC @][&ESC QA]${item.line1|left:24}[&CR]
[&ESC QB]${item.line2|left:24}[&CR]
{elseif type == 'onRecovery'}
[&ESC @][&ESC QB]TAL: ${txn.formatPrice(order.total)|right:19}[&CR]
{else}
[&ESC @][&ESC QA]${(store.name == null)?'VIVIPOS':store.name|center:24}[&CR]
[&ESC QB]${'Welcome!'|center:24}[&CR]
{/if}