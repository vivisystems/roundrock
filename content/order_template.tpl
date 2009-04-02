{if order}
{eval}
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
<pre>
${_('(view)order sequence') + ': ' + order.sequence}
${_('(view)order status') + ': ' + status}
${_('(view)order destination') + ': ' + order.destination}
${_('(view)branch') + ': ' + order.branch + ' (' + order.branch_id + ')'}
${_('(view)terminal') + ': ' + order.terminal_no}
</pre>
<hr/>
<pre>
<table>
    <tr>
        <td>
${_('(view)opened') + ': ' + (new Date(order.transaction_created * 1000)).toLocaleFormat('%Y-%m-%d %H:%M:%S')}
        </td>
        <td/>
        <td>
${_('(view)open clerk') + ': ' + order.service_clerk_displayname}
        </td>
    </tr>
    <tr>
        <td>
${_('(view)submitted') + ': ' + (new Date(order.transaction_submitted * 1000)).toLocaleFormat('%Y-%m-%d %H:%M:%S')}
        </td>
        <td/>
        <td>
${_('(view)close clerk') + ': ' + order.proceeds_clerk_displayname}
        </td>
    </tr>
</table>
</pre>
<hr/>
<pre>
<table>
    <tr>
        <td>
${_('(view)customer') + ': ' + order.member_displayname}
        </td>
        <td/>
        <td>
${_('(view)contact') + ': ' + order.member_cellphone}
        </td>
    </tr>
</table>
</pre>
<hr/>
<pre>
<table>
    <tr>
        <td>
${_('(view)check #') + ': ' + order.check_no}
        </td>
        <td/>
        <td>
${_('(view)table #') + ': ' + order.table_no}
        </td>
        <td>
${_('(view)customers') + ': ' + order.no_of_customers}
        </td>
    </tr>
</table></pre><hr/>
<pre><table>
{for item in order.OrderItem}
{eval}
    prodName = item.product_name;
    if (item.destination) prodName = '(' + item.destination + ') ' + prodName;
{/eval}
<tr>
<td>${prodName}</td><td>${item.current_qty} X </td><td>${item.current_price}</td><td>${item.current_subtotal|viviFormatPrices:true}</td><td>${item.tax_name}</td>
{if item.condiments}
<td>${item.condiments}</td><td>${item.current_condiment|viviFormatPrices:true}</td>
{else}
<td></td><td></td>
{/if}
{if item.has_discount}
<td>${item.discount_name}</td><td>${item.current_discount|viviFormatPrices:true}</td>
{elseif item.has_surcharge}
<td>${item.surcharge_name}</td><td>${item.current_surcharge|viviFormatPrices:true}</td>
{else}
<td></td><td></td>
{/if}
<td>
{if item.memo}
${item.memo}
{/if}
</td>
{/for}
</table></pre><hr/>
<pre>
${_('(view)Item Sub-total')}: ${order.item_subtotal|viviFormatPrices:true}
</pre><hr/>
{if order.OrderAddition}
<pre><table>
{for adjustment in order.OrderAddition}
{if adjustment.discount_name}
<tr><td>${adjustment.discount_name}</td><td>${adjustment.current_discount|viviFormatPrices:true}</td>
{else}
<tr><td>${adjustment.surcharge_name}</td><td>${adjustment.current_surcharge|viviFormatPrices:true}</td>
{/if}
{/for}
</table>
${_('(view)Adjustments')}: ${order.surcharge_subtotal + order.discount_subtotal|viviFormatPrices:true}
</pre><hr/>
{/if}
<pre>
${_('(view)Add-on Taxes')}: ${order.tax_subtotal|viviFormatTaxes:true}
${_('(view)Total')}: ${order.total|viviFormatPrices:true}
</pre><hr/>
{if order.OrderPayment}
<pre><table>
{for payment in order.OrderPayment}
<tr><td>${payment.name}</td><td>${payment.memo1}</td><td>${payment.memo2}</td><td>${payment.origin_amount}</td><td>${payment.amount|viviFormatPrices:true}</td></tr>
{/for}
</table></pre><hr/>
{/if}
<pre>
${_('(view)Change')}: ${order.change|viviFormatPrices:true}
</pre><hr/>
{if order.OrderAnnotation}
<pre><table>
{for note in order.OrderAnnotation}
<tr><td>${note.type}</td><td>${note.text}</td></tr>
{/for}
</table></pre><hr/>
{/if}
{elseif sequence}
<H2>${_('Order sequence [%S] does not exist', [sequence])}</H2>
{else}
<H2>${_('Unable to display order; no order sequence given')}</H2>
{/if}