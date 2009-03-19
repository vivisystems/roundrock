<!-- div class="paper" style="overflow:auto;" -->
<div id="printhead">
	<img src="chrome://viviecr/content/skin/images/logo.png" /><br />
</div>
<div id="docbody" class="paper">
	<p class="heading_store">${head.store.name} - ${head.store.branch}</p>
	<p class="heading_store">${head.store.telephone1}</p>

	<div style="float: left;">
		<p class="heading_p">Terminal: ${head.store.terminal_no}</p>
		<p class="heading_p">Clerk: ${head.clerk_displayname}</p>
		<p class="caption">${head.title}<br />${head.subtitle}</p>
	</div>

	<div style="float: right;">
		<p class="heading_p">&nbsp;</p>
		<p class="heading_p" align="right">Printed Time: ${foot.gen_time}</p>
		<p class="caption">${head.start_time} - ${head.end_time}</p>
	</div>

<table width="100%">
    <!--caption>${head.title}&nbsp;${head.subtitle}<br />${head.start_time} - ${head.end_time}</caption-->

    <tr>
        <td colspan="2">
            <table id="body-table">
                <tr>
                    <td style="text-align: right;">Total</td>
                    <td style="text-align: right;">Add-on Tax</td>
                    <td style="text-align: right;">Surcharge</td>
                    <td style="text-align: right;">Discount</td>
                    <td style="text-align: right;">Revenue</td>
                </tr>
                <tr>
                    <td style="text-align: right;">${body.sales_summary.ItemSubtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${body.sales_summary.TaxSubtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${body.sales_summary.SurchargeSubtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${body.sales_summary.DiscountSubtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${body.sales_summary.Total|default:0|viviFormatPrices:true}</td>
                </tr>
            </table>
        </td>
    </tr>

    <tr>
        <td valign="top">
            <table id="body-table">
                <caption>Sales Summary</caption>
                <thead>
                    <tr>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="text-align: left;">Orders:</td>
                        <td style="text-align: right;">${body.sales_summary.OrderNum|default:0|viviFormatPrices:true}</td>
                    </tr>

                    <tr>
                        <td style="text-align: left;">Total:</td>
                        <td style="text-align: right;">${body.sales_summary.Total|default:0|viviFormatPrices:true}</td>
                    </tr>
                    <tr>
                        <td style="text-align: left;">Guests:</td>
                        <td style="text-align: right;">${body.sales_summary.Guests|default:0|viviFormatPrices:true}</td>
                    </tr>
                    <tr>
                        <td style="text-align: left;">Items:</td>
                        <td style="text-align: right;">${body.sales_summary.ItemsCount|default:0|viviFormatPrices:true}</td>
                    </tr>

                    <tr>
                        <td style="text-align: left;">Average Total:</td>
                        <td style="text-align: right;">${body.sales_summary.AvgTotal|default:0|viviFormatPrices:true}</td>
                    </tr>
                    <tr>
                        <td style="text-align: left;">Average Guest:</td>
                        <td style="text-align: right;">${body.sales_summary.AvgGuests|default:0|viviFormatPrices:true}</td>
                    </tr>
                    <tr>
                        <td style="text-align: left;">Average Items:</td>
                        <td style="text-align: right;">${body.sales_summary.AvgItemsCount|default:0|viviFormatPrices:true}</td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td></td>
                        <td></td>
                    </tr>
                </tfoot>
            </table>
            <br />

            <table id="body-table">
                <caption>Payment List</caption>
                <thead>
                    <tr>
                        <th style="text-align: left;">Payment</th>
                        <th style="text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
    {for detail in body.payment_list.records}
                    <tr>
                        <td style="text-align: left;">${detail.name}</td>
                        <td style="text-align: right;">${detail.amount - detail.change|default:0|viviFormatPrices:true}</td>
                    </tr>
    {/for}
                </tbody>
                <tfoot>
                    <tr>
                        <td>Summary:</td>
                        <td style="text-align: right;">${body.payment_list.summary.payment_total - body.payment_list.summary.change_total|default:0|viviFormatPrices:true}</td>
                    </tr>
                </tfoot>
            </table>
            <br />

            <table id="body-table">
                <caption>Destination Summary</caption>
                <thead>
                    <tr>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                	<tr>
                		<td style="text-align: left;">Total Orders:</td>
                		<td style="text-align: right;">${body.destination_summary.total_trans }</td>
                	</tr>
	{for detail in body.destination_summary.data}
                    <tr>
                        <td style="text-align: left;">${detail.destination}&nbsp;Times:</td>
                        <td style="text-align: right;">${detail.num_trans|default:0}</td>
                    </tr>
                    <tr>
                        <td style="text-align: left;">${detail.destination}&nbsp;Amount:</td>
                        <td style="text-align: right;">${detail.total|default:0|viviFormatPrices:true}</td>
                    </tr>
	{/for}
                </tbody>
                <tfoot>
                    <tr>
                        <td></td>
                        <td></td>
                    </tr>
                </tfoot>
            </table>
            <br />
            
            <table id="body-table">
                <caption>Tax summary</caption>
                <thead>
                    <tr>
                        <th style="text-align: left;">Name</th>
                        <th style="text-align: right;">Rate</th>
                        <th style="text-align: left;">Rate Type</th>
                        <th style="text-align: left;">Type</th>
                        <th style="text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
	{for detail in body.tax_summary.records}
                    <tr>
                        <td style="text-align: left;">${detail.tax_name}</td>
                        <td style="text-align: right;">${detail.tax_rate}</td>
                        <td style="text-align: left;">${detail.rate_type}</td>
                        <td style="text-align: left;">${detail.tax_type}</td>
                        <td style="text-align: right;">${detail.tax_subtotal|default:0|viviFormatPrices:true}</td>
                    </tr>
	{/for}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="4">Summary:</td>
                        <td style="text-align: right;">${body.tax_summary.summary.tax_total|default:0|viviFormatPrices:true}</td>
                    </tr>
                </tfoot>
            </table>
            <br />
        </td>
        <td valign="top">

            <table id="body-table">
                <caption>Top ${body.dept_sales.num_rows_to_get} Department Sales</caption>
                <thead>
                    <tr>
                        <th style="text-align: left;">Department</th>
                        <th style="text-align: right;">Qty</th>
                        <th style="text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
    {for detail in body.dept_sales.records}
                    <tr>
                        <td style="text-align: left;">${detail.cate_no}-${detail.cate_name}</td>
                        <td style="text-align: right;">${detail.qty}</td>
                        <td style="text-align: right;">${detail.total|default:0|viviFormatPrices:true}</td>
                    </tr>
    {/for}
                </tbody>
                <tfoot>
                    <tr>
                        <td>Summary:</td>
                        <td style="text-align: right;">${body.dept_sales.summary.qty}</td>
                        <td style="text-align: right;">${body.dept_sales.summary.total|default:0|viviFormatPrices:true}</td>
                    </tr>
                </tfoot>
            </table>
            <br />

            <table id="body-table">
                <caption>Top ${body.prod_sales.num_rows_to_get} Product Sales</caption>
                <thead>
                    <tr>
                        <th style="text-align: left;">Product</th>
                        <th style="text-align: right;">Qty</th>
                        <th style="text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
    {for detail in body.prod_sales.records}
                    <tr>
                        <td style="text-align: left;">${detail.product_name}</td>
                        <td style="text-align: right;">${detail.qty}</td>
                        <td style="text-align: right;">${detail.total|default:0|viviFormatPrices:true}</td>
                    </tr>
    {/for}
                </tbody>
                <tfoot>
                    <tr>
                        <td>Summary:</td>
                        <td style="text-align: right;">${body.prod_sales.summary.qty}</td>
                        <td style="text-align: right;">${body.prod_sales.summary.total|default:0|viviFormatPrices:true}</td>
                    </tr>
                </tfoot>
            </table>
            <br />
            
            <table id="body-table">
                <caption>Hourly Sales</caption>
                <thead>
                    <tr>
                        <th style="text-align: left;">Time</th>
                        <th style="text-align: right;">Guests</th>
                        <th style="text-align: right;">Orders</th>
                        <th style="text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
    {for detail in body.hourly_sales.records}
                    <tr>
                        <td style="text-align: left;">${detail.Hour}</td>
                        <td style="text-align: right;">${detail.Guests}</td>
                        <td style="text-align: right;">${detail.OrderNum}</td>
                        <td style="text-align: right;">${detail.HourTotal|default:0|viviFormatPrices:true}</td>
                    </tr>
    {/for}
                </tbody>
                <tfoot>
                    <tr>
                        <td>Summary</td>
                        <td style="text-align: right;">${body.hourly_sales.summary.Guests}</td>
                        <td style="text-align: right;">${body.hourly_sales.summary.OrderNum}</td>
                        <td style="text-align: right;">${body.hourly_sales.summary.HourTotal|default:0|viviFormatPrices:true}</td>
                    </tr>
                </tfoot>
            </table>
            <br />
        </td>
    </tr>

    <!--tr>
        <td></td>
        <td valign="top">
            

        </td>
    </tr-->


    <!--tr>
        <td colspan="2">
            <table id="body-table">
                <caption>Invoice Record</caption>
                <tr>
                    <td>Num:</td>
                    <td>100</td>

                    <td>Cancel_Num:</td>
                    <td>5</td>

                    <td>Start_No:</td>
                    <td>FQ24252627</td>
                </tr>
                <tr>
                    <td>Amount:</td>
                    <td>5000</td>

                    <td>Cancel_Amt:</td>
                    <td>980</td>

                    <td>End_No:</td>
                    <td>FQ24253637</td>
                </tr>
            </table>
        </td>
    </tr-->

</table>

</div>
<!--/div -->
