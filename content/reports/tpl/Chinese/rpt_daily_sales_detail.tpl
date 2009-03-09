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
						<p align="left">機器編號: ${head.store.terminal_no}</p>
						<p align="left">店員: ${head.clerk_displayname}</p>
						<p align="right">列印時間: ${foot.gen_time}</p>
						<span style="float: left;">${head.title}</span>
						<span style="float: right;">${head.start_time} - ${head.end_time}</span>
					</td>
		        </tr>
                <tr>
                    <th>機器編號</th>
                    <th>時間</th>
                    <th>單號</th>
                    <th>營業金額</th>
                    <th>附加稅</th>
                    <th>溢收</th>
                    <th>折扣</th>
                    <th>實收金額</th>
                    <th>來客數</th>
                    <th>品項</th>
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
                    <td colspan="3">總計:</td>
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
