{if type == 'afterAddItem'}
[&ESC @][&ESC QA]${item.current_qty + ' '|left:5}X ${item.name|right:13}[&CR]
[&ESC QB]TAL: ${txn.formatPrice(order.total)|right:15}[&CR]
{elseif type == 'afterVoidItem'}
{if item == null}
[&ESC @][&ESC QA]VOID: ${itemDisplay.name|right:14}[&CR]
{else}
[&ESC @][&ESC QA]VOID: ${item.name|right:14}[&CR]
{/if}
[&ESC QB]TAL: ${txn.formatPrice(order.total)|right:15}[&CR]
{elseif type == 'afterModifyItem'}
{if itemDisplay.type == 'condiment'}
[&ESC @][&ESC QA]${itemDisplay.name|left:14} ${itemDisplay.current_price|default:0|right:5}[&CR]
{else}
[&ESC @][&ESC QA]${item.current_qty + ' '|left:5}X ${item.name|right:13}[&CR]
{/if}
[&ESC QB]TAL: ${txn.formatPrice(order.total)|right:15}[&CR]
{elseif type == 'afterAddPayment'}
[&ESC @][&ESC QA]PAY: ${txn.formatPrice(item.amount)|right:15}[&CR]
[&ESC QB]TAL: ${txn.formatPrice(order.total)|right:15}[&CR]
{elseif type == 'afterSubmit'}
{if txn.data.status == 1}
[&ESC @][&ESC QA]PAY: ${txn.formatPrice(order.payment_subtotal)|right:15}[&CR]
[&ESC QB]CHG: ${txn.formatPrice(0-order.remain)|right:15}[&CR]
{elseif txn.data.status == 2}
[&ESC @][&ESC QA]STORED: ${order.seq|right:12}[&CR]
[&ESC QB]TAL: ${txn.formatPrice(order.total)|right:15}[&CR]
{/if}
{elseif type == 'afterAddDiscount'}
[&ESC @][&ESC QA]${item.discount_name|left:9} ${txn.formatPrice(item.current_discount)|right:10}[&CR]
[&ESC QB]TAL: ${txn.formatPrice(order.total)|right:15}[&CR]
{elseif type == 'afterAddSurcharge'}
[&ESC @][&ESC QA]${item.surcharge_name|left:9} ${txn.formatPrice(item.current_surcharge)|right:10}[&CR]
[&ESC QB]TAL: ${txn.formatPrice(order.total)|right:15}[&CR]
{elseif type == 'afterAddCondiment'}
[&ESC @][&ESC QA]${itemDisplay.name|left:14} ${itemDisplay.current_price|default:0|right:5}[&CR]
[&ESC QB]TAL: ${txn.formatPrice(order.total)|right:15}[&CR]
{elseif type == 'onQueue'}
[&ESC @][&ESC QA]QUEUED: ${order.seq|right:12}[&CR]
[&ESC QB]TAL: ${txn.formatPrice(order.total)|right:15}[&CR]
{elseif type == 'afterPullQueue' || type == 'afterRecallOrder'}
[&ESC @][&ESC QA]PULLED: ${order.seq|right:12}[&CR]
[&ESC QB]TAL: ${txn.formatPrice(order.total)|right:15}[&CR]
{elseif type == 'afterCancel'}
[&ESC @][&ESC QA]${' '|left:20}[&CR]
[&ESC QB]CANCEL: ${order.seq|right:12}[&CR]
{elseif type == 'onMessage'}
[&ESC @][&ESC QA]${item.line1|left:20}[&CR]
[&ESC QB]${item.line2|left:20}[&CR]
{elseif type == 'onRecovery'}
[&ESC @][&ESC QA]SEQ: ${order.seq|right:15}[&CR]
[&ESC QB]TAL: ${txn.formatPrice(order.total)|right:15}[&CR]
{elseif type == 'onVoidSaleSuccess'}
[&ESC @][&ESC QA]${'ORDER VOIDED'|left:20}[&CR]
[&ESC QB]SEQ: ${order.seq|right:15}[&CR]
{else}
[&ESC @][&ESC QA]${(store.name == null)?'VIVIPOS':store.branch_id|center:20}[&CR]
[&ESC QB]${'Welcome!'|center:20}[&CR]
{/if}
