<!-- div class="paper" style="overflow:auto;" -->
<div id="printhead">
<!--img src="chrome://viviecr/content/skin/images/logo.png" /><br /-->
</div>
<div id="docbody" class="paper">
<!--p align="right">${head.start_time} - ${head.end_time}</p-->
        <table id="body-table">
            
            <thead>
            	<tr>
            		<td style="border: 0; background: white;" colspan="10">
            			<img style="border: 0; float: left" src="chrome://viviecr/content/skin/images/logo.png" />
            		</td>
            	</tr>
		        <tr>
		        	<td style="background: white;" colspan="10">
		        		<p align="left">${head.store.name}</p>
						<p align="left">${head.store.branch}</p>
						<p align="left">${head.store.telephone1}</p>
						<p align="left">Terminal: ${head.store.terminal_no}</p>
						<p align="left">Clerk: ${head.clerk_displayname}</p>
						<p align="right">Printed Time: ${foot.gen_time}</p>
						<p align="right">${head.start_time} - ${head.end_time}</p>
						<span style="float: left;">${head.title}</span>
						<span style="float: right;">${head.start_time} - ${head.end_time}</span>
					</td>
		        </tr>
                <tr>
                    <th>Term_No.</th>
                    <th>Time</th>
                    <th>Sequence</th>
                    <th>Total</th>
                    <th>Add-on Tax</th>
                    <th>Surcharge</th>
                    <th>Discount</th>
                    <th>Payment</th>
                    <th>Guests</th>
                    <th>Items</th>
                </tr>
            </thead>
            <tbody>
{for detail in body}
                <tr>
                    <td style="text-align: left;">${detail.terminal_no}</td>
                    <td style="text-align: left;">${detail.Order.Time}</td>
                    <td>${detail.sequence}</td>
                    <td>${detail.item_subtotal}</td>
                    <td>${detail.tax_subtotal}</td>
                    <td>${detail.surcharge_subtotal}</td>
                    <td>${detail.discount_subtotal}</td>
                    <td>${detail.total}</td>
                    <td>${detail.no_of_customers}</td>
                    <td>${detail.items_count}</td>
                </tr>

                <tr>
                    <td></td>
                    <td colspan="10">
                        <table width="100%">
{for items in detail.OrderItem}
                            <tr>
                                <td style="text-align: left;">${items.product_no}</td>
                                <td style="text-align: left;">${items.product_name}</td>
                                <td>${items.current_price}</td>
                                <td>${items.current_qty}</td>
                                <td>${items.current_subtotal}</td>
                            </tr>
{/for}
                        </table>
                    </td>
                </tr>
{/for}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="3">Summary:</td>
                    <td>${foot.foot_datas.item_subtotal|viviFormatPrices:true}</td>
                    <td>${foot.foot_datas.tax_subtotal|viviFormatPrices:true}</td>
                    <td>${foot.foot_datas.surcharge_subtotal|viviFormatPrices:true}</td>
                    <td>${foot.foot_datas.discount_subtotal|viviFormatPrices:true}</td>
                    <td>${foot.foot_datas.payment|viviFormatPrices:true}</td>
                    <td></td>
                    <td></td>
                </tr>
            </tfoot>
        </table>
        </br>
</div>
<!--/div -->
