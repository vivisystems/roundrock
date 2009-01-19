{if type == 'afterAddItem'}
[&ESC @][&ESC QA]${item.current_qty + ' X'|left:6} ${item.name|right:13}[&CR]
[&ESC QB]TAL: ${txn.formatPrice(order.total)|right:15}[&CR]
{elseif type == 'afterVoidItem'}
{if item == null}
[&ESC @][&ESC QA]VOIDED ${itemDisplay.type|right:13}[&CR]
{else}
[&ESC @][&ESC QA]VOIDED ${item.no|right:13}[&CR]
{/if}
[&ESC QB]TAL: ${txn.formatPrice(order.total)|right:15}[&CR]
{elseif type == 'afterModifyItem'}
{if itemDisplay.type == 'condiment'}
[&ESC @][&ESC QA]MOD ${itemDisplay.name|right:16}[&CR]
{else}
[&ESC @][&ESC QA]MOD ${item.no|right:16}[&CR]
{/if}
[&ESC QB]TAL: ${txn.formatPrice(order.total)|right:15}[&CR]
{elseif type == 'afterAddPayment'}
[&ESC @][&ESC QA]PAY: ${txn.formatPrice(item.amount)|right:15}[&CR]
[&ESC QB]TAL: ${txn.formatPrice(order.total)|right:15}[&CR]
{elseif type == 'afterSubmit'}
[&ESC @][&ESC QA]PAY: ${txn.formatPrice(order.payment_subtotal)|right:15}[&CR]
[&ESC QB]CHG: ${txn.formatPrice(0-order.remain)|right:15}[&CR]
{elseif type == 'afterAddDiscount'}
[&ESC @][&ESC QA]-:   ${txn.formatPrice(item.current_discount)|right:15}[&CR]
[&ESC QB]TAL: ${txn.formatPrice(order.total)|right:15}[&CR]
{elseif type == 'afterAddSurcharge'}
[&ESC @][&ESC QA]+:   ${txn.formatPrice(item.current_surcharge)|right:15}[&CR]
[&ESC QB]TAL: ${txn.formatPrice(order.total)|right:15}[&CR]
{elseif type == 'onQueue'}
[&ESC @][&ESC QA]QUEUED: ${order.seq|right:12}[&CR]
[&ESC QB]TAL: ${txn.formatPrice(order.total)|right:15}[&CR]
{elseif type == 'onPullQueue'}
[&ESC @][&ESC QA]RECALL: ${order.seq|right:12}[&CR]
[&ESC QB]TAL: ${txn.formatPrice(order.total)|right:15}[&CR]
{elseif type == 'afterCancel'}
[&ESC @][&ESC QB]CANCELED: ${order.seq|right:15}[&CR]
{else}
[&ESC @][&ESC QA]${(store.name == null)?'VIVIPOS':store.name|center:20}[&CR]
[&ESC QB]${'Welcome!'|center:20}[&CR]
{/if}