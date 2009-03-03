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
                    <th>Add-on Tax</th>
                    <th>Surcharge</th>
                    <th>Discount</th>
                    <th>Payment</th>
                    <th>Cash</th>
                    <th>Check</th>
                    <th>Credit Card</th>
                    <th>Coupon</th>
                    <th>Gift Card</th>
                </tr>
            </thead>
            <tbody>
{for detail in body}
                <tr>
                    <td style="text-align: left;">${detail.terminal_no}</td>
                    <td>${detail.item_subtotal|viviFormatPrices:true}</td>
                    <td>${detail.tax_subtotal|viviFormatPrices:true}</td>
                    <td>${detail.surcharge_subtotal|viviFormatPrices:true}</td>
                    <td>${detail.discount_subtotal|viviFormatPrices:true}</td>
                    <td>${detail.total|viviFormatPrices:true}</td>
                    <td>${detail.cash|default:0|viviFormatPrices:true}</td>
                    <td>${detail.check|default:0|viviFormatPrices:true}</td>
                    <td>${detail.creditcard|default:0|viviFormatPrices:true}</td>
                    <td>${detail.coupon|default:0|viviFormatPrices:true}</td>
                    <td>${detail.giftcard|default:0|viviFormatPrices:true}</td>
                </tr>
{/for}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="1">Summary:</td>
                    <td>${foot.item_subtotal|viviFormatPrices:true}</td>
                    <td>${foot.tax_subtotal|viviFormatPrices:true}</td>
                    <td>${foot.surcharge_subtotal|viviFormatPrices:true}</td>
                    <td>${foot.discount_subtotal|viviFormatPrices:true}</td>
                    <td>${foot.total|viviFormatPrices:true}</td>
                    <td>${foot.cash|viviFormatPrices:true}</td>
                    <td>${foot.check|viviFormatPrices:true}</td>
                    <td>${foot.creditcard|viviFormatPrices:true}</td>
                    <td>${foot.coupon|viviFormatPrices:true}</td>
                    <td>${foot.giftcard|viviFormatPrices:true}</td>
                </tr>
            </tfoot>
        </table>
        </br>

</div>
<!--/div -->
