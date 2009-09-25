<tabbox class="CheckTabbox" flex="1">
    <tabs id="orders_tab">
    </tabs>
    <tabpanels>
{for table_order in TableOrder}
        <tabpanel id="order_panel_${table_order.id}">
{eval}

  id = table_order.id;
  order = OrdersById[id].Order;
  transaction = OrdersById[id].TransactionData;

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

<!-- header start -->
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
        <html:td colspan="2"/>
    </html:tr>
    <html:tr>
        <html:td style="width: 90px">${_('(view)sale period')+':'}</html:td>
        <html:td>${(new Date(order.sale_period * 1000)).toLocaleFormat('%Y-%m-%d')}</html:td>
        <html:td style="width: 90px">${_('(view)shift number')+':'}</html:td>
        <html:td>${order.shift_number}</html:td>
        <html:td colspan="2"/>
    </html:tr>
    <html:tr>
        <html:td style="width: 80px">${_('(view)service clerk')+':'}</html:td>
        <html:td>${order.service_clerk_displayname}</html:td>
        <html:td style="width: 80px">${_('(view)opened')+':'}</html:td>
        <html:td>${(new Date(order.created * 1000)).toLocaleFormat('%Y-%m-%d %H:%M:%S')}</html:td>
        <html:td colspan="2"/>
    </html:tr>
    <html:tr>
        <html:td style="width: 80px">${_('(view)proceeds clerk')+':'}</html:td>
        <html:td>${order.proceeds_clerk_displayname}</html:td>
        <html:td style="width: 80px">${_('(view)submitted')+':'}</html:td>
        <html:td>${(new Date(order.transaction_submitted * 1000)).toLocaleFormat('%Y-%m-%d %H:%M:%S')}</html:td>
        <html:td colspan="2"/>
    </html:tr>
{if order.member}
    <html:tr>
        <html:td style="width: 80px">${_('(view)customer')+':'}</html:td>
        <html:td> ${order.member_displayname}</html:td>
        <html:td style="width: 80px">${_('(view)customer id')+':'}</html:td>
        <html:td>${order.member}</html:td>
        <html:td style="width: 80px">${_('(view)contact')+':'}</html:td>
        <html:td>${order.member_cellphone}</html:td>
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
<!-- header end -->

<!-- body start -->
<html:div class="tableTitle">
<html:table id="body-table" width="100%">
	    <html:thead>
                <html:tr>
                    <html:th style="text-align: left;">${_('(view)Item')}</html:th>
                    <html:th style="text-align: left;"> </html:th>
                    <html:th style="text-align: center;">${_('(view)Qty')}</html:th>
                    <html:th style="text-align: right;"> ${_('(view)Subtotal')}</html:th>
                    <html:th style="text-align: right;">${_('(view)Price')}</html:th>
                    <html:th style="text-align: left;">${_('(view)Tax')}</html:th>
                </html:tr>
            </html:thead>
        <html:tbody>
           {for item in transaction.display_sequences}
{eval}
    indent = item.level > 0 ? '&#160;&#160;&#160;&#160;' : '' ;
{/eval}
    <html:tr>
        <html:td style="width: 400px; text-align: left;">${indent + item.name}</html:td>
        <html:td/>
        <html:td style="width: 70px; text-align: right">${item.current_qty}</html:td>
        <html:td style="width: 100px; text-align: right;">${item.current_price}</html:td>
        <html:td style="width: 100px; text-align: right;">${item.current_subtotal}</html:td>
        <html:td>${item.current_tax}</html:td>
    </html:tr>
{/for}

</html:tbody>
            <html:tfoot>
    <html:tr>
        <html:td colspan="4" style="text-align: left;">${_('(view)Item Subtotal')}</html:td>
        <html:td style="width: 100px; text-align: right;">${transaction.item_subtotal}</html:td>
        <html:td></html:td>
    </html:tr>
{if transaction.discount_subtotal != 0}
    <html:tr>
        <html:td style="text-align: left;">${_('(view)Discount')}</html:td>
        <html:td style="text-align: right;"></html:td>
        <html:td colspan="3" style="text-align: right;">${transaction.discount_subtotal}</html:td>
    </html:tr>
{/if}
{if transaction.surcharge_subtotal != 0}
    <html:tr>
        <html:td style="text-align: left;">${_('(view)Surcharge')}</html:td>
        <html:td style="text-align: right;"></html:td>
        <html:td colspan="3" style="text-align: right;">${transaction.surcharge_subtotal}</html:td>
    </html:tr>
{/if}
    <html:tr>
        <html:td colspan="4" style="text-align: left;">${_('(view)Add-on Taxes')}</html:td>
        <html:td style="width: 100px; text-align: right;">${transaction.tax_subtotal}</html:td>
    </html:tr>
{if transaction.promotion_subtotal != 0}
    <html:tr>
        <html:td style="text-align: left;">${_('(view)Promotion')}</html:td>
        <html:td style="text-align: right;"></html:td>
        <html:td colspan="3" style="text-align: right;">${transaction.promotion_subtotal}</html:td>
    </html:tr>
{/if}

{if transaction.revalue_subtotal != 0}
    <html:tr>
        <html:td colspan="4" style="text-align: left;">${_('(view)Revalue')}</html:td>
        <html:td style="width: 100px; text-align: right;">${transaction.revalue_subtotal}</html:td>
    </html:tr>
{/if}

            </html:tfoot>
</html:table>
<html:br />
</html:div>

</html:div>
        </tabpanel>
{/for}
    </tabpanels >
</tabbox>