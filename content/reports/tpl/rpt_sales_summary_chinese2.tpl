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
                    <td>原價</td>
                    <td>附加稅</td>
                    <td>溢收</td>
                    <td>折扣</td>
                    <td>總營業額</td>
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
                        <td style="text-align: left;">總交易次數:</td>
                        <td>${body.sales_summary.OrderNum|default:0|viviFormatPrices:true}</td>
                    </tr>

                    <tr>
                        <td style="text-align: left;">總營業額:</td>
                        <td>${body.sales_summary.Total|default:0|viviFormatPrices:true}</td>
                    </tr>
                    <tr>
                        <td style="text-align: left;">總來客人數:</td>
                        <td>${body.sales_summary.Guests|default:0|viviFormatPrices:true}</td>
                    </tr>
                    <tr>
                        <td style="text-align: left;">銷售品項數:</td>
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
                        <td style="text-align: left;">平均銷售品項數:</td>
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
                <caption>訂單狀態分析表</caption>
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
                        <td>${detail.num_trans|default:0|viviFormatPrices:false}</td>
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
        </td>
        <td valign="top">

            <table id="body-table">
                <caption>商品類別銷售排行榜</caption>
                <thead>
                    <tr>
                        <th>商品類別</th>
                        <th>數量</th>
                        <th>總金額</th>
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
                <caption>商品銷售排行榜</caption>
                <thead>
                    <tr>
                        <th>商品</th>
                        <th>數量</th>
                        <th>總金額</th>
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
                <caption>發票記錄表</caption>
                <tr>
                    <td>有效張數:</td>
                    <td>100</td>

                    <td>作廢張數:</td>
                    <td>5</td>

                    <td>起始號碼:</td>
                    <td>FQ24252627</td>
                </tr>
                <tr>
                    <td>有效金額:</td>
                    <td>5000</td>

                    <td>作廢金額:</td>
                    <td>980</td>

                    <td>終止號碼:</td>
                    <td>FQ24253637</td>
                </tr>
            </table>
        </td>
    </tr>

</table>

</div>
<!--/div -->
