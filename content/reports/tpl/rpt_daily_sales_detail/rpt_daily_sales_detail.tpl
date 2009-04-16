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
        <table id="body-table">
            <thead>
                <tr>
                    <th style="text-align: left;">${_( '(rpt)Term_No.' )}</th>
                    <th style="text-align: left;">${_( '(rpt)Time' )}</th>
                    <th style="text-align: left;">${_( '(rpt)Sequence' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Total' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Add-on Tax' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Surcharge' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Discount' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Payment' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Guests' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Items' )}</th>
                </tr>
            </thead>
            <tbody>
{for detail in body}
                <tr>
                    <td style="text-align: left;">${detail.terminal_no}</td>
                    <td style="text-align: left;">${detail.Order.time|unixTimeToString}</td>
                    <td style="text-align: left;">${detail.sequence}</td>
                    <td style="text-align: right;">${detail.item_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.tax_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.surcharge_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.discount_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.total|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.no_of_customers}</td>
                    <td style="text-align: right;">${detail.items_count}</td>
                </tr>

                <tr>
                    <td></td>
                    <td colspan="9">
                        <table width="100%">
{for items in detail.OrderItem}
                            <tr>
                                <td style="text-align: left;">${items.product_no}</td>
                                <td style="text-align: left;">${items.product_name}</td>
                                <td style="text-align: left;">${items.tax_name}</td>
                                <td style="text-align: right;">${items.current_discount|default:0|viviFormatPrices:true}</td>
                                <td style="text-align: right;">${items.current_surcharge|default:0|viviFormatPrices:true}</td>
                                <td style="text-align: right;">${items.current_price|default:0|viviFormatPrices:true}</td>
                                <td style="text-align: right;">${items.current_qty}</td>
                                <td style="text-align: right;">${items.current_subtotal|default:0|viviFormatPrices:true}</td>
                            </tr>
{/for}
                        </table>
                    </td>
                </tr>
{/for}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="3">${_( '(rpt)Summary' ) + ':'}</td>
                    <td style="text-align: right;">${foot.foot_datas.item_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.foot_datas.tax_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.foot_datas.surcharge_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.foot_datas.discount_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.foot_datas.payment|viviFormatPrices:true}</td>
                    <td></td>
                    <td></td>
                </tr>
            </tfoot>
        </table>
        </br>
</div>
<!--/div -->
