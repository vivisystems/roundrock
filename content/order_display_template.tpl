<tabbox class="CheckTabbox" flex="1">
    <tabs id="orders_tab">
        <!-- dynamic created tabs -->
        <!-- tab linkedpanel="panel_{order.check_no}" label="C#{order.check_no}"/ -->
    </tabs>
    <tabpanels >

{for order in orders}
<tabpanel id="panel_${order.check_no}">
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
<html:div class="paper">

<html:div class="ReportDate">
<html:table width="90%">
    <html:tr>
        <html:td style="width: 80px">${_('(view)order sequence')+':'}</html:td>
        <html:td> ${order.sequence}</html:td>
        <html:td style="width: 80px">${_('(view)order status')+':'}</html:td>
        <html:td>${status}</html:td>
        <html:td style="width: 80px">${_('(view)order destination')+':'}</html:td>
        <html:td>${order.destination}</html:td>
    </html:tr>
    <html:tr>
        <html:td style="width: 80px">${_('(view)terminal')+':'}</html:td>
        <html:td>${order.terminal_no}</html:td>
        <html:td style="width: 80px">${_('(view)branch')+':'}</html:td>
        <html:td>${order.branch + ' (' + order.branch_id + ')'}</html:td>
    </html:tr>
    <html:tr>
        <html:td style="width: 80px">${_('(view)service clerk')+':'}</html:td>
        <html:td>${order.service_clerk_displayname}</html:td>
        <html:td style="width: 80px">${_('(view)opened')+':'}</html:td>
        <html:td>${(new Date(order.created * 1000)).toLocaleFormat('%Y-%m-%d %H:%M:%S')}</html:td>
    </html:tr>
    <html:tr>
        <html:td style="width: 80px">${_('(view)proceeds clerk')+':'}</html:td>
        <html:td>${order.proceeds_clerk_displayname}</html:td>
        <html:td style="width: 80px">${_('(view)submitted')+':'}</html:td>
        <html:td>${(new Date(order.transaction_submitted * 1000)).toLocaleFormat('%Y-%m-%d %H:%M:%S')}</html:td>
    </html:tr>
{if order.member}
    <html:tr>
        <html:td style="width: 80px">${_('(view)customer')+':'}</html:td>
        <html:td> ${order.member_displayname}</html:td>
        <html:td style="width: 80px">${_('(view)contact')+':'}</html:td>
        <html:td>${order.member_cellphone}</html:td>
        <html:td style="width: 80px">${_('(view)email')+':'}</html:td>
        <html:td>${order.member_email}</html:td>
    </html:tr>
{/if}
    <html:tr>
        <html:td style="width: 80px">${_('(view)check #')+':'}</html:td>
        <html:td> ${order.check_no}</html:td>
        <html:td style="width: 80px">${_('(view)table #')+':'}</html:td>
        <html:td>${order.table_no}</html:td>
        <html:td style="width: 80px">${_('(view)customers')+':'}</html:td>
        <html:td>${order.no_of_customers}</html:td>
    </html:tr>
</html:table>
</html:div>

<html:div class="tableTitle">
<html:table id="body-table" width="100%">
	    <html:thead>
                <html:tr>
                    <html:th style="text-align: left;">${_('(view)Item')}</html:th>
                    <html:th style="text-align: left;"> </html:th>
                    <html:th style="text-align: center;">${_('(view)Qty')}</html:th>
                    <html:th style="text-align: center;"> </html:th>
                    <html:th style="text-align: right;">${_('(view)Price')}</html:th>
                    <html:th style="text-align: left;">${_('(view)Tax')}</html:th>
                </html:tr>
            </html:thead>
            <html:tbody>
{for item in order.OrderItem}
{eval}
    prodName = item.product_name;
    indent = (item.parent_no != null && item.parent_no != '') ? ' ' : '';
    if (item.destination != null && item.destination != '' && indent == '') prodName = '(' + item.destination + ') ' + prodName;
    itemCondiments = [];
    if (order.OrderItemCondiment && order.OrderItemCondiment.length > 0) {
        itemCondiments = order.OrderItemCondiment.filter(function(c) {return c.item_id == item.id});
    }
{/eval}
    <html:tr>
        <html:td style="width: 400px; text-align: left;">${prodName}</html:td>
        <html:td/>
        <html:td style="width: 70px; text-align: right">${item.current_qty} X</html:td>
        <html:td style="width: 100px; text-align: right;">${item.current_price}</html:td>
        <html:td style="width: 100px; text-align: right;">${item.current_subtotal|viviFormatPrices:true}</html:td>
        <html:td>{if indent == ''}${item.tax_name}{/if}</html:td>
    </html:tr>
{for condiment in itemCondiments}
    <html:tr>
        <html:td colspan="3">${indent + condiment.name}</html:td>
        <html:td style="width: 100px; text-align: right;">${condiment.price|viviFormatPrices:true}</html:td>
    </html:tr>
{/for}
{if item.memo != null && item.memo != ''}
    <html:tr>
        <html:td colspan="6">${item.memo}</html:td>
    </html:tr>
{/if}
{if item.has_discount}
    {eval}
        item_adjustments += item.current_discount;
    {/eval}
    <html:tr>
        <html:td>${item.discount_name}</html:td>
        <html:td style="width: 100px; text-align: right;">${item.current_discount|viviFormatPrices:true}</html:td>
    </html:tr>
{elseif item.has_surcharge}
    {eval}
        item_adjustments += item.current_surcharge;
    {/eval}
    <html:tr>
        <html:td>${item.surcharge_name}</html:td>
        <html:td style="width: 100px; text-align: right;">${item.current_surcharge|viviFormatPrices:true}</html:td>
    </html:tr>
{/if}
{/for}

