<!-- div class="paper" style="overflow:auto;" -->
<div id="printhead">
<img src="chrome://viviecr/content/skin/images/logo.png" /><br />
</div>
<div id="docbody" class="paper">

<p align="left">${head.store.name}</p>
<p align="left">${head.store.branch}</p>
<p align="left">${head.store.telephone1}</p>
<p align="left">機器編號: ${head.store.terminal_no}</p>
<p align="left">店員: ${head.clerk_displayname}</p>
<p align="right">列印時間: ${foot.gen_time}</p>

<table width="100%">
    <caption>${head.title} - ${head.start_time} - ${head.end_time}</caption>

    <tr>
        <td colspan="2">
            <table id="body-table">
                <tr>
                    <td>營業金額</td>
                    <td>附加稅</td>
                    <td>溢收</td>
                    <td>折扣</td>
                    <td>實收金額</td>
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
                <caption>營業彙總表</caption>
                <thead>
                    <tr>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="text-align: left;">總單數:</td>
                        <td>${body.sales_summary.OrderNum|default:0|viviFormatPrices:true}</td>
                    </tr>

                    <tr>
                        <td style="text-align: left;">總營業額:</td>
                        <td>${body.sales_summary.Total|default:0|viviFormatPrices:true}</td>
                    </tr>
                    <tr>
                        <td style="text-align: left;">總來客數:</td>
                        <td>${body.sales_summary.Guests|default:0|viviFormatPrices:true}</td>
                    </tr>
                    <tr>
                        <td style="text-align: left;">總品項數:</td>
                        <td>${body.sales_summary.ItemsCount|default:0|viviFormatPrices:true}</td>
                    </tr>

                    <tr>
                        <td style="text-align: left;">平均營業額:</td>
                        <td>${body.sales_summary.AvgTotal|default:0|viviFormatPrices:true}</td>
                    </tr>
                    <tr>
                        <td style="text-align: left;">平均來客數:</td>
                        <td>${body.sales_summary.AvgGuests|default:0|viviFormatPrices:true}</td>
                    </tr>
                    <tr>
                        <td style="text-align: left;">平均品項數:</td>
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
                <caption>付款方式統計表</caption>
                <thead>
                    <tr>
                        <th>付款方式</th>
                        <th>金額</th>
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
                        <td>總計:</td>
                        <td>${body.payment_list.summary.payment_total - body.payment_list.summary.change_total|default:0|viviFormatPrices:true}</td>
                    </tr>
                </tfoot>
            </table>
            <br />

            <table id="body-table">
                <caption>訂單分析表</caption>
                <thead>
                    <tr>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                	<tr>
                		<td style="text-align: left;">總單數:</td>
                		<td>${body.destination_summary.total_trans }</td>
                	</tr>
	{for detail in body.destination_summary.data}
                    <tr>
                        <td style="text-align: left;">${detail.destination}&nbsp;次數:</td>
                        <td>${detail.num_trans|default:0}</td>
                    </tr>
                    <tr>
                        <td style="text-align: left;">${detail.destination}&nbsp;金額:</td>
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
                <caption>稅別彙總表</caption>
                <thead>
                    <tr>
                        <th>名稱</th>
                        <th>稅率</th>
                        <th>稅率單位</th>
                        <th>稅別</th>
                        <th>金額</th>
                    </tr>
                </thead>
                <tbody>
	{for detail in body.tax_summary.records}
                    <tr>
                        <td>${detail.tax_name}</td>
                        <td>${detail.tax_rate}</td>
                        <td>${detail.rate_type}</td>
                        <td>${detail.tax_type}</td>
                        <td>${detail.tax_subtotal|default:0|viviFormatPrices:true}</td>
                    </tr>
	{/for}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="4">總計:</td>
                        <td>${body.tax_summary.summary.tax_total|default:0|viviFormatPrices:true}</td>
                    </tr>
                </tfoot>
            </table>
            <br />
        </td>
        <td valign="top">

            <table id="body-table">
                <caption>商品類別銷售排行榜</caption>
                <thead>
                    <tr>
                        <th>商回類別</th>
                        <th>數量</th>
                        <th>總金額</th>
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
                        <td>總計:</td>
                        <td>${body.dept_sales.summary.qty}</td>
                        <td>${body.dept_sales.summary.total|default:0|viviFormatPrices:true}</td>
                    </tr>
                </tfoot>
            </table>
            <br />

            <table id="body-table">
                <caption>商品銷售排行榜</caption>
                <thead>
                    <tr>
                        <th>商品</th>
                        <th>數量</th>
                        <th>金額</th>
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
                        <td>總計:</td>
                        <td>${body.prod_sales.summary.qty}</td>
                        <td>${body.prod_sales.summary.total|default:0|viviFormatPrices:true}</td>
                    </tr>
                </tfoot>
            </table>
            <br />
            
            <table id="body-table">
                <caption>時段銷售表</caption>
                <thead>
                    <tr>
                        <th>時段</th>
                        <th>來客數</th>
                        <th>單數</th>
                        <th>總金額</th>
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
                        <td>總計</td>
                        <td>${body.hourly_sales.summary.Guests}</td>
                        <td>${body.hourly_sales.summary.OrderNum}</td>
                        <td>${body.hourly_sales.summary.HourTotal|default:0|viviFormatPrices:true}</td>
                    </tr>
                </tfoot>
            </table>
            <br />
        </td>
    </tr>

</table>

</div>
<!--/div -->
