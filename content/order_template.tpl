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
<hr/>
<pre><table style="width: 720px">
    <tr>
        <td style="width: 90px">${_('(view)order sequence')+':'}</td>
        <td> ${order.sequence}</td>
        <td style="width: 90px">${_('(view)order status')+':'}</td>
        <td>${status}</td>
        <td style="width: 90px">${_('(view)order destination')+':'}</td>
        <td>${order.destination}</td>
    </tr>
    <tr>
        <td style="width: 90px">${_('(view)terminal')+':'}</td>
        <td>${order.terminal_no}</td>
        <td style="width: 90px">${_('(view)branch')+':'}</td>
        <td>${order.branch + ' (' + order.branch_id + ')'}</td>
    </tr>
    <tr>
        <td style="width: 90px">${_('(view)sale period')+':'}</td>
        <td>${(new Date(order.sale_period * 1000)).toLocaleFormat('%Y-%m-%d')}</td>
        <td style="width: 90px">${_('(view)shift number')+':'}</td>
        <td>${order.shift_number}</td>
    </tr>
    <tr>
        <td style="width: 90px">${_('(view)service clerk')+':'}</td>
        <td>${order.service_clerk_displayname}</td>
        <td style="width: 90px">${_('(view)opened')+':'}</td>
        <td>${(new Date(order.transaction_created * 1000)).toLocaleFormat('%Y-%m-%d %H:%M:%S')}</td>
    </tr>
    <tr>
        <td style="width: 90px">${_('(view)proceeds clerk')+':'}</td>
        <td>${order.proceeds_clerk_displayname}</td>
        <td style="width: 90px">${_('(view)submitted')+':'}</td>
        <td>${(new Date(order.transaction_submitted * 1000)).toLocaleFormat('%Y-%m-%d %H:%M:%S')}</td>
    </tr>
{if order.status == -2}
    <tr>
        <td style="width: 90px">${_('(view)void clerk')+':'}</td>
        <td>${order.void_clerk_displayname}</td>
        <td style="width: 90px">${_('(view)voided')+':'}</td>
        <td>${(new Date(order.transaction_voided * 1000)).toLocaleFormat('%Y-%m-%d %H:%M:%S')}</td>
    </tr>
{/if}
    <tr>
        <td style="width: 90px">${_('(view)invoice number')+':'}</td>
        <td> ${order.invoice_no}</td>
        <td style="width: 90px">${_('(view)invoice count')+':'}</td>
        <td>${order.invoice_count}</td>
        <td style="width: 90px">${_('(view)invoice title')+':'}</td>
        <td>${order.invoice_title}</td>
    </tr>
{if order.member}
    <tr>
        <td style="width: 90px">${_('(view)customer')+':'}</td>
        <td> ${order.member_displayname}</td>
        <td style="width: 90px">${_('(view)contact')+':'}</td>
        <td>${order.member_cellphone}</td>
        <td style="width: 90px">${_('(view)email')+':'}</td>
        <td>${order.member_email}</td>
    </tr>
{/if}
    <tr>
        <td style="width: 90px">${_('(view)check #')+':'}</td>
        <td> ${order.check_no}</td>
        <td style="width: 90px">${_('(view)table #')+':'}</td>
        <td>${order.table_no}</td>
        <td style="width: 90px">${_('(view)no_of_customers')+':'}</td>
        <td>${order.no_of_customers}</td>
    </tr>
</table></pre><hr/>

<pre><table style="width: 720px">
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
    <tr>
        <td style="width: 400px">${indent + prodName}</td>
        <td/>
        <td style="width: 70px; text-align: right">${item.current_qty} X</td>
        <td style="width: 100px; text-align: right;">{if indent == ''}${item.current_price}{/if}</td>
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
    </tr>
{elseif item.has_surcharge}
    {eval}
        item_adjustments += item.current_surcharge;
    {/eval}
    <tr>
        <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${item.surcharge_name}</td>
        <td style="width: 100px; text-align: right;">${item.current_surcharge|viviFormatPrices:true}</td>
    </tr>
{/if}
{/for}
    <tr>
        <td colspan="6"><hr/></td>
    </tr>
    <tr>
        <td colspan="4">${_('(view)Item Subtotal')}</td>
        <td style="width: 100px; text-align: right;">${order.item_subtotal|viviFormatPrices:true}</td>
    </tr>
    <tr>
        <td colspan="6"><hr/></td>
    </tr>
{if item_adjustments != 0}
    <tr>
        <td>${_('(view)Item Adjustments')}</td>
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
        <td colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${adjustment.discount_name}</td>
        <td style="width: 100px; text-align: right;">${adjustment.current_discount|viviFormatPrices:true}</td>
        {else}
        <td colspan="3">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${adjustment.surcharge_name}</td>
        <td style="width: 100px; text-align: right;">${adjustment.current_surcharge|viviFormatPrices:true}</td>
    </tr>
        {/if}
    {/for}
    <tr>
        <td colspan="6"><hr/></td>
    </tr>
{/if}
    <tr>
        <td colspan="4">${_('(view)Add-on Taxes')}</td>
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
        <td colspan="4">${_('(view)Promotions')}</td>
        <td style="width: 100px; text-align: right;">${order.promotion_subtotal|viviFormatPrices:true}</td>
    </tr>
    <tr>
        <td colspan="6"><hr/></td>
    </tr>
{/if}
{if order.revalue_subtotal != 0}
    <tr>
        <td colspan="4">${_('(view)Revalue')}</td>
        <td style="width: 100px; text-align: right;">${order.revalue_subtotal|viviFormatPrices:true}</td>
    </tr>
{/if}
    <tr>
        <td colspan="4">${_('(view)Total')}</td>
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
        <td colspan="4">${_('(view)Payment Subtotal')}</td>
        <td style="width: 100px; text-align: right;">${order.payment_subtotal|viviFormatPrices:true}</td>
    </tr>
    <tr>
        <td colspan="6"><hr/></td>
    </tr>
{/if}
    <tr>
        <td colspan="4">${_('(view)Change')}</td>
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
