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
{/eval}
<hr/>
<pre><table style="width: 720px">
    <tr>
        <td style="width: 80px">${_('(view)order sequence')+':'}</td>
        <td> ${order.sequence}</td>
        <td style="width: 80px">${_('(view)order status')+':'}</td>
        <td>${status}</td>
        <td style="width: 80px">${_('(view)order destination')+':'}</td>
        <td>${order.destination}</td>
    </tr>
    <tr>
        <td style="width: 80px">${_('(view)terminal')+':'}</td>
        <td>${order.terminal_no}</td>
        <td style="width: 80px">${_('(view)branch')+':'}</td>
        <td>${order.branch + ' (' + order.branch_id + ')'}</td>
    </tr>
    <tr>
        <td style="width: 80px">${_('(view)open clerk')+':'}</td>
        <td>${order.service_clerk_displayname}</td>
        <td style="width: 80px">${_('(view)opened')+':'}</td>
        <td>${(new Date(order.transaction_created * 1000)).toLocaleFormat('%Y-%m-%d %H:%M:%S')}</td>
    </tr>
    <tr>
        <td style="width: 80px">${_('(view)open clerk')+':'}</td>
        <td>${order.proceeds_clerk_displayname}</td>
        <td style="width: 80px">${_('(view)submitted')+':'}</td>
        <td>${(new Date(order.transaction_submitted * 1000)).toLocaleFormat('%Y-%m-%d %H:%M:%S')}</td>
    </tr>
{if order.member}
    <tr>
        <td style="width: 80px">${_('(view)customer')+':'}</td>
        <td> ${order.member_displayname}</td>
        <td style="width: 80px">${_('(view)contact')+':'}</td>
        <td>${order.member_cellphone}</td>
        <td style="width: 80px">${_('(view)email')+':'}</td>
        <td>${order.member_email}</td>
    </tr>
{/if}
    <tr>
        <td style="width: 80px">${_('(view)check #')+':'}</td>
        <td> ${order.check_no}</td>
        <td style="width: 80px">${_('(view)table #')+':'}</td>
        <td>${order.table_no}</td>
        <td style="width: 80px">${_('(view)customers')+':'}</td>
        <td>${order.no_of_customers}</td>
    </tr>
</table></pre><hr/>

<pre><table style="width: 720px">
{for item in order.OrderItem}
{eval}
    prodName = item.product_name;
    if (item.destination != null) prodName = '(' + item.destination + ') ' + prodName;
{/eval}
    <tr>
        <td style="width: 400px">${prodName}</td>
        <td/>
        <td style="width: 70px; text-align: right">${item.current_qty} X</td>
        <td style="width: 100px; text-align: right;">${item.current_price}</td>
        <td style="width: 100px; text-align: right;">${item.current_subtotal|viviFormatPrices:true}</td>
        <td>${item.tax_name}</td>
    </tr>
{if item.condiments != null && item.condiments != ''}
    <tr>
        <td colspan="3">&nbsp;&nbsp;${item.condiments}</td>
        <td style="width: 100px; text-align: right;">${item.current_condiment|viviFormatPrices:true}</td>
    </tr>
{/if}
{if item.memo != null && item.memo != ''}
    <tr>
        <td colspan="6">&nbsp;&nbsp;&nbsp;&nbsp;${item.memo}</td>
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
    <tr>
        <td>${_('(view)Adjustments')}</td>
        <td style="text-align: right;">${item_adjustments|viviFormatPrices:true}</td>
        <td colspan="3" style="text-align: right;">${order.surcharge_subtotal + order.discount_subtotal|viviFormatPrices:true}</td>
    </tr>
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
        <td>${(payment.memo1 != null && payment.memo1 != '') ? payment.memo1 : payment.name}</td>
        <td colspan="2">${(payment.memo1 != null && payment.memo1 != '') ? payment.name : ''}</td>
        <td style="text-align: right;">${payment.origin_amount}</td>
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
{elseif sequence}
<H2>${_('Order sequence [%S] does not exist', [sequence])}</H2>
{else}
<H2>${_('Unable to display order; no order sequence given')}</H2>
{/if}