<tabbox class="CheckTabbox" flex="1">
    <arrowscrollbox orient="horizontal" flex="1" class="content-arrow-scrollbox">
    <tabs id="orders_tab">
    </tabs>
    </arrowscrollbox>
    <tabpanels>
{for table_order in TableOrder}
        <tabpanel id="order_panel_${table_order.id}">
{eval}

  id = table_order.id;
  order = OrdersById[id].Order;
  transaction = OrdersById[id].TransactionData;
  
  TrimPath.RoundingPrices = order.rounding_prices;
  TrimPath.PrecisionPrices = order.precision_prices;
  TrimPath.RoundingTaxes = order.rounding_taxes;
  TrimPath.PrecisionTaxes = order.precision_taxes;

{/eval}
<html:div class="paper">

<!-- header start -->
<html:div class="ReportDate">
<html:table width="90%">
    <html:tr>
        <html:td style="width: 80px">${_('(view)order sequence')+':'|escape}</html:td>
        <html:td> ${order.sequence}</html:td>
        <html:td style="width: 80px">${_('(view)order status')+':'|escape}</html:td>
        <html:td>${order.status_str|escape}</html:td>
        <html:td style="width: 80px">${_('(view)order destination')+':'|escape}</html:td>
        <html:td>${order.destination|escape}</html:td>
    </html:tr>
    <html:tr>
        <html:td style="width: 80px">${_('(view)terminal')+':'|escape}</html:td>
        <html:td>${order.terminal_no|escape}</html:td>
        <html:td style="width: 80px">${_('(view)branch')+':'|escape}</html:td>
        <html:td>${order.branch + ' (' + order.branch_id + ')'|escape}</html:td>
        <html:td colspan="2"/>
    </html:tr>
    <html:tr>
        <html:td style="width: 90px">${_('(view)sale period')+':'|escape}</html:td>
        <html:td>${(new Date(order.sale_period * 1000)).toLocaleFormat('%Y-%m-%d')}</html:td>
        <html:td style="width: 90px">${_('(view)shift number')+':'|escape}</html:td>
        <html:td>${order.shift_number|escape}</html:td>
        <html:td colspan="2"/>
    </html:tr>
    <html:tr>
        <html:td style="width: 80px">${_('(view)service clerk')+':'|escape}</html:td>
        <html:td>${order.service_clerk_displayname|escape}</html:td>
        <html:td style="width: 80px">${_('(view)opened')+':'|escape}</html:td>
        <html:td>${(new Date(order.transaction_created * 1000)).toLocaleFormat('%Y-%m-%d %H:%M:%S')}</html:td>
        <html:td colspan="2"/>
    </html:tr>
    <html:tr>
        <html:td style="width: 80px">${_('(view)proceeds clerk')+':'|escape}</html:td>
        <html:td>${order.proceeds_clerk_displayname|escape}</html:td>
        <html:td style="width: 80px">${_('(view)submitted')+':'|escape}</html:td>
        <html:td>${(new Date(order.transaction_submitted * 1000)).toLocaleFormat('%Y-%m-%d %H:%M:%S')}</html:td>
        <html:td colspan="2"/>
    </html:tr>
{if order.member}
    <html:tr>
        <html:td style="width: 80px">${_('(view)customer')+':'|escape}</html:td>
        <html:td> ${order.member_displayname|escape}</html:td>
        <html:td style="width: 80px">${_('(view)customer id')+':'|escape}</html:td>
        <html:td>${order.member|escape}</html:td>
        <html:td style="width: 80px">${_('(view)contact')+':'|escape}</html:td>
        <html:td>${order.member_cellphone|escape}</html:td>
    </html:tr>
{/if}
    <html:tr>
        <html:td style="width: 80px">${_('(view)check #')+':'|escape}</html:td>
        <html:td> ${order.check_no}</html:td>
        <html:td style="width: 80px">${_('(view)table #')+':'|escape}</html:td>
        <html:td>${order.table_no}</html:td>
        <html:td style="width: 80px">${_('(view)customers')+':'|escape}</html:td>
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
                    <html:th style="text-align: left;">${_('(view)Item')|escape}</html:th>
                    <html:th style="text-align: left;"> </html:th>
                    <html:th style="text-align: center;">${_('(view)Qty')|escape}</html:th>
                    <html:th style="text-align: right;"> ${_('(view)Subtotal')|escape}</html:th>
                    <html:th style="text-align: right;">${_('(view)Price')|escape}</html:th>
                    <html:th style="text-align: left;">${_('(view)Tax')|escape}</html:th>
                </html:tr>
            </html:thead>
        <html:tbody>
           {for item in transaction.display_sequences}
{eval}
    indent = item.level > 0 ? '&#160;&#160;&#160;&#160;' : '' ;
{/eval}
    <html:tr>
        <html:td style="width: 400px; text-align: left;">${indent}${item.name|escape}</html:td>
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
        <html:td colspan="4" style="text-align: left;">${_('(view)Item Subtotal')|escape}</html:td>
        <html:td style="width: 100px; text-align: right;">${transaction.item_subtotal|viviFormatPrices:true}</html:td>
        <html:td></html:td>
    </html:tr>
{if transaction.discount_subtotal != 0}
    <html:tr>
        <html:td style="text-align: left;">${_('(view)Discount')|escape}</html:td>
        <html:td style="text-align: right;"></html:td>
        <html:td colspan="3" style="text-align: right;">${transaction.discount_subtotal|viviFormatPrices:true}</html:td>
    </html:tr>
{/if}
{if transaction.surcharge_subtotal != 0}
    <html:tr>
        <html:td style="text-align: left;">${_('(view)Surcharge')|escape}</html:td>
        <html:td style="text-align: right;"></html:td>
        <html:td colspan="3" style="text-align: right;">${transaction.surcharge_subtotal|viviFormatPrices:true}</html:td>
    </html:tr>
{/if}
    <html:tr>
        <html:td colspan="4" style="text-align: left;">${_('(view)Add-on Taxes')|escape}</html:td>
        <html:td style="width: 100px; text-align: right;">${transaction.tax_subtotal|viviFormatTaxes:true}</html:td>
    </html:tr>
{if transaction.promotion_subtotal != 0}
    <html:tr>
        <html:td style="text-align: left;">${_('(view)Promotion')|escape}</html:td>
        <html:td style="text-align: right;"></html:td>
        <html:td colspan="3" style="text-align: right;">${transaction.promotion_subtotal|viviFormatPrices:true}</html:td>
    </html:tr>
{/if}

{if transaction.revalue_subtotal != 0}
    <html:tr>
        <html:td colspan="4" style="text-align: left;">${_('(view)Revalue')|escape}</html:td>
        <html:td style="width: 100px; text-align: right;">${transaction.revalue_subtotal|viviFormatPrices:true}</html:td>
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
