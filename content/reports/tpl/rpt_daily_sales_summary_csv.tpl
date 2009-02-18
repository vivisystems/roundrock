<!-- div class="paper" style="overflow:auto;" -->
<div id="printhead">
<img src="chrome://viviecr/content/skin/images/logo.png" /><br />
</div>
<div id="docbody" class="paper">
<p align="right">${head.start_time} - ${head.end_time}</p>
        <table id="body-table">
            <caption>${head.title}</caption>
            <thead>
                <tr>
                    <th>Term_No.</th>
                    <th>Total</th>
                    <th>Surcharge</th>
                    <th>Discount</th>
                    <th>Cash</th>
                    <th>Credit Card</th>
                    <th>Coupon</th>
                </tr>
            </thead>
            <tbody>
{for detail in body}
                <tr>
                    <td style="text-align: left;">${detail.terminal_no}</td>
                    <td>${detail.total|viviFormatPrices:true}</td>
                    <td>${detail.surcharge_subtotal|viviFormatPrices:true}</td>
                    <td>${detail.discount_subtotal|viviFormatPrices:true}</td>
                    <td>${detail.cash|default:0|viviFormatPrices:true}</td>
                    <td>${detail.creditcard|default:0|viviFormatPrices:true}</td>
                    <td>${detail.coupon|default:0|viviFormatPrices:true}</td>
                </tr>
{/for}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="1">Summary:</td>
                    <td>${foot.total|viviFormatPrices:true}</td>
                    <td>${foot.surcharge_subtotal|viviFormatPrices:true}</td>
                    <td>${foot.discount_subtotal|viviFormatPrices:true}</td>
                    <td>${foot.cash|viviFormatPrices:true}</td>
                    <td>${foot.creditcard|viviFormatPrices:true}</td>
                    <td>${foot.coupon|viviFormatPrices:true}</td>
                </tr>
            </tfoot>
        </table>
        </br>

</div>
<!--/div -->
