<!-- div class="paper" style="overflow:auto;" -->
<div id="printhead">
<img src="chrome://viviecr/content/skin/images/logo.png" /><br />
</div>
<div id="docbody" class="paper">

<p align="left">${head.store.name}</p>
<p align="left">${head.store.branch}</p>
<p align="left">${head.store.telephone1}</p>
<p align="left">Terminal: ${head.store.terminal_no}</p>
<p align="left">Clerk: ${head.clerk_displayname}</p>
<p align="right">Printed Time: ${foot.gen_time}</p>

<table width="100%">
    <caption>${head.title} - ${head.start_time} - ${head.end_time}</caption>

    <tr>
        <td colspan="2">
            <table id="body-table">
                <tr>
                    <td>Total</td>
                    <td>Add-on Tax</td>
                    <td>Surcharge</td>
                    <td>Discount</td>
                    <td>Revenue</td>
                </tr>
                <tr>
                    <td>${body.sales_summary.ItemSubtotal|default:0|viviFormatPrices:true}</td>
                    <td>${body.sales_summary.TaxSubtotal|default:0|viviFormatPrices:true}</td>
                    <td>${body.sales_summary.SurchargeSubtotal|default:0|viviFormatPrices:true}</td>
                    <td>${body.sales_summary.DiscountSubtotal|default:0|viviFormatPrices:true}</td>
                    <td>${body.sales_summary.Total|default:0|viviFormatPrices:true}</td>
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
                        <td>${body.sales_summary.OrderNum|default:0|viviFormatPrices:true}</td>
                    </tr>

                    <tr>
                        <td style="text-align: left;">Total:</td>
                        <td>${body.sales_summary.Total|default:0|viviFormatPrices:true}</td>
                    </tr>
                    <tr>
                        <td style="text-align: left;">Guests:</td>
                        <td>${body.sales_summary.Guests|default:0|viviFormatPrices:true}</td>
                    </tr>
                    <tr>
                        <td style="text-align: left;">Items:</td>
                        <td>${body.sales_summary.ItemsCount|default:0|viviFormatPrices:true}</td>
                    </tr>

                    <tr>
                        <td style="text-align: left;">Average Total:</td>
                        <td>${body.sales_summary.AvgTotal|default:0|viviFormatPrices:true}</td>
                    </tr>
                    <tr>
                        <td style="text-align: left;">Average Guest:</td>
                        <td>${body.sales_summary.AvgGuests|default:0|viviFormatPrices:true}</td>
                    </tr>
                    <tr>
                        <td style="text-align: left;">Average Items:</td>
                        <td>${body.sales_summary.AvgItemsCount|default:0|viviFormatPrices:true}</td>
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
                        <th>Payment</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
    {for detail in body.payment_list.records}
                    <tr>
                        <td style="text-align: left;">${detail.name}</td>
                        <td>${detail.amount - detail.change|default:0|viviFormatPrices:true}</td>
                    </tr>
    {/for}
                </tbody>
                <tfoot>
                    <tr>
                        <td>Summary:</td>
                        <td>${body.payment_list.summary.payment_total - body.payment_list.summary.change_total|default:0|viviFormatPrices:true}</td>
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
                		<td>${body.destination_summary.total_trans }</td>
                	</tr>
	{for detail in body.destination_summary.data}
                    <tr>
                        <td style="text-align: left;">${detail.destination}&nbsp;Times:</td>
                        <td>${detail.num_trans|default:0}</td>
                    </tr>
                    <tr>
                        <td style="text-align: left;">${detail.destination}&nbsp;Amount:</td>
                        <td>${detail.total|default:0|viviFormatPrices:true}</td>
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
                        <th>Name</th>
                        <th>Rate</th>
                        <th>Rate Type</th>
                        <th>Type</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
	{for detail in body.tax_summary.records}
                    <tr>
                        <td>${detail.tax_name}</td>
                        <td>${detail.tax_rate}</td>
                        <td></td>
                        <td>${detail.tax_type}</td>
                        <td>${detail.tax_subtotal|default:0|viviFormatPrices:true}</td>
                    </tr>
	{/for}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="4">Summary:</td>
                        <td>${body.tax_summary.summary.tax_total|default:0|viviFormatPrices:true}</td>
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
                        <th>Department</th>
                        <th>Qty</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
    {for detail in body.dept_sales.records}
                    <tr>
                        <td style="text-align: left;">${detail.cate_no}-${detail.cate_name}</td>
                        <td>${detail.qty}</td>
                        <td>${detail.total|default:0|viviFormatPrices:true}</td>
                    </tr>
    {/for}
                </tbody>
                <tfoot>
                    <tr>
                        <td>Summary:</td>
                        <td>${body.dept_sales.summary.qty}</td>
                        <td>${body.dept_sales.summary.total|default:0|viviFormatPrices:true}</td>
                    </tr>
                </tfoot>
            </table>
            <br />

            <table id="body-table">
                <caption>Top ${body.prod_sales.num_rows_to_get} Product Sales</caption>
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
    {for detail in body.prod_sales.records}
                    <tr>
                        <td style="text-align: left;">${detail.product_name}</td>
                        <td>${detail.qty}</td>
                        <td>${detail.total|default:0|viviFormatPrices:true}</td>
                    </tr>
    {/for}
                </tbody>
                <tfoot>
                    <tr>
                        <td>Summary:</td>
                        <td>${body.prod_sales.summary.qty}</td>
                        <td>${body.prod_sales.summary.total|default:0|viviFormatPrices:true}</td>
                    </tr>
                </tfoot>
            </table>
            <br />
            
            <table id="body-table">
                <caption>Hourly Sales</caption>
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Guests</th>
                        <th>Orders</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
    {for detail in body.hourly_sales.records}
                    <tr>
                        <td style="text-align: left;">${detail.Hour}</td>
                        <td>${detail.Guests}</td>
                        <td>${detail.OrderNum}</td>
                        <td>${detail.HourTotal|default:0|viviFormatPrices:true}</td>
                    </tr>
    {/for}
                </tbody>
                <tfoot>
                    <tr>
                        <td>Summary</td>
                        <td>${body.hourly_sales.summary.Guests}</td>
                        <td>${body.hourly_sales.summary.OrderNum}</td>
                        <td>${body.hourly_sales.summary.HourTotal|default:0|viviFormatPrices:true}</td>
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