</html:tbody>
            <html:tfoot>
    <html:tr>
        <html:td colspan="4" style="text-align: left;">${_('(view)Item Subtotal')}</html:td>
        <html:td style="width: 100px; text-align: right;">${order.item_subtotal|viviFormatPrices:true}</html:td>
        <html:td></html:td>
    </html:tr>
    <html:tr>
        <html:td colspan="6"></html:td>
    </html:tr>
{if item_adjustments != 0}
    <html:tr>
        <html:td style="text-align: left;">${_('(view)Item Adjustments')}</html:td>
        <html:td style="text-align: right;">${item_adjustments|viviFormatPrices:true}</html:td>
        <html:td colspan="3" style="text-align: right;">${order.surcharge_subtotal + order.discount_subtotal|viviFormatPrices:true}</html:td>
    </html:tr>
    <html:tr>
        <html:td colspan="6"></html:td>
    </html:tr>
{/if}
{if order.OrderAddition}
    {for adjustment in order.OrderAddition}
    <html:tr>
        {if adjustment.discount_name != null}
        <html:td colspan="3">${adjustment.discount_name}</html:td>
        <html:td style="width: 100px; text-align: right;">${adjustment.current_discount|viviFormatPrices:true}</html:td>
        {else}
        <html:td colspan="3">${adjustment.surcharge_name}</html:td>
        <html:td style="width: 100px; text-align: right;">${adjustment.current_surcharge|viviFormatPrices:true}</html:td>
    </html:tr>
        {/if}
    {/for}
{/if}
    <html:tr>
        <html:td colspan="6"></html:td>
    </html:tr>
    
    <html:tr>
        <html:td colspan="4" style="text-align: left;">${_('(view)Add-on Taxes')}</html:td>
        <html:td style="width: 100px; text-align: right;">${order.tax_subtotal|viviFormatTaxes:true}</html:td>
    </html:tr>
{if order.OrderPromotion}
    {for promotion in order.OrderPromotion}
    <html:tr>
        <html:td colspan="3">${promotion.name}</html:td>
        <html:td style="width: 100px; text-align: right;">${promotion.discount_subtotal|viviFormatPrices:true}</html:td>
    </html:tr>
    {/for}
    <html:tr>
        <html:td colspan="6"></html:td>
    </html:tr>
    <html:tr>
        <html:td colspan="4" style="text-align: left;">${_('(view)Promotions')}</html:td>
        <html:td style="width: 100px; text-align: right;">${order.promotion_subtotal|viviFormatPrices:true}</html:td>
    </html:tr>
    <html:tr>
        <html:td colspan="6"></html:td>
    </html:tr>
{/if}
{if order.revalue_subtotal != 0}
    <html:tr>
        <html:td colspan="4" style="text-align: left;">${_('(view)Revalue')}</html:td>
        <html:td style="width: 100px; text-align: right;">${order.revalue_subtotal|viviFormatPrices:true}</html:td>
    </html:tr>
{/if}
    <html:tr>
        <html:td colspan="4" style="text-align: left;">${_('(view)Total')}</html:td>
        <html:td style="width: 100px; text-align: right;">${order.total|viviFormatPrices:true}</html:td>
    </html:tr>
{if order.trans_payments}
{for payment in order.trans_payments}
    <html:tr>
        <html:td style="text-align: left;">${(payment.memo1 != null && payment.memo1 != '') ? payment.memo1 : payment.name}</html:td>
        <html:td colspan="2" style="text-align: left;">${(payment.memo1 != null && payment.memo1 != '') ? payment.name : ''}</html:td>
        <html:td style="text-align: right;">${payment.origin_amount}</html:td>
        <html:td style="text-align: right;">${payment.amount|viviFormatPrices:true}</html:td>
    </html:tr>
    {if payment.memo2 != null && payment.memo2 != ''}
    <html:tr>
        <html:td colspan="6">${payment.memo2}</html:td>
    </html:tr>
    {/if}
{/for}
    <html:tr>
        <html:td colspan="4" style="text-align: left;">${_('(view)Payment Subtotal')}</html:td>
        <html:td style="width: 100px; text-align: right;">${order.payment_subtotal|viviFormatPrices:true}</html:td>
    </html:tr>
{/if}

{if order.OrderAnnotation}
    {for note in order.OrderAnnotation}
        <html:tr><html:td>${note.type}</html:td><html:td colspan="5">${note.text}</html:td></html:tr>
    {/for}
{/if}

            </html:tfoot>
</html:table>
<html:br />
</html:div>

{elseif sequence}
<html:H2>${_('Order sequence [%S] does not exist', [sequence])}</html:H2>
{else}
<html:H2>${_('Unable to display order; no order sequence given')}</html:H2>
{/if}
</html:div>
</tabpanel>

{/for}

    </tabpanels >
</tabbox>
