{if order}
{eval}
  item_adjustments = 0;
  status = '';
  switch(parseInt(order.status)) {
    case 1:
      status = _('(view)completed');
      break;

    case 2:
      status = _('(view)stored');
      break;

    case -1:
      status = _('(view)cancelled');
      break;

    case -2:
      status = _('(view)voided');
      break;

    case -3:
      status = _('(view)merged');
      break;

    default:
      status = order.status;
  }

  TrimPath.RoundingPrices = order.rounding_prices;
  TrimPath.PrecisionPrices = order.precision_prices;
  TrimPath.RoundingTaxes = order.rounding_taxes;
  TrimPath.PrecisionTaxes = order.precision_taxes;
{/eval}
${_('Transaction Details')|center:42}
------------------------------------------
${_('(view)order sequence')+':'|left:15} ${order.sequence|left:26}
${_('(view)branch')+':'|left:15} ${order.branch + ' (' + order.branch_id + ')'|left:26}
${_('(view)order status')+':'|left:15} ${status|left:26}
${_('(view)terminal')+':'|left:15} ${order.terminal_no|left:26}
${_('(view)sale period')+':'|left:15} ${(new Date(order.sale_period * 1000)).toLocaleFormat('%Y-%m-%d')|left:26}
${_('(view)shift number')+':'|left:15} ${order.shift_number|left:26}
${_('(view)service clerk')+':'|left:15} ${order.service_clerk_displayname|left:26}
${_('(view)opened')+':'|left:15} ${(new Date(order.transaction_created * 1000)).toLocaleFormat('%Y-%m-%d %H:%M:%S')|left:26}
${_('(view)proceeds clerk')+':'|left:15} ${order.proceeds_clerk_displayname|left:26}
${_('(view)submitted')+':'|left:15} ${(new Date(order.transaction_submitted * 1000)).toLocaleFormat('%Y-%m-%d %H:%M:%S')|left:26}
{if order.status == -2}
${_('(view)void clerk')+':'|left:15} ${order.void_clerk_displayname|left:26}
${_('(view)voided')+':'|left:15} ${(new Date(order.transaction_voided * 1000)).toLocaleFormat('%Y-%m-%d %H:%M:%S')|left:26}
{/if}
{if order.invoice_no}
${_('(view)invoice number')+':'|left:15} ${order.invoice_no|left:26}
${_('(view)invoice count')+':'|left:15} ${order.invoice_count|left:26}
${_('(view)invoice title')+':'|left:15} ${order.invoice_title|left:26}
{/if}
{if order.member}
${_('(view)customer id')+':'|left:15} ${order.member|left:26}
${_('(view)customer')+':'|left:15} ${order.member_displayname|left:26}
${_('(view)contact')+':'|left:15} ${order.member_cellphone|left:26}
{/if}
------------------------------------------
${_('(view)check #')+':'|left:12} ${order.check_no|left:8} ${_('(view)table #')+':'|left:12} ${order.table_no|left:7}
${_('(view)order destination')+':'|left:12} ${order.destination|left:8} ${_('(view)no_of_customers')+':'|left:12} ${order.no_of_customers|left:7}
------------------------------------------
{for item in order.OrderItem}
{eval}
    prodName = item.product_name;
    indent = (item.parent_no != null && item.parent_no != '') ? '  ' : '';
    if (item.destination != null && item.destination != '' && indent == '') prodName = '(' + item.destination + ') ' + prodName;
    itemCondiments = [];
    if (order.OrderItemCondiment && order.OrderItemCondiment.length > 0) {
        itemCondiments = order.OrderItemCondiment.filter(function(c) {return c.item_id == item.id});
    }
{/eval}
{if indent == ''}
${prodName|left:24} ${item.current_qty|format:0|right:2}X${item.current_price|right:5} ${item.current_subtotal|viviFormatPrices:true|right:6}${item.tax_name|right:2}[&CR]
{else}
${indent + prodName|left:24} ${item.current_qty|format:0|right:2}X{if item.current_subtotal != 0}${item.current_subtotal|viviFormatPrices:true|right:5}{/if}[&CR]
{/if}
{for condiment in itemCondiments}
${'  ' + indent + condiment.name|left:27}{if condiment.price != 0} ${condiment.price|viviFormatPrices:true|right:5}{/if}[&CR]
{/for}
{if item.memo != null && item.memo != ''}
    ${indent + item.memo|left:38}
{/if}
{if item.has_discount}
{eval}
        item_adjustments += item.current_discount;
{/eval}
${'      ' + item.discount_name|left:33} ${item.current_discount|viviFormatPrices:true|right:6}
{elseif item.has_surcharge}
{eval}
        item_adjustments += item.current_surcharge;
{/eval}
${'      ' + item.surcharge_name|left:33} ${item.current_surcharge|viviFormatPrices:true|right:6}
{/if}
{/for}
------------------------------------------
${_('(view)Item Subtotal')|left:35} ${order.item_subtotal|viviFormatPrices:true|right:6}
------------------------------------------
{if item_adjustments != 0}
${_('(view)Item Adjustments')|left:35} ${item_adjustments|viviFormatPrices:true|right:6}
------------------------------------------
{/if}
{if order.OrderAddition}
{for adjustment in order.OrderAddition}
{if adjustment.discount_name != null}
${adjustment.discount_name|left:35} ${adjustment.current_discount|viviFormatPrices:true|right:6}
        {else}
${adjustment.surcharge_name|left:35} ${adjustment.current_surcharge|viviFormatPrices:true|right:6}
{/if}
{/for}
------------------------------------------
{/if}
${_('(view)Add-on Taxes')|left:35} ${order.tax_subtotal|viviFormatTaxes:true|right:6}
------------------------------------------
{if order.OrderPromotion}
{for promotion in order.OrderPromotion}
${'  ' + promotion.name|left:35} ${promotion.discount_subtotal|viviFormatPrices:true|right:6}
{/for}
------------------------------------------
${_('(view)Promotions')|left:35} ${order.promotion_subtotal|viviFormatPrices:true|right:6}
------------------------------------------
{/if}
{if order.revalue_subtotal != 0}
${_('(view)Revalue')|left:35} ${order.revalue_subtotal|viviFormatPrices:true|right:6}
------------------------------------------
{/if}
${_('(view)Total')|left:35} ${order.total|viviFormatPrices:true|right:6}
------------------------------------------
{if order.OrderPayment}
{for payment in order.OrderPayment}
${'  ' +  ((payment.memo1 != null && payment.memo1 != '') ? payment.memo1 : _(payment.name))|left:17} ${(payment.memo1 != null && payment.memo1 != '') ? _(payment.name) : ''|left:10} ${payment.origin_amount|viviFormatPrices:true|right:6} ${payment.amount|viviFormatPrices:true|right:6}
{if payment.memo2 != null && payment.memo2 != ''}
${'    ' + payment.memo2|left:42}
{/if}
{/for}
------------------------------------------
${_('(view)Payment Subtotal')|left:35} ${order.payment_subtotal|viviFormatPrices:true|right:6}
------------------------------------------
{/if}
${_('(view)Change')|left:35} ${order.change|viviFormatPrices:true|right:6}
------------------------------------------
{if order.OrderAnnotation}
{for note in order.OrderAnnotation}
${note.type + ':' + note.text|left:42}
{/for}
{/if}
{eval}
  delete TrimPath.RoundingPrices;
  delete TrimPath.PrecisionPrices;
  delete TrimPath.RoundingTaxes;
  delete TrimPath.PrecisionTaxes;
{/eval}
{/if}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
[&CR]
