{if order.split_payments}
{eval}
splitPayments=[];
for (tp in order.trans_payments) {
   splitPayments.push( order.trans_payments[tp].amount);
}
{/eval}
{else}
{eval}
splitPayments=[order.payment_subtotal];
{/eval}
{/if}
{for receivePayment in splitPayments}
[&INIT]
[&CTR][&IMG1][&LFT]
{if duplicate}
[&DWON]${'副本'|center:21}[&DWOFF]
{/if}
{if store.branch.length > 0}${store.branch|left:41}{/if}
{if store.telephone1.length > 0}${store.telephone1|left:41}{/if}
{if store.address1.length > 0}${store.address1|left:41}{/if}
{if store.address2.length > 0}${store.address2|left:41}{/if}
{if store.city.length > 0}${store.city|left}{/if}{if store.country > 0}${', '}${store.country|left:30}{/if}
${(new Date()).toLocaleFormat('%Y-%m-%d %H:%M:%S')}
------------------------------------------
{for item in order.items_summary}
 ${item.qty_subtotal|right:3} X ${item.name|left:23} ${item.subtotal|viviFormatPrices:true|right:10}
{if item.discount_subtotal != 0}${item.discount_subtotal|viviFormatPrices:true|right:41}
{/if}
{if item.surcharge_subtotal != 0}${'+' + item.surcharge_subtotal|viviFormatPrices:true|right:41}
{/if}
{/for}
------------------------------------------
{if order.trans_discount_subtotal != 0}${'値引き:'|left:15} ${order.trans_discount_subtotal|viviFormatPrices:true|right:26}
{/if}
{if order.trans_surcharge_subtotal != 0}${'追加料金:'|left:15} ${order.trans_surcharge_subtotal|viviFormatPrices:true|right:26}
{/if}
{if order.revalue_subtotal != 0}${'端数処理:'|left:15} ${order.revalue_subtotal|viviFormatPrices:true|right:26}
{/if}
{if order.promotion_subtotal != 0}${'販売促進:'|left:15} ${order.promotion_subtotal|viviFormatPrices:true|right:26}
{/if}
${'税抜き:'|left:15} ${order.tax_subtotal|viviFormatPrices:true|right:26}
${'税込み:'|left:15} ${order.included_tax_subtotal|viviFormatPrices:true|right:26}
${'合計:'|left:15} ${order.total|viviFormatPrices:true|right:26}
[&CR]
${'お預り:'|left:15} ${receivePayment|viviFormatPrices:true|right:26}
{if order.remain > 0}
${'差額:'|left:15} ${order.remain|viviFormatPrices:true|right:26}
{else}
${'お釣:'|left:15} ${(0 - order.remain)|viviFormatPrices:true|right:26}
{/if}
------------------------------------------
[&CR]
[&CTR][&IMG2][&LFT]
[&RESET]
${'レジ:'|left}${order.terminal_no|left:20} ${'責:'|right}${order.proceeds_clerk_displayname|right}
[&RESET]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
[&CR]
[&CR]
[&CR]
{/for}
