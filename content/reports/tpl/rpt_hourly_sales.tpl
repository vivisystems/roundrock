<!-- div class="paper" style="overflow:auto;" -->
<div id="printhead">
<img src="chrome://viviecr/content/skin/images/logo.png" /><br />
</div>
<div id="docbody" class="paper">
 <!-- ${head.starttime} - ${head.endtime} -->
        <table id="body-table">
            <caption>${head.title}</caption>
            <thead>
                <tr>
                    <th>Time</th>
                    <th>Total</th>
                    <th>Orders</th>
                    <th>Guests</th>
                    <th>Items</th>
                </tr>
            </thead>
            <tbody>
{for detail in body}
                <tr>
                    <td style="text-align: left;">${detail.Hour}</td>
                    <td>${detail.HourTotal}</td>
                    <td>${detail.OrderNum}</td>
                    <td>${detail.Guests}</td>
                    <td>${detail.ItemsCount}</td>
                </tr>
{/for}
            </tbody>
            <tfoot>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
            </tfoot>
        </table>
        </br>

</div>
<!--/div -->
