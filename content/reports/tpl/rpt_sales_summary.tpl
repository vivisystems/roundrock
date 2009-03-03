<!-- div class="paper" style="overflow:auto;" -->
<div id="printhead">
<img src="chrome://viviecr/content/skin/images/logo.png" /><br />
</div>
<div id="docbody" class="paper">


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
    {for detail in body.payment_list}
                    <tr>
                        <td style="text-align: left;">${detail.name}</td>
                        <td>${detail.amount - detail.change|default:0|viviFormatPrices:true}</td>
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
                        <td style="text-align: left;">${detail.destination}&nbsp;Time:</td>
                        <td>${detail.num_trans|default:0|viviFormatPrices:false}</td>
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
        </td>
        <td valign="top">

            <table id="body-table">
                <caption>Department Sales Billboard</caption>
                <thead>
                    <tr>
                        <th>Department</th>
                        <th>Qty</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
    {for detail in body.dept_sales}
                    <tr>
                        <td style="text-align: left;">${detail.cate_no}-${detail.cate_name}</td>
                        <td>${detail.qty}</td>
                        <td>${detail.total|default:0|viviFormatPrices:true}</td>
                    </tr>
    {/for}
                </tbody>
                <tfoot>
                    <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                </tfoot>
            </table>
            <br />

            <table id="body-table">
                <caption>Product Sales Billboard</caption>
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
    {for detail in body.prod_sales}
                    <tr>
                        <td style="text-align: left;">${detail.product_name}</td>
                        <td>${detail.qty}</td>
                        <td>${detail.total|default:0|viviFormatPrices:true}</td>
                    </tr>
    {/for}
                </tbody>
                <tfoot>
                    <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                </tfoot>
            </table>
            <br />

        </td>
    </tr>

    <tr>
        <td></td>
        <td valign="top">
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
    {for detail in body.hourly_sales}
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
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                </tfoot>
            </table>
            <br />

        </td>
    </tr>


    <tr>
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
    </tr>

</table>

</div>
<!--/div -->
