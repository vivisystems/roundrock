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
    indent = (item.parent_no != null && item.parent_no != '') ? '&nbsp;&nbsp;' : '';
    if (item.destination != null && item.destination != '' && indent == '') prodName = '(' + item.destination + ') ' + prodName;
    itemCondiments = [];
    if (order.OrderItemCondiment && order.OrderItemCondiment.length > 0) {
        itemCondiments = order.OrderItemCondiment.filter(function(c) {return c.item_id == item.id});
    }
{/eval}
${indent + prodName}
${item.current_qty|format:0|right:4} X {if indent == ''}${item.current_price}{/if}</td>
        <td style="width: 100px; text-align: right;">{if indent == ''}${item.current_subtotal|viviFormatPrices:true}{/if}</td>
        <td>{if indent == ''}${item.tax_name}{/if}</td>
    </tr>
{for condiment in itemCondiments}
    <tr>
        <td colspan="3">&nbsp;&nbsp;${indent + condiment.name}</td>
        <td style="width: 100px; text-align: right;">${condiment.price|viviFormatPrices:true}</td>
    </tr>
{/for}
{if item.memo != null && item.memo != ''}
    <tr>
        <td colspan="6">&nbsp;&nbsp;&nbsp;&nbsp;${indent + item.memo}</td>
    </tr>
{/if}
{if item.has_discount}
    {eval}
        item_adjustments += item.current_discount;
    {/eval}
    <tr>
        <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${item.discount_name}</td>
        <td style="width: 100px; text-align: right;">${item.current_discount|viviFormatPrices:true}</td>
        <td colspan="4"/>
    </tr>
{elseif item.has_surcharge}
    {eval}
        item_adjustments += item.current_surcharge;
    {/eval}
    <tr>
        <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${item.surcharge_name}</td>
        <td style="width: 100px; text-align: right;">${item.current_surcharge|viviFormatPrices:true}</td>
        <td colspan="4"/>
    </tr>
{/if}
{/for}
    <tr>
        <td colspan="6"><hr/></td>
    </tr>
    <tr>
        <td colspan="4" class="subtitle">${_('(view)Item Subtotal')}</td>
        <td style="width: 100px; text-align: right;">${order.item_subtotal|viviFormatPrices:true}</td>
    </tr>
    <tr>
        <td colspan="6"><hr/></td>
    </tr>
{if item_adjustments != 0}
    <tr>
        <td class="subtitle">${_('(view)Item Adjustments')}</td>
        <td style="text-align: right;">${item_adjustments|viviFormatPrices:true}</td>
        <td colspan="3" style="text-align: right;">${item_adjustments|viviFormatPrices:true}</td>
    </tr>
    <tr>
        <td colspan="6"><hr/></td>
    </tr>
{/if}
{if order.OrderAddition}
    {for adjustment in order.OrderAddition}
    <tr>
        {if adjustment.discount_name != null}
        <td colspan="4">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${adjustment.discount_name}</td>
        <td style="width: 100px; text-align: right;">${adjustment.current_discount|viviFormatPrices:true}</td>
        {else}
        <td colspan="4">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${adjustment.surcharge_name}</td>
        <td style="width: 100px; text-align: right;">${adjustment.current_surcharge|viviFormatPrices:true}</td>
    </tr>
        {/if}
    {/for}
    <tr>
        <td colspan="6"><hr/></td>
    </tr>
{/if}
    <tr>
        <td colspan="4" class="subtitle">${_('(view)Add-on Taxes')}</td>
        <td style="width: 100px; text-align: right;">${order.tax_subtotal|viviFormatTaxes:true}</td>
    </tr>
    <tr>
        <td colspan="6"><hr/></td>
    </tr>
{if order.OrderPromotion}
    {for promotion in order.OrderPromotion}
    <tr>
        <td colspan="3">&nbsp;&nbsp;${promotion.name}</td>
        <td style="width: 100px; text-align: right;">${promotion.discount_subtotal|viviFormatPrices:true}</td>
    </tr>
    {/for}
    <tr>
        <td colspan="6"><hr/></td>
    </tr>
    <tr>
        <td colspan="4" class="subtitle">${_('(view)Promotions')}</td>
        <td style="width: 100px; text-align: right;">${order.promotion_subtotal|viviFormatPrices:true}</td>
    </tr>
    <tr>
        <td colspan="6"><hr/></td>
    </tr>
{/if}
{if order.revalue_subtotal != 0}
    <tr>
        <td colspan="4" class="subtitle">${_('(view)Revalue')}</td>
        <td style="width: 100px; text-align: right;">${order.revalue_subtotal|viviFormatPrices:true}</td>
    </tr>
{/if}
    <tr>
        <td colspan="4" class="subtitle">${_('(view)Total')}</td>
        <td style="width: 100px; text-align: right;">${order.total|viviFormatPrices:true}</td>
    </tr>
    <tr>
        <td colspan="6"><hr/></td>
    </tr>
{if order.OrderPayment}
{for payment in order.OrderPayment}
    <tr>
        <td>&nbsp;&nbsp;${(payment.memo1 != null && payment.memo1 != '') ? payment.memo1 : _(payment.name)}</td>
        <td colspan="2">${(payment.memo1 != null && payment.memo1 != '') ? _(payment.name) : ''}</td>
        <td style="text-align: right;">${payment.origin_amount|viviFormatPrices:true}</td>
        <td style="text-align: right;">${payment.amount|viviFormatPrices:true}</td>
    </tr>
    {if payment.memo2 != null && payment.memo2 != ''}
    <tr>
        <td colspan="6">&nbsp;&nbsp;&nbsp;&nbsp;${payment.memo2}</td>
    </tr>
    {/if}
{/for}
    <tr>
        <td colspan="6"><hr/></td>
    </tr>
    <tr>
        <td colspan="4" class="subtitle">${_('(view)Payment Subtotal')}</td>
        <td style="width: 100px; text-align: right;">${order.payment_subtotal|viviFormatPrices:true}</td>
    </tr>
    <tr>
        <td colspan="6"><hr/></td>
    </tr>
{/if}
    <tr>
        <td colspan="4" class="subtitle">${_('(view)Change')}</td>
        <td style="width: 100px; text-align: right;">${order.change|viviFormatPrices:true}</td>
    </tr>
{if order.OrderAnnotation}
    <tr>
        <td colspan="6"><hr/></td>
    </tr>
    {for note in order.OrderAnnotation}
        <tr><td>${note.type}</td><td colspan="5">${note.text}</td></tr>
    {/for}
{/if}
</table></pre><hr/>
{eval}
  delete TrimPath.RoundingPrices;
  delete TrimPath.PrecisionPrices;
  delete TrimPath.RoundingTaxes;
  delete TrimPath.PrecisionTaxes;
{/eval}
{elseif sequence}
<H2>${_('Order sequence [%S] does not exist', [sequence])}</H2>
{else}
<H2>${_('Unable to display order; no order sequence given')}</H2>
{/if}
