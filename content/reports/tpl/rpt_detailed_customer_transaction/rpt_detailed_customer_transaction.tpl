<!--doing this can make the codes below be colored by the gedit. It's so funny, isn't it? -->
<div id="printhead">
	<img src="chrome://viviecr/content/skin/images/logo.png" /><br />
</div>
<div id="docbody" class="paper">
	<p class="heading_store">${head.store.name} - ${head.store.branch}</p>
	<p class="heading_store">${head.store.telephone1}</p>

	<div style="float: left;">
		<p class="heading_p">${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no}</p>
		<p class="heading_p">${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname}</p>
		<p class="caption">${head.title}</p>
	</div>

	<div style="float: right;">
		<p class="heading_p">&nbsp;</p>
		<p class="heading_p" align="right">${_( '(rpt)Printed Time' ) + ': '}${foot.gen_time}</p>
		<p class="caption">${head.start_time} - ${head.end_time}</p>
	</div>
{for detail in body}
        <table id="body-table">
            <thead>
            	<tr>
		        	<td colspan="15" class="subtitle">${detail.customer_id} - ${detail.name}</td>
		        </tr>
                <tr class="fields">
                    <th style="text-align: center;">${_( '(rpt)Terminal' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Sale Period' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Shift' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Time' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Sequence' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Invoice Number' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Number of Guests' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Number of Items' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Gross Sales' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Add-on Tax' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Surcharge' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Discount' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Promotion' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Revalue' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Net Sales' )}</th>
                </tr>
            </thead>
            <tbody>
{eval}
  TrimPath.RoundingPrices = detail.rounding_prices;
  TrimPath.PrecisionPrices = detail.precision_prices;
  TrimPath.RoundingTaxes = detail.rounding_taxes;
  TrimPath.PrecisionTaxes = detail.precision_taxes;
{/eval}
{for order in detail.orders}
                <tr id="${order.id}">
                    <td style="text-align: left;">${order.terminal_no}</td>
                    <td style="text-align: left;">${order.sale_period|unixTimeToString:'saleperiod'}</td>
                    <td style="text-align: left;">${order.shift_number}</td>
                    <td style="text-align: left;">${order.Order.time|unixTimeToString}</td>
                    <td style="text-align: left;" class="hyperlink">${order.sequence}</td>
                    <td style="text-align: left;">${order.invoice_no|default:''}</td>
                    <td style="text-align: right;">${order.no_of_customers|default:''|format:0}</td>
                    <td style="text-align: right;">${order.qty_subtotal|default:0|format:0}</td>
                    <td style="text-align: right;">${order.item_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${order.tax_subtotal|default:0|viviFormatTaxes:true}</td>
                    <td style="text-align: right;">${order.surcharge_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${order.discount_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${order.promotion_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${order.revalue_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${order.total|default:0|viviFormatPrices:true}</td>
                </tr>

                <tr>
                    <td></td>
                    <td colspan="14">
                        <table width="100%">
                        	<tr style="color: gray; font-style: italic; font-size: 8pt;">
                        		<th style="text-align: left; width: 12%;">${_( '(rpt)Product Number' )}</th>
                        		<th style="text-align: left; width: 16%;">${_( '(rpt)Product Name' )}</th>
                        		<th style="text-align: left; width: 12%;">${_( '(rpt)Tax Name' )}</th>
                        		<th style="text-align: right; width: 12%;">${_( '(rpt)Surcharge' )}</th>
                        		<th style="text-align: right; width: 12%;">${_( '(rpt)Discount' )}</th>
                        		<th style="text-align: right; width: 12%;">${_( '(rpt)Price' )}</th>
                        		<th style="text-align: right; width: 12%;">${_( '(rpt)Quantity' )}</th>
                        		<th style="text-align: right; width: 12%;">${_( '(rpt)Subtotal' )}</th>
                        	</tr>
{for items in order.OrderItem}
                            <tr>
                                <td style="text-align: left;">${items.product_no}</td>
                                <td style="text-align: left;">${items.product_name|default:''}</td>
                                <td style="text-align: left;">${items.tax_name|default:''}</td>
                                <td style="text-align: right;">${items.current_surcharge|default:0|viviFormatPrices:true}</td>
                                <td style="text-align: right;">${items.current_discount|default:0|viviFormatPrices:true}</td>
                                <td style="text-align: right;">${items.current_price|default:0|viviFormatPrices:true}</td>
                                <td style="text-align: right;">${items.current_qty|default:0|format:0}</td>
                                <td style="text-align: right;">${items.current_subtotal|default:0|viviFormatPrices:true}</td>
                            </tr>
{/for}
                        </table>
                    </td>
                </tr>
{/for}
            </tbody>
{eval}
  delete TrimPath.RoundingPrices;
  delete TrimPath.PrecisionPrices;
  delete TrimPath.RoundingTaxes;
  delete TrimPath.PrecisionTaxes;
{/eval}
            <tfoot>
                <tr>
                    <td colspan="4" style="text-align: left;">${_( '(rpt)Records Found' ) }: ${detail.orders.length|default:0|format:0}</td>
                    <td colspan="2">${_( '(rpt)Summary' ) + ':'}</td>
                    <td style="text-align: right;">${detail.summary.no_of_customers|format:0}</td>
                    <td style="text-align: right;">${detail.summary.qty_subtotal|format:0}</td>
                    <td style="text-align: right;">${detail.summary.item_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.summary.tax_subtotal|default:0|viviFormatTaxes:true}</td>
                    <td style="text-align: right;">${detail.summary.surcharge_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.summary.discount_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.summary.promotion_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.summary.revalue_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.summary.total|default:0|viviFormatPrices:true}</td>
                </tr>
            </tfoot>
        </table>
        </br>
{/for}
</div>
<!--/div -->
